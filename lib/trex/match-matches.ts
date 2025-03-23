import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import { MatchBase } from "@/trex/match-base";

export class MatchAnyString extends MatchBase {
	public constructor(
		public readonly matchValues: (string | StrSlice)[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		for (const matchValue of this.matchValues) {
			if (
				nav.source.startsWith(matchValue, nav.navIndex)
			) {
				nav.moveCaptureForward(matchValue.length);
				return nav;
			}
		}
		return nav.invalidate();
	}
}

export class MatchAnyMatch extends MatchBase {
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

export class MatchAllMatches extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const matchersLength = this.matchers.length;
		const lastMatcherIndex = matchersLength - 1;
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

export class MatchOptMatch extends MatchBase {
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

export class MatchRepeatMatch extends MatchBase {
	public constructor(
		public readonly matcher: MatchBase,
		public readonly minNumberMatches: number = 1,
		public readonly maxNumberMatches: number = Number.MAX_SAFE_INTEGER
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		let count = 0;
		let currentNav = nav;

		while (count < this.maxNumberMatches) {
			const result = this.matcher.match(currentNav);

			if (!result) {
				break;
			}

			count++;
			currentNav = result;
		}

		if (
			count >= this.minNumberMatches &&
			count <= this.maxNumberMatches
		) {
			return currentNav;
		} else {
			return nav.invalidate();
		}
	}
}

export class GhostMatch extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const result = this.matcher.match(nav.copy());
		if (result) {
			nav.moveGhostCaptureForward(result.captureLength);
			return nav;
		}
		return nav.invalidate();
	}
}
