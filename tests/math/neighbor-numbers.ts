import { getError } from "@/utils/error";
import { div, log, logh, logln } from "@/utils/log";
import {
	areEqual,
	getRelativeEspilon,
	randomInteger,
} from "@/utils/math";
import { formatNum } from "@/utils/string";
import { merge, minCalls } from "moderndash";
import { DeepPartial } from "utility-types";

/**
 * Generates a 13 or 14 Sig Dig string for testing
 * 15 or 16 precision numbers.
 *
 * String will be in the form of: "1.234567895123"
 *
 * It will later have 2 generated digits + "e" + power
 * and coverted to a Number
 *
 * @param sigDigits 13 or 14 sigDigits for testing
 * 15 or 16 precision numbers.
 * @returns
 */
const generateRandom13Or14SigDigitNumberBaseString = (
	sigDigits: 13 | 14 = 13
) => {
	switch (sigDigits) {
		case 13:
		case 14:
			break;
	}

	const strs: string[] = [];
	const lastDigit = sigDigits - 1;
	for (let i = 0; i < sigDigits; i++) {
		const n =
			i === 0 || i === sigDigits
				? randomInteger(1, 9)
				: randomInteger(0, 9);

		strs.push(n.toString());
		if (i == 0) {
			strs.push(".");
		}
	}

	return strs.join("");
};

const retrieveAreEqualDetails = (
	a: number,
	b: number,
	expectedAreEqualOutcome: boolean
) => {
	const relEpsilon = getRelativeEspilon(a);
	const deltaAB = Math.abs(a - b);
	const ratio = expectedAreEqualOutcome
		? Math.round((deltaAB / relEpsilon) * 100)
		: Math.round((relEpsilon / deltaAB) * 100);
	const ratioMsg = expectedAreEqualOutcome
		? `   ratio of delta(a,b)/relEpisolon: ${ratio}%`
		: `   ratio of relEpisolon/delta(a,b): ${ratio}%`;
	const areEq = areEqual(a, b);
	return {
		relEps: relEpsilon,
		deltaAB,
		ratio,
		areEq,
	};
};

const logAndRetrieveAreEqualDetails = (
	a: number,
	b: number,
	expectedAreEqualOutcome: boolean,
	testNumber: number
) => {
	const { relEps, deltaAB, ratio, areEq } = retrieveAreEqualDetails(
		a,
		b,
		expectedAreEqualOutcome
	);

	log(`a: ${a}`);
	log(`b: ${b}`);
	const digitCountingStr =
		Math.floor(Math.log10(a)) === -1
			? `-----123456789012345`
			: `---1.23456789012345`;

	log(digitCountingStr);
	// const relEps = getRelativeEspilon(a);
	// const deltaAB = Math.abs(a - b);
	// const ratio = expectedIsEqual
	// 	? Math.round((deltaAB / relEps) * 100)
	// 	: Math.round((relEps / deltaAB) * 100);
	log(
		`delta(a - b) =  ${deltaAB} : <= relEps: ${deltaAB <= relEps}`
	);
	log(`relEpsilon:     ${relEps}`);
	const ratioMsg = expectedAreEqualOutcome
		? `   ratio of delta(a,b)/relEpisolon: ${ratio}%`
		: `   ratio of relEpisolon/delta(a,b): ${ratio}%`;
	log(ratioMsg);
	// const isEq = areEqual(a, b);
	logln(20);
	log(`===(${testNumber}/100) ARE EQUAL: ${areEq}`);
	div();
	return {
		a,
		b,
		expectedAreEqualOutcome,
		relEps,
		deltaAB,
		ratio,
		areEq,
	};
};

type LogLevel = "none" | "minimal" | "verbose";

const getCantUseBaseStringError = (baseNumberString: string) => {
	return `
		=======> CAN NOT USE BASE STRING: "${baseNumberString}"\n
		Any digit string starting with '0.123...' will lower"\n
		the testing number's power of 10. This will affect the test.\n
		The first digit must be a non-zero number.\n
		\n
		The number of significt digits in the string"\n
		must also be either 13 or 14, which maps to"\n
		the 15 and 16 precision test."\n	
	`;
};

