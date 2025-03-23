import { StrSlice } from "@/utils/slice";
import { MatchBase } from "@/trex/match-base";
import { MutMatchNav, FindResult } from "@/trex/nav";

export abstract class FindMatchBase {
	constructor() {}
	public abstract match(nav: MutMatchNav): FindResult;
}

export class FindAnyString extends FindMatchBase {
	public constructor(
		public readonly matchValues: (string | StrSlice)[]
	) {
		super();
	}

	public match(nav: MutMatchNav): FindResult {
		nav.assertValid();
		nav.assertFresh();
		const [matchIndex, stringIndex] =
			nav.source.indexOfMany(
				this.matchValues,
				nav.startIndex
			);
		if (matchIndex >= 0) {
			const matchLength =
				this.matchValues[stringIndex].length;
			return nav.splitFragmentAndMatch(
				matchIndex,
				matchLength
			);
		}

		const fragmentNav = nav.copy().moveCaptureToEnd();
		const matchNav = nav.invalidate();
		return {
			matchNav,
			fragmentNav,
		};
	}
}

export class FindMatch extends FindMatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}
	public match(nav: MutMatchNav): FindResult {
		nav.assertValid();
		nav.assertFresh();
		let currentNav = nav.copy();
		const originalNav = nav.copy();

		while (!currentNav.isEndSlice) {
			const result = this.matcher.match(
				currentNav.copyAndMoveStartToNav()
			);
			if (result) {
				return originalNav.splitFragmentAndMatch(
					result.startIndex,
					result.captureLength
				);
			}
			currentNav =
				currentNav.moveCaptureForwardOneCodePoint();
		}

		return {
			matchNav: nav.invalidate(),
			fragmentNav: currentNav,
		};
	}
}
