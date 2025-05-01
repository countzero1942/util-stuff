import unicode from "unicode-properties";

import { CodePointSeq } from "@/utils/seq";
import { getCodePointCharLength } from "@/utils/string";
import {
	MatchCodePointBase,
	MatchPositionBase,
} from "@/trex/match-base";
import { MutMatchNav } from "@/trex/nav";
import { getClassName } from "@/utils/types";

export class MatchCodePoint extends MatchCodePointBase {
	public constructor(public readonly matchValue: number) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.peekCodePoint();
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

	public matchCodePoint(codePoint: number): boolean {
		if (
			codePoint !== undefined &&
			codePoint === this.matchValue
		) {
			return true;
		}
		return false;
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
		const codePoint = nav.peekCodePoint();
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

	public matchCodePoint(codePoint: number): boolean {
		return this.lambda(codePoint);
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

	public *codePoints(): Generator<number> {
		const end = this.end;
		for (
			let codePoint = this.start;
			codePoint <= end;
			codePoint++
		) {
			yield codePoint;
		}
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

export class MatchCodePointSet extends MatchCodePointBase {
	public constructor(
		public readonly codePointSet: Record<number, boolean>
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.peekCodePoint();
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

	public matchCodePoint(codePoint: number): boolean {
		return this.codePointSet[codePoint] ?? false;
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

	public static fromArgs(
		...args: (CodePointRange | string)[]
	) {
		const codePointSet: Record<number, boolean> = {};
		for (const arg of args) {
			switch (true) {
				case arg instanceof CodePointRange:
					for (const codePoint of arg.codePoints()) {
						codePointSet[codePoint] = true;
					}

					break;
				case typeof arg === "string":
					const codePointSeq = new CodePointSeq(
						arg as string
					);
					codePointSeq.foreach(codePoint => {
						codePointSet[codePoint.element] = true;
					});
					break;
				default:
					throw new Error("Invalid argument");
			}
		}
		return new MatchCodePointSet(codePointSet);
	}

	public static fromNumbers(
		...codePoints: number[]
	): MatchCodePointSet {
		const codePointSet: Record<number, boolean> = {};
		for (const codePoint of codePoints) {
			codePointSet[codePoint] = true;
		}
		return new MatchCodePointSet(codePointSet);
	}

	public static fromSets(
		...sets: Record<number, boolean>[]
	): MatchCodePointSet {
		const codePointSet: Record<number, boolean> = {};
		for (const set of sets) {
			for (const key in set) {
				codePointSet[key] = true;
			}
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
		"Cc Cf Cn Co Cs Ll Lm Lo Lt Lu Mc Me Mn Nd " +
		"Nl No Pc Pd Pe Pf Pi Po Ps Sc Sk Sm So Zl Zp Zs";
	for (const category of categoriesString.split(" ")) {
		categoriesSet[category] = true;
	}
	return categoriesSet;
};

export const allUnicodeCategories =
	initializeAllUnicodeCategories();

export class MatchCodePointCat extends MatchCodePointBase {
	public constructor(
		public readonly categories: Record<string, boolean>
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.peekCodePoint();
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

	public matchCodePoint(codePoint: number): boolean {
		return (
			this.categories[unicode.getCategory(codePoint)] ??
			false
		);
	}

	public static fromString(
		categories: string
	): MatchCodePointCat {
		const categoriesSet: Record<string, boolean> = {};
		for (const category of categories.split(" ")) {
			if (allUnicodeCategories[category] === undefined) {
				throw new Error(
					`Invalid Unicode category: ${category}`
				);
			}
			categoriesSet[category] = true;
		}
		return new MatchCodePointCat(categoriesSet);
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

	public matchCodePoint(codePoint: number): boolean {
		return this.range.contains(codePoint);
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

	public matchCodePoint(codePoint: number): boolean {
		return this.ranges.some(range =>
			range.contains(codePoint)
		);
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
		public readonly matcher: MatchCodePointBase
	) {
		super();
		if (!(matcher instanceof MatchCodePointBase)) {
			throw new Error(
				"MatchNotCodePoint: Invalid matcher type. " +
					"Must be instance of MatchCodePointBase"
			);
		}
		if (matcher instanceof MatchNotCodePoint) {
			throw new Error(
				"MatchNotCodePoint: Invalid matcher type: MatchNotCodePoint. " +
					"Recursion not supported."
			);
		}
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertValid();
		const codePoint = nav.peekCodePoint();
		if (
			codePoint !== undefined &&
			!this.matcher.matchCodePoint(codePoint)
		) {
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
			return nav;
		}
		return nav.invalidate();

		// nav.assertValid();
		// const result = this.matcher.match(nav.copy());
		// if (result) {
		// 	return nav.invalidate();
		// }

		// return nav.moveCaptureForwardOneCodePoint();
	}

	public matchCodePoint(codePoint: number): boolean {
		return !this.matcher.matchCodePoint(codePoint);
	}
}
