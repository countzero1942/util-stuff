import { StrSlice } from "@/utils/slice";
import { CodePointSeq } from "./seq";
import unicode from "unicode-properties";

export class MutMatchNav {
	private _startIndex: number;
	private _navIndex: number;
	private _captureIndex: number;
	private _lastNavIndex: number;
	private _isInvalidated: boolean = false;
	constructor(public readonly source: StrSlice) {
		this._startIndex = 0;
		this._navIndex = 0;
		this._captureIndex = 0;
		this._lastNavIndex = 0;
	}

	public moveCaptureForward(length: number = 1) {
		this._lastNavIndex = this._navIndex;
		this._navIndex += length;
		this._captureIndex += length;
	}

	public moveGhostCaptureForward(length: number = 1) {
		this._navIndex += length;
	}

	public save(): MutMatchNav {
		const nav = new MutMatchNav(this.source);
		nav._startIndex = this._startIndex;
		nav._navIndex = this._navIndex;
		nav._lastNavIndex = this._lastNavIndex;
		nav._captureIndex = this._captureIndex;
		nav._isInvalidated = this._isInvalidated;
		return nav;
	}

	public invalidate(): null {
		this._isInvalidated = true;
		return null;
	}

	public assertValid(): void {
		if (this._isInvalidated) {
			throw new Error("Illegal use of invalidated nav");
		}
		if (this._navIndex < this._captureIndex) {
			throw new Error(
				"Nav has ghost capture at end: cannot match further"
			);
		}
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

	public get isInvalidated() {
		return this._isInvalidated;
	}

	public get captureIndex() {
		return this._captureIndex;
	}

	public get accumulatedMatch(): StrSlice {
		return this.source.slice(
			this._startIndex,
			this._captureIndex
		);
	}

	public get lastMatch(): StrSlice {
		return this.source.slice(
			this._lastNavIndex,
			this._captureIndex
		);
	}

	public get ghostMatch(): StrSlice {
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

export class MatchStartSlice extends MatchBase {
	constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex === 0 ? nav : nav.invalidate();
	}
}

export const matchStartSlice = new MatchStartSlice();

export class MatchEndSlice extends MatchBase {
	constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex === nav.source.length
			? nav
			: nav.invalidate();
	}
}

export const matchEndSlice = new MatchEndSlice();

export class MatchCodePoint extends MatchBase {
	public constructor(public readonly matchValue: number) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (codePoint === this.matchValue) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveCaptureForward(length);
			return nav;
		}
		return nav.invalidate();
	}
}

export class MatchCodePointLambda extends MatchBase {
	public constructor(
		public readonly lambda: (codePoint: number) => boolean
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (
			codePoint !== undefined &&
			this.lambda(codePoint)
		) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveCaptureForward(length);
			return nav;
		}
		return nav.invalidate();
	}
}

export const matchUnicodeAlphanumeric =
	new MatchCodePointLambda(
		codePoint =>
			unicode.isAlphabetic(codePoint) ||
			unicode.isDigit(codePoint)
	);

export const matchUnicodeWhitespace =
	new MatchCodePointLambda(codePoint =>
		unicode.isWhiteSpace(codePoint)
	);

export const matchUnicodeAlphabetic =
	new MatchCodePointLambda(codePoint =>
		unicode.isAlphabetic(codePoint)
	);

export const matchUnicodeNumeric = new MatchCodePointLambda(
	codePoint => unicode.isDigit(codePoint)
);

export const matchUnicodeLowerCase =
	new MatchCodePointLambda(codePoint =>
		unicode.isLowerCase(codePoint)
	);

export const matchUnicodeUpperCase =
	new MatchCodePointLambda(codePoint =>
		unicode.isUpperCase(codePoint)
	);

export const matchUnicodeTitleCase =
	new MatchCodePointLambda(codePoint =>
		unicode.isTitleCase(codePoint)
	);

export class MatchCodePointCategories extends MatchBase {
	public constructor(
		public readonly categories: string[]
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (
			codePoint !== undefined &&
			this.categories.some(
				category =>
					unicode.getCategory(codePoint) === category
			)
		) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveCaptureForward(length);
			return nav;
		}
		return nav.invalidate();
	}
}

