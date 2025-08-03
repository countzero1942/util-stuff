import {
	MatchBase,
	MatchCodePointBase,
} from "./match-base";
import { MatchAnyString } from "./match-any-string";
import { MutMatchNav } from "./nav";

/**
 * Matches the code-point-based matcher at the position before
 * the current nav position.
 */
export class LookBehindCodePoint extends MatchBase {
	/**
	 * Creates a new LookBehindCodePoint instance.
	 *
	 * @param matcher The matcher to match.
	 * @returns A new LookBehindCodePoint instance.
	 */
	protected constructor(
		public readonly matcher: MatchCodePointBase
	) {
		super();
	}

	/**
	 * Matches the given code-point-based matcher at the position before
	 * the current nav position.
	 *
	 * If the lookbehind match is successful, the nav is returned unaltered.
	 *
	 * If the lookbehind match is not successful, the nav is invalidated
	 * and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();

		const behindCodePoint = nav.peekBehindCodePoint();
		if (
			behindCodePoint !== undefined &&
			this.matcher.matchCodePoint(behindCodePoint)
		) {
			return nav;
		}

		return nav.invalidate();
	}

	/**
	 * Creates a new LookBehindCodePoint instance.
	 *
	 * @param matcher The matcher to match.
	 * @returns A new LookBehindCodePoint instance.
	 */
	public static from(
		matcher: MatchCodePointBase
	): LookBehindCodePoint {
		return new LookBehindCodePoint(matcher);
	}
}

/**
 * Matches the given string-based matcher at the position before the
 * current nav position.
 *
 * If the lookbehind match is successful, the nav is returned unaltered.
 *
 * If the lookbehind match is not successful, the nav is invalidated
 * and null returned.
 *
 * @param nav The navigation to match.
 * @returns The navigation after matching, or null if no match.
 */
export class LookBehindAnyString extends MatchBase {
	protected constructor(
		public readonly matcher: MatchAnyString
	) {
		super();
	}

	/**
	 * Matches the given string-based matcher at the position before the
	 * current nav position.
	 *
	 * Match uses the prefix index of the string-based matcher to retrieve
	 * the lengths of all the strings in the prefix index. It then looks
	 * back each length and uses prefix index to check if the string exists.
	 *
	 * If the lookbehind match is successful, the nav is returned unaltered.
	 *
	 * If the lookbehind match is not successful, the nav is invalidated
	 * and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();

		const prefixIndex = this.matcher.index;

		const keyLengths = prefixIndex.getAllKeyLengths();

		for (const keyLength of keyLengths) {
			const behindSlice =
				nav.peekBehindSliceByLength(keyLength);
			if (
				behindSlice !== undefined &&
				prefixIndex.hasSlice(behindSlice)
			) {
				return nav;
			}
		}

		return nav.invalidate();
	}

	/**
	 * Creates a new LookBehindAnyString instance.
	 *
	 * @param matcher The matcher to match.
	 * @returns A new LookBehindAnyString instance.
	 */
	public static from(
		matcher: MatchAnyString
	): LookBehindAnyString {
		return new LookBehindAnyString(matcher);
	}
}

/**
 * Matches the given code-point-based matcher at the position after the
 * current nav position.
 *
 * If the lookbehind match is successful, the nav is returned unaltered.
 *
 * If the lookbehind match is not successful, the nav is invalidated
 * and null returned.
 *
 * @param nav The navigation to match.
 * @returns The navigation after matching, or null if no match.
 */
export class LookAheadCodePoint extends MatchBase {
	protected constructor(
		public readonly matcher: MatchCodePointBase
	) {
		super();
	}

	/**
	 * Matches the given code-point-based matcher at the position after the
	 * current nav position.
	 *
	 * If the lookbehind match is successful, the nav is returned unaltered.
	 *
	 * If the lookbehind match is not successful, the nav is invalidated
	 * and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();

		const aheadCodePoint = nav.peekAheadCodePoint();
		if (
			aheadCodePoint !== undefined &&
			this.matcher.matchCodePoint(aheadCodePoint)
		) {
			return nav;
		}

		return nav.invalidate();
	}

	public static from(
		matcher: MatchCodePointBase
	): LookAheadCodePoint {
		return new LookAheadCodePoint(matcher);
	}
}

/**
 * Matches the given string-based matcher at the position after the
 * current nav position.
 *
 * If the lookbehind match is successful, the nav is returned unaltered.
 *
 * If the lookbehind match is not successful, the nav is invalidated
 * and null returned.
 *
 * @param nav The navigation to match.
 * @returns The navigation after matching, or null if no match.
 */
export class LookAheadAnyString extends MatchBase {
	protected constructor(
		public readonly matcher: MatchAnyString
	) {
		super();
	}

	/**
	 * Matches the given string-based matcher at the position after the
	 * current nav position. Uses prefix index for O(1) lookups.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();

		const aheadNav = nav.copyAndMoveNext("LookForward");
		const result = this.matcher.match(aheadNav);

		return result ? nav : nav.invalidate();
	}

	/**
	 * Creates a new LookAheadAnyString instance.
	 *
	 * @param matcher The matcher to match.
	 * @returns A new LookAheadAnyString instance.
	 */
	public static from(
		matcher: MatchAnyString
	): LookAheadAnyString {
		return new LookAheadAnyString(matcher);
	}
}
