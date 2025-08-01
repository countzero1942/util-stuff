import unicode from "unicode-properties";

import { CodePointSeq } from "@/utils/seq";
import {
	getCodePointCharLength,
	isCodePointValid,
} from "@/utils/string";
import { MatchCodePointBase } from "@/trex/match-base";
import { MutMatchNav } from "@/trex/nav";
import { getType } from "@/utils/types";

/**
 * Returns a string representation of a code point for error messages.
 *
 * @param codePoint Code point to convert
 * @returns String representation of the code point
 */
const getCodePointStringForErrorMsg = (
	codePoint: number
) =>
	codePoint < 0
		? codePoint.toString()
		: `0x${codePoint.toString(16).toUpperCase()}`;

/**
 * MatchCodePoint: a matcher for code-point-based matchers.
 *
 * @param matchValue Code point to match
 */
export class MatchCodePoint extends MatchCodePointBase {
	/**
	 * Creates a MatchCodePoint from a code point.
	 *
	 * @param matchValue Code point to match
	 * @returns A new MatchCodePoint instance
	 */
	private constructor(public readonly matchValue: number) {
		super();
	}

	/**
	 * Creates a MatchCodePoint from a code point.
	 *
	 * @param matchValue Code point to match
	 * @returns A new MatchCodePoint instance
	 */
	public static fromNumber(
		matchValue: number
	): MatchCodePoint {
		if (!isCodePointValid(matchValue)) {
			throw new Error(
				`MatchCodePoint.fromNumber: Invalid code point: ${getCodePointStringForErrorMsg(matchValue)}`
			);
		}
		return new MatchCodePoint(matchValue);
	}

	/**
	 * Creates a MatchCodePoint from a string.
	 *
	 * @param matchValue String to match
	 * @returns A new MatchCodePoint instance
	 */
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

	/**
	 * Attempt to match code point at nav index position. If successful,
	 * nav capture is moved forward by the length of the matched code point.
	 *
	 * Otherwise nav is invalidated and null returned.
	 *
	 * @param nav Navigation state to use for matching
	 * @returns Navr captures code point if successful, or nav.invalidate() if no match
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
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

	/**
	 * Returns true if the code point matches the matcher, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if the code point matches the matcher, otherwise false
	 */
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

/**
 * MatchCodePointLambda: a lambda matcher for code-point-based matchers.
 *
 * @param lambda Lambda function to match
 */
export class MatchCodePointLambda extends MatchCodePointBase {
	/**
	 * Creates a MatchCodePointLambda from a lambda function.
	 *
	 * @param lambda Lambda function to match
	 * @returns A new MatchCodePointLambda instance
	 */
	private constructor(
		public readonly lambda: (codePoint: number) => boolean
	) {
		super();
	}

	/**
	 * Creates a MatchCodePointLambda from a lambda function.
	 *
	 * @param lambda Lambda function to match
	 * @returns A new MatchCodePointLambda instance
	 */
	public static from(
		lambda: (codePoint: number) => boolean
	): MatchCodePointLambda {
		return new MatchCodePointLambda(lambda);
	}

	/**
	 * Attempt to match code point at nav index position. If successful,
	 * nav capture is moved forward by the length of the matched code point.
	 *
	 * Otherwise nav is invalidated and null returned.
	 *
	 * @param nav Navigation state to use for matching
	 * @returns Navr captures code point if successful, or nav.invalidate() if no match
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
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

	/**
	 * Returns true if the code point matches the lambda, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if the code point matches the lambda, otherwise false
	 */
	public matchCodePoint(codePoint: number): boolean {
		return this.lambda(codePoint);
	}
}

/**
 * CodePointRange: a range matcher for code-point-based matchers.
 *
 * @param start Start of the range
 * @param end End of the range
 */
export class CodePointRange {
	/**
	 * Creates a CodePointRange from a start and end code point.
	 *
	 * @param start Start of the range
	 * @param end End of the range
	 * @returns A new CodePointRange instance
	 */
	private constructor(
		public readonly start: number,
		public readonly end: number
	) {
		if (!isCodePointValid(start)) {
			throw new Error(
				`Invalid code point range: start is invalid` +
					` (${getCodePointStringForErrorMsg(start)})`
			);
		}
		if (!isCodePointValid(end)) {
			throw new Error(
				`Invalid code point range: end is invalid` +
					` (${getCodePointStringForErrorMsg(end)})`
			);
		}
		if (start > end) {
			throw new Error(
				`Invalid code point range: start > end` +
					` (${getCodePointStringForErrorMsg(start)} > ${getCodePointStringForErrorMsg(end)})`
			);
		}
	}

	/**
	 * Creates a CodePointRange from code point range string. E.g. "a-z"
	 *
	 * @param range Code point range string
	 * @returns A new CodePointRange instance
	 */
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

