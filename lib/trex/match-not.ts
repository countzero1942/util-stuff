import { MatchBase, MatchCodePointBase } from "./match-base";
import { MatchNav } from "./nav";

/**
 * Matches the given matcher at the current nav position.
 *
 * If the matcher matches, null is returned.
 *
 * This is for general matchers. Code-point matchers should use
 * MatchNotCodePoint instead.
 *
 * @param nav The navigation to match.
 * @returns The navigation after matching, or null if no match.
 */
export class MatchNot extends MatchBase {
	/**
	 * Creates a new MatchNot instance.
	 *
	 * Throws Error if matcher is a MatchCodePointBase or MatchNot.
	 *
	 * @param matcher The matcher to match.
	 * @returns A new MatchNot instance.
	 */
	protected constructor(public readonly matcher: MatchBase) {
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

	public match(nav: MatchNav): MatchNav | null {
		const result = this.matcher.match(nav);
		if (result) {
			return null;
		}

		return nav;
	}

	/**
	 * Creates a new MatchNot instance.
	 *
	 * @param matcher The matcher to match.
	 * @returns A new MatchNot instance.
	 */
	public static from(matcher: MatchBase): MatchNot {
		return new MatchNot(matcher);
	}
}
