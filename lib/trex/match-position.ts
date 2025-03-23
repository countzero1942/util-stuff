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
}
