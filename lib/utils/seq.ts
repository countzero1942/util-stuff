import { div, log } from "@/utils/log";
import {
	FullType,
	getFullType,
	hasClassName,
	isFullType,
} from "@/utils/types";
import { stringify } from "node:querystring";

/**
 * Seq base class. Holds functional methods: 'map', 'filter', etc.
 * These chain together Seq instances: MapSeq, FilterSeq, etc.
 *
 * @param T the Seq element type
 */
export abstract class Seq<T> {
	abstract gen(): Generator<T>;

	/**
	 * Converts Seq to Array
	 *
	 * @returns readonly array of Seq element
	 */
	public toArray(): readonly T[] {
		return Array.from(this);
	}

	[Symbol.iterator]() {
		return this.gen();
	}

	/**
	 * Maps 'this' Seq to another Seq.
	 * One element type to another.
	 *
	 * @param fn The mapping function
	 *
	 * @returns MapSeq
	 */
	public map<TOut>(fn: (x: T) => TOut) {
		return new MapSeq(this, fn);
	}

	/**
	 * Maps 'this' Seq to another Seq with index.
	 * One element type to another.
	 *
	 * @param fn Mapping fucntion
	 * @param T 'this' element type
	 * @returns IndexMapSeq
	 */
	public imap<TOut>(fn: (i: number, x: T) => TOut) {
		return new IndexMapSeq(this, fn);
	}

	/**
	 * Filters 'this' Seq to another Seq
	 *
	 * @param fn Filter function
	 * @returns FilterSeq
	 */
	public filter(fn: (x: T) => boolean) {
		return new FilterSeq(this, fn);
	}

	/**
	 * Skips starting elements in 'this' Seq.
	 * 'skip' and 'take' can be chained together.
	 *
	 * @param skipCount Number of elements to skip
	 * @returns SkipSeq
	 */
	public skip(skipCount: number) {
		return new SkipSeq(this, skipCount);
	}

	/**
	 * Takes starting elements in 'this' Seq.
	 * 'skip' and 'take' can be chained together.
	 *
	 * @param takeCount Number of elements to take
	 * @returns TakeSeq
	 */
	public take(takeCount: number) {
		return new TakeSeq(this, takeCount);
	}

	public zip<T2, T3, T4, T5, TOut>(
		seqs: [Seq<T2>, Seq<T3>, Seq<T4>, Seq<T5>],
		fn: (a: T, b: T2, c: T3, d: T4, e: T5) => TOut
	): ZipSeq<TOut>;
	public zip<T2, T3, T4, TOut>(
		seqs: [Seq<T2>, Seq<T3>, Seq<T4>],
		fn: (a: T, b: T2, c: T3, d: T4) => TOut
	): ZipSeq<TOut>;
	public zip<T2, T3, TOut>(
		seqs: [Seq<T2>, Seq<T3>],
		fn: (a: T, b: T2, c: T3) => TOut
	): ZipSeq<TOut>;
	public zip<T2, TOut>(
		seqs: [Seq<T2>],
		fn: (a: T, b: T2) => TOut
	): ZipSeq<TOut>;
	public zip<TOut>(
		seqs: Seq<any>[],
		fn: (...args: any) => TOut
	): ZipSeq<TOut> {
		const allSeqs: Seq<any>[] = [this, ...seqs];
		return new ZipSeq(allSeqs, fn);
	}

	public first() {
		for (const x of this) {
			return x;
		}

		return undefined;
	}

	public firstOrThrow() {
		for (const x of this) {
			return x;
		}

		throw Error("Empty Seq: fistOrThrow");
	}

	public last() {
		let v: T | undefined = undefined;

		for (const x of this) {
			v = x;
		}

		return v;
	}

	public lastOrThrow(): T {
		let v: T | undefined = undefined;

		for (const x of this) {
			v = x;
		}

		if (v !== undefined) {
			return v;
		}

		throw Error("Empty Seq: lastOrThrow");
	}

	public foreach(fn: (x: T) => void) {
		for (const x of this) {
			fn(x);
		}
	}

