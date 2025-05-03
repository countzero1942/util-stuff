import {
	MatchBase,
	MatchCodePointBase,
} from "./match-base";
import { MatchAnyString } from "./match-string";
import { MutMatchNav } from "./nav";

export class LookBehindCodePoint extends MatchBase {
	protected constructor(
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

	public static from(
		matcher: MatchCodePointBase
	): LookBehindCodePoint {
		return new LookBehindCodePoint(matcher);
	}
}

export class LookBehindAnyString extends MatchBase {
	protected constructor(
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

	public static from(
		matcher: MatchAnyString
	): LookBehindAnyString {
		return new LookBehindAnyString(matcher);
	}
}

export class LookAheadCodePoint extends MatchBase {
	protected constructor(
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

	public static from(
		matcher: MatchCodePointBase
	): LookAheadCodePoint {
		return new LookAheadCodePoint(matcher);
	}
}

export class LookAheadAnyString extends MatchBase {
	protected constructor(
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

	public static from(
		matcher: MatchAnyString
	): LookAheadAnyString {
		return new LookAheadAnyString(matcher);
	}
}