/**
 *	Here we test neighbor numbers for "areEqual" of any power of 10
 *
 * The neighbors are tested in the range of a relative Number.Epsilon
 *
 * From the 'baseNumberString' parameter, all permutations
 * of the last two digits will be added on. Then all 100 neighbor
 * numbers will be tested for equality within +/- its relative epsilon.
 *
 * All 15 precision neighbor numbers will be distinct
 * and will therefore not pass the "areEqual" equality test.
 *
 * All 16 precision neighbor numbers will not be distinct
 * and will therefore yield false positives in the "areEqual"
 * equality test
 *
 * Function will throw Error on unexpected result (which
 * should never happen.)
 *
 * @param baseNumberString A 13 or 14 char decimal string:
 * e.g.: "1.234567895123".
 *
 * 13 base digits -> 15 precision; 14 base digits -> 16 precision
 *
 * This string must not begin with "0.nnn..." because this will
 * lower the testing number's power of 10, which will affect
 * the test.
 */
export const testPrec15Or16NeighborNumbersAreEqualOfAnyPowerOfTen = (
	baseNumberString: string = "1.234567895123",
	power: number = -1,
	loglevel: "none" | "minimal" | "verbose" = "verbose"
) => {
	// const s = "1.234567895123"; => 13 SigDig & 14 char length
	//            1 23456789012345678901234567890

	const validNumberString = /^[1-9]\.\d{12,13}$/;

	if (!validNumberString.test(baseNumberString)) {
		throw Error(getCantUseBaseStringError(baseNumberString));
	}

	// 14 $ length => 13 digits -> 15 precision level
	// 15 $ length => 14 digits -> 16 precision level
	// Above validation eliminates other lengths
	const getPrecisionLevel = () => {
		switch (baseNumberString.length) {
			case 14:
				return 15;
			case 15:
				return 16;
			default:
				throw "Never";
		}
	};
	const precisionLevel = getPrecisionLevel();

	const expectedAreEqualOutcome: boolean =
		precisionLevel == 15 ? false : true;

	const nums: number[] = [];

	for (let i = 0; i <= 9; i++) {
		for (let j = 0; j <= 9; j++) {
			const numstr =
				`${baseNumberString}${i.toString()}` +
				`${j.toString()}e${power}`;
			nums.push(Number(numstr));
		}
	}

	const getErrorMsg = () => {
		return (
			`Unexpected result: baseNumberString: ` +
			`${baseNumberString}`
		);
	};

	let maxratio: number = 0;
	let passedCount = 0;

	for (let i = 1; i < 100; i++) {
		const a = nums[i - 1];
		const b = nums[i];
		const testNumber = i + 1;

		if (a === undefined || b === undefined) throw "Never";

		switch (loglevel) {
			case "none":
			case "minimal":
				{
					const { ratio, areEq } = retrieveAreEqualDetails(
						a,
						b,
						expectedAreEqualOutcome
					);

					if (!Number.isNaN(ratio)) {
						maxratio = Math.max(maxratio, ratio);
					}
					if (areEq === expectedAreEqualOutcome) {
						passedCount++;
					}
				}
				break;
			case "verbose":
				{
					const { ratio, areEq } = logAndRetrieveAreEqualDetails(
						a,
						b,
						expectedAreEqualOutcome,
						testNumber
					);
					maxratio = Math.max(maxratio, ratio);
					if (areEq === expectedAreEqualOutcome) {
						passedCount++;
					}
				}
				break;
		}
	}

	// for 1 .. 100

	// REPORT //
	////////////

	switch (loglevel) {
		case "none":
			break;
		case "minimal":
		case "verbose":
			{
				logh("REPORT");
				const ratioMsg = expectedAreEqualOutcome
					? `Maximum ratio of delta(a, b)/relEpsilon (->): ${maxratio}%`
					: `Maximum ratio of relEpsilon/delta(a, b) (<-): ${maxratio}%`;
				log(ratioMsg);
				div();

				const didPassAllTests = passedCount === 99;
				const passedOrFailedMsg = didPassAllTests
					? "PASSED"
					: "==> FAILED! <==";

				log(
					`Number base: "${baseNumberString}" x 10^${power}:\n` +
						`   precision: ${precisionLevel}\n` +
						`   tests passed: (${passedCount}/99) => ` +
						`${passedOrFailedMsg}`
				);
				log(
					`All tests should match expected 'areEqual(a,b)' ` +
						`outcome: ${expectedAreEqualOutcome}`
				);
				const msg: string = expectedAreEqualOutcome
					? "All neighbor numbers with 16 digit precision:\n" +
					  "   SHOULD BE INDISTINCT AND FALSELY EQUAL"
					: "All neighbor numbers with 15 digit precision:\n" +
					  "   SHOULD BE DISTINCT AND NOT EQUAL";

				log(msg);
				div();
				log();
				div();
			}
			break;
	}

	return {
		baseNumberString,
		power,
		expectedAreEqualOutcome,
		precisionLevel,
		maxratio,
		passedCount,
	};
};