	public log(max?: number) {
		let c = 1;
		max = max ?? Number.MAX_SAFE_INTEGER;
		for (const x of this) {
			if (c <= max) {
				log(x);
			}
		}
	}

	public count() {
		let c = 0;
		for (const x of this) {
			c++;
		}
		return c;
	}

	public hasElements() {
		for (const x of this) {
			return true;
		}
		return false;
	}

	public reduce(accStart: T, fn: (acc: T, current: T) => T) {
		let v = accStart;
		for (const x of this) {
			v = fn(v, x);
		}
		return v;
	}

	public accum<TValue>(
		accStart: TValue,
		fn: (acc: TValue, value: T) => TValue
	) {
		return new AccumSeq(this, accStart, fn);
	}
}

/**
 * Class used for mapping one Seq type to another
 *
 * @param TIn The input element type
 * @param TOut The output element type
 */
export class MapSeq<TIn, TOut> extends Seq<TOut> {
	/**
	 * MapSeq constructor.
	 *
	 * @param seq The input Seq
	 * @param fn The mapping lambda
	 */
	constructor(
		public readonly seq: Seq<TIn>,
		public readonly fn: (x: TIn) => TOut
	) {
		super();
	}

	public override *gen() {
		for (const x of this.seq) {
			yield this.fn(x);
		}
	}
}

/**
 * Class used for mapping one Seq to another, with index
 *
 * @param TIn The input element type
 * @param TOut The output element type
 */
export class IndexMapSeq<TIn, TOut> extends Seq<TOut> {
	constructor(
		public readonly seq: Seq<TIn>,
		public readonly fn: (i: number, x: TIn) => TOut
	) {
		super();
	}

	public override *gen() {
		let i = 0;
		for (const x of this.seq) {
			yield this.fn(i, x);
			i++;
		}
	}
}

/**
 * Class used to filter one Seq down to another Seq
 *
 * @param T The Seq element type
 */
export class FilterSeq<T> extends Seq<T> {
	/**
	 * FilterSeq constructor
	 *
	 * @param seq The input Seq
	 * @param fn The filter function
	 */
	constructor(
		public readonly seq: Seq<T>,
		public readonly fn: (x: T) => boolean
	) {
		super();
	}

	public override *gen() {
		for (const x of this.seq) {
			if (this.fn(x)) yield x;
		}
	}
}

/**
 * Class used to take a number of starting elements from a Seq
 *
 * @param T The Seq element type
 */
export class TakeSeq<T> extends Seq<T> {
	/**
	 * TakeSeq constructor
	 *
	 * @param seq The Seq to take elements from
	 * @param takeCount The number of elements to take
	 */
	constructor(
		public readonly seq: Seq<T>,
		public readonly takeCount: number
	) {
		super();
	}

	public override *gen() {
		let i = 0;
		for (const x of this.seq) {
			if (i < this.takeCount) {
				yield x;
			} else {
				break;
			}
			i++;
		}
	}
}

/**
 * Class used to skip a number of starting elements of a Seq
 *
 * @param T The Seq element type
 */
export class SkipSeq<T> extends Seq<T> {
	/**
	 * SkipSeq constructor
	 *
	 * @param seq The Seq to skip elements of
	 * @param skipCount The number of elements to skip
	 */
	constructor(
		public readonly seq: Seq<T>,
		public readonly skipCount: number
	) {
		super();
	}

	public override *gen() {
		let i = 1;
		for (const x of this.seq) {
			if (i > this.skipCount) yield x;
			i++;
		}
	}
}

/**
 * Class that holds an array whose elements will
 * be turned into a Seq
 *
 * @param T The Seq element type
 */
export class ArraySeq<T> extends Seq<T> {
	/**
	 * ArraySeq constructor
	 *
	 * @param array The array to Seq
	 */
	constructor(public readonly array: readonly T[]) {
		super();
	}
	public override *gen() {
		for (const x of this.array) {
			yield x;
		}
	}

	public static from<TElement>(array: readonly TElement[]) {
		return new ArraySeq(array);
	}
}

