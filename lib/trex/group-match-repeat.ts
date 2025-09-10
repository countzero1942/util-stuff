import { GroupMatchBase } from "./group-match";
import {
	GroupMatchAll,
	GroupMatchAny,
} from "./group-match-any-all";
import { GroupMatchNav } from "./group-nav";
import { GroupName } from "./group-name";
import {
	MatchRepeat,
	NumberOfMatches,
} from "./match-repeat";
import { MutMatchNav } from "./nav";

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
		return new AltFirstLastGroupMatchers(
			altFirstMatch,
			altLastMatch
		);
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
		return new AltFirstLastGroupMatchers(
			altFirstMatch,
			null
		);
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
		return new AltFirstLastGroupMatchers(
			null,
			altLastMatch
		);
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

	private static _default =
		new AltFirstLastGroupMatchers();
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
	public match(nav: MutMatchNav): GroupMatchNav | null {
		nav.assertNavIsValid();
		nav.assertNavIsNew();

		let count = 0;
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const beyondCount = max + 1;

		let firstNav = nav.copy();
		let currentNav = nav.copy();

		const savedNavs: GroupMatchNav[] = [];

		const firstMatcher =
			this.altFirstLastMatchers.altFirstMatch;
		const contentMatcher = this.matcher;
		const lastMatcher =
			this.altFirstLastMatchers.altLastMatch;

		const stepNav = MatchRepeat.getMatchRepeatStepNav();

		let isFailedMatch = false;

		while (count < beyondCount && stepNav.isNotComplete) {
			/**
			 * The result of the current match.
			 *
			 * Will be null if the match fails.
			 * Will be null if firstMatcher or lastMatcher is null.
			 * So it is not a reliable indicator of failed match.
			 */
			let result: GroupMatchNav | null = null;

			const isCurrentMatchEmpty = () => {
				if (result === null) {
					return true;
				}
				return (
					result.wholeMatchNav.captureIndex ===
					currentNav.captureIndex
				);
			};

			const doAltMatcher = (
				altMatcher: GroupMatchBase | null
			) => {
				if (altMatcher) {
					result = altMatcher.match(currentNav.copy());
					if (!result) {
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
					result = contentMatcher.match(
						currentNav.copy()
					);
					if (!result) {
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
			if (result) {
				GroupMatchAll.addResultsToSavedNavs(
					result,
					savedNavs
				);

				currentNav =
					result.wholeMatchNav.copyAndMoveNext(
						"OptMoveForward"
					);
			}
		}

		if (count >= min && count <= max) {
			return GroupMatchNav.fromChildren(
				MutMatchNav.fromFirstAndLast(
					firstNav,
					currentNav
				),
				this.groupName,
				savedNavs
			);
		} else {
			return nav.invalidate();
		}
	}

	/**
	 * Creates a new MatchRepeat instance.
	 *
	 * @param matcher The matcher to repeat.
	 * @param numberOfMatches The number of times to repeat.
	 * @param altFirstLastMatchers The altFirst and altLast matchers.
	 * @returns A new MatchRepeat instance.
	 */
	public static from(
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
}
