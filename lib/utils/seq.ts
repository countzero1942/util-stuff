import { div, log } from "@/utils/log";
import {
	FullType,
	getFullType,
	getType,
	hasClassName,
	isFullType,
	isObject,
} from "@/utils/types";
import { stringify } from "node:querystring";
import { Key } from "node:readline";
import { ValueOf } from "type-fest";
import { ValuesType } from "utility-types";

export type AnySeq = Seq<any>;

export type SeqType<T> = T extends Seq<infer U> ? U : never;

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

	public toObject2<V>(): Record<KeyType, V> {
		const obj: Record<string, V> = {};

		for (const x of this) {
			if (!isObject(x)) continue;
			const key = x["key"];
			if (!key) continue;
			const value = x["value"];
			if (!value) continue;

			obj[key] = value;
		}
		return obj;
	}

	public toObject<V extends ExtractValueType<T>>(): Record<
		KeyType,
		V
	> {
		const obj: Record<KeyType, V> = {};

		for (const x of this) {
			if (!isObject(x)) continue;
			const key = x["key"];
			if (!key) continue;
			const value = x["value"];
			if (!value) continue;

			obj[key] = value;
		}
		return obj;
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

	public zip<T2, T3, T4, T5, T6, T7, T8, T9, TOut>(
		seqs: [
			Seq<T2>,
			Seq<T3>,
			Seq<T4>,
			Seq<T5>,
			Seq<T6>,
			Seq<T7>,
			Seq<T8>,
			Seq<T9>
		],
		fn: (
			a: T,
			b: T2,
			c: T3,
			d: T4,
			e: T5,
			f: T6,
			g: T7,
			h: T8,
			i: T9
		) => TOut
	): ZipSeq<TOut>;
	/**
	 * Zips 'this' Seq with up to 8 other Seqs using a function.
	 * The function takes one element from each Seq and returns a new element.
	 * The resulting Seq is a ZipSeq.
	 *
	 * @param seqs The Seqs to zip
	 * @param fn The zipping function
	 * @returns ZipSeq
	 */
	public zip<T2, T3, T4, T5, T6, T7, T8, TOut>(
		seqs: [
			Seq<T2>,
			Seq<T3>,
			Seq<T4>,
			Seq<T5>,
			Seq<T6>,
			Seq<T7>,
			Seq<T8>
		],
		fn: (
			a: T,
			b: T2,
			c: T3,
			d: T4,
			e: T5,
			f: T6,
			g: T7,
			h: T8
		) => TOut
	): ZipSeq<TOut>;
	/**
	 * Zips 'this' Seq with up to 7 other Seqs using a function.
	 * The function takes one element from each Seq and returns a new element.
	 * The resulting Seq is a ZipSeq.
	 *
	 * @param seqs The Seqs to zip
	 * @param fn The zipping function
	 * @returns ZipSeq
	 */
	public zip<T2, T3, T4, T5, T6, T7, TOut>(
		seqs: [Seq<T2>, Seq<T3>, Seq<T4>, Seq<T5>, Seq<T6>, Seq<T7>],
		fn: (a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7) => TOut
	): ZipSeq<TOut>;
	/**
	 * Zips 'this' Seq with up to 6 other Seqs using a function.
	 * The function takes one element from each Seq and returns a new element.
	 * The resulting Seq is a ZipSeq.
	 *
	 * @param seqs The Seqs to zip
	 * @param fn The zipping function
	 * @returns ZipSeq
	 */
	public zip<T2, T3, T4, T5, T6, TOut>(
		seqs: [Seq<T2>, Seq<T3>, Seq<T4>, Seq<T5>, Seq<T6>],
		fn: (a: T, b: T2, c: T3, d: T4, e: T5, f: T6) => TOut
	): ZipSeq<TOut>;
	/**
	 * Zips 'this' Seq with up to 5 other Seqs using a function.
	 * The function takes one element from each Seq and returns a new element.
	 * The resulting Seq is a ZipSeq.
	 *
	 * @param seqs The Seqs to zip
	 * @param fn The zipping function
	 * @returns ZipSeq
	 */
	public zip<T2, T3, T4, T5, TOut>(
		seqs: [Seq<T2>, Seq<T3>, Seq<T4>, Seq<T5>],
		fn: (a: T, b: T2, c: T3, d: T4, e: T5) => TOut
	): ZipSeq<TOut>;
	/**
	 * Zips 'this' Seq with up to 4 other Seqs using a function.
	 * The function takes one element from each Seq and returns a new element.
	 * The resulting Seq is a ZipSeq.
	 *
	 * @param seqs The Seqs to zip
	 * @param fn The zipping function
	 * @returns ZipSeq
	 */
	public zip<T2, T3, T4, TOut>(
		seqs: [Seq<T2>, Seq<T3>, Seq<T4>],
		fn: (a: T, b: T2, c: T3, d: T4) => TOut
	): ZipSeq<TOut>;
	/**
	 * Zips 'this' Seq with up to 3 other Seqs using a function.
	 * The function takes one element from each Seq and returns a new element.
	 * The resulting Seq is a ZipSeq.
	 *
	 * @param seqs The Seqs to zip
	 * @param fn The zipping function
	 * @returns ZipSeq
	 */
	public zip<T2, T3, TOut>(
		seqs: [Seq<T2>, Seq<T3>],
		fn: (a: T, b: T2, c: T3) => TOut
	): ZipSeq<TOut>;
	/**
	 * Zips 'this' Seq with one other Seq using a function.
	 * The function takes one element from each Seq and returns a new element.
	 * The resulting Seq is a ZipSeq.
	 *
	 * @param seqs The Seqs to zip
	 * @param fn The zipping function
	 * @returns ZipSeq
	 */
	public zip<T2, TOut>(
		seqs: [Seq<T2>],
		fn: (a: T, b: T2) => TOut
	): ZipSeq<TOut>;
	/**
	 * Zips 'this' Seq with an array of Seqs using a function.
	 * The function takes one element from each Seq and returns a new element.
	 * The resulting Seq is a ZipSeq.
	 *
	 * @param seqs The Seqs to zip
	 * @param fn The zipping function
	 * @returns ZipSeq
	 */
	public zip<TOut>(
		seqs: Seq<any>[],
		fn: (...args: any) => TOut
	): ZipSeq<TOut> {
		const allSeqs: Seq<any>[] = [this, ...seqs];
		return new ZipSeq(allSeqs, fn);
	}

	/**
	 * Returns the first element of the Seq, or undefined if the Seq is empty.
	 */
	public first() {
		for (const x of this) {
			return x;
		}

		return undefined;
	}

	/**
	 * Returns the first element of the Seq, or throws an Error if the Seq is empty.
	 * @throws Error if the Seq is empty
	 */
	public firstOrThrow() {
		for (const x of this) {
			return x;
		}

		throw Error("Empty Seq: fistOrThrow");
	}

	/**
	 * Returns the last element of the Seq, or undefined if the Seq is empty.
	 */
	public last() {
		let v: T | undefined = undefined;

		for (const x of this) {
			v = x;
		}

		return v;
	}

	/**
	 * Returns the last element of the Seq, or throws an Error if the Seq is empty.
	 * @throws Error if the Seq is empty
	 */
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

	/**
	 * Applies a side effect to each element of the Seq.
	 * @param fn A pure function with side effects
	 */
	public foreach(fn: (x: T) => void) {
		for (const x of this) {
			fn(x);
		}
	}

	/**
	 * Logs each element of the Seq to the console.
	 * @param max The maximum number of elements to log. Defaults to Number.MAX_SAFE_INTEGER.
	 */
	public log(max?: number) {
		let c = 1;
		max = max ?? Number.MAX_SAFE_INTEGER;
		for (const x of this) {
			if (c <= max) {
				log(x);
			} else {
				break;
			}
		}
	}

	/**
	 * Returns the number of elements in the Seq.
	 * Note: This method uses iteration under the hood,
	 * so it may not be suitable for very large Seqs.
	 * @returns The number of elements in the Seq
	 */
	public count() {
		let c = 0;
		for (const x of this) {
			c++;
		}
		return c;
	}

	/**
	 * Checks if the Seq has any elements.
	 * @returns true if the Seq is not empty, false otherwise
	 */
	public hasElements() {
		for (const x of this) {
			return true;
		}
		return false;
	}

	/**
	 * Applies a function to each element of the Seq, in order,
	 * and returns the result to reduce the Seq to a single value.
	 * @param accStart The initial value for the accumulator
	 * @param fn A function of two arguments: the accumulator and the next value
	 * @returns The reduced value
	 */
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

export class ObjValueSeq<
	TValue,
	TKey extends KeyType = KeyType
> extends Seq<TValue> {
	/**
	 * ObjValueSeq constructor.
	 *
	 * @param object The input object
	 * @param fullType The full type to check against
	 * @param constraintKind The type of dynamic constraint to apply
	 * "none" - no constraint
	 * "full-type" - check that the value matches fullType
	 * "has-class" - check that the value has the given class name
	 */
	constructor(
		public readonly object: Record<TKey, TValue>,
		public readonly fullType: FullType,
		public readonly constraintKind:
			| "none"
			| "full-type"
			| "has-class"
	) {
		super();
	}

	/**
	 * Iterate over the values in the object.
	 * If the Seq was created with a constraint, apply the constraint.
	 * If the constraint fails, skip the value.
	 *
	 * @returns An iterator over the constrained values.
	 */
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
					// log(`===><ObjValueSeq.gen> 'has-class' Value:`);
					// log(value);

					// log(
					// 	`===><ObjValueSeq.gen>: has className: '${this.fullType.className}'`
					// );
					if (!hasClassName(value, this.fullType.name)) {
						// div();
						continue;
					}
					// div();
					break;
			}
			yield value as TValue;
		}
	}

	/**
	 * From Generic constraint alone. No dynamic type checking.
	 *
	 * @param obj
	 * @returns
	 */
	public static fromGeneric<TValue, TKey extends KeyType = string>(
		obj: Record<TKey, TValue>
	) {
		return new ObjValueSeq<TValue, TKey>(
			obj,
			{ type: "Null", name: "" },
			"none"
		);
	}

	/**
	 * From generic constraint and dynamic type checking. Non-class type.
	 *
	 * @param obj
	 * @param type
	 * @returns
	 */
	public static fromType<TValue, TKey extends KeyType = string>(
		obj: Record<TKey, TValue>,
		type: FullType["type"]
	) {
		return new ObjValueSeq<TValue, TKey>(
			obj,
			{ type, name: "" },
			"full-type"
		);
	}
	/**
	 * From generic constraint and dynamic class filter.
	 *
	 * @param obj
	 * @param className
	 * @returns
	 */
	public static fromClass<TValue, TKey extends KeyType = string>(
		obj: Record<TKey, TValue>,
		className: string
	) {
		return new ObjValueSeq<TValue, TKey>(
			obj,
			{ type: "Class", name: className },
			"full-type"
		);
	}

	/**
	 * From generic constraint and has-class (self or ancestor base class)
	 * dynamic type checking.
	 *
	 * @param obj
	 * @param className
	 * @returns
	 */
	public static fromHasClass<TValue, TKey extends KeyType = string>(
		obj: Record<TKey, TValue>,
		className: string
	) {
		return new ObjValueSeq<TValue, TKey>(
			obj,
			{ type: "Class", name: className },
			"has-class"
		);
	}
}

