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
	readonly #matchers: readonly MatchCodePointBase[];

	private constructor(matchers: MatchCodePointBase[]) {
		super();
		this.#matchers = matchers.slice(); // defensive copy
	}

	static from(
		...matchers: MatchCodePointBase[]
	): MatchCodePointAny {
		return new MatchCodePointAny(matchers);
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		for (const matcher of this.#matchers) {
			const result = matcher.match(nav.copy());
			if (result) return result;
		}
		return nav.invalidate();
	}

	/**
	 * Returns true if any matcher matches the codepoint, otherwise false.
	 */
	public matchCodePoint(codePoint: number): boolean {
		for (const matcher of this.#matchers) {
			if (matcher.matchCodePoint(codePoint)) return true;
		}
		return false;
	}
}
