import { getSeqs, logKeyValueZipSeqs } from "@/app/seq-zip-helper";
import { div, logh, logln } from "@/utils/log";
import { isEven, isOdd } from "@/utils/math";
import {
	chooseDefaultNumberPrompt,
	chooseNumberPrompt,
	pressEnterToContinue,
} from "@/utils/prompts";
import {
	AnySeq,
	ArraySeq,
	NumSeq,
	RecordSeq,
	RecordValueSeq,
	Seq,
} from "@/utils/seq";
import {
	cleanJSDocDescription,
	removeEmptyLinesFromStartAndEnd,
} from "@/utils/string";
import { getFullType, hasClassName } from "@/utils/types";
import { count, log } from "console";
import readline from "node:readline";

/**
 * Logs ZipSeq of countSeq and toStrSeq.
 *
 * The logged ZipSeq contains objects with properties: count and toStr.
 * The logged ZipSeq is filtered to only include even numbers.
 *
 * @param {number} count
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

/**
 * Logs ZipSeq of: countSeq, squaresSeq and cubesSeq.
 *
 * The logged ZipSeq contains objects with properties: count, square and cube.
 * The logged ZipSeq is filtered to only include even numbers.
 *
 * @param {number} count
 */
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

	const seqs: Record<string, AnySeq> = {
		countSeq,
		squaresSeq,
		cubesSeq,
		zipSeq,
	};

	logKeyValueZipSeqs(seqs);
};

/**
 * Logs ZipSeq of countSeq, squaresSeq, cubesSeq and trianglesSeq.
 *
 * The logged ZipSeq is filtered to only include even numbers.
 *
 * The zipping process is broken up into two stages.
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
 * Then, this object is zipped with: cubesSeq and trianglesSeq.
 *
 * The second zip is not destructured. All parameters are passed directly
 * from the first zip into the second zip.
 *
 * @param {number} count
 */
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

/**
 * Logs ZipSeq of countSeq, squaresSeq, cubesSeq and trianglesSeq.
 *
 * The logged ZipSeq is filtered to only include even numbers.
 *
 * The zipping process is broken up into two stages:
 *
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
 *
 * Then, this object is zipped with: cubesSeq and trianglesSeq.
 *
 * The first zip is destructured into the second zip as 'a' -> '...a'
 *
 * @param {number} count
 */
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

/**
 * Logs ZipSeq of countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
 *
 * The logged ZipSeq is filtered to only include odd numbers.
 *
 * The zipping process is broken up into two stages:
 *
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
 *
 * Then, this object is zipped with: cubesSeq, trianglesSeq and fibonacciSeq.
 *
 * The first zip is destructured into the second zip as 'a' -> '...a'
 *
 * @param {number} count
 */
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

/**
 * Logs ZipSeq of: countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
 *
 * The logged ZipSeq is filtered to only include even numbers.
 *
 * The zipping process is broken up into two stages:
 *
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
 *
 * Then, this object is zipped with: cubesSeq, trianglesSeq and fibonacciSeq.
 *
 * The first zip is destructured into the second zip as 'a' -> '...a'
 *
 * The fibonacci value is destructured to eliminate 'prevFib' in final result:
 *
 * 'const { fibonacci } = fib'
 *
 * @param {number} count
 */
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

/**
 * Logs ZipSeq of: countSeq, squaresSeq, cubesSeq, trianglesSeq, fibonacciSeq and factorialSeq.
 *
 * The logged ZipSeq is filtered to only include odd numbers.
 *
 * The zipping process is broken up into two stages:
 *
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
 *
 * Then, this object is zipped with: cubesSeq, trianglesSeq, fibonacciSeq and factorialSeq.
 *
 * @param {number} count
 */
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

/**
 * Logs ZipSeq of countSeq, squaresSeq, cubesSeq, trianglesSeq, fibonacciSeq and factorialSeq.
 *
 * The logged ZipSeq is filtered to only include even numbers.
 *
 * The zipping process is done in a single step.
 *
 * @param {number} count
 */
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

	const zipSeq = countSeq
		.zip(
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
		factorialSeq,
		zipSeq,
	});
};

