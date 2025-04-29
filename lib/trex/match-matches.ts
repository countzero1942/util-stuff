import { MutMatchNav } from "@/trex/nav";
import { MatchBase } from "@/trex/match-base";

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

export class MatchNot extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const savedNav = nav.copy();
		const result = this.matcher.match(nav);
		if (result) {
			return nav.invalidate();
		}

		return savedNav;
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

export class MatchRepeat extends MatchBase {
	public constructor(
		public readonly matcher: MatchBase,
		public readonly minNumberMatches: number = 1,
		public readonly maxNumberMatches: number = -1,
		public readonly altFirstMatch: MatchBase | null = null,
		public readonly altLastMatch: MatchBase | null = null
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		let count = 0;
		let currentNav = nav;
		const max =
			this.maxNumberMatches < 0
				? Number.MAX_SAFE_INTEGER
				: this.maxNumberMatches;

		const firstMatch = this.altFirstMatch
			? new MatchAny([this.altFirstMatch, this.matcher])
			: this.matcher;

		const nextMatch = this.altLastMatch
			? new MatchAny([this.matcher, this.altLastMatch])
			: this.matcher;

		while (count < max) {
			const result =
				count === 0
					? firstMatch.match(currentNav.copy())
					: nextMatch.match(currentNav.copy());

			if (!result) {
				break;
			}

			count++;
			currentNav = result;
		}

		if (count >= this.minNumberMatches && count <= max) {
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
		const result = this.matcher.match(
			nav.copyAndMoveStartToNav()
		);
		if (result) {
			nav.moveGhostCaptureForward(result.captureLength);
			return nav;
		}
		return nav.invalidate();
	}
}
