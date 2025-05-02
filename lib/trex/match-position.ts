import { MatchPositionBase } from "@/trex/match-base";
import { MutMatchNav } from "@/trex/nav";

export class MatchStartSlice extends MatchPositionBase {
	private static _default = new MatchStartSlice();
	public static get default(): MatchStartSlice {
		return MatchStartSlice._default;
	}
	private constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex === 0 ? nav : nav.invalidate();
	}
}

export class MatchEndSlice extends MatchPositionBase {
	private static _default = new MatchEndSlice();
	public static get default(): MatchEndSlice {
		return MatchEndSlice._default;
	}
	private constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex === nav.source.length
			? nav
			: nav.invalidate();
	}
}

export class MatchNotStartSlice extends MatchPositionBase {
	private static _default = new MatchNotStartSlice();
	public static get default(): MatchNotStartSlice {
		return MatchNotStartSlice._default;
	}
	private constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex !== 0 ? nav : nav.invalidate();
	}
}

export class MatchNotEndSlice extends MatchPositionBase {
	private static _default = new MatchNotEndSlice();
	public static get default(): MatchNotEndSlice {
		return MatchNotEndSlice._default;
	}
	private constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex !== nav.source.length
			? nav
			: nav.invalidate();
	}
}