	/**
	 * Creates a CodePointRange from code point range numbers. E.g.: 97, 122
	 *
	 * @param startCodePoint Start of the range
	 * @param endCodePoint End of the range
	 * @returns A new CodePointRange instance
	 */
	public static fromNumbers(
		startCodePoint: number,
		endCodePoint: number
	): CodePointRange {
		return new CodePointRange(
			startCodePoint,
			endCodePoint
		);
	}

	/**
	 * Returns true if the code point is in the range, otherwise false.
	 *
	 * @param codePoint Code point to check
	 * @returns True if the code point is in the range, otherwise false
	 */
	public contains(codePoint: number): boolean {
		return (
			codePoint >= this.start && codePoint <= this.end
		);
	}

	/**
	 * Returns an iterator over the code points in the range
	 *
	 * @returns An iterator over the code points in the range
	 */
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

	/**
	 * Returns an iterator over the code points in the range
	 *
	 * @returns An iterator over the code points in the range
	 */
	public [Symbol.iterator](): Generator<number> {
		return this.codePoints();
	}

	public toString(): string {
		const start = String.fromCodePoint(this.start);
		const end = String.fromCodePoint(this.end);
		return `${start}-${end}`;
	}

	/**
	 * Returns a string containing all code points in the range
	 *
	 * @returns A string containing all code points in the range
	 */
	public toExpandedString(): string {
		const codePoints = this.codePoints().toArray();
		const fullString = String.fromCodePoint(
			...codePoints
		);
		return fullString;
	}
}

/**
 * MatchCodePointSet: a set matcher for code-point-based matchers.
 *
 * @param codePointSet Set of code points to match
 */
export class MatchCodePointSet extends MatchCodePointBase {
	#codePointSet: Set<number>;

	protected constructor(codePointSet: Set<number>) {
		super();
		if (codePointSet.size === 0) {
			throw new Error(
				"MatchCodePointSet: empty code point set"
			);
		}
		this.#codePointSet = codePointSet;
	}

	/**
	 * Returns an iterator over the code points in the set
	 *
	 * @returns An iterator over the code points in the set
	 */
	public [Symbol.iterator](): IterableIterator<number> {
		return this.#codePointSet.values();
	}

	/**
	 * Creates a MatchCodePointSet from a string of code points.
	 *
	 * @param codePoints String of code points to match
	 * @returns A new MatchCodePointSet instance
	 */
	public static fromString(
		codePoints: string
	): MatchCodePointSet {
		if (codePoints.length === 0) {
			throw new Error(
				"MatchCodePointSet.fromString: empty code points string"
			);
		}

		const codePointSet = new Set<number>();
		const codePointSeq = new CodePointSeq(codePoints);
		codePointSeq.foreach(codePoint => {
			codePointSet.add(codePoint.element);
		});
		return new MatchCodePointSet(codePointSet);
	}

