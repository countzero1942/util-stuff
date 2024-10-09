import { div, logh } from "@/utils/log";
import { isEven, isOdd } from "@/utils/math";
import {
	NumSeq,
	ObjKeyValueSeq,
	ObjValueSeq,
	Seq,
} from "@/utils/seq";
import { getFullType, hasClassName } from "@/utils/types";
import { count, log } from "console";

const logZipSeqs = (...seqs: Seq<any>[]) => {
	const length = seqs.length;
	if (length < 3) {
		return;
	}
	const last = length - 1;
	const labels: string[] = [];

	for (let i = 0; i < length; i++) {
		const seq = seqs[i] as Seq<any>;
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

/**
 *
 * @param seqs All seqs used + zipSeq last
 */
const logKeyValueZipSeqs = (seqs: Object) => {
	const ss = ObjKeyValueSeq.fromHasClass<Seq<any>>(seqs, "Seq");
	const arr = ss.toArray();
	if (arr.length < 3) {
		throw Error(
			"Three Seqs expected: 2 Seqs and 1 ZipSeq at the end."
		);
	}

	const labels: string[] = [];

	const last = arr.length - 1;
	for (let i = 0; i < arr.length; i++) {
		const { key, value } = arr[i] as ArrayElement<typeof arr>;

		switch (true) {
			case i === last:
				logh(`${key} of ${labels.join(", ")}:`);
				log(value.toArray());
				break;

			default:
				labels.push(key);
				logh(`${key}:`);
				log(value.toArray());
				break;
		}
	}
};

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

const getSeqs = (count: number) => {
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

const getPartialSeqs = (
	length: number,
	count: number
): ReturnType<typeof getSeqs> => {
	const seqs = getSeqs(count);

	const ss = ObjKeyValueSeq.fromHasClass<Seq<any>>(seqs, "Seq");

	const obj = Object.create(null);

	ss.take(length).foreach(kv => {
		// @ts-ignore
		obj[kv.key] = kv.value;
		return;
	});

	// Object.assign(obj, ss.take(3));

	log(obj);
	div();
	div();

	return obj as ReturnType<typeof getSeqs>;
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip2Seq = (count: number) => {
	const seqs = getSeqs(count);
	const { countSeq, toStrSeq } = seqs;

	const zipSeq = countSeq
		.zip([toStrSeq], (count, toStr) => {
			return { count, toStr };
		})
		.filter(x => x.count % 2 === 0);

	logKeyValueZipSeqs({ countSeq, toStrSeq, zipSeq });
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip3Seq = (count: number) => {
	const seqs = getPartialSeqs(3, count);
	const { countSeq, toStrSeq, sevensSeq } = seqs;
	log(seqs);
	log(countSeq);
	log(toStrSeq);
	log(sevensSeq);
	const zipSeq = countSeq
		.zip([toStrSeq, sevensSeq], (count, toStr, sevens) => {
			return { count, toStr, sevens };
		})
		.filter(x => x.count % 2 === 0);

	logKeyValueZipSeqs({ ...seqs, zipSeq });
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip7Seq = (count: number) => {
	const seqs = getSeqs(count);
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
	} = seqs;
	const zipSeq = countSeq
		.zip(
			[toStrSeq, sevensSeq, elevensSeq, squaresSeq],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip(
			[cubesSeq, trianglesSeq],
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

	logKeyValueZipSeqs({
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		zipSeq,
	});
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip7bSeq = (count: number) => {
	const seqs = getSeqs(count);
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
	} = seqs;
	const zipSeq = countSeq
		.zip(
			[toStrSeq, sevensSeq, elevensSeq, squaresSeq],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip([cubesSeq, trianglesSeq], (a, cube, triangle) => {
			return {
				...a,
				cube,
				triangle,
			};
		})
		.filter(x => x.count % 2 === 0);

	logKeyValueZipSeqs({
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		zipSeq,
	});
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip8Seq = (count: number) => {
	const seqs = getSeqs(count);
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
	} = seqs;
	getSeqs(count);
	const zipSeq = countSeq
		.zip(
			[toStrSeq, sevensSeq, elevensSeq, squaresSeq],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip(
			[cubesSeq, trianglesSeq, fibonacciSeq],
			(a, cube, triangle, fib) => {
				return { ...a, cube, triangle, ...fib };
			}
		)
		.filter(x => isEven(x.count));

	logKeyValueZipSeqs({
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		zipSeq,
	});
};

export const logZip8bSeq = (count: number) => {
	const seqs = getSeqs(count);
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
	} = seqs;
	const zipSeq = countSeq
		.zip(
			[toStrSeq, sevensSeq, elevensSeq, squaresSeq],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip(
			[cubesSeq, trianglesSeq, fibonacciSeq],
			(a, cube, triangle, fib) => {
				const { fibonacci } = fib;
				return { ...a, cube, triangle, fibonacci };
			}
		)
		.filter(x => isOdd(x.count));

	logKeyValueZipSeqs({
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		zipSeq,
	});
};

export const logObject = (obj: Object) => {
	for (const [key, value] of Object.entries(obj)) {
		const { type, className: name } = getFullType(value);
		const hasClass = hasClassName(value, "Seq");
		div();

		log(
			`key: ${key}, type: ${type}, name: ${name}, hasClass "Seq": ${hasClass}`
		);

		console.log(value);
	}
};

export const logZip9Seq = (count: number) => {
	const seqs = getSeqs(count);
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		factorialSeq,
	} = seqs;
	const zipSeq = countSeq
		.zip(
			[toStrSeq, sevensSeq, elevensSeq, squaresSeq],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip(
			[cubesSeq, trianglesSeq, fibonacciSeq, factorialSeq],
			(a, cube, triangle, fib, factorial) => {
				return { ...a, cube, triangle, ...fib, factorial };
			}
		);

	logKeyValueZipSeqs({ ...seqs, zipSeq });
};

export const logZip9bSeq = (count: number) => {
	const seqs = getSeqs(count);
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		factorialSeq,
	} = seqs;
	const zipSeq = countSeq
		.zip(
			[toStrSeq, sevensSeq, elevensSeq, squaresSeq],
			(count, toStr, sevens, elevens, square) => {
				return { count, toStr, sevens, elevens, square };
			}
		)
		.zip(
			[cubesSeq, trianglesSeq, fibonacciSeq, factorialSeq],
			(a, cube, triangle, fib, factorial) => {
				return { ...a, cube, triangle, ...fib, factorial };
			}
		);

	const ss = ObjValueSeq.fromHasClass<Seq<any>>(seqs, "Seq");

	const arr = ss.toArray();

	logZipSeqs(...arr);
};

export const logObjValueSeqZip3Seq = (count: number) => {
	const seqs = getSeqs(count);
	const { countSeq, toStrSeq, sevensSeq } = seqs;
	const zipSeq = countSeq.zip(
		[toStrSeq, sevensSeq],
		(count, toStr, sevens) => {
			return { count, toStr, sevens };
		}
	);

	const myobj = {
		a: 43,
		countSeq,
		b: "a string",
		c: {
			x: false,
			y: 6.28,
		},
		toStrSeq,
		d: RangeError("Huha"),
		sevensSeq,
		zipSeq,
	};

	const arr = ObjValueSeq.fromHasClass<Seq<any>>(
		myobj,
		"Seq"
	).toArray();

	logZipSeqs(...arr);
};

export const logObjKeyValueSeqZip3Seq = (count: number) => {
	const seqs = getSeqs(count);
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		factorialSeq,
	} = seqs;
	const seqZip = countSeq.zip(
		[toStrSeq, sevensSeq],
		(count, toStr, sevens) => {
			return { count, toStr, sevens };
		}
	);

	const myobj = {
		a: 43,
		countSeq,
		b: "a string",
		c: {
			x: false,
			y: 6.28,
		},
		toStrSeq,
		d: RangeError("Huha"),
		sevensSeq,
		seqZip,
	};

	logKeyValueZipSeqs(myobj);
};
