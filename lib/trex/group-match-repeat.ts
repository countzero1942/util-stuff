import { GroupMatchBase } from "./group-match";
import { GroupMatchAll, GroupMatchAny } from "./group-match-any-all-opt";
import { GroupMatchNav } from "./group-nav";
import { GroupName } from "./group-name";
import { MatchRepeat, NumberOfMatches } from "./match-repeat";
import { MatchNav } from "./nav";
import { addResultToParent } from "./group-helper";
import { GroupValidatorError } from "./group-validator-error";
import { isNativeError } from "util/types";
import { log } from "console";
import chalk from "chalk";

export class AltFirstLastGroupMatchers {
	protected constructor(
		public readonly altFirstMatch: GroupMatchBase | null = null,
		public readonly altLastMatch: GroupMatchBase | null = null
	) {}

	/**
	 * Creates a new AltFirstLastMatchers instance with the given matchers.
	 *
	 * @param altFirstMatch The first matcher.
	 * @param altLastMatch The last matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	public static fromBoth(
		altFirstMatch: GroupMatchBase,
		altLastMatch: GroupMatchBase
	): AltFirstLastGroupMatchers {
		return new AltFirstLastGroupMatchers(altFirstMatch, altLastMatch);
	}

	/**
	 * Creates a new AltFirstLastMatchers instance with only the altFirstMatch.
	 *
	 * @param altFirstMatch The first matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	public static fromAltFirst(
		altFirstMatch: GroupMatchBase
	): AltFirstLastGroupMatchers {
		return new AltFirstLastGroupMatchers(altFirstMatch, null);
	}

	/**
	 * Creates a new AltFirstLastMatchers instance with only the altLastMatch.
	 *
	 * @param altLastMatch The last matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	public static fromAltLast(
		altLastMatch: GroupMatchBase
	): AltFirstLastGroupMatchers {
		return new AltFirstLastGroupMatchers(null, altLastMatch);
	}

	/**
	 * Returns the default AltFirstLastMatchers instance.
	 *
	 * The default instance has null for both altFirstMatch and altLastMatch.
	 *
	 * @returns The default AltFirstLastMatchers instance.
	 */
	public static get default(): AltFirstLastGroupMatchers {
		return AltFirstLastGroupMatchers._default;
	}

	private static _default = new AltFirstLastGroupMatchers();
}

export class GroupMatchRepeat extends GroupMatchBase {
	/**
	 * Creates a new MatchRepeat instance.
	 *
	 * @param matcher The matcher to repeat.
	 * @param numberOfMatches The number of times to repeat.
	 * @param altFirstLastMatchers The altFirst and altLast matchers.
	 */
	public constructor(
		groupName: GroupName,
		public readonly matcher: GroupMatchBase,
		public readonly numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore,
		public readonly altFirstLastMatchers: AltFirstLastGroupMatchers = AltFirstLastGroupMatchers.default
	) {
		super(groupName);
	}

	/**
	 * Matches the repeat matcher according to the numberOfMatches
	 * and altFirstLastMatchers.
	 *
	 * If the number of matches is less than the minimum number of matches,
	 * the match fails.
	 *
	 * If the number of matches is greater than the maximum number of matches,
	 * the match fails.
	 *
	 * A succesful match will move the nav capture forward by the length of
	 * the match.
	 *
	 * If the match fails, null is returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MatchNav): GroupMatchNav | GroupValidatorError {
		const firstMatcher = this.altFirstLastMatchers.altFirstMatch;
		const lastMatcher = this.altFirstLastMatchers.altLastMatch;

		nav.assertNavIsNew();

		let count = 0;
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const beyondCount = this.numberOfMatches.doesOverMatchingFail
			? max + 1
			: max;

		let currentNav = nav;
		let lastNav = nav;

		const savedNavs: GroupMatchNav[] = [];

		const contentMatcher = this.matcher;

		const stepNav = MatchRepeat.getMatchRepeatStepNav();

		let isFailedMatch = false;
		let didContentMatch = false;

		while (count < beyondCount && stepNav.isNotComplete) {
			/**
			 * The result of the current match.
			 *
			 * Will be null if the match fails.
			 * Will be null if firstMatcher or lastMatcher is null.
			 * So it is not a reliable indicator of failed match.
			 */
			let result: GroupMatchNav | GroupValidatorError =
				GroupValidatorError.empty;

			const isCurrentMatchEmpty = () => {
				if (result instanceof GroupValidatorError) {
					return true;
				}
				return (
					result.wholeMatchNav.captureIndex ===
					currentNav.captureIndex
				);
			};