	/**
	 * Creates a MatchCodePointSet from an array of arguments.
	 *
	 * The arguments can be:
	 * - CodePointRange
	 * - MatchCodePointSet
	 * - string of code points
	 *
	 * @param args Array of arguments to include in the set
	 * @returns A new MatchCodePointSet instance
	 */
	public static fromArgs(
		...args: readonly (
			| CodePointRange
			| MatchCodePointSet
			| string
		)[]
	): MatchCodePointSet {
		const codePointSet = new Set<number>();
		for (const arg of args) {
			switch (true) {
				case arg instanceof CodePointRange:
					for (const codePoint of arg) {
						codePointSet.add(codePoint);
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
						codePointSet.add(codePoint.element);
					});
					break;
				case arg instanceof MatchCodePointSet:
					for (const codePoint of arg) {
						codePointSet.add(codePoint);
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

	/**
	 * Creates a MatchCodePointSet from an array of code-point numbers.
	 *
	 * @param codePoints Array of code points to match
	 * @returns A new MatchCodePointSet instance
	 */
	public static fromNumbers(
		...codePoints: readonly number[]
	): MatchCodePointSet {
		if (
			codePoints === undefined ||
			codePoints.length === 0
		) {
			throw new Error(
				"MatchCodePointSet.fromNumbers: empty code points array"
			);
		}
		const codePointSet = new Set<number>();
		for (const codePoint of codePoints) {
			if (!isCodePointValid(codePoint)) {
				throw new Error(
					`MatchCodePointSet.fromNumbers: Invalid code point: ${codePoint}`
				);
			}
			codePointSet.add(codePoint);
		}
		return new MatchCodePointSet(codePointSet);
	}

	/**
	 * Creates a MatchCodePointSet from a Set of code-point numbers.
	 *
	 * @param codePointSet Set of code points to match
	 * @returns A new MatchCodePointSet instance
	 */
	public static fromSet(
		codePointSet: Set<number>
	): MatchCodePointSet {
		return new MatchCodePointSet(new Set(codePointSet));
	}

	/**
	 * Attempt to match code point at nav index position. If successful,
	 * nav capture is moved forward by the length of the matched code point.
	 *
	 * Otherwise nav is invalidated and null returned.
	 *
	 * @param nav Navigation state to use for matching
	 * @returns Navr captures code point if successful, or nav.invalidate() if no match
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		const codePoint = nav.peekCodePoint();
		if (
			codePoint !== undefined &&
			this.#codePointSet.has(codePoint)
		) {
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
			return nav;
		}
		return nav.invalidate();
	}

	/**
	 * Returns true if the code point is in the set, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if the code point is in the set, otherwise false
	 */
	public matchCodePoint(codePoint: number): boolean {
		return this.#codePointSet.has(codePoint);
	}

	/**
	 * Returns the number of code points in the set.
	 *
	 * @returns The number of code points in the set
	 */
	public get size(): number {
		return this.#codePointSet.size;
	}

	/**
	 * Returns true if the code point is in the set, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if the code point is in the set, otherwise false
	 */
	public has(codePoint: number): boolean {
		return this.#codePointSet.has(codePoint);
	}
}

/**
 * Initialize all Unicode categories.
 *
 * @returns A record of all Unicode categories
 */
const initializeAllUnicodeCategories = (): Set<string> => {
	const categoriesSet: Set<string> = new Set();
	const categoriesString =
		"Cc Cf Cn Co Cs Ll Lm Lo Lt Lu Mc Me Mn Nd " +
		"Nl No Pc Pd Pe Pf Pi Po Ps Sc Sk Sm So Zl Zp Zs";
	for (const category of categoriesString.split(" ")) {
		categoriesSet.add(category);
	}
	return categoriesSet;
};

export const allUnicodeCategories =
	initializeAllUnicodeCategories();

/**
 * MatchCodePointCategories: a unicode-category-based set matcher
 * for code-point-based matchers.
 *
 * @param categories Set of Unicode categories to match
 */
export class MatchCodePointCategories extends MatchCodePointBase {
	#categories: Set<string>;

	/**
	 * Creates a MatchCodePointCategories from a set of categories.
	 *
	 * @param categories Set of Unicode categories to match
	 * @returns A new MatchCodePointCategories instance
	 */
	protected constructor(categories: Set<string>) {
		super();
		this.#categories = categories;
	}

	/**
	 * Returns an iterator over the categories in the set.
	 *
	 * @returns An iterator over the categories in the set
	 */
	public [Symbol.iterator](): IterableIterator<string> {
		return this.#categories.values();
	}

	/**
	 * Attempt to match code point at nav index position. If successful,
	 * nav capture is moved forward by the length of the matched code point.
	 *
	 * Otherwise nav is invalidated and null returned.
	 *
	 * @param nav Navigation state to use for matching
	 * @returns Navr captures code point if successful, or nav.invalidate() if no match
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		const codePoint = nav.peekCodePoint();
		if (
			codePoint !== undefined &&
			this.#categories.has(
				unicode.getCategory(codePoint)
			)
		) {
			nav.moveCaptureForward(
				getCodePointCharLength(codePoint)
			);
			return nav;
		}
		return nav.invalidate();
	}

	/**
	 * Returns true if the code point is in the set, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if the code point is in the set, otherwise false
	 */
	public matchCodePoint(codePoint: number): boolean {
		return this.#categories.has(
			unicode.getCategory(codePoint)
		);
	}

	/**
	 * Creates a MatchCodePointCategories from a string of categories.
	 *
	 * @param categories String of categories to match
	 * @returns A new MatchCodePointCategories instance
	 */
	public static fromString(
		categories: string
	): MatchCodePointCategories {
		const categoriesSet = new Set<string>();
		for (const category of categories.split(" ")) {
			if (!allUnicodeCategories.has(category)) {
				throw new Error(
					`Invalid Unicode category: ${category}`
				);
			}
			categoriesSet.add(category);
		}
		return new MatchCodePointCategories(categoriesSet);
	}
}

/**
 * MatchCodePointRange: a range-based matcher for code-point-based matchers.
 *
 * @param range Range of code points to match
 */
export class MatchCodePointRange extends MatchCodePointBase {
	protected constructor(
		public readonly range: CodePointRange
	) {
		super();
		// note: ranges are validated in constructor
	}

	/**
	 * Attempt to match code point at nav index position. If successful,
	 * nav capture is moved forward by the length of the matched code point.
	 *
	 * Otherwise nav is invalidated and null returned.
	 *
	 * @param nav Navigation state to use for matching
	 * @returns Navr captures code point if successful, or nav.invalidate() if no match
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
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

	/**
	 * Returns true if the code point is in the range, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if the code point is in the range, otherwise false
	 */
	public matchCodePoint(codePoint: number): boolean {
		return this.range.contains(codePoint);
	}

	/**
	 * Creates a MatchCodePointRange from a string range: e.g. "a-z".
	 *
	 * Calls CodePointRange.fromString() to create the range.
	 *
	 * @param range String of code points to match
	 * @returns A new MatchCodePointRange instance
	 */
	public static fromString(
		range: string
	): MatchCodePointRange {
		return new MatchCodePointRange(
			CodePointRange.fromString(range)
		);
	}

	/**
	 * Creates a MatchCodePointRange from a CodePointRange.
	 *
	 * @param range CodePointRange to match
	 * @returns A new MatchCodePointRange instance
	 */
	public static fromRange(
		range: CodePointRange
	): MatchCodePointRange {
		return new MatchCodePointRange(range);
	}
}

/**
 * MatchCodePointRanges: a range-based matcher for code-point-based matchers.
 * Handles multiple ranges.
 *
 * @param ranges Array of ranges to match
 */
export class MatchCodePointRanges extends MatchCodePointBase {
	#_ranges: readonly CodePointRange[];

	/**
	 * Creates a MatchCodePointRanges from an array of ranges.
	 *
	 * @param ranges Array of ranges to match
	 * @returns A new MatchCodePointRanges instance
	 */
	private constructor(ranges: readonly CodePointRange[]) {
		super();
		// note: ranges are validated in constructor
		if (ranges.length === 0) {
			throw new Error(
				"MatchCodePointRanges: empty ranges array"
			);
		}
		this.#_ranges = ranges.slice(); // defensive copy
	}

	/**
	 * Creates a MatchCodePointRanges from an array of ranges.
	 *
	 * Each string contains a range of code points: e.g. "a-z".
	 *
	 * @param ranges Array of ranges to match
	 * @returns A new MatchCodePointRanges instance
	 */
	public static fromStrings(
		...ranges: string[]
	): MatchCodePointRanges {
		return new MatchCodePointRanges(
			ranges.map(range =>
				CodePointRange.fromString(range)
			)
		);
	}

	/**
	 * Creates a MatchCodePointRanges from an array of ranges.
	 *
	 * @param ranges Array of ranges to match
	 * @returns A new MatchCodePointRanges instance
	 */
	public static fromRanges(
		...ranges: CodePointRange[]
	): MatchCodePointRanges {
		return new MatchCodePointRanges(ranges);
	}

	/**
	 * Attempt to match code point at nav index position. If successful,
	 * nav capture is moved forward by the length of the matched code point.
	 *
	 * Otherwise nav is invalidated and null returned.
	 *
	 * @param nav Navigation state to use for matching
	 * @returns Navr captures code point if successful, or nav.invalidate() if no match
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
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

	/**
	 * Returns true if the code point is in any of the ranges, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if the code point is in any of the ranges, otherwise false
	 */
	public matchCodePoint(codePoint: number): boolean {
		return this.ranges.some(range =>
			range.contains(codePoint)
		);
	}

	/**
	 * Returns array of ranges of code points to match.
	 *
	 * @returns Array of ranges
	 */
	public get ranges(): readonly CodePointRange[] {
		return this.#_ranges;
	}
}

/**
 * MatchNotCodePoint: a negation matcher for code-point-based matchers.
 *
 * @param matcher Matcher to negate
 */
export class MatchNotCodePoint extends MatchCodePointBase {
	/**
	 * Creates a MatchNotCodePoint from a matcher.
	 *
	 * @param matcher Matcher to negate
	 * @returns A new MatchNotCodePoint instance
	 */
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

	/**
	 * Attempt to match code point at nav index position. If successful, nav
	 * capture is moved forward by the length of the matched code point.
	 *
	 * Otherwise nav is invalidated and null returned.
	 *
	 * @param nav Navigation state to use for matching
	 * @returns Navr captures code point if successful, or nav.invalidate() if no match
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
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
	}

	/**
	 * Returns true if the code point is not matched by the matcher, otherwise false.
	 *
	 * @param codePoint Code point to match
	 * @returns True if the code point is not matched by the matcher, otherwise false
	 */
	public matchCodePoint(codePoint: number): boolean {
		return !this.matcher.matchCodePoint(codePoint);
	}

	/**
	 * Creates a MatchNotCodePoint from a code-point-based matcher.
	 *
	 * @param matcher Code-point-based matcher to negate
	 * @returns A new MatchNotCodePoint instance
	 */
	public static from(
		matcher: MatchCodePointBase
	): MatchNotCodePoint {
		return new MatchNotCodePoint(matcher);
	}
}
