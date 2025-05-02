import { MutMatchNav } from "@/trex/nav";
import {
	MatchBase,
	MatchCodePointBase,
} from "@/trex/match-base";
import { isBaseForm } from "unicode-properties";

export class MatchAny extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		for (const matcher of this.matchers) {
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
}

export class MatchAll extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const matchersLength = this.matchers.length;
		for (let i = 0; i < matchersLength; i++) {
			const matcher = this.matchers[i];
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
}

export class MatchOpt extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
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
