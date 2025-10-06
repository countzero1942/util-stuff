import { MatchNav } from "@/trex/nav";

export abstract class MatchBase {
	public abstract match(nav: MatchNav): MatchNav | null;
}

export abstract class MatchCodePointBase extends MatchBase {
	constructor() {
		super();
	}

	public abstract matchCodePoint(codePoint: number): boolean;
}

export abstract class MatchStringBase extends MatchBase {
	constructor() {
		super();
	}

	public abstract matchString(string: string): boolean;
}

export abstract class MatchPositionBase extends MatchBase {
	constructor() {
		super();
	}
}