/**
 * Logs an object with various properties, including sequences.
 *
 * The purpose is to verify that the logKeyValueSeqs function works correctly
 * by ignorning non-Seq parameters in the object passed to it.
 *
 * The logged object has the following properties:
 * - a: a number
 * - countSeq: a Seq of numbers from 1 to count
 * - b: a string
 * - c: an object with two properties: x (a boolean) and y (a number)
 * - sevensSeq: a Seq of multiples of 7
 * - d: a RangeError object
 * - elevensSeq: a Seq of multiples of 11
 * - seqZip: a zipped sequence of countSeq, sevensSeq and elevensSeq
 *
 * @param {number} count
 */
export const logObjKeyValueSeqZip3Seq = (count: number) => {
	const seqs = getSeqs(count);
	const { countSeq, sevensSeq, elevensSeq } = seqs;
	const seqZip = countSeq.zip(
		[sevensSeq, elevensSeq],
		(count, sevens, elevens) => {
			return { count, sevens, elevens };
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
		sevensSeq,
		d: RangeError("Huha"),
		elevensSeq,
		seqZip,
	};

	logh("Object with various properties, including Seqs:");
	log(myobj);

	logKeyValueZipSeqs(myobj as unknown as Record<string, AnySeq>);
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
		logZip9SeqDirect,
		logObjKeyValueSeqZip3Seq,
	];
};

/**
 * An Record containing: a function reference, its name
 * and a description of the function that includes its
 * JSDoc. Generated by Codeium.
 */
export const logFunctions: Record<
	string,
	{ fn: FunctionType; name: string; description: string }
