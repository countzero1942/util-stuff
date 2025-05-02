import { MatchPositionBase } from "@/trex/match-base";
import { MutMatchNav } from "@/trex/nav";

export class MatchStartSlice extends MatchPositionBase {
	constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex === 0 ? nav : nav.invalidate();
	}

	public static get default(): MatchStartSlice {
		return matchStartSlice;
	}
}

export class MatchEndSlice extends MatchPositionBase {
	constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex === nav.source.length
			? nav
			: nav.invalidate();
	}

	public static get default(): MatchEndSlice {
		return matchEndSlice;
	}
}

export class MatchNotStartSlice extends MatchPositionBase {
	constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex !== 0 ? nav : nav.invalidate();
	}

	public static get default(): MatchNotStartSlice {
		return matchNotStartSlice;
	}
}

export class MatchNotEndSlice extends MatchPositionBase {
	constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex !== nav.source.length
			? nav
			: nav.invalidate();
	}

	public static get default(): MatchNotEndSlice {
		return matchNotEndSlice;
	}
}

export const matchStartSlice = new MatchStartSlice();

export const matchEndSlice = new MatchEndSlice();

export const matchNotStartSlice = new MatchNotStartSlice();

export const matchNotEndSlice = new MatchNotEndSlice();
