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
}

export class MatchOpt extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
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
