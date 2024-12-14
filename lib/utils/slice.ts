import { StrGraphemeSeq, StrSeq, Range, Seq } from "@/utils/seq";

export const normalizeStartEnd = (
	length: number,
	startIncl?: number,
	endExcl?: number
): Range => {
	const getStart = () => {
		let s = startIncl ?? 0;
		s = s < 0 ? length + s : s;
		return Math.max(0, s);
	};

	const getEnd = () => {
		let e = endExcl ?? length;
		e = e < 0 ? length + e : e;
		return Math.max(0, e);
	};

	let s = getStart();
	let e = getEnd();

	if (s > e) {
		[s, e] = [e, s];
	}

	return Range.from(s, e);
};

export class ArraySlice<T> extends Seq<T> {
	public readonly startIncl: number;
	public readonly endExcl: number;

	public get length(): number {
		return this.endExcl - this.startIncl;
	}

	constructor(
		public readonly array: readonly T[],
		startIncl?: number,
		endExcl?: number
	) {
		super();

		const range = normalizeStartEnd(
			array.length,
			startIncl,
			endExcl
		);
		this.startIncl = range.startIncl;
		this.endExcl = range.endExcl;
	}

	public override *gen(): Generator<T, any, any> {
		for (let i = this.startIncl; i < this.endExcl; i++) {
			yield this.array[i] as T;
		}
	}

	public toArray() {
		return this.array.slice(this.startIncl, this.endExcl);
	}

	public static from<T>(
		array: readonly T[],
		startIncl?: number,
		endExcl?: number
	): ArraySlice<T> {
		return new ArraySlice(array, startIncl, endExcl);
	}
}

export class StrCharSlice {
	/**
	 * The parent starting index (inclusive) of the slice in UTF-16 char units.
	 */
	public readonly startIncl: number;

	/**
	 * The parent ending index (exclusive) of the slice in UTF-16 char units.
	 */
	public readonly endExcl: number;

	/**
	 * Construct a StrCharSlice from a string and a range of indices (inclusive-exclusive).
	 *
	 * The range is given as a start index (inclusive) and an end index (exclusive)
	 * inside the parent string.
	 *
	 * If the end index is undefined, it will be set to the end of the string.
	 *
	 * If `startIncl` is negative, it will be interpreted as being relative to the end of the string.
	 * If `endExcl` is negative, it will be interpreted as being relative to the end of the string.
	 *
	 * @param value The parent string.
	 * @param startIncl The parent starting index (inclusive) of the slice in UTF-16 char units.
	 * @param endExcl The parent ending index (exclusive) of the slice in UTF-16 char units.
	 */
	constructor(
		public readonly value: string,
		startIncl?: number,
		endExcl?: number
	) {
		const range = normalizeStartEnd(
			this.value.length,
			startIncl,
			endExcl
		);
		this.startIncl = range.startIncl;
		this.endExcl = range.endExcl;
	}

	/**
	 * The length of the slice in UTF-16 char units.
	 *
	 * This is a computed property.
	 */
	public get length(): number {
		return this.endExcl - this.startIncl;
	}

	public get isEmpty(): boolean {
		return this.length === 0;
	}

	private sliceCache: string | undefined = undefined;

	public get slicedString(): string {
		if (this.sliceCache === undefined) {
			this.sliceCache = this.value.slice(
				this.startIncl,
				this.endExcl
			);
		}
		return this.sliceCache;
	}

	public trimStart(): StrCharSlice {
		let start = this.startIncl;
		while (
			start < this.endExcl &&
			this.value.charCodeAt(start) <= 32
		) {
			start++;
		}
		return start === this.startIncl
			? this
			: new StrCharSlice(this.value, start, this.endExcl);
	}

	public trimEnd(): StrCharSlice {
		let end = this.endExcl;
		while (
			end > this.startIncl &&
			this.value.charCodeAt(end - 1) <= 32
		) {
			end--;
		}
		return end === this.endExcl
			? this
			: new StrCharSlice(this.value, this.startIncl, end);
	}

	public trim(): StrCharSlice {
		return this.trimStart().trimEnd();
	}

	public indexOf(value: string): number {
		let i = this.value.indexOf(value, this.startIncl);
		if (i > -1 && i + value.length <= this.endExcl) {
			return i;
		}
		return -1;
	}

	public lastIndexOf(value: string): number {
		let i = this.value.lastIndexOf(value, this.endExcl);
		if (
			i > -1 &&
			i >= this.startIncl &&
			i + value.length <= this.endExcl
		) {
			return i;
		}
		return -1;
	}

	public startsWith(value: string): boolean {
		if (value.length > this.length) {
			return false;
		}
		return this.value.startsWith(value, this.startIncl);
	}

	public endsWith(value: string): boolean {
		if (value.length > this.length) {
			return false;
		}
		return this.value.endsWith(value, this.endExcl);
	}

	public slice(
		childStartIncl?: number,
		childEndExcl?: number
	): StrCharSlice {
		const range = normalizeStartEnd(
			this.length,
			childStartIncl,
			childEndExcl
		);

		return new StrCharSlice(
			this.value,
			this.startIncl + range.startIncl,
			this.startIncl + range.endExcl
		);
	}

