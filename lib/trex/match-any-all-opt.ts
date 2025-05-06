import { MutMatchNav } from "@/trex/nav";
import {
	MatchBase,
	MatchCodePointBase,
} from "@/trex/match-base";
import { isBaseForm } from "unicode-properties";

export class MatchAny extends MatchBase {
	#_matchers: MatchBase[];

	private constructor(matchers: MatchBase[]) {
		super();
		this.#_matchers = matchers.slice(); // defensive copy
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		for (const matcher of this.#_matchers) {
			const result = matcher.match(nav.copy());
			if (result) {
				return result;
			}
		}
		return nav.invalidate();
	}

	public static from(...matchers: MatchBase[]): MatchAny {
		return new MatchAny(matchers);
	}

	public get matchers(): readonly MatchBase[] {
		return this.#_matchers;
	}
}

export class MatchAll extends MatchBase {
	#_matchers: MatchBase[];

	private constructor(matchers: MatchBase[]) {
		super();
		this.#_matchers = matchers.slice(); // defensive copy
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const matchersLength = this.#_matchers.length;
		for (let i = 0; i < matchersLength; i++) {
			const matcher = this.#_matchers[i];
			const result = matcher.match(nav);
			if (!result) {
				return nav.invalidate();
			}
			nav = result;
		}
		return nav;
	}

	public static from(...matchers: MatchBase[]): MatchAll {
		return new MatchAll(matchers);
	}

	public get matchers(): readonly MatchBase[] {
		return this.#_matchers;
	}
}

export class MatchOpt extends MatchBase {
	private constructor(public readonly matcher: MatchBase) {
		super();
	}

	public static from(matcher: MatchBase): MatchOpt {
		return new MatchOpt(matcher);
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const savedNav = nav.copy();
		const result = this.matcher.match(nav);
		if (result) {
			return result;
		}
		return savedNav;
	}
}
