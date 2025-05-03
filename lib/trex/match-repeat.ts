import { MatchBase } from "./match-base";
import { MatchAny } from "./match-any-all-opt";
import { MutMatchNav } from "./nav";

export class NumberOfMatches {
	public readonly minNumber: number;
	public readonly maxNumber: number;

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

	public static oneOrMore(): NumberOfMatches {
		return new NumberOfMatches(1, -1);
	}

	public static zeroOrMore(): NumberOfMatches {
		return new NumberOfMatches(0, -1);
	}

	public static exactly(number: number): NumberOfMatches {
		return new NumberOfMatches(number, number);
	}

	public static between(
		minNumber: number,
		maxNumber: number
	): NumberOfMatches {
		return new NumberOfMatches(minNumber, maxNumber);
	}

	public static atLeast(number: number): NumberOfMatches {
		return new NumberOfMatches(number);
	}
}

export class AltFirstLastMatchers {
	protected constructor(
		public readonly altFirstMatch: MatchBase | null = null,
		public readonly altLastMatch: MatchBase | null = null
	) {}

	public getStartAndNextMatcher(
		matcher: MatchBase
	): [MatchBase, MatchBase] {
		const firstMatch =
			this.altFirstMatch !== null
				? MatchAny.from(this.altFirstMatch, matcher)
				: matcher;

		const nextMatch =
			this.altLastMatch !== null
				? MatchAny.from(matcher, this.altLastMatch)
				: matcher;

		return [firstMatch, nextMatch];
	}

	public static from(
		altFirstMatch: MatchBase,
		altLastMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(
			altFirstMatch,
			altLastMatch
		);
	}

	public static fromAltFirst(
		altFirstMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(altFirstMatch, null);
	}

	public static fromAltLast(
		altLastMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(null, altLastMatch);
	}

	public static get default(): AltFirstLastMatchers {
		return AltFirstLastMatchers._default;
	}

	private static _default = new AltFirstLastMatchers();
}

export class MatchRepeat extends MatchBase {
	public constructor(
		public readonly matcher: MatchBase,
		public readonly numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore(),
		public readonly altFirstLastMatchers: AltFirstLastMatchers = AltFirstLastMatchers.default
	) {
		super();
	}

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

	public static from(
		matcher: MatchBase,
		numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore(),
		altFirstLastMatchers: AltFirstLastMatchers = AltFirstLastMatchers.default
	): MatchRepeat {
		return new MatchRepeat(
			matcher,
			numberOfMatches,
			altFirstLastMatchers
		);
	}
}
