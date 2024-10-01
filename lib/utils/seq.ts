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
		return Array.from(this.gen());
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
	constructor(
		public min: number,
		public max: number,
		public inc: number = 1
	) {
		super();
	}

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
