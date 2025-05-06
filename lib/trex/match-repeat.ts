import { MatchBase } from "./match-base";
import { MatchAny } from "./match-any-all-opt";
import { MutMatchNav } from "./nav";

/**
 * Defines the number of matches for a repeat matcher.
 */
export class NumberOfMatches {
	public readonly minNumber: number;
	public readonly maxNumber: number;

	/**
	 * @param minNumber The minimum number of matches.
	 * @param maxNumber The maximum number of matches.
	 * If -1 is passed for maxNumber, it is set to Number.MAX_SAFE_INTEGER.
	 */
	protected constructor(
		minNumber: number,
		maxNumber: number = -1
	) {
		this.minNumber = minNumber;
		this.maxNumber =
			maxNumber === -1
				? Number.MAX_SAFE_INTEGER
				: maxNumber;

		if (this.minNumber < 0) {
			throw new Error(
				"NumberOfMatches: minNumber must be >= 0" +
					` (${this.minNumber})`
			);
		}

		if (this.maxNumber < this.minNumber) {
			throw new Error(
				"NumberOfMatches: minNumber must be <= maxNumber" +
					` (${this.minNumber} > ${this.maxNumber})`
			);
		}
	}

	/**
	 * Matches one or more times. (Static getter)
	 */
	public static get oneOrMore(): NumberOfMatches {
		return new NumberOfMatches(1, -1);
	}

	/**
	 * Matches zero or more times. (Static getter)
	 */
	public static get zeroOrMore(): NumberOfMatches {
		return new NumberOfMatches(0, -1);
	}

	/**
	 * Matches exactly the given number of times.
	 */
	public static exactly(number: number): NumberOfMatches {
		return new NumberOfMatches(number, number);
	}

	/**
	 * Matches between the given number of times.
	 */
	public static between(
		minNumber: number,
		maxNumber: number
	): NumberOfMatches {
		return new NumberOfMatches(minNumber, maxNumber);
	}

	/**
	 * Matches at least the given number of times.
	 *
	 */
	public static atLeast(number: number): NumberOfMatches {
		return new NumberOfMatches(number);
	}
}

/**
 * Defines the first and last matchers for a repeat matcher.
 */
export class AltFirstLastMatchers {
	protected constructor(
		public readonly altFirstMatch: MatchBase | null = null,
		public readonly altLastMatch: MatchBase | null = null
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
		contentMatcher: MatchBase
	): [MatchBase, MatchBase] {
		const firstMatch =
			this.altFirstMatch !== null
				? MatchAny.from(
						this.altFirstMatch,
						contentMatcher
					)
				: contentMatcher;

		const nextMatch =
			this.altLastMatch !== null
				? MatchAny.from(
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
		altFirstMatch: MatchBase,
		altLastMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(
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
		altFirstMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(altFirstMatch, null);
	}

	/**
	 * Creates a new AltFirstLastMatchers instance with only the altLastMatch.
	 *
	 * @param altLastMatch The last matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	public static fromAltLast(
		altLastMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(null, altLastMatch);
	}

	/**
	 * Returns the default AltFirstLastMatchers instance.
	 *
	 * The default instance has null for both altFirstMatch and altLastMatch.
	 *
	 * @returns The default AltFirstLastMatchers instance.
	 */
	public static get default(): AltFirstLastMatchers {
		return AltFirstLastMatchers._default;
	}

	private static _default = new AltFirstLastMatchers();
}

/**
 * A repeat matcher.
 */
export class MatchRepeat extends MatchBase {
	/**
	 * Creates a new MatchRepeat instance.
	 *
	 * @param matcher The matcher to repeat.
	 * @param numberOfMatches The number of times to repeat.
	 * @param altFirstLastMatchers The altFirst and altLast matchers.
	 */
	public constructor(
		public readonly matcher: MatchBase,
		public readonly numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore,
		public readonly altFirstLastMatchers: AltFirstLastMatchers = AltFirstLastMatchers.default
	) {
		super();
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
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		let count = 0;
		let currentNav = nav;
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;

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
			currentNav = result;
		}

		if (count >= min && count <= max) {
			return currentNav;
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
		matcher: MatchBase,
		numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore,
		altFirstLastMatchers: AltFirstLastMatchers = AltFirstLastMatchers.default
	): MatchRepeat {
		return new MatchRepeat(
			matcher,
			numberOfMatches,
			altFirstLastMatchers
		);
	}
}
