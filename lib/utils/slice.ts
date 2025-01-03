import { Str } from "@/parser/types/type-types";
import { clamp } from "@/utils/math";
import { StrGraphemeSeq, StrSeq, Range, Seq } from "@/utils/seq";
import { isCodePointWhiteSpace } from "@/utils/string";

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
	public readonly startIncl: number;

	public readonly endExcl: number;

	constructor(
		public readonly source: string,
		startIncl?: number,
		endExcl?: number
	) {
		const range = normalizeStartEnd(
			this.source.length,
			startIncl,
			endExcl
		);
		this.startIncl = range.startIncl;
		this.endExcl = range.endExcl;
		if (
			this.startIncl === 0 &&
			this.endExcl === this.source.length
		) {
			this.sliceCache = this.source;
		}
	}

	public get length(): number {
		return this.endExcl - this.startIncl;
	}

	public get isEmpty(): boolean {
		return this.length === 0;
	}

	private sliceCache: string | undefined = undefined;

	public get string(): string {
		if (this.sliceCache === undefined) {
			this.sliceCache = this.source.slice(
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
			isCodePointWhiteSpace(this.source.charCodeAt(start))
		) {
			start++;
		}
		return start === this.startIncl
			? this
			: new StrCharSlice(this.source, start, this.endExcl);
	}

	public trimEnd(): StrCharSlice {
		let endIncl = this.endExcl - 1;
		while (
			endIncl >= this.startIncl &&
			isCodePointWhiteSpace(this.source.charCodeAt(endIncl))
		) {
			endIncl--;
		}
		return endIncl === this.endExcl - 1
			? this
			: new StrCharSlice(this.source, this.startIncl, endIncl + 1);
	}

	public trim(): StrCharSlice {
		return this.trimStart().trimEnd();
	}

	public indexOf(value: string, childStartIncl?: number): number {
		// abcde
		// 012345
		// length = 5
		//
		// value = "", length = 0
		// loopLength = 5 - 0 = 5
		// lastIndex = 4
		//
		// value = "e", length = 1
		// loopLength = 5 - 1 = 4
		// lastIndex = 4 => wrong
		// loopLength = 5 - 1 + 1 = 5
		// lastIndex = 4
		//
		// value = "de", length = 2
		// loopLength = 5 - 2 + 1 = 4
		// lastIndex = 3
		//
		// So always add the 1 because we exclude empty value

		const l = value.length;
		if (l === 0) {
			return -1;
		}

		const range = normalizeStartEnd(this.length, childStartIncl);

		const loopLength = this.endExcl - l + 1;
		for (
			let i = this.startIncl + range.startIncl;
			i < loopLength;
			i++
		) {
			if (this.source.startsWith(value, i)) {
				return i - this.startIncl;
			}
		}
		return -1;
	}

	public countOccurencesOf = (
		match: string,
		childStartIncl?: number
	): number => {
		if (match.length == 0) {
			return 0;
		}

		const range = normalizeStartEnd(this.length, childStartIncl);

		let i = range.startIncl;

		let count = 0;
		while (true) {
			i = this.indexOf(match, i);
			if (i >= 0) {
				count++;
				i += match.length;
			} else {
				break;
			}
		}
		return count;
	};

	public lastIndexOf(value: string, childEndExcl?: number): number {
		// hello world
		// 012345678901

		const l = value.length;
		if (l === 0) {
			return -1;
		}

		const range = normalizeStartEnd(this.length, 0, childEndExcl);

		for (let i = range.endExcl - l; i >= this.startIncl; i--) {
			if (this.source.startsWith(value, i)) {
				return i - this.startIncl;
			}
		}
		return -1;
	}

	public startsWith(
		value: string | StrCharSlice,
		startIncl?: number
	): boolean {
		const range = normalizeStartEnd(this.length, startIncl);

		if (
			value.length === 0 ||
			range.startIncl + value.length > this.length
		) {
			return false;
		}
		if (typeof value === "string") {
			return this.source.startsWith(
				value,
				this.startIncl + range.startIncl
			);
		} else {
			let valueIndex = value.startIncl;
			let sourceIndex = this.startIncl + range.startIncl;
			let valueStr = value.source;
			let sourceStr = this.source;
			while (
				valueIndex < value.endExcl &&
				sourceIndex < this.endExcl
			) {
				if (
					valueStr.charCodeAt(valueIndex) !==
					sourceStr.charCodeAt(sourceIndex)
				) {
					return false;
				}
				valueIndex++;
				sourceIndex++;
			}
			return valueIndex === value.endExcl;
		}
	}

	public endsWith(
		value: string | StrCharSlice,
		endExcl?: number
	): boolean {
		// hello world
		// 012345678901
		// 11 -

		const range = normalizeStartEnd(this.length, 0, endExcl);

		if (value.length === 0 || value.length > this.length) {
			return false;
		}
		const startsWithIndex = range.endExcl - value.length;
		return this.startsWith(value, startsWithIndex);
	}

	public equals(value: string | StrCharSlice): boolean {
		// if (typeof value === "string") {
		// 	return (
		// 		this.length === value.length && this.startsWith(value)
		// 	);
		// } else {
		// 	return (
		// 		this.length === value.length &&
		// 		this.startsWith(value.string)
		// 	);
		// }
		if (value.length === 0 && this.length === 0) {
			return true;
		}

		return this.length === value.length && this.startsWith(value);
	}

	public split(
		splitter: string,
		maxSplits?: number
	): StrCharSlice[] {
		const strs: StrCharSlice[] = [];
		let i = this.startIncl;
		let splits = 0;
		const safeMaxSplits =
			maxSplits === undefined
				? Number.MAX_SAFE_INTEGER
				: maxSplits;
		while (true) {
			const j = this.indexOf(splitter, i);
			if (j > -1) {
				splits++;
			} else {
				strs.push(
					new StrCharSlice(this.source, i, this.endExcl).trim()
				);
				break;
			}
			strs.push(new StrCharSlice(this.source, i, j).trim());

			i = j + splitter.length;

			if (splits >= safeMaxSplits) {
				strs.push(
					new StrCharSlice(this.source, i, this.endExcl).trim()
				);
				break;
			}
		}
		return strs;
	}

	public parentSlice(
		startIncl?: number,
		endExcl?: number
	): StrCharSlice {
		return new StrCharSlice(this.source, startIncl, endExcl);
	}

	public childSlice(
		childStartIncl?: number,
		childEndExcl?: number
	): StrCharSlice {
		const range = normalizeStartEnd(
			this.length,
			childStartIncl,
			childEndExcl
		);

		return new StrCharSlice(
			this.source,
			this.startIncl + range.startIncl,
			this.startIncl + range.endExcl
		);
	}

	public sliceOf(value: string): StrCharSlice {
		const i = this.indexOf(value);
		if (i === -1) {
			return StrCharSlice.none(this.source);
		}
		return this.parentSlice(i, i + value.length);
	}

	public indexOfMany(
		values: readonly string[],
		startIncl?: number
	): [number, number] {
		for (
			let i =
				startIncl === undefined
					? this.startIncl
					: Math.max(startIncl, this.startIncl);
			i < this.endExcl;
			i++
		) {
			for (let j = 0; j < values.length; j++) {
				const value = values[j] as string;
				if (
					i + value.length <= this.endExcl &&
					this.source.startsWith(value, i)
				) {
					return [i, j];
				}
			}
		}
		return [-1, -1];
	}

	public edgeSplitMany(values: readonly string[]): StrCharSlice[] {
		// note: 'values' can only have 'undefined' if out of bounds
		const slices: StrCharSlice[] = [];
		let start = this.startIncl;
		let next = start;
		while (next <= this.endExcl) {
			const [j, k] = this.indexOfMany(values, next);
			if (j === -1) {
				slices.push(
					new StrCharSlice(
						this.source,
						start,
						this.endExcl
					).trim()
				);
				break;
			}
			if (start !== j) {
				slices.push(
					new StrCharSlice(this.source, start, j).trim()
				);
			}
			start = j;
			next = start + values[k]!.length;
		}
		return slices;
	}

	public indexesOfOrdered(
		orderedValues: readonly string[]
	): readonly number[] {
		// note: 'orderedValues' can only be 'undefined' if indexed out of bounds
		const valuesLength = orderedValues.length;
		const indexes = Array.from({ length: valuesLength }, () => -1);
		let currentOrder = 0;
		for (
			let i = this.startIncl;
			i < this.endExcl && currentOrder < valuesLength;
			i++
		) {
			for (let j = currentOrder; j < valuesLength; j++) {
				const value = orderedValues[j] as string;
				if (this.source.startsWith(value, i)) {
					indexes[j] = i;
					i += value.length;
					currentOrder = j + 1;
					break;
				}
			}
		}
		return indexes;
	}

	public edgeSplitOrdered(
		values: readonly string[]
	): StrCharSlice[] {
		// 'indexes' will be same length as 'values'
		const indexes = this.indexesOfOrdered(values);
		const slices: StrCharSlice[] = [];
		let start = this.startIncl;
		for (let i = 0; i < indexes.length; i++) {
			const end = indexes[i] as number;
			if (end !== -1) {
				slices.push(
					new StrCharSlice(this.source, start, end).trim()
				);
				start = end;
			}
		}
		slices.push(new StrCharSlice(this.source, start, this.endExcl));
		return slices;
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
		return this.string;
	}

	public static from(
		source: string,
		startIncl?: number,
		endExcl?: number
	): StrCharSlice {
		return new StrCharSlice(source, startIncl, endExcl);
	}

	public static fromLength(
		source: string,
		startIncl: number,
		length: number
	): StrCharSlice {
		return new StrCharSlice(source, startIncl, startIncl + length);
	}

	public static fromIndexOfDefaultAll(
		source: string,
		startIncl: number
	): StrCharSlice {
		return startIncl >= 0
			? StrCharSlice.from(source, startIncl)
			: StrCharSlice.all(source);
	}

	public static fromIndexOfDefaultNone(
		source: string,
		startIncl: number
	): StrCharSlice {
		return startIncl >= 0
			? StrCharSlice.from(source, startIncl)
			: StrCharSlice.none(source);
	}

	public static fromCodePointIndices(
		source: string,
		startIncl?: number,
		endExcl?: number
	): StrCharSlice {
		const seq = StrSeq.from(source);
		const range = seq.getRange(startIncl, endExcl);

		return new StrCharSlice(source, range.startIncl, range.endExcl);
	}

	public static fromGraphemeIndices(
		source: string,
		startIncl?: number,
		endExcl?: number
	): StrCharSlice {
		const seq = StrGraphemeSeq.from(source);
		const range = seq.getRange(startIncl, endExcl);

		return new StrCharSlice(source, range.startIncl, range.endExcl);
	}

	public static to(source: string, endExcl: number): StrCharSlice {
		return new StrCharSlice(source, 0, endExcl);
	}

	public static all(source: string): StrCharSlice {
		return new StrCharSlice(source, 0);
	}

	public static none(source: string): StrCharSlice {
		return new StrCharSlice(source, 0, 0);
	}

	public static empty(): StrCharSlice {
		return new StrCharSlice("", 0, 0);
	}
}
