import { MatchNav } from "@/trex/nav";
import { MatchBase, MatchCodePointBase } from "@/trex/match-base";
import { isBaseForm } from "unicode-properties";

export class MatchAny extends MatchBase {
	#_matchers: MatchBase[];

	private constructor(matchers: MatchBase[]) {
		super();
		this.#_matchers = matchers.slice(); // defensive copy
	}
	public match(nav: MatchNav): MatchNav | null {
		for (const matcher of this.#_matchers) {
			const result = matcher.match(nav);
			if (result) {
				return result;
			}
		}
		return null;
	}

	public static fromMatchers(...matchers: MatchBase[]): MatchAny {
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
	public match(nav: MatchNav): MatchNav | null {
		const matchersLength = this.#_matchers.length;
		for (let i = 0; i < matchersLength; i++) {
			const matcher = this.#_matchers[i];
			const result = matcher.match(nav);
			if (!result) {
				return null;
			}
			nav = result;
		}
		return nav;
	}

	public static fromMatchers(...matchers: MatchBase[]): MatchAll {
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

	public match(nav: MatchNav): MatchNav | null {
		const result = this.matcher.match(nav);
		if (result) {
			return result;
		}
		return nav;
	}
}
