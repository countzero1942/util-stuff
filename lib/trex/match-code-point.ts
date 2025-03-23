import unicode from "unicode-properties";

import { CodePointSeq } from "@/utils/seq";
import { getCodePointCharLength } from "@/utils/string";
import {
	MatchCodePointBase,
	MatchPositionBase,
} from "@/trex/match-base";
import { MutMatchNav } from "@/trex/nav";

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

export const matchAnyCodePoint = new MatchCodePointRange(
	new CodePointRange(0, 0x10ffff)
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
