import { MatchNav } from "@/trex/nav";

export abstract class MatchBase {
	public abstract match(nav: MatchNav): MatchNav | null;
}

/**
 * Code point matcher base class.
 *
 * Requires implementation of matchCodePoint abstract method.
 * This allows a direct match of a code point.
 *
 * @abstract
 */
export abstract class MatchCodePointBase extends MatchBase {
	constructor() {
		super();
	}

	public abstract matchCodePoint(codePoint: number): boolean;
}

/**
 * String matcher base class.
 *
 * Requires implementation of matchString abstract method.
 * This allows a direct match of a string.
 *
 * @abstract
 */
export abstract class MatchStringBase extends MatchBase {
	constructor() {
		super();
	}

	public abstract matchString(string: string): boolean;
}

export abstract class MatchPositionBase extends MatchBase {
	constructor() {
		super();
	}
}