/**
 * Class that iterates over numbers in a Seq
 */
export class NumSeq extends Seq<number> {
	/**
	 * ArraySeq constructor
	 *
	 * @param min Minimum number in Seq
	 * @param max Maximum number in Seq
	 * @param inc Increment value
	 */

	// private coercedMin: number;
	// private coercedMax: number;
	// private coercedInc: number;

	constructor(
		public min: number,
		public max: number,
		public inc: number = 1
	) {
		super();
	}

	private setCoercedMinMaxInc = (): void => {
		const getSafeInce = (inc: number) => {
			// Test
		};

		const inc = Math.abs(this.inc);

		switch (true) {
			case this.min < this.max:

			case this.min > this.max:
				const inc = this.inc < 0;

			default:
				break;
		}
	};

	public override *gen() {
		for (let n = this.min; n <= this.max; n += this.inc) {
			yield n;
		}
	}

	/**
	 * NumberSeq factory method
	 *
	 * @param min Minimum number in Seq
	 * @param max Maximum number in Seq
	 * @param inc Increment value
	 * @returns NumberSeq
	 */
	public static from(min: number, max: number, inc: number = 1) {
		return new NumSeq(min, max, inc);
	}

	/**
	 * NumberSeq factory method
	 *
	 * @param inclStart Inclusive starting number
	 * @param exclEnd Exclusive ending number
	 * @param inc Increment
	 * @returns NumberSeq
	 */
	public static range(
		inclStart: number,
		exclEnd: number,
		inc: number = 1
	) {
		return new NumSeq(inclStart, exclEnd - 1, inc);
	}

	/**
	 * NumberSeq factory method.
	 *
	 * Counts from 1 upto and including end number
	 *
	 * @param inclEnd Inclusive end number
	 * @returns NumberSeq
	 */
	public static count(inclEnd: number) {
		return new NumSeq(1, inclEnd);
	}

	/**
	 * NumberSeq factory method.
	 *
	 * Index form: from 0 upto, but not including, end number
	 *
	 * @param exclEnd
	 * @returns
	 */
	public static loop(exclEnd: number) {
		return new NumSeq(0, exclEnd - 1);
	}
}

/**
 * Class used to directly filter a number Seq
 */
export class NumberFilterSeq extends Seq<number> {
	/**
	 * NumberFilterSeq constructor.
	 *
	 * @param min The min number
	 * @param max The max number
	 * @param fn The filter function
	 */
	constructor(
		public readonly min: number,
		public readonly max: number,
		public readonly fn: (x: number) => boolean
	) {
		super();
	}

	public override *gen() {
		const min = this.min;
		const max = this.max;
		for (let n = min; n <= max; n++) {
			if (this.fn(n)) yield n;
		}
	}
}

export class MathSumSeq extends Seq<number> {
	constructor(public fn: (n: number) => number) {
		super();
	}

	public override *gen() {
		let i = 1;
		let sum = 0;
		while (true) {
			sum += this.fn(i);
			yield sum;
			i++;
		}
	}

	public static from(fn: (n: number) => number) {
		return new MathSumSeq(fn);
	}
}

export class MathProdSeq extends Seq<number> {
	constructor(public fn: (n: number) => number) {
		super();
	}

	public override *gen() {
		let i = 1;
		let prod = 1;
		while (true) {
			prod *= this.fn(i);
			yield prod;
			i++;
		}
	}

	public static from(fn: (n: number) => number) {
		return new MathProdSeq(fn);
	}
}

export type SeqType<T> = T extends Seq<infer U> ? U : never;

/**
 * Class used to Zip two Seqs together
 *
 * @param TSeqA The type of the first Seq
 * @param TSeqB The type of the second Seq
 * @param TOut The final element type of the Seq
 */
export class ZipSeq<TOut> extends Seq<TOut> {
	/**
	 * ZipManySeq constructor
	 *
	 * @param Seqs The array of Seqs to zip
	 * @param fn The zip mapping function
	 */
	constructor(
		public readonly Seqs: Seq<any>[],
		public readonly fn: (...args: any[]) => TOut
	) {
		super();
	}

