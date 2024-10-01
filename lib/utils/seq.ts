export interface SeqBase<T> {
	gen(): Generator<T>;
}

export abstract class Seq<T> implements SeqBase<T> {
	abstract gen(): Generator<T>;

	public toArray(): readonly T[] {
		return Array.from(this.gen());
	}

	[Symbol.iterator]() {
		return this.gen();
	}

	public map<TOut>(fn: (x: T) => TOut) {
		return new MapSeq(this, fn);
	}

	public imap<TOut>(fn: (i: number, x: T) => TOut) {
		return new IndexMapSeq(this, fn);
	}

	public filter(fn: (x: T) => boolean) {
		return new FilterSeq(this, fn);
	}

	public skip(skipCount: number) {
		return new SkipSeq(this, skipCount);
	}

	public take(takeCount: number) {
		return new TakeSeq(this, takeCount);
	}
}

export class SkipSeq<T> extends Seq<T> {
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

export class MapSeq<TIn, TOut> extends Seq<TOut> {
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

export class FilterSeq<T> extends Seq<T> {
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

export class NumberFilterSeq extends Seq<number> {
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

export class TakeSeq<T> extends Seq<T> {
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

export class ArraySeq<T> extends Seq<T> {
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

export class NumSeq extends Seq<number> {
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

	public static from(min: number, max: number, inc: number = 1) {
		return new NumSeq(min, max, inc);
	}

	public static range(
		inclStart: number,
		exclEnd: number,
		inc: number = 1
	) {
		return new NumSeq(inclStart, exclEnd - 1, inc);
	}

	public static count(inclEnd: number) {
		return new NumSeq(1, inclEnd);
	}

	public static loop(exclEnd: number) {
		return new NumSeq(0, exclEnd - 1);
	}
}
