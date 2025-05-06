import { MatchCodePointBase } from "./match-base";
import type { MutMatchNav } from "./nav";

/**
 * MatchCodePointAny: a union matcher for code point-based matchers.
 * - Accepts an array of MatchCodePointBase.
 * - match() returns the first successful match, or nav.invalidate().
 * - matchCodePoint() returns the codepoint for the first matcher that matches, or undefined.
 * - Immutable.
 */
export class MatchCodePointAny extends MatchCodePointBase {
	readonly #_matchers: readonly MatchCodePointBase[];

	private constructor(
		matchers: readonly MatchCodePointBase[]
	) {
		super();

		if (matchers === undefined || matchers.length === 0) {
			throw new Error(
				"MatchCodePointAny: No matchers provided"
			);
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
	 * @returns The first successful match, or nav.invalidate() if no match
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		for (const matcher of this.#_matchers) {
			const result = matcher.match(nav.copy());
			if (result) return result;
		}
		return nav.invalidate();
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
