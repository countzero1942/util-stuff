import { StrSlice } from "@/utils/slice";
import { MatchBase, MutMatchNav } from "@/trex";

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
}

export class TRex {
	public constructor(public readonly matcher: MatchBase) {}
	public find(
		source: StrSlice,
		start: number = 0
	): FindResult {
		let nav = new MutMatchNav(source, start);
		const originalNav = nav.copy();

		while (!nav.isEndSlice) {
			const result = this.matcher.match(nav.copy());
			if (result) {
				return {
					matchNav: result,
					fragmentNav: originalNav.moveCaptureForward(
						result.startIndex
					),
				};
			}
			nav = nav.moveStartForwardOneCodePoint();
		}

		return {
			matchNav: nav.invalidate(),
			fragmentNav: originalNav.moveCaptureToEnd(),
		};
	}
}
