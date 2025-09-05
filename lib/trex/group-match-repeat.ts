import { GroupMatchBase } from "./group-match";
import {
	GroupMatchAll,
	GroupMatchAny,
} from "./group-match-any-all";
import { GroupMatchNav } from "./group-nav";
import { GroupName } from "./group-name";
import { NumberOfMatches } from "./match-repeat";
import { MutMatchNav } from "./nav";

export class AltFirstLastGroupMatchers {
	protected constructor(
		public readonly altFirstMatch: GroupMatchBase | null = null,
		public readonly altLastMatch: GroupMatchBase | null = null
	) {}

	/**
	 * Returns the first and next matchers for a repeat matcher.
	 *
	 * If altFirstMatch is not null, Start is a MatchAny with altFirstMatch
	 * as the first matcher and contentMatcher as the second matcher.
	 *
	 * If altLastMatch is not null, Next is a MatchAny with contentMatcher
	 * as the first matcher and altLastMatch as the second matcher.
	 *
	 * If both altFirstMatch and altLastMatch are null, Start and Next are
	 * contentMatcher.
	 *
	 * @param contentMatcher The matcher to use for the content.
	 * @returns The first and next matchers.
	 */
	public getStartAndNextMatcher(
		contentMatcher: GroupMatchBase
	): [GroupMatchBase, GroupMatchBase] {
		const firstMatch =
			this.altFirstMatch !== null
				? GroupMatchAny.fromUnnamed(
						this.altFirstMatch,
						contentMatcher
					)
				: contentMatcher;

		const nextMatch =
			this.altLastMatch !== null
				? GroupMatchAny.fromUnnamed(
						contentMatcher,
						this.altLastMatch
					)
				: contentMatcher;

		return [firstMatch, nextMatch];
	}

	/**
	 * Creates a new AltFirstLastMatchers instance with the given matchers.
	 *
	 * @param altFirstMatch The first matcher.
	 * @param altLastMatch The last matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	public static from(
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
		const firstNav = nav.copy();
		let currentNav = nav.copy();
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const savedNavs: GroupMatchNav[] = [];

		const [firstMatch, nextMatch] =
			this.altFirstLastMatchers.getStartAndNextMatcher(
				this.matcher
			);

		while (count < max) {
			const result =
				count === 0
					? firstMatch.match(currentNav.copy())
					: nextMatch.match(currentNav.copy());

			if (!result) {
				break;
			}

			count++;
			currentNav = result.wholeMatchNav;

			GroupMatchAll.addResultsToSavedNavs(
				result,
				savedNavs
			);
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