export class CodePointRange {
	public constructor(
		public readonly start: number,
		public readonly end: number
	) {
		if (start > end) {
			throw new Error(
				"Invalid code point range: start > end"
			);
		}
	}

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

export class MatchCodePointRange extends MatchBase {
	public constructor(
		public readonly range: CodePointRange
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (
			codePoint !== undefined &&
			this.range.contains(codePoint)
		) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveCaptureForward(length);
			return nav;
		}
		return nav.invalidate();
	}

	public static fromString(
		range: string
	): MatchCodePointRange {
		return new MatchCodePointRange(
			CodePointRange.fromString(range)
		);
	}
}

export const matchAnyCodePoint = new MatchCodePointRange(
	new CodePointRange(0, 0x10ffff)
);

export class MatchCodePointRanges extends MatchBase {
	public constructor(
		public readonly ranges: CodePointRange[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
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
			nav.moveCaptureForward(length);
			return nav;
		}
		return nav.invalidate();
	}

	public static fromStrings(
		ranges: string[]
	): MatchCodePointRanges {
		return new MatchCodePointRanges(
			ranges.map(range =>
				CodePointRange.fromString(range)
			)
		);
	}
}

export const matchLatinLowerCase = new MatchCodePointRange(
	new CodePointRange(0x0061, 0x007a)
);

export const matchLatinUpperCase = new MatchCodePointRange(
	new CodePointRange(0x0041, 0x005a)
);

export const matchLatinLetter = new MatchCodePointRange(
	new CodePointRange(0x0041, 0x005a)
);

export const matchLatinLetterOrDigit =
	new MatchCodePointRange(
		new CodePointRange(0x0041, 0x005a)
	);

export const matchLatinDigit = new MatchCodePointRange(
	new CodePointRange(0x0030, 0x0039)
);

export class MatchNotCodePoint extends MatchBase {
	public constructor(
		public readonly matcher:
			| MatchCodePoint
			| MatchCodePointRange
			| MatchCodePointRanges
			| MatchStartSlice
			| MatchEndSlice
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const savedNav = nav.save();
		const result = this.matcher.match(nav);
		if (result) {
			return nav.invalidate();
		}
		switch (true) {
			case this.matcher instanceof MatchStartSlice:
			case this.matcher instanceof MatchEndSlice:
				return savedNav;
			default:
				return matchAnyCodePoint.match(savedNav);
		}
	}
}

export class MatchString extends MatchBase {
	public constructor(
		public readonly matchValue: string | StrSlice
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		if (
			nav.source.startsWith(
				this.matchValue,
				nav.navIndex
			)
		) {
			nav.moveCaptureForward(this.matchValue.length);
			return nav;
		}
		return nav.invalidate();
	}
}

export class MatchAnyString extends MatchBase {
	public constructor(
		public readonly matchValues: (string | StrSlice)[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		for (const matchValue of this.matchValues) {
			if (
				nav.source.startsWith(matchValue, nav.navIndex)
			) {
				nav.moveCaptureForward(matchValue.length);
				return nav;
			}
		}
		return nav.invalidate();
	}
}

export class MatchAnyMatch extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		for (const matcher of this.matchers) {
			const result = matcher.match(nav.save());
			if (result) {
				return result;
			}
		}
		return nav.invalidate();
	}
}

export class MatchAllMatches extends MatchBase {
	public constructor(
		public readonly matchers: MatchBase[]
	) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		for (const matcher of this.matchers) {
			const result = matcher.match(nav);
			if (!result) {
				return nav.invalidate();
			}
			nav = result;
		}
		return nav;
	}
}

export class MatchOptMatch extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const savedNav = nav.save();
		const result = this.matcher.match(nav);
		if (result) {
			return result;
		}
		return savedNav;
	}
}

export class MatchRepeatMatch extends MatchBase {
	public constructor(
		public readonly matcher: MatchBase,
		public readonly minNumberMatches: number = 1,
		public readonly maxNumberMatches: number = Number.MAX_SAFE_INTEGER
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		let count = 0;
		let currentNav = nav;

		while (count < this.maxNumberMatches) {
			const result = this.matcher.match(currentNav);

			if (!result) {
				break;
			}

			count++;
			currentNav = result;
		}

		if (
			count >= this.minNumberMatches &&
			count <= this.maxNumberMatches
		) {
			return currentNav;
		} else {
			return nav.invalidate();
		}
	}
}

export class GhostMatch extends MatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const result = this.matcher.match(nav.save());
		if (result) {
			nav.moveGhostCaptureForward(
				result.captureIndex - nav.captureIndex
			);
			return nav;
		}
		return nav.invalidate();
	}
}
