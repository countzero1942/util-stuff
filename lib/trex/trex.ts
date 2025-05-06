import { StrSlice } from "@/utils/slice";
import { MatchBase, MutMatchNav } from "@/trex";
import { log } from "console";

/**
 * A token return from TRex find operations.
 *
 * It contains the category, kind, and match value.
 */
export class Token<
	TCategory extends string = string,
	TKind extends string = string,
> {
	/**
	 * Creates a new Token instance.
	 *
	 * @param category The category of the token.
	 * @param kind The kind of the token.
	 * @param matchValue The match value of the token.
	 */
	constructor(
		public readonly category: TCategory,
		public readonly kind: TKind,
		public readonly matchValue: StrSlice
	) {}

	/**
	 * Returns a string representation of the token.
	 *
	 * @returns A string representation of the token.
	 */
	public toString(): string {
		return `${this.category}:${this.kind} '${this.matchValue.value}'`;
	}
}

/**
 * A token return from TRex find operations.
 *
 * It contains the category, kind, and match navigator.
 *
 * The match navigator contains the match and ghost match StrSlices.
 */
export class NavToken<
	TCategory extends string = string,
	TKind extends string = string,
> {
	/**
	 * Creates a new NavToken instance.
	 *
	 * @param category The category of the token.
	 * @param kind The kind of the token.
	 * @param matchNav The match navigator containing the match and ghost match StrSlices.
	 */
	constructor(
		public readonly category: TCategory,
		public readonly kind: TKind,
		public readonly matchNav: MutMatchNav
	) {}

	/**
	 * Returns a string representation of the token.
	 *
	 * @returns A string representation of the token.
	 */
	public toString(): string {
		return `${this.category}${this.kind} '${this.matchNav.captureMatch.value}'`;
	}

	/**
	 * Returns a string representation of the token, including the ghost match.
	 *
	 * @returns A string representation of the token, including the ghost match.
	 */
	public toStringWithGhostMatch(): string {
		return (
			`${this.category}${this.kind} '${this.matchNav.captureMatch.value}'` +
			` + '${this.matchNav.ghostMatch.value}'`
		);
	}
}

/**
 * The default category for find tokens.
 */
export type FindCategory = ":find";

/**
 * The default kind for find tokens.
 */
export type FindKind = ":match" | ":fragment";

/**
 * A default token returned from a find operation.
 */
export class FindToken extends Token<
	FindCategory,
	FindKind
> {}

/**
 * A default token returned from a find operation.
 */
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

/**
 * Result of a findAll operation containing both the matched portion
 * and the fragment before the match
 */
export class FindAllResult {
	/**
	 * Creates a new FindAllResult instance.
	 *
	 * @param results Array of FindResult objects
	 */
	constructor(public readonly results: FindResult[]) {}

	/**
	 * Returns an array of NavTokens for the results.
	 *
	 * @returns An array of NavTokens for the results.
	 */
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

	/**
	 * Returns an array of Tokens for the results.
	 *
	 * @returns An array of Tokens for the results.
	 */
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

/**
 * A TRex instance. Used for searching text and breaking text into tokens.
 */
export class TRex {
	public constructor(public readonly matcher: MatchBase) {}

	/**
	 * Finds the first match in the source text.
	 *
	 * @param source The source text to search.
	 * @param start The starting position in the source text.
	 * @returns A FindResult object containing the match navigator and fragment navigator.
	 */
	public find(
		source: StrSlice,
		start: number = 0
	): FindResult {
		let nav = MutMatchNav.from(source, start);
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

	/**
	 * Finds all matches in the source text.
	 *
	 * @param source The source text to search.
	 * @returns An array of FindResult objects.
	 */
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
