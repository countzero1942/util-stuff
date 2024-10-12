import { log, logh, logln } from "@/utils/log";
import { AnySeq, NumSeq, RecordSeq } from "@/utils/seq";

/**
 *
 * @param seqs All seqs used + zipSeq last
 */
export const logKeyValueZipSeqs = (seqs: Record<string, AnySeq>) => {
	const ss = RecordSeq.fromHasClass<AnySeq>(seqs, "Seq");
	const arr = ss.toArray();
	if (arr.length < 3) {
		throw Error(
			"Three Seqs expected: 2 Seqs and 1 ZipSeq at the end."
		);
	}

	const labels: string[] = [];

	const lastSeqIndex = arr.length - 1;
	for (let i = 0; i < arr.length; i++) {
		const { key, value } = arr[i] as ArrayElement<typeof arr>;

		switch (true) {
			case i === lastSeqIndex:
				{
					logln(20);
					log(`${key} of`);
					const lastLabelIndex = labels.length - 1;
					for (let j = 0; j < labels.length; j++) {
						const label = labels[j];
						switch (true) {
							case j === lastLabelIndex:
								log(`   ${label}:`);
								break;
							default:
								log(`   ${label}`);
								break;
						}
					}
					logln(20);
					log(value.toArray());
				}
				break;

			default:
				{
					labels.push(key);
					logh(`${key}:`);
					log(value.toArray());
				}
				break;
		}
	}
};

/**
 * Calculates the nth triangular number.
 *
 * Triangular numbers are the sum of all positive integers up to n.
 * The nth triangular number is the number of dots in the triangular
 * arrangement with n dots on a side.
 *
 * @param n The nth triangular number to calculate.
 * @returns The nth triangular number.
 */
export const reduceTriangular = (n: number) => {
	const triangular = NumSeq.count(n).reduce(
		0,
		(acc, current) => acc + current
	);
	return triangular;
};

/**
 * Calculates the nth Fibonacci number.
 *
 * Fibonacci numbers are the numbers in the Fibonacci sequence, which is
 * the sequence of numbers in which each number is the sum of the two
 * preceding numbers.
 *
 * @param n The nth Fibonacci number to calculate.
 * @returns The nth Fibonacci number.
 */
export const reduceFib = (n: number) => {
	const fib = NumSeq.count(n).accum(
		{ prevFib: 1, fibonacci: 0 },
		({ prevFib, fibonacci }) => {
			return {
				prevFib: fibonacci,
				fibonacci: prevFib + fibonacci,
			};
		}
	);
	return fib;
};

/**
 * Generates a bunch of example sequences.
 *
 * @param count The number of elements in each sequence.
 * @returns An object with the following sequences:
 *  - countSeq: a sequence of numbers from 1 to count
 *  - toStrSeq: a sequence of strings from "1" to "count"
 *  - sevensSeq: a sequence of numbers from 7 to 7*count
 *  - elevensSeq: a sequence of numbers from 11 to 11*count
 *  - squaresSeq: a sequence of squares of numbers from 1 to count
 *  - cubesSeq: a sequence of cubes of numbers from 1 to count
 *  - trianglesSeq: a sequence of triangular numbers from 1 to count
 *  - fibonacciSeq: a sequence of Fibonacci numbers from 1 to count
 *  - factorialSeq: a sequence of factorials from 1 to count
 */
export const getSeqs = (count: number) => {
	const countSeq = NumSeq.count(count);
	const toStrSeq = countSeq.map(x => x.toString());
	const sevensSeq = countSeq.map(x => 7 * x);
	const elevensSeq = countSeq.map(x => 11 * x);
	const squaresSeq = countSeq.map(x => x ** 2);
	const cubesSeq = countSeq.map(x => x ** 3);
	const trianglesSeq = countSeq.accum(0, (acc, n) => acc + n);
	const fibonacciSeq = countSeq.accum(
		{ prevFib: 1, fibonacci: 0 },
		({ prevFib, fibonacci }) => {
			return {
				prevFib: fibonacci,
				fibonacci: prevFib + fibonacci,
			};
		}
	);
	const factorialSeq = countSeq.accum(1, (acc, n) => acc * n);

	return {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		factorialSeq,
	};
};