export class ObjKeyValueSeq<
	TValue,
	TKey extends KeyType = KeyType
> extends Seq<{
	key: TKey;
	value: TValue;
}> {
	/**
	 * ObjKeyValueSeq constructor.
	 *
	 * @param object The input object
	 * @param fullType The full type to check against
	 * @param constraintKind The type of constraint to apply
	 * "none" - no constraint
	 * "full-type" - check that the value is a full match to fullType
	 * "has-class" - check that the value has the given class name
	 */
	constructor(
		public readonly object: Record<TKey, TValue>,
		public readonly fullType: FullType,
		public readonly constraintKind:
			| "none"
			| "full-type"
			| "has-class"
	) {
		super();
	}

	/**
	 * Iterate over the key-value pairs in the object.
	 * If the Seq was created with a constraint, apply the constraint.
	 * If the constraint fails, skip the pair.
	 *
	 * @returns An iterator over the constrained key-value pairs.
	 */
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
					// log("===========");

					if (!hasClassName(value, this.fullType.name)) {
						// log("===> className fail: don't yield");
						// div();
						continue;
					}
					// log("===> className match: yield");
					// div();
					break;
			}
			yield { key: key as TKey, value: value as TValue };
		}
	}
	public static fromGeneric<TValue, TKey extends KeyType = string>(
		obj: Record<TKey, TValue>
	) {
		return new ObjKeyValueSeq<TValue, TKey>(
			obj,
			{ type: "Null", name: "" },
			"none"
		);
	}

	public static fromType<TValue, TKey extends KeyType = string>(
		obj: Record<TKey, TValue>,
		type: FullType["type"]
	) {
		return new ObjKeyValueSeq<TValue, TKey>(
			obj,
			{ type, name: "" },
			"full-type"
		);
	}
	public static fromClass<TValue, TKey extends KeyType = string>(
		obj: Record<TKey, TValue>,
		className: string
	) {
		return new ObjKeyValueSeq<TValue, TKey>(
			obj,
			{ type: "Class", name: className },
			"full-type"
		);
	}

	public static fromHasClass<TValue, TKey extends KeyType = string>(
		obj: Record<TKey, TValue>,
		className: string
	) {
		return new ObjKeyValueSeq<TValue, TKey>(
			obj,
			{ type: "Class", name: className },
			"has-class"
		);
	}
}
