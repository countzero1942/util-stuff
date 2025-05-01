import {
	MatchBase,
	MatchCodePointBase,
} from "./match-base";
import { MutMatchNav } from "./nav";

export class MatchNot extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
		if (matcher instanceof MatchCodePointBase) {
			throw new Error(
				"MatchNot: Invalid matcher type: MatchCodePointBase. " +
					"Use MatchNotCodePoint instead."
			);
		}
		if (matcher instanceof MatchNot) {
			throw new Error(
				"MatchNot: Invalid matcher type: MatchNot. " +
					"Recursion not supported."
			);
		}
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const result = this.matcher.match(nav.copy());
		if (result) {
			return nav.invalidate();
		}

		return nav;
	}
}
