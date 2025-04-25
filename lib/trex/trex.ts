import { StrSlice } from "@/utils/slice";
import { MatchBase, MutMatchNav } from "@/trex";
import { log } from "console";

export class Token<
	TCategory extends string = string,
	TKind extends string = string,
> {
	constructor(
		public readonly category: TCategory,
		public readonly kind: TKind,
		public readonly matchValue: StrSlice
	) {}

	public toString(): string {
		return `${this.category}:${this.kind} '${this.matchValue.value}'`;
	}
}

export class NavToken<
	TCategory extends string = string,
	TKind extends string = string,
> {
	constructor(
		public readonly category: TCategory,
		public readonly kind: TKind,
		public readonly matchNav: MutMatchNav
	) {}

	public toString(): string {
		return `${this.category}:${this.kind} '${this.matchNav.captureMatch.value}'`;
	}
}

export type FindCategory = ":find";

export type FindKind = ":match" | ":fragment";

export class FindToken extends Token<
	FindCategory,
	FindKind
> {}

export class FindNavToken extends NavToken<
	FindCategory,
	FindKind
> {}

/**
 * Result of a split operation containing both the matched portion
 * and the fragment before the match
 */
export type FindResult = {
	/**
	 * Navigator for the matched portion, or null if no match
	 */
	matchNav: MutMatchNav | null;
	/**
	 * Navigator for the fragment before the match
	 */
	fragmentNav: MutMatchNav;
};

export class FindAllResult {
	constructor(public readonly results: FindResult[]) {}

	public getNavTokens(): FindNavToken[] {
		const navTokens: FindNavToken[] = [];

		for (const result of this.results) {
			// Add fragment token if not empty
			if (result.fragmentNav.captureMatch.length > 0) {
				navTokens.push(
					new FindNavToken(
						":find",
						":fragment",
						result.fragmentNav
					)
				);
			}

			// Add match token if match exists
			if (result.matchNav !== null) {
				navTokens.push(
					new FindNavToken(
						":find",
						":match",
						result.matchNav
					)
				);
			}
		}

		return navTokens;
	}

	public getTokens(): FindToken[] {
		return this.getNavTokens().map(
			navToken =>
				new FindToken(
					navToken.category,
					navToken.kind,
					navToken.matchNav.captureMatch
				)
		);
	}
}

export class TRex {
	public constructor(public readonly matcher: MatchBase) {}

	public find(
		source: StrSlice,
		start: number = 0
	): FindResult {
		let nav = new MutMatchNav(source, start);
		const originalNav = nav.copy();

		// const str =
		// 	"abc def xxx hij yyy lmn opq xxx yyz xxx yyy mmm cba xxxyyy yyyxxx yyy";
		//     01234567890123456789012345678901234567890123456789012345678901234567890
		while (!nav.isEndSlice) {
			const result = this.matcher.match(nav.copy());
			if (result) {
				const matchNav = result;
				const fragmentNav =
					originalNav.moveCaptureForward(
						result.startIndex - originalNav.startIndex
					);
				return {
					matchNav,
					fragmentNav,
				};
			}
			nav = nav.moveStartForwardOneCodePoint();
		}

		const matchNav = nav.invalidate();
		const fragmentNav = originalNav.moveCaptureToEnd();

		return {
			matchNav,
			fragmentNav,
		};
	}

	public findAll(source: StrSlice): FindAllResult {
		const results: FindResult[] = [];
		let currentPosition = 0;

		while (currentPosition < source.length) {
			const str =
				"abc def xxx hij yyy lmn opq xxx yyz xxx yyy mmm cba xxxyyy yyyxxx yyy";
			//  01234567890123456789012345678901234567890123456789012345678901234567890

			const result = this.find(source, currentPosition);
			results.push(result);

			// If no match was found, we're done
			if (result.matchNav === null) {
				break;
			}

			if (result.matchNav.isEmptyMatch) {
				throw new Error("Empty match found");
			}

			// Move to the position after the current match
			currentPosition = result.matchNav.navIndex;
		}

		return new FindAllResult(results);
	}
}
