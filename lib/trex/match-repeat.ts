import { MatchBase } from "./match-base";
import { MatchAny } from "./match-any-all-opt";
import { MutMatchNav } from "./nav";

export class NumberOfMatches {
	public readonly minNumber: number;
	public readonly maxNumber: number;

	constructor(minNumber: number, maxNumber: number = -1) {
		this.minNumber = minNumber;
		this.maxNumber =
			maxNumber === -1
				? Number.MAX_SAFE_INTEGER
				: maxNumber;

		if (this.minNumber < 0) {
			throw new Error(
				"NumberOfMatches: minNumber must be >= 0"
			);
		}

		if (this.maxNumber < this.minNumber) {
			throw new Error(
				"NumberOfMatches: maxNumber must be >= minNumber"
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
}

export class AltFirstLastMatchers {
	constructor(
		public readonly altFirstMatch: MatchBase | null = null,
		public readonly altLastMatch: MatchBase | null = null
	) {}

	public getStartAndNextMatcher(
		matcher: MatchBase
	): [MatchBase, MatchBase] {
		const firstMatch =
			this.altFirstMatch !== null
				? new MatchAny([this.altFirstMatch, matcher])
				: matcher;

		const nextMatch =
			this.altLastMatch !== null
				? new MatchAny([matcher, this.altLastMatch])
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
}

export class MatchRepeat extends MatchBase {
	public constructor(
		public readonly matcher: MatchBase,
		public readonly numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore(),
		public readonly altFirstLastMatchers: AltFirstLastMatchers = new AltFirstLastMatchers()
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
		altFirstLastMatchers: AltFirstLastMatchers = new AltFirstLastMatchers()
	): MatchRepeat {
		return new MatchRepeat(
			matcher,
			numberOfMatches,
			altFirstLastMatchers
		);
	}
}
