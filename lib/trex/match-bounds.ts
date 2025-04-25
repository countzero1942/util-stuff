import {
	matchEndSlice,
	matchStartSlice,
	matchUnicodeSpace,
	matchUnicodeWhiteSpace,
} from "./consts";
import {
	MatchBase,
	MatchCodePointBase,
	MatchStringBase,
} from "./match-base";
import {
	GhostMatch,
	MatchAllMatches,
	MatchAnyMatch,
	MatchRepeatMatch,
} from "./match-matches";
import { MatchAnyString } from "./match-string";
import { MutMatchNav } from "./nav";

export class LookBehindCodePoint extends MatchBase {
	public constructor(
		public readonly matcher: MatchCodePointBase
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();

		const behindCodePoint = nav.peekBeforeCodePoint();
		if (
			behindCodePoint !== undefined &&
			this.matcher.matchCodePoint(behindCodePoint)
		) {
			return nav;
		}

		return nav.invalidate();
	}
}

export class LookBehindAnyString extends MatchBase {
	public constructor(
		public readonly matcher: MatchAnyString
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();

		const prefixIndex = this.matcher.index;

		const keyLengths = prefixIndex.getAllKeyLengths();

		for (const keyLength of keyLengths) {
			const behindSlice =
				nav.peekBeforeSliceByLength(keyLength);
			if (
				behindSlice !== undefined &&
				prefixIndex.hasSlice(behindSlice)
			) {
				return nav;
			}
		}

		return nav.invalidate();
	}
}

export class LookAheadCodePoint extends MatchBase {
	public constructor(
		public readonly matcher: MatchCodePointBase
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();

		const aheadCodePoint = nav.peekAheadCodePoint();
		if (
			aheadCodePoint !== undefined &&
			this.matcher.matchCodePoint(aheadCodePoint)
		) {
			return nav;
		}

		return nav.invalidate();
	}
}

export class LookAheadAnyString extends MatchBase {
	public constructor(
		public readonly matcher: MatchAnyString
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();

		const aheadNav = nav.copyAndMoveStartToNav();
		const result = this.matcher.match(aheadNav);

		return result ? nav : nav.invalidate();
	}
}
