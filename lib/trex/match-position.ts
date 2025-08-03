import { MatchPositionBase } from "@/trex/match-base";
import { MutMatchNav } from "@/trex/nav";

/**
 * Matches if the nav is at the start of the source StrSlice.
 */
export class MatchStartSlice extends MatchPositionBase {
	/**
	 * Creates a new MatchStartSlice instance.
	 *
	 * @returns A new MatchStartSlice instance.
	 */
	private constructor() {
		super();
	}

	private static _default = new MatchStartSlice();

	/**
	 * Gets the default MatchStartSlice instance.
	 *
	 * @returns The default MatchStartSlice instance.
	 */
	public static get default(): MatchStartSlice {
		return MatchStartSlice._default;
	}

	/**
	 * Matches if the nav is at the start of the source StrSlice.
	 *
	 * If the nav is at the start, the nav is returned unaltered.
	 *
	 * If the nav is not at the start, the nav is invalidated and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		return nav.captureIndex === 0
			? nav
			: nav.invalidate();
	}
}

/**
 * Matches if the nav is at the end of the source StrSlice.
 */
export class MatchEndSlice extends MatchPositionBase {
	/**
	 * Creates a new MatchEndSlice instance.
	 *
	 * @returns A new MatchEndSlice instance.
	 */
	private constructor() {
		super();
	}

	private static _default = new MatchEndSlice();

	/**
	 * Gets the default MatchEndSlice instance.
	 *
	 * @returns The default MatchEndSlice instance.
	 */
	public static get default(): MatchEndSlice {
		return MatchEndSlice._default;
	}

	/**
	 * Matches if the nav is at the end of the source StrSlice.
	 *
	 * If the nav is at the end, the nav is returned unaltered.
	 *
	 * If the nav is not at the end, the nav is invalidated and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		return nav.captureIndex === nav.source.length
			? nav
			: nav.invalidate();
	}
}

/**
 * Matches if the nav is NOT at the start of the source StrSlice.
 */
export class MatchNotStartSlice extends MatchPositionBase {
	/**
	 * Creates a new MatchNotStartSlice instance.
	 *
	 * @returns A new MatchNotStartSlice instance.
	 */
	private constructor() {
		super();
	}

	private static _default = new MatchNotStartSlice();

	/**
	 * Gets the default MatchNotStartSlice instance.
	 *
	 * @returns The default MatchNotStartSlice instance.
	 */
	public static get default(): MatchNotStartSlice {
		return MatchNotStartSlice._default;
	}

	/**
	 * Matches if the nav is NOT at the start of the source StrSlice.
	 *
	 * If the nav is NOT at the start, the nav is returned unaltered.
	 *
	 * If the nav is at the start, the nav is invalidated and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		return nav.captureIndex !== 0
			? nav
			: nav.invalidate();
	}
}

/**
 * Matches if the nav is NOT at the end of the source StrSlice.
 */
export class MatchNotEndSlice extends MatchPositionBase {
	/**
	 * Creates a new MatchNotEndSlice instance.
	 *
	 * @returns A new MatchNotEndSlice instance.
	 */
	private constructor() {
		super();
	}

	private static _default = new MatchNotEndSlice();

	/**
	 * Gets the default MatchNotEndSlice instance.
	 *
	 * @returns The default MatchNotEndSlice instance.
	 */
	public static get default(): MatchNotEndSlice {
		return MatchNotEndSlice._default;
	}

	/**
	 * Matches if the nav is NOT at the end of the source StrSlice.
	 *
	 * If the nav is NOT at the end, the nav is returned unaltered.
	 *
	 * If the nav is at the end, the nav is invalidated and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		return nav.captureIndex !== nav.source.length
			? nav
			: nav.invalidate();
	}
}
