import { getSeqs, logKeyValueZipSeqs } from "@/app/seq-zip-helper";
import { div, logh, logln } from "@/utils/log";
import { isEven, isOdd } from "@/utils/math";
import {
	AnySeq,
	ArraySeq,
	NumSeq,
	RecordSeq,
	RecordValueSeq,
	Seq,
} from "@/utils/seq";
import { getFullType, hasClassName } from "@/utils/types";
import { count, log } from "console";
import * as readline from "readline";

// count, toStr, sevens, elevens, square, cube, triangle, fib

/**
 * Logs ZipSeq of {count, toStr} where count is an even number from 1 to count.
 * @param count - upper limit of the count sequence
 */
export const logZip2Seq = (count: number) => {
	const { countSeq, toStrSeq } = getSeqs(count);

	const zipSeq = countSeq
		.zip([toStrSeq], (count, toStr) => {
			return { count, toStr };
		})
		.filter(x => x.count % 2 === 0);

	logKeyValueZipSeqs({ countSeq, toStrSeq, zipSeq });
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip3Seq = (count: number) => {
	const { countSeq, squaresSeq, cubesSeq } = getSeqs(count);
	log(countSeq);
	log(squaresSeq);
	log(cubesSeq);
	const zipSeq = countSeq
		.zip([squaresSeq, cubesSeq], (count, toStr, sevens) => {
			return { count, toStr, sevens };
		})
		.filter(x => x.count % 2 === 0);

	log("Logging this:");
	log(this);
	div();

	const seqs: Record<string, AnySeq> = {
		countSeq,
		squaresSeq,
		cubesSeq,
		zipSeq,
	};

	logKeyValueZipSeqs(seqs);
};

// count, toStr, sevens, elevens, square, cube, triangle, fib

export const logZip7Seq = (count: number) => {
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
	} = getSeqs(count);
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
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
	} = getSeqs(count);

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
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
	} = getSeqs(count);

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
	const {
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
	} = getSeqs(count);

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
		const { type, name: name } = getFullType(value);
		const hasClass = hasClassName(value, "Seq");
		div();

		log(
			`key: ${key}, type: ${type}, name: ${name}, hasClass "Seq": ${hasClass}`
		);

		console.log(value);
	}
};

export const logZip9Seq = (count: number) => {
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
	} = getSeqs(count);

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

	logKeyValueZipSeqs({
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		factorialSeq,
		zipSeq,
	});
};

export const logZip9bSeq = (count: number) => {
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
	} = getSeqs(count);
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

	logKeyValueZipSeqs({
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		factorialSeq,
		zipSeq,
	});
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

	logKeyValueZipSeqs(myobj as unknown as Record<string, AnySeq>);
};

export const logZip9SeqDirect = (count: number) => {
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
	} = getSeqs(count);

	const zipSeq = countSeq.zip(
		[
			toStrSeq,
			sevensSeq,
			elevensSeq,
			squaresSeq,
			cubesSeq,
			trianglesSeq,
			fibonacciSeq,
			factorialSeq,
		],
		(
			count,
			toStr,
			sevens,
			elevens,
			square,
			cube,
			triangle,
			fibonacci,
			factorial
		) => {
			return {
				count,
				toStr,
				sevens,
				elevens,
				square,
				cube,
				triangle,
				...fibonacci,
				factorial,
			};
		}
	);

	logKeyValueZipSeqs({
		countSeq,
		toStrSeq,
		sevensSeq,
		elevensSeq,
		squaresSeq,
		cubesSeq,
		trianglesSeq,
		fibonacciSeq,
		factorialSeq,
		zipSeq,
	});
};

type FunctionType = (count: number) => void;

export const getLogFunctions = (): FunctionType[] => {
	return [
		logZip2Seq,
		logZip3Seq,
		logZip7Seq,
		logZip7bSeq,
		logZip8Seq,
		logZip8bSeq,
		logZip9Seq,
		logZip9bSeq,
		logZip9SeqDirect,
		logObjKeyValueSeqZip3Seq,
	];
};

export const selectAndRun = (count: number) => {
	const functions = getLogFunctions();

	const max = Object.keys(functions).reduce(
		(max, key) => Math.max(max, parseInt(key)),
		0
	);

	logh("Select a function:");
	Object.entries(functions).forEach(([key, value]) => {
		log(`  ${key}: ${value.name}`);
	});

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.question(
		`Enter a number between 1 and ${max}: `,
		(answer: string) => {
			rl.close();
			const num = parseInt(answer);
			if (num >= 1 && num <= max) {
				const f = functions[num] as FunctionType;
				f(count);
			} else {
				log("Invalid input.");
			}
		}
	);
};

export const getRecord = () => {
	const logFunctions = getLogFunctions();

	const record = ArraySeq.from(logFunctions)
		.imap((i, fn) => {
			const type = getFullType(fn);
			return { key: i + 1, value: { name: type.name, fn } };
		})
		.toObject();

	return record;
};
