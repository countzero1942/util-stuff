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

export abstract class MatchCodePointBase extends MatchBase {
	constructor() {
		super();
	}
}

export abstract class MatchPositionBase extends MatchBase {
	constructor() {
		super();
	}
}

export class MatchStartSlice extends MatchPositionBase {
	constructor() {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		return nav.navIndex === 0 ? nav : nav.invalidate();
	}
}

export const matchStartSlice = new MatchStartSlice();

export class MatchEndSlice extends MatchPositionBase {
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

export class MatchCodePoint extends MatchCodePointBase {
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

export class MatchCodePointLambda extends MatchCodePointBase {
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

export class MatchCodePointSet extends MatchCodePointBase {
	public constructor(
		public readonly codePointSet: Record<number, boolean>
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
			this.codePointSet[codePoint]
		) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveCaptureForward(length);
			return nav;
		}
		return nav.invalidate();
	}

	public static fromString(
		codePoints: string
	): MatchCodePointSet {
		const codePointSet: Record<number, boolean> = {};

		const codePointSeq = new CodePointSeq(codePoints);

		codePointSeq.foreach(codePoint => {
			codePointSet[codePoint.element] = true;
		});

		return new MatchCodePointSet(codePointSet);
	}

	public static fromArray(
		codePoints: number[]
	): MatchCodePointSet {
		const codePointSet: Record<number, boolean> = {};
		for (const codePoint of codePoints) {
			codePointSet[codePoint] = true;
		}
		return new MatchCodePointSet(codePointSet);
	}
}

const initializeAllUnicodeCategories = (): Record<
	string,
	boolean
> => {
	const categoriesSet: Record<string, boolean> = {};
	const categoriesString =
		"Cc Cf Co Cs Ll Lm Lo Lt Lu Mc Me Mn Nd " +
		"Nl No Pc Pd Pe Pf Pi Po Ps Sc Sk Sm So Zl Zp Zs";
	for (const category of categoriesString.split(" ")) {
		categoriesSet[category] = true;
	}
	return categoriesSet;
};

export const allUnicodeCategories =
	initializeAllUnicodeCategories();

export class MatchCodePointCategories extends MatchCodePointBase {
	public constructor(
		public readonly categories: Record<string, boolean>
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
			this.categories[unicode.getCategory(codePoint)]
		) {
			const length = codePoint >= 0x10000 ? 2 : 1;
			nav.moveCaptureForward(length);
			return nav;
		}
		return nav.invalidate();
	}

	public static fromString(
		categories: string
	): MatchCodePointCategories {
		const categoriesSet: Record<string, boolean> = {};
		for (const category of categories.split(" ")) {
			if (allUnicodeCategories[category] === undefined) {
				throw new Error(
					`Invalid Unicode category: ${category}`
				);
			}
			categoriesSet[category] = true;
		}
		return new MatchCodePointCategories(categoriesSet);
	}
}

export const matchUnicodeLetter =
	MatchCodePointCategories.fromString("Lu Lo Ll");

export const matchUnicodeDigit =
	MatchCodePointCategories.fromString("Nd");

export const matchUnicodeLetterOrDigit =
	MatchCodePointCategories.fromString("Lu Lo Ll Nd");

export const matchUnicodeLowerCase =
	MatchCodePointCategories.fromString("Ll");

export const matchUnicodeUpperCase =
	MatchCodePointCategories.fromString("Lu");

export const matchUnicodeTitleCase =
	MatchCodePointCategories.fromString("Lt");

export const matchUnicodeSpace =
	MatchCodePointCategories.fromString("Zs");

export const matchUnicodeWhiteSpace =
	MatchCodePointSet.fromArray([
		0x20, 0x0d, 0x0a, 0x09, 0x0c, 0x0b, 0xa0, 0x1680,
		0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005,
		0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x2028,
		0x2029, 0x202f, 0x205f, 0x3000, 0xfeff,
	]);

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

export class MatchCodePointRange extends MatchCodePointBase {
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

export class MatchCodePointRanges extends MatchCodePointBase {
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

export const matchLatinLetter = new MatchCodePointRange(
	new CodePointRange(0x0041, 0x005a)
);

export const matchLatinDigit = new MatchCodePointRange(
	new CodePointRange(0x0030, 0x0039)
);

export const matchLatinLetterOrDigit =
	new MatchCodePointRange(
		new CodePointRange(0x0041, 0x005a)
	);

export const matchLatinLowerCase = new MatchCodePointRange(
	new CodePointRange(0x0061, 0x007a)
);

export const matchLatinUpperCase = new MatchCodePointRange(
	new CodePointRange(0x0041, 0x005a)
);

export class MatchNotCodePoint extends MatchCodePointBase {
	public constructor(
		public readonly matcher:
			| MatchCodePointBase
			| MatchPositionBase
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
			case this.matcher instanceof MatchPositionBase:
				return savedNav;
			case this.matcher instanceof MatchCodePointBase:
				return matchAnyCodePoint.match(savedNav);
			default:
				throw new Error("Invalid matcher type");
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
