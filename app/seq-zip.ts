import { log, logh, logln } from "@/utils/log";
import {
	MathProdSeq,
	MathSumSeq,
	NumSeq,
	Seq,
	SeqType,
	ZipSeq,
} from "@/utils/seq";
import { toFixedArray } from "@/utils/types";

const div = () => {
	logln(40);
};

const ftup = <T extends any[]>(
	args: [...T],
	fn: (args: [...T]) => [...T]
) => {
	return fn(args);
};

{
	const ret = ftup(["string", 32, true], ([a, b, c]) => {
		return [a, b, c];
	});
}

function zipmany<T1, T2, T3, T4, T5, TOut>(
	fn: (a: T1, b: T2, c: T3, d: T4, e: T5) => TOut,
	seq1: Seq<T1>,
	seq2: Seq<T2>,
	seq3: Seq<T3>,
	seq4: Seq<T4>,
	seq5: Seq<T5>
): TOut;
function zipmany<T1, T2, T3, T4, TOut>(
	fn: (a: T1, b: T2, c: T3, d: T4) => TOut,
	seq1: Seq<T1>,
	seq2: Seq<T2>,
	seq3: Seq<T3>,
	seq4: Seq<T4>
): TOut;
function zipmany<T1, T2, T3, TOut>(
	fn: (a: T1, b: T2, c: T3) => TOut,
	seq1: Seq<T1>,
	seq2: Seq<T2>,
	seq3: Seq<T3>
): TOut;
function zipmany<T1, T2, TOut>(
	fn: (a: T1, b: T2) => TOut,
	seq1: Seq<T1>,
	seq2: Seq<T2>
): TOut;
function zipmany<T, TOut>(
	fn: (...args: any) => TOut,
	...seqs: Seq<T>[]
): TOut {
	const arr: any[] = [];

	for (const seq of seqs) {
		arr.push(seq.firstOrThrow());
	}

	return fn(...arr);
}

export const testZipManyPrototype = () => {
	const seq1 = NumSeq.count(10);
	const seq2 = seq1.map(x => x.toString());
	const seq3 = seq1.map(x => x ** 2);
	const seq4 = seq1.map(x => x ** 3);
	const seq5 = seq1.map(x => x % 2 === 0);

	logh("Test Zip Many Prototype");

	const seqs = [seq1, seq2, seq3, seq4, seq5];
	for (const seq of seqs) {
		seq.log();
		div();
	}
	log();

	// @ts-expect-error
	const val1 = zipmany(count => {
		return { count };
	}, seq1);

	const val2 = zipmany(
		(count, str) => {
			return { count, str };
		},
		seq1,
		seq2
	);

	const val3 = zipmany(
		(count, str, square) => {
			return { count, str, square };
		},
		seq1,
		seq2,
		seq3
	);

	const val4 = zipmany(
		(count, str, square, cube) => {
			return { count, str, square, cube };
		},
		seq1,
		seq2,
		seq3,
		seq4
	);

	const val5 = zipmany(
		(count, str, square, cube, truthy) => {
			return { count, str, square, cube, truthy };
		},
		seq1,
		seq2,
		seq3,
		seq4,
		seq5
	);

	logh("Values");
	const vals = [val1, val2, val3, val4, val5];
	for (const v of vals) {
		log(v);
		div();
	}
};

/**
 * This is a painful mess
 *
 * @param args
 * @param fn
 * @returns
 */
const fseq = <T extends Seq<any>[], U extends SeqType<T>[]>(
	args: [...T],
	fn: (args: [...U]) => string
) => {
	const l = args.length;
	switch (args.length) {
		case 0:
			throw Error("Too few args");
		case 1:
			{
				const seq1 = args[0];
				fn(seq1.first());
			}
			break;
		case 2:
			{
				const seq1 = args[0];
				const seq2 = args[1];
				//fn([seq1.first(), seq2.first()]);
			}
			break;
		default:
			throw Error("Too many args");
	}

	return "string";
};

const f1 = <T extends any[]>(
	args: [...T],
	fn: (args: [...T]) => [...T]
) => {
	return fn(args);
};

{
	const ret = f1(["string", 32, true], ([a, b, c]) => {
		return [a, b, c];
	});

	log(ret);
}

type T1 = SeqType<NumSeq>;

const betaTestSeqTypeFunctionThroughput = () => {
	const f2 = <T extends Seq<any>>(
		seq: T,
		fn: (seq: SeqType<T>) => SeqType<T>
	) => {
		return fn(seq.firstOrThrow());
	};

	{
		const seq2 = NumSeq.count(10);
		const r2 = f2(seq2, v => {
			return v + 1;
		});

		div();
		log(`r2: ${r2}`);
		div();
	}
};

const zip = <T extends Seq<any>, U extends Seq<any>, TOut>(
	seqA: T,
	seqB: U,
	fn: (a: SeqType<T>, b: SeqType<U>) => TOut
): TOut[] => {
	const itA = seqA.gen();
	const itB = seqB.gen();

	const arr: TOut[] = [];

	while (true) {
		const aRes = itA.next();
		const bRes = itB.next();

		if (aRes.done === true) {
			break;
		}
		if (bRes.done === true) {
			break;
		}

		arr.push(fn(aRes.value, bRes.value));
	}
	return arr;
};

/**
 * Test custom zip function that zips two seqs
 */
export const testCustomZipFunction = () => {
	{
		logh("Test custom zip function that zips two seqs");

		const sqA = NumSeq.count(10);
		const sqB = sqA.map(x => x.toString());
		const arr1 = zip(sqA, sqB, (a, b) => {
			return { a, b };
		});

		sqA.foreach(x => log(x));
		div();
		sqB.foreach(x => log(x));
		div();
		log(arr1);
	}
};

/**
 * Test: new ZipSeq -> zip two Seqs
 */
export const testNewZipSeq = () => {
	{
		const sqA = NumSeq.count(10);
		const sqB = sqA.map(x => x.toString());
		const sqC = new ZipSeq(sqA, sqB, (a, b) => {
			return { a, b };
		});

		logh("Test: new ZipSeq -> zip two Seqs");
		sqA.foreach(x => log(x));
		div();
		sqB.foreach(x => log(x));
		div();
		sqC.foreach(x => log(x));
	}
};

/**
 * Test Seq.zip -> ZipSeq: zip two Seqs
 */
export const testSeqZipFunctionToZipSeq = () => {
	{
		const sqA = NumSeq.count(10);
		const sqB = sqA.map(x => x.toString());
		const sqC = sqA.zip(sqB, (a, b) => {
			return { a, b };
		});

		logh("Test: Seq<T>.zip -> ZipSeq: zip two Seqs");
		sqA.foreach(x => log(x));
		div();
		sqB.foreach(x => log(x));
		div();
		sqC.foreach(x => log(x));
	}
};

/**
 * Test: Seq.zip chained
 *
 * A new line
 */
export const testSeqZipChained = () => {
	const count = 10;
	const countSeq = NumSeq.count(count);
	const triangularSeq = MathSumSeq.from(x => x).take(count);
	const factorialSeq = MathProdSeq.from(x => x).take(count);
	const squareSeq = countSeq.map(x => x ** 2);
	const allSeq = countSeq
		.zip(triangularSeq, (count, triangular) => {
			return { count, triangular };
		})
		.zip(factorialSeq, ({ count, triangular }, factorial) => {
			return { count, triangular, factorial };
		})
		.zip(squareSeq, ({ count, triangular, factorial }, square) => {
			return { count, triangular, factorial, square };
		});
	logh("Test: Seq<T>.zip chained");
	allSeq.foreach(x => log(x));
};