			const doAltMatcher = (altMatcher: GroupMatchBase | null) => {
				if (altMatcher) {
					result = altMatcher.match(currentNav);
					if (result instanceof GroupValidatorError) {
						isFailedMatch = true;
					}
				}
				stepNav.next();
			};

			switch (stepNav.step) {
				case "First Matcher":
					doAltMatcher(firstMatcher);
					break;
				case "Content Matcher":
					result = contentMatcher.match(currentNav);
					if (result instanceof GroupMatchNav) {
						didContentMatch = true;
					}
					if (
						result instanceof GroupValidatorError &&
						didContentMatch === false
					) {
						isFailedMatch = true;
					}
					if (isCurrentMatchEmpty()) {
						stepNav.next();
					}
					break;
				case "Last Matcher":
					doAltMatcher(lastMatcher);
					break;
				default:
					throw "never";
			}

			// note: result will also be null on failed match
			if (isFailedMatch) {
				break;
			}

			if (isCurrentMatchEmpty() === false) {
				count++;
			}

			// note: result here is only null if altMatcher is null
			// and no matching took place
			if (result instanceof GroupMatchNav) {
				// addResultToChildrenGroupNavs(result, savedNavs);
				addResultToParent(result, savedNavs);
				lastNav = currentNav;
				currentNav = result.wholeMatchNav.moveNext("OptMoveForward");
			}
		}

		// case: successful match
		if (isFailedMatch === false) {
			switch (true) {
				// case: successful match in range
				case count >= min && count <= max: {
					// note: groupName is empty if count is 0: optional match
					// otherwise groupName is this.groupName: successful match
					const groupName =
						count > 0 ? this.groupName : GroupName.empty;
					return GroupMatchNav.fromBranch(
						MatchNav.fromFirstAndLast(nav, currentNav),
						groupName,
						savedNavs
					);
				}
				// case: optional match
				case count === 0 && min === 0: {
					return GroupMatchNav.fromLeaf(nav, GroupName.empty);
				}
				// case: not enough matches
				case count > 0 && count < min: {
					const currentView = currentNav.fullView;
					const errorView =
						currentView.length > 0 ? currentView : nav.fullView;
					return GroupValidatorError.from(
						errorView,
						nav.fullView,
						"not enough matches"
					);
				}
				// case: too many matches
				case count > max: {
					const errorView = lastNav.fullView;
					return GroupValidatorError.from(
						errorView,
						nav.fullView,
						"too many matches"
					);
				}
				// case: no matches
				case count === 0: {
					return GroupValidatorError.from(
						nav.fullView,
						nav.fullView,
						"no matches"
					);
				}
				default:
					throw "never";
			}
		}
		// case: failed match with zero matches allowed: optional match
		else if (isFailedMatch === true && count === 0 && min === 0) {
			log(chalk.red(">>> optional match failed"));
			return GroupMatchNav.fromLeaf(nav, GroupName.empty);
		}
		// case: failed match
		log(chalk.red(">>> failed match: no other cases handled"));
		const errorView = currentNav.fullView;
		const error = GroupValidatorError.from(
			errorView,
			nav.fullView,
			"no matches"
		);
		return error;
	}

	/**
	 * Creates a new MatchRepeat instance with a named group.
	 *
	 * @param matcher The matcher to repeat.
	 * @param numberOfMatches The number of times to repeat.
	 * @param altFirstLastMatchers The altFirst and altLast matchers.
	 * @returns A new MatchRepeat instance.
	 */
	public static fromNamed(
		groupName: GroupName,
		matcher: GroupMatchBase,
		numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore,
		altFirstLastMatchers: AltFirstLastGroupMatchers = AltFirstLastGroupMatchers.default
	): GroupMatchRepeat {
		return new GroupMatchRepeat(
			groupName,
			matcher,
			numberOfMatches,
			altFirstLastMatchers
		);
	}

	/**
	 * Creates a new MatchRepeat instance with an empty group name.
	 *
	 * @param matcher The matcher to repeat.
	 * @param numberOfMatches The number of times to repeat.
	 * @param altFirstLastMatchers The altFirst and altLast matchers.
	 * @returns A new MatchRepeat instance.
	 */
	public static fromUnnamed(
		matcher: GroupMatchBase,
		numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore,
		altFirstLastMatchers: AltFirstLastGroupMatchers = AltFirstLastGroupMatchers.default
	): GroupMatchRepeat {
		return new GroupMatchRepeat(
			GroupName.empty,
			matcher,
			numberOfMatches,
			altFirstLastMatchers
		);
	}
}
