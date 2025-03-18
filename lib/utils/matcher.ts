import unicode from "unicode-properties";
import { StrSlice } from "@/utils/slice";
import { CodePointSeq } from "@/utils/seq";
import { FindResult, MutMatchNav } from "@/utils/match-nav";
import { getCodePointCharLength } from "@/utils/string";

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

export const matchStartSlice = new MatchStartSlice();

export const matchEndSlice = new MatchEndSlice();

export class MatchCodePoint extends MatchCodePointBase {
	public constructor(public readonly matchValue: number) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.getCodePoint();
		if (
			codePoint !== undefined &&
			codePoint === this.matchValue
		) {
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
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
		const codePoint = nav.getCodePoint();
		if (
			codePoint !== undefined &&
			this.lambda(codePoint)
		) {
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
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
		const codePoint = nav.getCodePoint();
		if (
			codePoint !== undefined &&
			this.codePointSet[codePoint]
		) {
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
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
		const codePoint = nav.getCodePoint();
		if (
			codePoint !== undefined &&
			this.categories[unicode.getCategory(codePoint)]
		) {
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
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
		const dashCodePoint = 0x2d; // "-"

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
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
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
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
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
		const savedNav = nav.copy();
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
			const result = matcher.match(nav.copy());
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
		const matchersLength = this.matchers.length;
		const lastMatcherIndex = matchersLength - 1;
		for (let i = 0; i < matchersLength; i++) {
			const matcher = this.matchers[i];
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
		const savedNav = nav.copy();
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
		const result = this.matcher.match(nav.copy());
		if (result) {
			nav.moveGhostCaptureForward(result.captureLength);
			return nav;
		}
		return nav.invalidate();
	}
}

export abstract class FindMatchBase {
	constructor() {}
	public abstract match(nav: MutMatchNav): FindResult;
}

export class FindAnyString extends FindMatchBase {
	public constructor(
		public readonly matchValues: (string | StrSlice)[]
	) {
		super();
	}

	public match(nav: MutMatchNav): FindResult {
		nav.assertValid();
		nav.assertFresh();
		const [matchIndex, stringIndex] =
			nav.source.indexOfMany(
				this.matchValues,
				nav.startIndex
			);
		if (matchIndex >= 0) {
			const matchLength =
				this.matchValues[stringIndex].length;
			return nav.splitFragmentAndMatch(
				matchIndex,
				matchLength
			);
		}

		const fragmentNav = nav.copy().moveCaptureToEnd();
		const matchNav = nav.invalidate();
		return {
			matchNav,
			fragmentNav,
		};
	}
}

export class FindMatch extends FindMatchBase {
	public constructor(public readonly matcher: MatchBase) {
		super();
	}
	public match(nav: MutMatchNav): FindResult {
		nav.assertValid();
		nav.assertFresh();
		let currentNav = nav.copy();
		const originalNav = nav.copy();

		while (!currentNav.isEndSlice) {
			const result = this.matcher.match(
				currentNav.copyAndMoveStartToNavIndex()
			);
			if (result) {
				return originalNav.splitFragmentAndMatch(
					result.startIndex,
					result.captureLength
				);
			}
			currentNav =
				currentNav.moveCaptureForwardOneCodePoint();
		}

		return {
			matchNav: nav.invalidate(),
			fragmentNav: currentNav,
		};
	}
}
