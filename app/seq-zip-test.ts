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
 * The second zip is not destructured. All parameters are passed into the second zip.
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

// count, toStr, sevens, elevens, square, cube, triangle, fib

/**
 * Logs ZipSeq of countSeq, squaresSeq, cubesSeq and trianglesSeq.
 *
 * The logged ZipSeq is filtered to only include even numbers.
 *
 * The zipping process is broken up into two stages.
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
 * Then, this object is zipped with: cubesSeq and trianglesSeq.
 *
 * The second zip is destructured as 'a' -> '...a'
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

// count, toStr, sevens, elevens, square, cube, triangle, fib

/**
 * Logs ZipSeq of countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
 *
 * The logged ZipSeq is filtered to only include even numbers.
 *
 * The zipping process is broken up into two stages.
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
 * Then, this object is zipped with: cubesSeq, trianglesSeq and fibonacciSeq.
 *
 * The second zip is destructured as 'a' -> '...a'
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
 * Logs ZipSeq of: countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
 *
 * The logged ZipSeq is filtered to only include odd numbers.
 *
 * The zipping process is broken up into two stages.
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
 * Then, this object is zipped with: cubesSeq, trianglesSeq and fibonacciSeq.
 *
 * The second zip is destructured as 'a' -> '...a'
 *
 * The fibonacci value is destructured to eliminate 'prevFib' in final result.
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
 * Logs ZipSeq of: countSeq, squaresSeq, cubesSeq, trianglesSeq, fibonacciSeq and factorialSeq.
 *
 * The logged ZipSeq is filtered to only include odd numbers.
 *
 * The zipping process is broken up into two stages.
 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
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
 * The logged ZipSeq is filtered to only include odd numbers.
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
			 * 
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
			 * Logs ZipSeq of: countSeq, squaresSeq and cubesSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, square and cube.
			 * 
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
			 * Logs ZipSeq of countSeq, toStrSeq, sevensSeq, elevensSeq, squaresSeq, cubesSeq and trianglesSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, toStr, sevens, elevens, square, cube and triangle.
			 * 
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
			 * Logs ZipSeq of countSeq, toStrSeq, sevensSeq, elevensSeq, squaresSeq, cubesSeq and trianglesSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, toStr, sevens, elevens, square, cube and triangle.
			 * 
			 * The logged ZipSeq is filtered to only include odd numbers.
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
			 * Logs ZipSeq of countSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, square, cube, triangle and fibonacci.
			 * 
			 * The logged ZipSeq is filtered to only include even numbers.
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
			 * The logged ZipSeq is filtered to only include odd numbers.
			 *
			 * The zipping process is broken up into two stages:
			 * 
			 * First, countSeq is zipped with: toStrSeq, sevensSeq, elevensSeq and squaresSeq.
			 * 
			 * Then, this object is zipped with: cubesSeq, trianglesSeq and fibonacciSeq.
			 *
			 * The second zip is destructured as 'a' -> '...a'
			 *
			 * The fibonacci value is destructured to eliminate 'prevFib' in final result.
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
			 * Logs ZipSeq of countSeq, toStrSeq, sevensSeq, elevensSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, toStr, sevens, elevens, square, cube, triangle and fibonacci.
			 * 
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
			 * Logs ZipSeq of countSeq, toStrSeq, sevensSeq, elevensSeq, squaresSeq, cubesSeq, trianglesSeq and fibonacciSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, toStr, sevens, elevens, square, cube, triangle and fibonacci.
			 * 
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
			 * Logs ZipSeq of countSeq, sevensSeq and elevensSeq.
			 *
			 * The logged ZipSeq contains objects with properties: count, sevens and elevens.
			 * 
			 * The logged ZipSeq is filtered to only include even numbers.
			 *
			 * @param {number} count
			 */
		`,
	},
};

// export const inputInt2 = (
// 	min: number,
// 	max: number,
// 	defaultNumber?: number
// ): number | "Invalid" | "Out of Range" | "Exit" => {
// 	const getMsg = () => {
// 		switch (true) {
// 			case defaultNumber === undefined:
// 				return `   (Leave blank to exit): `;

// 			default:
// 				return `   (default: ${defaultNumber}): `;
// 		}
// 	};

// 	const rl = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout,
// 	});
// 	log(`Enter an integer number between ${min} and ${max}`);

// 	let returnValue: number | "Invalid" | "Out of Range" | "Exit" =
// 		"Invalid";
// 	rl.question("enter number: ", (answer: string) => {
// 		rl.close();
// 		const num = parseInt(answer);
// 		switch (true) {
// 			case answer === "":
// 				returnValue = defaultNumber ?? "Exit";
// 				break;
// 			case isNaN(num):
// 				returnValue = "Invalid";
// 				break;
// 			case num < min || num > max:
// 				returnValue = "Out of Range";
// 				break;
// 			default:
// 				returnValue = num;
// 				break;
// 		}
// 	});
// 	return returnValue;
// };

// const inputPressAnyKey = (fn: (answer: string) => void) => {
// 	const rl = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout,
// 	});

// 	rl.question(`   (Press enter to exit): `, answer => {
// 		fn(answer);

// 		rl.close();
// 	});
// };

export const inputInt = (
	min: number,
	max: number,
	fn: (result: number | "Invalid" | "Out of Range" | "Exit") => void
) => {
	log(`Enter an integer number between ${min} and ${max}`);

	let result: number | "Invalid" | "Out of Range" | "Exit" = "Exit";

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.question(`   (Press enter to exit): `, answer => {
		const num = parseInt(answer);
		switch (true) {
			case answer === "":
				result = "Exit";
				break;
			case isNaN(num):
				result = "Invalid";
				break;
			case num < min || num > max:
				result = "Out of Range";
				break;
			default:
				result = num;
				break;
		}

		fn(result);

		rl.close();
	});

	return result;
};

export const selectAndRun = (count: number) => {
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
		logh(`Select a function: 1 - ${max}`);
		functions.foreach(({ n, name, description }) => {
			logh(`${n}: ${name}`);
			log(description);
			log();
		});
	};

	logChoices();
	logh(`Select a function: 1 - ${max}`);

	inputInt(1, max, res => {
		switch (res) {
			case "Invalid":
				log("Invalid input.");
				break;
			case "Out of Range":
				log("Out of range.");
				break;
			case "Exit":
				log("Exiting.");
				return;
			default:
				const num = res;
				const selection = functions
					.filter(x => x.n === num)
					.first();
				if (!selection) throw "Never";
				const { fn, name } = selection;
				log(`Running function '${name}'...`);
				log();
				div();
				fn(count);
		}
	});

	log();
	// inputPressAnyKey(() => {
	// 	log();
	// 	log("Exiting.");
	// 	log();
	// });
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