/**
 * Args for TestNeighborNumbersAreEqual
 */
type ArgsTestNeighborNumbers = {
	/**
	 * The precision level to test:
	 *
	 * `15`: all neighbor numbers are DISTINCT:
	 *  `areEqual(a,b)` -> `true`
	 *
	 * `16`: all neighbor numbers are INDISTINCT:
	 *  `areEqual(a,b)` -> `false`
	 *
	 * `random`: either `15` or `16`
	 *
	 * Default: `random`
	 */
	precisionLevel: "15" | "16" | "random";
	/**
	 * Related to Power-of-Ten to test
	 */
	power: {
		/**
		 * Power-of-ten input kind: "single" | "range" | "random-range"
		 *
		 * Default: "random-range"
		 */
		kind: "single" | "range" | "random-range";
		/**
		 * Used with 'kind' of "single"
		 *
		 * Default: -1 (Relative Epsilon = Number.Epsilon)
		 */
		single: number;
		/**
		 * Used with 'kind' of "random-range"
		 */
		range: {
			/**
			 * Min power-of-ten random range.
			 *
			 * Default: -200
			 */
			min: number;
			/**
			 * Max power-of-ten random range.
			 *
			 * Default: 200
			 */
			max: number;
		};
	};
	/**
	 * "none" | "minimal" | "verbose" | "verbose-no-throw"
	 *
	 * Default: "verbose"
	 */
	logLevel: LogLevel;
	/**
	 * Number of tests to run.
	 *
	 * Best to reduce 'logLevel' from "verbose"
	 *
	 * Default: 1
	 */
	numOfTests: number;
};

export const TestNeighborNumbersAreEqual = (
	args: DeepPartial<ArgsTestNeighborNumbers>
) => {
	const defaultTestNeighborNumbers: ArgsTestNeighborNumbers = {
		precisionLevel: "random",
		power: {
			kind: "random-range",
			single: -1,
			range: {
				min: -200,
				max: 200,
			},
		},
		logLevel: "verbose",
		numOfTests: 1,
	};

	const mergedArgs = merge(
		defaultTestNeighborNumbers,
		args
	) as ArgsTestNeighborNumbers;

	const { precisionLevel, power, logLevel, numOfTests } = mergedArgs;

	const getTestCount = () => {
		const { kind } = power;
		switch (kind) {
			case "single":
			case "random-range":
				return numOfTests;

			case "range": {
				const { min, max } = power.range;
				return max - min + 1;
			}
		}
	};

	const testCount = getTestCount();
	try {
		for (let i = 0; i < testCount; i++) {
			const getPrecision = (): 15 | 16 => {
				switch (precisionLevel) {
					case "15":
						return 15;
					case "16":
						return 16;
					case "random":
						return randomInteger(15, 16) as 15 | 16;
				}
			};

			const precision = getPrecision();

			const getBaseStringPrecisionDigits = () => {
				switch (precision) {
					case 15:
						return 13;
					case 16:
						return 14;
				}
			};

			const getNumberPowerOfTen = () => {
				const { kind } = power;
				switch (kind) {
					case "single": {
						const { single } = power;
						return single;
					}
					case "random-range": {
						const { min, max } = power.range;
						return randomInteger(min, max);
					}
					case "range": {
						const { min } = power.range;
						return min + i;
					}
				}
			};

			const baseString =
				generateRandom13Or14SigDigitNumberBaseString(
					getBaseStringPrecisionDigits()
				);

			const powerOfTen = getNumberPowerOfTen();

			div();
			log(`Batch Test (${formatNum(i + 1)}/${testCount})`);
			log(
				`   Power-of-ten: ${powerOfTen}, Precision: ${precision}`
			);
			div();

			testPrec15Or16NeighborNumbersAreEqualOfAnyPowerOfTen(
				baseString,
				powerOfTen,
				logLevel
			);
		}
	} catch (error) {
		log(getError(error));
	}
};
