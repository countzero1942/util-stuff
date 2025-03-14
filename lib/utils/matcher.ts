import { StrSlice } from "@/utils/slice";
import { match } from "node:assert";

export class MutMatchNav {
	private _startIndex: number;
	private _navIndex: number;
	constructor(public readonly source: StrSlice) {
		this._startIndex = 0;
		this._navIndex = 0;
	}

	public moveForward(length: number = 1) {
		this._navIndex += length;
	}

	public save(): MutMatchNav {
		const nav = new MutMatchNav(this.source);
		nav._startIndex = this._startIndex;
		nav._navIndex = this._navIndex;
		return nav;
	}

	public get startIndex() {
		return this._startIndex;
	}

	public get navIndex() {
		return this._navIndex;
	}

	public get accumulated() {
		return this.source.slice(
			this._startIndex,
			this._navIndex
		);
	}
}

export abstract class MatchBase {
	public abstract match(
		nav: MutMatchNav
	): MutMatchNav | null;
}

export class MatchStart extends MatchBase {
	public match(nav: MutMatchNav): MutMatchNav | null {
		return nav.navIndex === 0 ? nav : null;
	}
}

export const matchStart = new MatchStart();

export class MatchEnd extends MatchBase {
	public match(nav: MutMatchNav): MutMatchNav | null {
		return nav.navIndex === nav.source.length
			? nav
			: null;
	}
}

export const matchEnd = new MatchEnd();

export class MatchCharCode extends MatchBase {
	public constructor(public readonly matchValue: number) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		if (
			nav.source.charCodeAt(nav.navIndex) ===
			this.matchValue
		) {
			nav.moveForward(1);
			return nav;
		}
		return null;
	}
}

export class MatchCodePoint extends MatchBase {
	public constructor(public readonly matchValue: number) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (codePoint === this.matchValue) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveForward(length);
			return nav;
		}
		return null;
	}
}

export class MatchString extends MatchBase {
	public constructor(
		public readonly matchValue: string | StrSlice
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		if (
			nav.source.startsWith(
				this.matchValue,
				nav.navIndex
			)
		) {
			nav.moveForward(this.matchValue.length);
			return nav;
		}
		return null;
	}
}

export class MatchAnyString extends MatchBase {
	public constructor(
		public readonly matchValues: (string | StrSlice)[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		for (const matchValue of this.matchValues) {
			if (
				nav.source.startsWith(matchValue, nav.navIndex)
			) {
				nav.moveForward(matchValue.length);
				return nav;
			}
		}
		return null;
	}
}

export class MatchAny extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		for (const matcher of this.matchers) {
			const result = matcher.match(nav);
			if (result) {
				return result;
			}
		}
		return null;
	}
}

export class MatchAll extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		for (const matcher of this.matchers) {
			const result = matcher.match(nav);
			if (!result) {
				return null;
			}
			nav = result;
		}
		return nav;
	}
}

export class MatchOpt extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		const savedNav = nav.save();
		const result = this.matcher.match(nav);
		if (result) {
			return result;
		}
		return savedNav;
	}
}

export class MatchNot extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		const savedNav = nav.save();
		const result = this.matcher.match(nav);
		if (result) {
			return null;
		}
		return savedNav;
	}
}