	public override *gen() {
		{
			const iters = this.Seqs.map(seq => seq.gen());
			const length = iters.length;
			const argArray = new Array(length);

			let cont = true;
			while (true) {
				let argArrayIndex = 0;
				for (const iter of iters) {
					const res = iter.next();
					if (res.done) {
						cont = false;
						break;
					}

					argArray[argArrayIndex] = res.value;

					argArrayIndex++;
				}

				if (cont) {
					yield this.fn(...argArray);
				} else {
					break;
				}
			}
		}
	}
}

export class AccumSeq<TIn, TValue> extends Seq<TValue> {
	/**
	 * MapSeq constructor.
	 *
	 * @param seq The input Seq
	 * @param fn The mapping lambda
	 */
	constructor(
		public readonly seq: Seq<TIn>,
		public readonly start: TValue,
		public readonly fn: (acc: TValue, value: TIn) => TValue
	) {
		super();
	}

	public override *gen() {
		let acc = this.start;
		for (const value of this.seq) {
			acc = this.fn(acc, value);
			yield acc;
		}
	}
}

export class ObjValueSeq<T> extends Seq<T> {
	constructor(
		public readonly object: Object,
		public readonly fullType: FullType,
		public readonly constraintKind:
			| "none"
			| "full-type"
			| "has-class"
	) {
		super();
	}

	public override *gen() {
		for (const [key, value] of Object.entries(this.object)) {
			switch (this.constraintKind) {
				case "none":
					break;
				case "full-type":
					if (!isFullType(value, this.fullType)) {
						continue;
					}
					break;
				case "has-class":
					log(`===><ObjValueSeq.gen> 'has-class' Value:`);
					log(value);

					log(
						`===><ObjValueSeq.gen>: has className: '${this.fullType.className}'`
					);
					if (!hasClassName(value, this.fullType.className)) {
						div();
						continue;
					}
					div();
					break;
			}
			yield value as T;
		}
	}

	public static fromType<T>(obj: Object, type: FullType["type"]) {
		return new ObjValueSeq<T>(
			obj,
			{ type, className: "" },
			"full-type"
		);
	}
	public static fromClass<T>(obj: Object, className: string) {
		return new ObjValueSeq<T>(
			obj,
			{ type: "Class", className },
			"full-type"
		);
	}

	public static fromHasClass<T>(obj: Object, className: string) {
		return new ObjValueSeq<T>(
			obj,
			{ type: "Class", className },
			"has-class"
		);
	}
}

export class ObjKeyValueSeq<T> extends Seq<{
	key: string;
	value: T;
}> {
	constructor(
		public readonly object: Object,
		public readonly fullType: FullType,
		public readonly constraintKind:
			| "none"
			| "full-type"
			| "has-class"
	) {
		super();
	}

	public override *gen() {
		for (const [key, value] of Object.entries(this.object)) {
			switch (this.constraintKind) {
				case "none":
					break;
				case "full-type":
					if (!isFullType(value, this.fullType)) {
						continue;
					}
					break;
				case "has-class":
					// log(`===> 'has-class' Value:`);
					// log(value);

					// log(
					// 	`===>hasClassName: '${
					// 		this.fullType.className
					// 	}' ${hasClassName(value, this.fullType.className)}`
					// );
					if (!hasClassName(value, this.fullType.className)) {
						continue;
					}
			}
			yield { key, value: value as T };
		}
	}

	public static fromType<T>(obj: Object, type: FullType["type"]) {
		return new ObjKeyValueSeq<T>(
			obj,
			{ type, className: "" },
			"full-type"
		);
	}
	public static fromClass<T>(obj: Object, className: string) {
		return new ObjKeyValueSeq<T>(
			obj,
			{ type: "Class", className },
			"full-type"
		);
	}

	public static fromHasClass<T>(obj: Object, className: string) {
		return new ObjKeyValueSeq<T>(
			obj,
			{ type: "Class", className },
			"has-class"
		);
	}
}