> = {
	logZip2Seq: {
		fn: logZip2Seq,
		name: "logZip2Seq",
		description: `
			/**
			 * Logs ZipSeq of countSeq and toStrSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count and toStr.
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * @param {number} count
			 */
		`,
	},
	logZip3Seq: {
		fn: logZip3Seq,
		name: "logZip3Seq",
		description: `
			/**
			 * Logs ZipSeq of countSeq, squaresSeq and cubesSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, square and cube.
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * @param {number} count
			 */
		`,
	},
	logZip7Seq: {
		fn: logZip7Seq,
		name: "logZip7Seq",
		description: `
			/**
			 * Logs ZipSeq of: countSeq, toStrSeq, sevensSeq, elevensSeq, squaresSeq, cubesSeq and trianglesSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, toStr, sevens, elevens, square, cube and triangle.
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * @param {number} count
			 */
		`,
	},
	logZip7bSeq: {
		fn: logZip7bSeq,
		name: "logZip7bSeq",
		description: `
			/**
			 * Logs ZipSeq of: countSeq, toStrSeq, sevensSeq, elevensSeq, squaresSeq, cubesSeq and trianglesSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, toStr, sevens, elevens, square, cube and triangle.
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * The zipping process is broken up into two stages:
			 *
			 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq, squaresSeq, cubesSeq and trianglesSeq.
			 *
			 * Then, the object is zipped with: fibonacciSeq.
			 *
			 * The first zip is destructured into the second zip as 'a' -> '...a'
			 *
			 * The fibonacci value is destructured to eliminate 'prevFib' in final result:
			 *
			 * 'const { fibonacci } = fib'
			 *
			 * @param {number} count
			 */
		`,
	},
	logZip8Seq: {
		fn: logZip8Seq,
		name: "logZip8Seq",
		description: `
			/**
			 * Logs ZipSeq of: countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, square, cube, triangle and fibonacci.
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * The zipping process is broken up into two stages:
			 *
			 * First, countSeq is zipped with: squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
			 *
			 * Then, the object is zipped with: toStrSeq.
			 *
			 * The first zip is destructured into the second zip as 'a' -> '...a'
			 *
			 * The fibonacci value is destructured to eliminate 'prevFib' in final result:
			 *
			 * 'const { fibonacci } = fib'
			 *
			 * @param {number} count
			 */
		`,
	},
	logZip8bSeq: {
		fn: logZip8bSeq,
		name: "logZip8bSeq",
		description: `
			/**
			 * Logs ZipSeq of: countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, square, cube, triangle and fibonacci.
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * The zipping process is broken up into two stages:
			 *
			 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq, squaresSeq, cubesSeq and trianglesSeq.
			 *
			 * Then, the object is zipped with: fibonacciSeq.
			 *
			 * The first zip is destructured into the second zip as 'a' -> '...a'
			 *
			 * The fibonacci value is destructured to eliminate 'prevFib' in final result:
			 *
			 * 'const { fibonacci } = fib'
			 *
			 * @param {number} count
			 */
		`,
	},
	logZip9Seq: {
		fn: logZip9Seq,
		name: "logZip9Seq",
		description: `
			/**
			 * Logs ZipSeq of: countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq directly.
			 *
			 * The logged ZipSeq contains objects with properties: count, square, cube, triangle and fibonacci.
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * @param {number} count
			 */
		`,
	},
	logZip9SeqDirect: {
		fn: logZip9SeqDirect,
		name: "logZip9SeqDirect",
		description: `
			/**
			 * Logs ZipSeq of: countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq directly.
			 *
			 * The logged ZipSeq contains objects with properties: count, square, cube, triangle and fibonacci.
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * @param {number} count
			 */
		`,
	},
	logObjKeyValueSeqZip3Seq: {
		fn: logObjKeyValueSeqZip3Seq,
		name: "logObjKeyValueSeqZip3Seq",
		description: `
			/**
			 * Logs an object with various properties, including sequences.
			 *
			 * The purpose is to verify that the logKeyValueSeqs function works correctly
			 * by ignorning non-Seq parameters in the object passed to it.
			 *
			 * The logged object has the following properties:
			 * - a: a number
			 * - countSeq: a Seq of numbers from 1 to count
			 * - b: a string
			 * - c: an object with two properties: x (a boolean) and y (a number)
			 * - sevensSeq: a Seq of multiples of 7
			 * - d: a RangeError object
			 * - elevensSeq: a Seq of multiples of 11
			 * - seqZip: a zipped sequence of countSeq, sevensSeq and elevensSeq
			 *
			 * @param {number} count
			 */
		`,
	},
};

/**
 * Runs all examples in sequence.
 *
 * Allows user to select which example to run, and how many elements to
 * generate in the sequence.
 *
 * The user is presented with a list of functions with descriptions,
 * and is asked to select a function by number.
 *
 * After selecting a function, the user is asked to select the number of
 * elements to generate in the sequence.
 *
 * After the selected function has run, the user is given the option to exit
 * or select another function.
 *
 * @returns A Promise that resolves when the user chooses to exit
 */
export const runSeqExamples = async (): Promise<void> => {
	const functions = RecordValueSeq.fromType(
		logFunctions,
		"Object"
	).imap((i, a) => {
		let { fn, name, description } = a;
		description = cleanJSDocDescription(description, true, 60);
		return { n: i + 1, fn, name, description };
	});

	const max = functions
		.map(x => x.n)
		.reduce(0, (max, n) => Math.max(max, n));

	const logChoices = () => {
		logh(`Function Choices: 1 - ${max}`);
		functions.foreach(({ n, name, description }) => {
			logh(`${n}: ${name}`);
			log(description);
			log();
		});
	};

	while (true) {
		logh("Select Seq Count");
		const count = await chooseDefaultNumberPrompt(
			0,
			100,
			20,
			"Choose Seq count"
		);

		logChoices();
		div();
		const fnNumber = await chooseNumberPrompt(
			1,
			max,
			"Choose a function"
		);

		log();

		const fn = functions
			.filter(x => x.n === fnNumber)
			.firstOrThrow().fn;

		fn(count);

		const response = await pressEnterToContinue();
		if (response === "Exit") {
			break;
		}

		console.clear();
	}
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