	/**
	 * If StrCharSlice represents a string with a parser error in it
	 * this will return a string underlining the error.
	 *
	 * @returns
	 */
	public getErrorString(): string {
		return this.endExcl > this.startIncl
			? `${" ".repeat(this.startIncl)}${"^".repeat(this.length)}`
			: "";
	}

	public toString(): string {
		return this.slicedString;
	}

	public static from(
		value: string,
		startIncl: number,
		endExcl?: number
	): StrCharSlice {
		return new StrCharSlice(value, startIncl, endExcl);
	}

	public static fromLength(
		value: string,
		startIncl: number,
		length: number
	): StrCharSlice {
		return new StrCharSlice(value, startIncl, startIncl + length);
	}

	/**
	 * This function accepts a function call to string.indexOf(...) and returns a StrCharSlice
	 * based on result.
	 *
	 * If there is no match, the whole string is returned.
	 *
	 * @param value The string to extract a StrCharSlice from
	 * @param startIncl The starting index (inclusive) of the slice
	 *
	 * If startIncl is negative, the whole string is returned.
	 * Otherwise, a slice of the string is returned, starting at startIncl.
	 *
	 * @returns A new StrCharSlice
	 */
	public static fromIndexOfDefaultAll(
		value: string,
		startIncl: number
	): StrCharSlice {
		return startIncl >= 0
			? StrCharSlice.from(value, startIncl)
			: StrCharSlice.all(value);
	}

	/**
	 * This function accepts a function call to string.indexOf(...) and returns a StrCharSlice
	 * based on result.
	 *
	 * If there is no match, a StrCharSlice of length 0 is returned.
	 *
	 * @param value The string to extract a StrCharSlice from
	 * @param startIncl The starting index (inclusive) of the slice
	 *
	 * If startIncl is negative, StrCharSlice.none is returned.
	 * Otherwise, a slice of the string is returned, starting at startIncl.
	 *
	 * @returns A new StrCharSlice
	 */
	public static fromIndexOfDefaultNone(
		value: string,
		startIncl: number
	): StrCharSlice {
		return startIncl >= 0
			? StrCharSlice.from(value, startIncl)
			: StrCharSlice.none(value);
	}

	/**
	 * Create a StrCharSlice from a string and a range of element indices of: UTF-16 chars
	 * or surrogate pairs (which cannot be directly indexed.)
	 *
	 * The range is given as a start index (inclusive) and an end index (exclusive).
	 * If the end index is undefined, it will be set to the end of the string.
	 *
	 * If `startIncl` is negative, it will be interpreted as being relative to the end of the string.
	 * If `endExcl` is negative, it will be interpreted as being relative to the end of the string.
	 *
	 * Elements of the string are either UTF-16 chars or surrogate pairs.
	 *
	 * @param value The input string.
	 * @param startIncl The starting index (inclusive).
	 * @param endExcl The ending index (exclusive).
	 * @returns A new StrCharSlice from the input string and range of code point indices.
	 */
	public static fromCodePointIndices(
		value: string,
		startIncl?: number,
		endExcl?: number
	): StrCharSlice {
		const seq = StrSeq.from(value);
		const range = seq.getRange(startIncl, endExcl);

		return new StrCharSlice(value, range.startIncl, range.endExcl);
	}

	/**
	 * Create a StrCharSlice from a string and a range of element indices of: UTF-16 chars,
	 * surrogate pairs or grapheme clusters (which cannot be directly indexed.)
	 *
	 * The range is given as a start index (inclusive) and an end index (exclusive).
	 * If the end index is undefined, it will be set to the end of the string.
	 *
	 * If `startIncl` is negative, it will be interpreted as being relative to the end of the string.
	 * If `endExcl` is negative, it will be interpreted as being relative to the end of the string.
	 *
	 * Elements of the string are: UTF-16 chars, surrogate pairs or grapheme clusters.
	 *
	 * @param value The input string.
	 * @param startIncl The starting index (inclusive).
	 * @param endExcl The ending index (exclusive).
	 * @returns A new StrCharSlice from the input string and range of grapheme indices.
	 */
	public static fromGraphemeIndices(
		value: string,
		startIncl?: number,
		endExcl?: number
	): StrCharSlice {
		const seq = StrGraphemeSeq.from(value);
		const range = seq.getRange(startIncl, endExcl);

		return new StrCharSlice(value, range.startIncl, range.endExcl);
	}

	/**
	 * Create a StrCharSlice from a string and the end index (exclusive).
	 *
	 * The start index is always 0.
	 *
	 * @param endExcl The ending index (exclusive).
	 * @param value The input string.
	 * @returns A new StrCharSlice from the input string and end index.
	 */
	public static to(value: string, endExcl: number): StrCharSlice {
		return new StrCharSlice(value, 0, endExcl);
	}

	/**
	 * Create a StrCharSlice from a string, which spans the entire string.
	 *
	 * This is equivalent to calling `from(0, undefined)`.
	 *
	 * @param value The input string.
	 * @returns A new StrCharSlice from the input string, which spans the entire string.
	 */
	public static all(value: string): StrCharSlice {
		return new StrCharSlice(value, 0);
	}

	/**
	 * Create a StrCharSlice from a string, with no range.
	 *
	 * This is a StrCharSlice with start and end indices both 0.
	 *
	 * @param value The input string.
	 * @returns A new StrCharSlice from the input string, with no range.
	 */
	public static none(value: string): StrCharSlice {
		return new StrCharSlice(value, 0, 0);
	}
}
