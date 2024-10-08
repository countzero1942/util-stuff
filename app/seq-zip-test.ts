import { div } from "@/utils/log";
import { isEven, isOdd } from "@/utils/math";
import { NumSeq, Seq } from "@/utils/seq";
import { count, log } from "console";
import { ReadonlyTuple } from "type-fest";

const reduceTriangular = (n: number) => {
	const triangular = NumSeq.count(n).reduce(
		0,
		(acc, current) => acc + current
	);
	return triangular;
};

const reduceFib = (n: number) => {
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

const logZipSeqs = (...seqs: Seq<any>[]) => {
	const length = seqs.length;
	if (length < 3) {
		return;
	}
	const last = length - 1;
	const labels: string[] = [];

	for (let i = 0; i < length; i++) {
		const seq = seqs[i];
		if (seq === undefined) throw "Never";
		const n = i + 1;
		switch (true) {
			case i < last:
				const label = `seq${n}`;
				div();
				log(label);
				log(seq.toArray());
				labels.push(label);
				break;
			default:
				const title = `ZipSeq of ${labels.join(", ")}:`;
				div();
				log(title);
				log(seq.toArray());
				break;
		}
	}
};

const getSeqs = (count: number): ReadonlyTuple<Seq<any>, 9> => {
	const seq1 = NumSeq.count(count);
	const seq2 = seq1.map(x => x.toString());
	const seq3 = seq1.map(x => 7 * x);
	const seq4 = seq1.map(x => 11 * x);
	const seq5 = seq1.map(x => x ** 2);
	const seq6 = seq1.map(x => x ** 3);
	const seq7 = seq1.accum(0, (acc, n) => acc + n);
	const seq8 = seq1.accum(
		{ prevFib: 1, fibonacci: 0 },
		({ prevFib, fibonacci }) => {
			return {
				prevFib: fibonacci,
				fibonacci: prevFib + fibonacci,
			};
		}
	);
	const seq9 = seq1.accum(1, (acc, n) => acc * n);

	return [seq1, seq2, seq3, seq4, seq5, seq6, seq7, seq8, seq9];
};

const getSeqs2 = (count: number) => {
	const seq1 = NumSeq.count(count);
	const seq2 = seq1.map(x => x.toString());
	const seq3 = seq1.map(x => 7 * x);
	const seq4 = seq1.map(x => 11 * x);
	const seq5 = seq1.map(x => x ** 2);
	const seq6 = seq1.map(x => x ** 3);
	const seq7 = seq1.accum(0, (acc, n) => acc + n);
	const seq8 = seq1.accum(
		{ prevFib: 1, fibonacci: 0 },
		({ prevFib, fibonacci }) => {
			return {
				prevFib: fibonacci,
				fibonacci: prevFib + fibonacci,
			};
		}
	);
	const seq9 = seq1.accum(1, (acc, n) => acc * n);

	return [seq1, seq2, seq3, seq4, seq5, seq6, seq7, seq8, seq9];
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip2Seq = (count: number) => {
	const [seq1, seq2] = getSeqs(count);

	const seqZip = seq1
		.zip([seq2], (count, toStr) => {
			return { count, toStr };
		})
		.filter(x => x.count % 2 === 0);

	logZipSeqs(seq1, seq2, seqZip);
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip3Seq = (count: number) => {
	const [seq1, seq2, seq3] = getSeqs(count);
	const seqZip = seq1
		.zip([seq2, seq3], (count, toStr, sevens) => {
			return { count, toStr, sevens };
		})
		.filter(x => x.count % 2 === 0);

	logZipSeqs(seq1, seq2, seq3, seqZip);
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip7Seq = (count: number) => {
	const [seq1, seq2, seq3, seq4, seq5, seq6, seq7] = getSeqs(count);
	const seqZip = seq1
		.zip(
			[seq2, seq3, seq4, seq5],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip(
			[seq6, seq7],
			(
				{ count, toStr, sevens, elevens, square },
				cube,
				triangle
			) => {
				return {
					count,
					toStr,
					sevens,
					elevens,
					square,
					cube,
					triangle,
				};
			}
		)
		.filter(x => x.count % 2 === 0);

	logZipSeqs(seq1, seq2, seq3, seq4, seq5, seq6, seq7, seqZip);
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip7bSeq = (count: number) => {
	const [seq1, seq2, seq3, seq4, seq5, seq6, seq7] = getSeqs(count);
	const seqZip = seq1
		.zip(
			[seq2, seq3, seq4, seq5],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip([seq6, seq7], (a, cube, triangle) => {
			return {
				...a,
				cube,
				triangle,
			};
		})
		.filter(x => x.count % 2 === 0);

	logZipSeqs(seq1, seq2, seq3, seq4, seq5, seq6, seq7, seqZip);
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip8Seq = (count: number) => {
	const [seq1, seq2, seq3, seq4, seq5, seq6, seq7, seq8] =
		getSeqs(count);
	const seqZip = seq1
		.zip(
			[seq2, seq3, seq4, seq5],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip([seq6, seq7, seq8], (a, cube, triangle, fib) => {
			return { ...a, cube, triangle, ...fib };
		})
		.filter(x => isEven(x.count));

	logZipSeqs(seq1, seq2, seq3, seq4, seq5, seq6, seq7, seq8, seqZip);
};

export const logZip8bSeq = (count: number) => {
	const [seq1, seq2, seq3, seq4, seq5, seq6, seq7, seq8] =
		getSeqs(count);
	const seqZip = seq1
		.zip(
			[seq2, seq3, seq4, seq5],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip([seq6, seq7, seq8], (a, cube, triangle, fib) => {
			const { fibonacci } = fib;
			return { ...a, cube, triangle, fibonacci };
		})
		.filter(x => isOdd(x.count));

	logZipSeqs(seq1, seq2, seq3, seq4, seq5, seq6, seq7, seq8, seqZip);
};

export const logZip9Seq = (count: number) => {
	const seqs = getSeqs(count);
	const [seq1, seq2, seq3, seq4, seq5, seq6, seq7, seq8, seq9] =
		seqs;
	const seqZip = seq1
		.zip(
			[seq2, seq3, seq4, seq5],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip(
			[seq6, seq7, seq8, seq9],
			(a, cube, triangle, fib, factorial) => {
				return { ...a, cube, triangle, ...fib, factorial };
			}
		);

	// logZipSeqs(
	// 	seq1,
	// 	seq2,
	// 	seq3,
	// 	seq4,
	// 	seq5,
	// 	seq6,
	// 	seq7,
	// 	seq8,
	// 	seq9,
	// 	seqZip
	// );

	logZipSeqs(...seqs, seqZip);
};
