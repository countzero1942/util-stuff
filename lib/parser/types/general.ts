export class StrSlice {
	constructor(
		public readonly value: string,
		public readonly start: number,
		public readonly end: number
	) {}
}

export class Slice {
	constructor(
		public readonly start: number,
		public readonly end?: number
	) {}

	// public slice<T>(arr: T[]): T[] {
	// 	return this.end === undefined
	// 		? arr.slice(this.start)
	// 		: arr.slice(this.start, this.end);
	// }

	public slice<T>(arrOrStr: T[] | string): T[] | string {
		if (Array.isArray(arrOrStr)) {
			return this.end === undefined
				? arrOrStr.slice(this.start)
				: arrOrStr.slice(this.start, this.end);
		} else {
			return this.end === undefined
				? arrOrStr.slice(this.start)
				: arrOrStr.slice(this.start, this.end);
		}
	}

	public normalize<T>(arrOrStr: readonly T[] | string): {
		startIncl: number;
		endExcl: number;
	} {
		if (Array.isArray(arrOrStr)) {
			return this.end === undefined
				? { startIncl: this.start, endExcl: arrOrStr.length }
				: { startIncl: this.start, endExcl: this.end };
		} else {
			return this.end === undefined
				? { startIncl: this.start, endExcl: arrOrStr.length }
				: { startIncl: this.start, endExcl: this.end };
		}
	}

	public getErrorString(value: string): string {
		const start =
			this.start >= 0
				? this.start
				: Math.max(0, value.length + this.start);
		const end =
			this.end === undefined
				? value.length
				: this.end >= 0
				? this.end
				: Math.max(0, value.length + this.end);

		return end > start
			? `${" ".repeat(start)}${"^".repeat(end - start)}`
			: "";
	}

	public static from(start: number, end?: number): Slice {
		return new Slice(start, end);
	}

	public static fromLength(start: number, length: number): Slice {
		return new Slice(start, start + length);
	}

	public static fromIndexOfDefaultAll(start: number): Slice {
		return start >= 0 ? Slice.from(start) : Slice.all();
	}
	public static fromIndexOfDefaultNone(start: number): Slice {
		return start >= 0 ? Slice.from(start) : Slice.none();
	}

	public static to(end: number): Slice {
		return new Slice(0, end);
	}

	public static all(): Slice {
		return new Slice(0);
	}
	public static none(): Slice {
		return new Slice(0, 0);
	}
}
