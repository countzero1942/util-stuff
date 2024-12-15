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

	public indexOf(value: string): number {
		let i = this.source.indexOf(value, this.startIncl);
		if (i > -1 && i + value.length <= this.endExcl) {
			return i;
		}
		return -1;
	}

	public lastIndexOf(value: string): number {
		let i = this.source.lastIndexOf(value, this.endExcl);
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
		return this.source.startsWith(value, this.startIncl);
	}

	public endsWith(value: string): boolean {
		if (value.length > this.length) {
			return false;
		}
		return this.source.endsWith(value, this.endExcl);
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
			this.source,
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
		return this.string;
	}

	public static from(
		source: string,
		startIncl: number,
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
}
