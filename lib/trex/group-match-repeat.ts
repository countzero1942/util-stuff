import { GroupMatchBase } from "./group-match";
import { GroupMatchAll, GroupMatchAny } from "./group-match-any-all";
import { GroupMatchNav } from "./group-nav";
import { GroupName } from "./group-name";
import { MatchRepeat, NumberOfMatches } from "./match-repeat";
import { MutMatchNav } from "./nav";
import { addResultToParent } from "./group-helper";
import { GroupValidatorError } from "./group-validator-error";

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
	 * If the match fails, the nav is invalidated and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(
		nav: MutMatchNav,
		parent: GroupMatchNav | null
	): GroupMatchNav | GroupValidatorError {
		const firstMatcher = this.altFirstLastMatchers.altFirstMatch;
		const lastMatcher = this.altFirstLastMatchers.altLastMatch;

		nav.assertNavIsValid();
		nav.assertNavIsNew();

		let count = 0;
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const beyondCount = this.numberOfMatches.doesOverMatchingFail
			? max + 1
			: max;

		let firstNav = nav.copy();
		let currentNav = nav.copy();

		// const savedNavs: GroupMatchNav[] = [];
		const parentNav = GroupMatchNav.fromConstructableBranch(
			this.groupName,
			parent
		);

		const firstNamedAncestor = parentNav.getFirstNamedAncestor();

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
				GroupValidatorError.GenericError;

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
					result = altMatcher.match(currentNav.copy(), parentNav);
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
					result = contentMatcher.match(currentNav.copy(), parentNav);
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
				addResultToParent(result, parentNav);

				currentNav =
					result.wholeMatchNav.copyAndMoveNext("OptMoveForward");
			}
		}

		// case: successful match in range
		if (isFailedMatch === false && count >= min && count <= max) {
			// return GroupMatchNav.fromBranch(
			// 	MutMatchNav.fromFirstAndLast(firstNav, currentNav),
			// 	this.groupName,
			// 	savedNavs
			// );
			parentNav.seal(
				MutMatchNav.fromFirstAndLast(firstNav, currentNav)
			);
			return parentNav;
		}
		// case: failed match with zero matches allowed
		else if (isFailedMatch === true && count === 0 && min === 0) {
			// Note: on failed match the parentNav is discarded
			return GroupMatchNav.fromLeaf(nav.copy(), this.groupName, parent);
		}
		// case: failed match
		else {
			nav.invalidate();
			return GroupValidatorError.GenericError;
		}
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
