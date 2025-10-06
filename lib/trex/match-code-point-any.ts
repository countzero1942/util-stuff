import { MatchCodePointBase } from "./match-base";
import type { MatchNav } from "./nav";

/**
 * MatchCodePointAny: a union matcher for code point-based matchers.
 * - Accepts an array of MatchCodePointBase.
 * - match() returns the first successful match, or null if none match.
 * - matchCodePoint() returns the codepoint for the first matcher that matches, or undefined.
 * - Immutable.
 */
export class MatchCodePointAny extends MatchCodePointBase {
	readonly #_matchers: readonly MatchCodePointBase[];

	private constructor(matchers: readonly MatchCodePointBase[]) {
		super();

		if (matchers === undefined || matchers.length === 0) {
			throw new Error("MatchCodePointAny: No matchers provided");
		}
		this.#_matchers = matchers.slice(); // defensive copy
	}

	/**
	 * Creates a MatchCodePointAny from an array of matchers.
	 *
	 * Matches the first successful match of any of the given matchers
	 * of MatchCodePointBase.
	 *
	 * @param matchers Array of matchers to include in the union
	 * @returns A new MatchCodePointAny instance
	 */
	static from(
		...matchers: readonly MatchCodePointBase[]
	): MatchCodePointAny {
		return new MatchCodePointAny(matchers);
	}

	/**
	 * Returns the first successful match of any of the given matchers
	 * of MatchCodePointBase.
	 *
	 * @param nav Navigation state to use for matching
	 * @returns The first successful match, or null if no match
	 */
	public match(nav: MatchNav): MatchNav | null {
		for (const matcher of this.#_matchers) {
			const result = matcher.match(nav);
			if (result) return result;
		}
		return null;
	}

	/**
	 * Returns true if any matcher matches the codepoint, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if any matcher matches the codepoint, otherwise false
	 */
	public matchCodePoint(codePoint: number): boolean {
		for (const matcher of this.#_matchers) {
			if (matcher.matchCodePoint(codePoint)) return true;
		}
		return false;
	}

	/**
	 * Returns array of MatchCodePointBase matchers of which any can match in order.
	 *
	 * @returns Array of matchers
	 */
	public get matchers(): readonly MatchCodePointBase[] {
		return this.#_matchers;
	}
}
