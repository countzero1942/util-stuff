import { log, logh, logln } from "@/utils/log";
import {
	MathProdSeq,
	MathSumSeq,
	NumSeq,
	Seq,
	SeqType,
	ZipSeq,
} from "@/utils/seq";

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
