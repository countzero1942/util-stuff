import { StrSlice } from "@/utils/slice";
import { CodePointSeq } from "./seq";

export class MutMatchNav {
	private _startIndex: number;
	private _navIndex: number;
	private _lastNavIndex: number;
	constructor(public readonly source: StrSlice) {
		this._startIndex = 0;
		this._navIndex = 0;
		this._lastNavIndex = 0;
	}

	public moveForward(length: number = 1) {
		this._lastNavIndex = this._navIndex;
		this._navIndex += length;
	}

	public save(): MutMatchNav {
		const nav = new MutMatchNav(this.source);
		nav._startIndex = this._startIndex;
		nav._navIndex = this._navIndex;
		nav._lastNavIndex = this._lastNavIndex;
		return nav;
	}

	public get startIndex() {
		return this._startIndex;
	}

	public get navIndex() {
		return this._navIndex;
	}

	public get lastNavIndex() {
		return this._lastNavIndex;
	}

	public get accumulated() {
		return this.source.slice(
			this._startIndex,
			this._navIndex
		);
	}

	public get matched() {
		return this.source.slice(
			this._lastNavIndex,
			this._navIndex
		);
	}
}

export abstract class MatchBase {
	public abstract match(
		nav: MutMatchNav
	): MutMatchNav | null;
}

export class MatchStart extends MatchBase {
	public match(nav: MutMatchNav): MutMatchNav | null {
		return nav.navIndex === 0 ? nav : null;
	}
}

export const matchStart = new MatchStart();

export class MatchEnd extends MatchBase {
	public match(nav: MutMatchNav): MutMatchNav | null {
		return nav.navIndex === nav.source.length
			? nav
			: null;
	}
}

export const matchEnd = new MatchEnd();

export class MatchCodePoint extends MatchBase {
	public constructor(public readonly matchValue: number) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (codePoint === this.matchValue) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveForward(length);
			return nav;
		}
		return null;
	}
}

export class CodePointRange {
	public constructor(
		public readonly start: number,
		public readonly end: number
	) {}

	public contains(codePoint: number): boolean {
		return (
			codePoint >= this.start && codePoint <= this.end
		);
	}

	public static fromString(range: string): CodePointRange {
		const dashCodePoint = "-".codePointAt(0);

		const codepoints = new CodePointSeq(range).toArray();
		if (
			codepoints.length !== 3 ||
			codepoints[1].element !== dashCodePoint
		) {
			throw new Error("Invalid code point range");
		}

		return new CodePointRange(
			codepoints[0].element,
			codepoints[2].element
		);
	}
}

export class MatchRange extends MatchBase {
	public constructor(
		public readonly range: CodePointRange
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (
			codePoint !== undefined &&
			this.range.contains(codePoint)
		) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveForward(length);
			return nav;
		}
		return null;
	}

	public static fromString(range: string): MatchRange {
		return new MatchRange(
			CodePointRange.fromString(range)
		);
	}
}

export class MatchRanges extends MatchBase {
	public constructor(
		public readonly ranges: CodePointRange[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (
			codePoint !== undefined &&
			this.ranges.some(range =>
				range.contains(codePoint)
			)
		) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveForward(length);
			return nav;
		}
		return null;
	}

	public static fromStrings(
		ranges: string[]
	): MatchRanges {
		return new MatchRanges(
			ranges.map(range =>
				CodePointRange.fromString(range)
			)
		);
	}
}

export class MatchString extends MatchBase {
	public constructor(
		public readonly matchValue: string | StrSlice
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		if (
			nav.source.startsWith(
				this.matchValue,
				nav.navIndex
			)
		) {
			nav.moveForward(this.matchValue.length);
			return nav;
		}
		return null;
	}
}

export class MatchAnyString extends MatchBase {
	public constructor(
		public readonly matchValues: (string | StrSlice)[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		for (const matchValue of this.matchValues) {
			if (
				nav.source.startsWith(matchValue, nav.navIndex)
			) {
				nav.moveForward(matchValue.length);
				return nav;
			}
		}
		return null;
	}
}

export class MatchAny extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		for (const matcher of this.matchers) {
			const result = matcher.match(nav);
			if (result) {
				return result;
			}
		}
		return null;
	}
}

export class MatchAll extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		for (const matcher of this.matchers) {
			const result = matcher.match(nav);
			if (!result) {
				return null;
			}
			nav = result;
		}
		return nav;
	}
}

export class MatchOpt extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		const savedNav = nav.save();
		const result = this.matcher.match(nav);
		if (result) {
			return result;
		}
		return savedNav;
	}
}

export class MatchNot extends MatchBase {
	public constructor(
		public readonly matcher:
			| MatchCodePoint
			| MatchRange
			| MatchRanges
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		const savedNav = nav.save();
		const result = this.matcher.match(nav);
		if (result) {
			return null;
		}
		return savedNav;
	}
}

export class MatchRepeat extends MatchBase {
	public constructor(
		public readonly matcher: MatchBase,
		public readonly min: number = 1,
		public readonly max: number = Number.MAX_SAFE_INTEGER
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		// Save initial state in case we need to backtrack
		const initialNav = nav.save();

		// Try to match as many times as possible up to max
		let count = 0;
		let currentNav = nav;

		while (count < this.max) {
			const savedNav = currentNav.save(); // Save before each attempt
			const result = this.matcher.match(savedNav);

			if (!result) {
				break; // No more matches possible
			}

			// Match succeeded, update count and nav
			count++;
			currentNav = result;
		}

		// Check if we've matched at least min times
		if (count >= this.min) {
			// Success - return the nav after all successful matches
			// Update the original nav to the final position
			nav.moveForward(
				currentNav.navIndex - nav.navIndex
			);
			return nav;
		} else {
			// Failed to match minimum required times
			return null;
		}
	}
}
