import { NumSeq } from "@/utils/seq";
import { log } from "console";

export const reduceTriangular = (n: number) => {
	const triangular = NumSeq.count(n).reduce(
		0,
		(acc, current) => acc + current
	);
	return triangular;
};

const reduceFib = (n: number) => {
	const fib = NumSeq.count(n).accumulate(
		{ back1: 1, fibonacci: 0 },
		({ back1: back2, fibonacci: back1 }) => {
			return { back1: back1, fibonacci: back2 + back1 };
		}
	);
	return fib;
};

export const logReduceTriangular = (n: number) => {
	const seq1 = NumSeq.count(n);
	const seqTri = seq1.map(reduceTriangular);
	const seqFinal = seq1.zip([seqTri], (count, triangular) => {
		return { count, triangular };
	});
	log(seqFinal.toArray());
};

export const logReduceFib = (n: number) => {
	const seq1 = NumSeq.count(n);
	const seqFib = seq1.map(reduceFib);

	const seqFinal = seq1.zip([seqFib], (count, fibonacci) => {
		return { count, ...fibonacci };
	});
	log(seqFinal.toArray());
};

export const logFibSeq = (n: number) => {
	const seq1 = NumSeq.from(0, n);
	const seqFib = seq1.accSeq(
		{ count: 0, prev: 1, current: 0 },
		({ count, prev, current }) => {
			return {
				count: count + 1,
				prev: current,
				current: current + prev,
			};
		}
	);
	log(seqFib.toArray());
};

export const logFibTriFac = (n: number) => {
	const seq = NumSeq.count(n).accSeq(
		{
			count: 1,
			prevFib: 0,
			fibonacci: 1,
			triangle: 1,
			factorial: 1,
		},
		({ count, prevFib, fibonacci, triangle, factorial }) => {
			const next = count + 1;
			return {
				count: next,
				prevFib: fibonacci,
				fibonacci: prevFib + fibonacci,
				triangle: triangle + next,
				factorial: factorial * next,
			};
		}
	);
	log(seq.toArray());
};

export const logFibTriSquare = (n: number) => {
	const seq = NumSeq.count(n).accSeq(
		{ count: 1, prevFib: 0, fibonacci: 1, triangle: 1, square: 1 },
		({ count, prevFib, fibonacci, triangle }) => {
			const next = count + 1;
			return {
				count: next,
				prevFib: fibonacci,
				fibonacci: prevFib + fibonacci,
				triangle: triangle + next,
				square: next ** 2,
			};
		}
	);
	log(seq.toArray());
};
