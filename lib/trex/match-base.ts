import { MutMatchNav } from "@/trex/nav";

export abstract class MatchBase {
	public abstract match(
		nav: MutMatchNav
	): MutMatchNav | null;
}

export abstract class MatchCodePointBase extends MatchBase {
	constructor() {
		super();
	}
}

export abstract class MatchPositionBase extends MatchBase {
	constructor() {
		super();
	}
}
