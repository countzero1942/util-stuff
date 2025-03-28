import {
	matchEndSlice,
	matchStartSlice,
	matchUnicodeSpace,
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
		nav.assertFresh();

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

export const matchManyUnicodeSpaces = new MatchRepeatMatch(
	matchUnicodeSpace
);

export const matchWordStart = new MatchAnyMatch([
	matchStartSlice,
	new LookBehindCodePoint(matchUnicodeSpace),
]);

export const matchWordEnd = new MatchAnyMatch([
	matchEndSlice,
	new GhostMatch(matchManyUnicodeSpaces),
]);

export class MatchWord extends MatchBase {
	private readonly wrapMatcher: MatchBase;
	public constructor(public readonly matcher: MatchBase) {
		super();
		this.wrapMatcher = new MatchAllMatches([
			matchWordStart,
			this.matcher,
			matchWordEnd,
		]);
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return this.wrapMatcher.match(nav);
	}
}
