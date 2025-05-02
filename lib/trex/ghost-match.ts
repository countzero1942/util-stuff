import { MatchBase } from "./match-base";
import { MutMatchNav } from "./nav";

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

	public static from(matcher: MatchBase): GhostMatch {
		return new GhostMatch(matcher);
	}
}
