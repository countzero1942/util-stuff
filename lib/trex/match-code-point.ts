import unicode from "unicode-properties";

import { CodePointSeq } from "@/utils/seq";
import {
	getCodePointCharLength,
	isCodePointValid,
} from "@/utils/string";
import {
	MatchCodePointBase,
	MatchPositionBase,
} from "@/trex/match-base";
import { MutMatchNav } from "@/trex/nav";
import { getClassName, getType } from "@/utils/types";

const getCodePointString = (codePoint: number) =>
	codePoint < 0
		? codePoint.toString()
		: `0x${codePoint.toString(16).toUpperCase()}`;

export class MatchCodePoint extends MatchCodePointBase {
	protected constructor(
		public readonly matchValue: number
	) {
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

	public static fromNumber(
		matchValue: number
	): MatchCodePoint {
		if (!isCodePointValid(matchValue)) {
			throw new Error(
				`MatchCodePoint.fromNumber: Invalid code point: ${getCodePointString(matchValue)}`
			);
		}
		return new MatchCodePoint(matchValue);
	}

	public static fromString(
		matchValue: string
	): MatchCodePoint {
		const codePoint = matchValue.codePointAt(0);
		if (
			codePoint === undefined ||
			getCodePointCharLength(codePoint) !==
				matchValue.length
		) {
			throw new Error(
				`MatchCodePoint.fromString: Invalid code point string: '${matchValue}'`
			);
		}
		return new MatchCodePoint(codePoint);
	}
}

export class MatchCodePointLambda extends MatchCodePointBase {
	protected constructor(
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

	public static from(
		lambda: (codePoint: number) => boolean
	): MatchCodePointLambda {
		return new MatchCodePointLambda(lambda);
	}
}

export class CodePointRange {
	protected constructor(
		public readonly start: number,
		public readonly end: number
	) {
		if (!isCodePointValid(start)) {
			throw new Error(
				`Invalid code point range: start is invalid` +
					` (${getCodePointString(start)})`
			);
		}
		if (!isCodePointValid(end)) {
			throw new Error(
				`Invalid code point range: end is invalid` +
					` (${getCodePointString(end)})`
			);
		}
		if (start > end) {
			throw new Error(
				`Invalid code point range: start > end` +
					` (${getCodePointString(start)} > ${getCodePointString(end)})`
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
			throw new Error(
				`Invalid code point range: '${range}'`
			);
		}

		return new CodePointRange(
			codepoints[0].element,
			codepoints[2].element
		);
	}

	public static fromNumbers(
		startCodePoint: number,
		endCodePoint: number
	): CodePointRange {
		return new CodePointRange(
			startCodePoint,
			endCodePoint
		);
	}

	public toString(): string {
		const start = String.fromCodePoint(this.start);
		const end = String.fromCodePoint(this.end);
		return `${start}-${end}`;
	}

	public toFullString(): string {
		const codePoints = this.codePoints().toArray();
		const fullString = String.fromCodePoint(
			...codePoints
		);
		return fullString;
	}
}

export class MatchCodePointSet extends MatchCodePointBase {
	protected constructor(
		public readonly codePointSet: Record<number, boolean>
	) {
		super();

		if (this.length === 0) {
			throw new Error(
				"MatchCodePointSet: empty code point set"
			);
		}
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

	public get length(): number {
		return Object.keys(this.codePointSet).length;
	}

	public static fromString(
		codePoints: string
	): MatchCodePointSet {
		if (codePoints.length === 0) {
			throw new Error(
				"MatchCodePointSet.fromString: empty code points string"
			);
		}

		const codePointSet: Record<number, boolean> = {};

		const codePointSeq = new CodePointSeq(codePoints);

		codePointSeq.foreach(codePoint => {
			codePointSet[codePoint.element] = true;
		});

		return new MatchCodePointSet(codePointSet);
	}

	public static fromArgs(
		...args: (
			| CodePointRange
			| MatchCodePointSet
			| string
		)[]
	) {
		const codePointSet: Record<number, boolean> = {};
		for (const arg of args) {
			switch (true) {
				case arg instanceof CodePointRange:
					// note: ranges cannot be empty
					for (const codePoint of arg.codePoints()) {
						codePointSet[codePoint] = true;
					}

					break;
				case typeof arg === "string":
					if (arg.length === 0) {
						throw new Error(
							"MatchCodePointSet.fromArgs: empty code points string"
						);
					}
					const codePointSeq = new CodePointSeq(
						arg as string
					);
					codePointSeq.foreach(codePoint => {
						codePointSet[codePoint.element] = true;
					});
					break;
				case arg instanceof MatchCodePointSet:
					// note: MatchCodePointSet cannot be empty
					for (const codePoint in arg.codePointSet) {
						codePointSet[codePoint] = true;
					}
					break;
				default:
					throw new Error(
						`MatchCodePointSet.fromArgs: ` +
							`Invalid argument type: '${getType(arg)}'`
					);
			}
		}
		return new MatchCodePointSet(codePointSet);
	}

	public static fromNumbers(
		...codePoints: number[]
	): MatchCodePointSet {
		if (
			codePoints === undefined ||
			codePoints.length === 0
		) {
			throw new Error(
				"MatchCodePointSet.fromNumbers: empty code points array"
			);
		}
		const codePointSet: Record<number, boolean> = {};
		for (const codePoint of codePoints) {
			if (!isCodePointValid(codePoint)) {
				throw new Error(
					`MatchCodePointSet.fromNumbers: Invalid code point: ${codePoint}`
				);
			}
			codePointSet[codePoint] = true;
		}
		return new MatchCodePointSet(codePointSet);
	}

	public static fromSet(
		codePointSet: Record<number, boolean>
	): MatchCodePointSet {
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

export class MatchCodePointCategories extends MatchCodePointBase {
	protected constructor(
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

export class MatchCodePointRange extends MatchCodePointBase {
	protected constructor(
		public readonly range: CodePointRange
	) {
		super();
		// note: ranges are validated in constructor
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

	public static fromRange(
		range: CodePointRange
	): MatchCodePointRange {
		return new MatchCodePointRange(range);
	}
}

export class MatchCodePointRanges extends MatchCodePointBase {
	protected constructor(
		public readonly ranges: CodePointRange[]
	) {
		super();
		// note: ranges are validated in constructor
		if (this.ranges.length === 0) {
			throw new Error(
				"MatchCodePointRanges: empty ranges array"
			);
		}
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
		...ranges: string[]
	): MatchCodePointRanges {
		return new MatchCodePointRanges(
			ranges.map(range =>
				CodePointRange.fromString(range)
			)
		);
	}

	public static fromRanges(
		...ranges: CodePointRange[]
	): MatchCodePointRanges {
		return new MatchCodePointRanges(ranges);
	}
}

export class MatchNotCodePoint extends MatchCodePointBase {
	protected constructor(
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

	public static from(
		matcher: MatchCodePointBase
	): MatchNotCodePoint {
		return new MatchNotCodePoint(matcher);
	}
}
