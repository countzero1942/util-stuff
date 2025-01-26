import { div, log, logln } from "@/utils/log";
import {
	areEqual,
	getRelativeEspilon,
	randomInteger,
} from "@/utils/math";

/**
 * Generates a 13 or 14 Sig Dig string for testing
 * 15 or 16 precision numbers.
 *
 * String will be in the form of:
 *
 * "baseNegative10" -> "0.1234567895123"
 *
 * "anyBase" -> "1.234567895123"
 *
 * @param sigDigits 13 or 14 sigDigits for testing
 * 15 or 16 precision numbers.
 * @returns
 */
const generateRandom13Or14SigDigitNumberBaseStringOLD = (
	sigDigits: 13 | 14 = 13,
	basePower: "baseNegative10" | "anyBase" = "baseNegative10"
) => {
	switch (sigDigits) {
		case 13:
		case 14:
			break;
	}

	const strs: string[] = [];
	switch (basePower) {
		case "baseNegative10":
			{
				strs.push("0.");

				for (let i = 0; i < sigDigits; i++) {
					const n =
						i === 0 ? randomInteger(1, 9) : randomInteger(1, 9);
					strs.push(n.toString());
				}
			}
			break;
		case "anyBase":
			{
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
			}
			break;
	}

	return strs.join("");
};

/**
 *	Here we test numbers of a power of 10^-1
 *
 * The neighbors are tested in the range of Number.Epsilon
 *
 * From the 'baseNumberString' parameter, all permutations
 * of the last two digits will be added on. All 100 neighbor
 * numbers will be tested for equality within +/- epsilon.
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
 * @param baseNumberString A 13 or 14 digit decimal base string: e.g.: "0.1234567895123".
 * (The leading '0' is not counted: it is not a significant digit.)
 *
 * 13 base digits -> 15 precision; 14 base digits -> 16 precision
 *
 * The string must begin with "0.nnnnnnnnnnnnn" so it is a power
 * of 10^-1.
 *
 * This string must not begin with "0.0..." because this will
 * lower the testing number's power of 10 and affect test results.
 */
const testPrec15Or16NeighborNumbersAgainstAreEqual = (
	baseNumberString: string = "0.1234567895123",
	loglevel: "none" | "minimal" | "verbose" = "verbose"
) => {
	// const s = "0.1234567895123"; => 13 SigDig & 15 char length
	//           123456789012345678901234567890

	const usePrecisionRound = true;

	const validNumberString = /^0\.\d{13,14}$/;

	if (!validNumberString.test(baseNumberString)) {
		log(`=======> CAN NOT USE BASE STRING: "${baseNumberString}"`);
		log(
			"Any digit string starting with '0.0...' will lower testing range."
		);
		log("Test numbers must be a power of 10^-1");
		log();
		log("The number of significt digits in the string");
		log("must also be either 13 or 14, which maps to");
		log("the 15 and 16 precision test.");
		return;
	}

	// 15 $ length => 13 digits -> 15 precision level
	// 16 $ length => 14 digits -> 16 precision level
	// Above validation eliminates other lengths
	const getPrecisionTestLevel = () => {
		switch (baseNumberString.length) {
			case 15:
				return 15;
			case 16:
				return 16;
			default:
				throw "Never";
		}
	};

	const expectedIsEqual: boolean =
		getPrecisionTestLevel() == 15 ? false : true;

	const nums: number[] = [];

	for (let i = 0; i <= 9; i++) {
		for (let j = 0; j <= 9; j++) {
			const numstr = `${baseNumberString}${i.toString()}${j.toString()}`;
			nums.push(Number(numstr));
		}
	}

	for (let i = 0; i < 100; i++) {
		if (i > 0) {
			const a = nums[i - 1];
			const b = nums[i];
			if (a === undefined || b === undefined) throw "Never";

			switch (loglevel) {
				case "none":
				case "minimal":
					{
						const isEq = areEqual(a, b);
						if (isEq !== expectedIsEqual) {
							throw Error("Unexpected Result");
						}
					}
					break;
				case "verbose":
					{
						log(`a: ${a}`);
						log(`b: ${b}`);
						log("-----123456789012345");
						const relEps = getRelativeEspilon(a);
						const amb = Math.abs(a - b);
						log(
							`a - b =  ${amb} : <= Epsilon: ${amb <= relEps}`
						);
						log(`Epsilon: ${relEps}`);
						const isEq = areEqual(a, b);
						logln(20);
						log(`===ARE EQUAL: ${isEq}`);
						div();
						if (isEq !== expectedIsEqual) {
							throw Error("Unexpected Result");
						}
					}
					break;
			}
		}
	} // for 1 .. 100

	switch (loglevel) {
		case "none":
			break;
		case "minimal":
		case "verbose":
			log(
				`Number base: "${baseNumberString}":\n` +
					`   total digit precision: ` +
					`${baseNumberString.length} -> PASSED`
			);
			log(
				`All 100 tests matched expected 'areEqual(a,b)' ` +
					`result: ${expectedIsEqual}`
			);
			const msg: string = expectedIsEqual
				? "All neighbor numbers > 15 digit precision:\n" +
					"   SHOULD BE INDISTINCT AND FALSELY EQUAL"
				: "All neighbor numbers in 15 digit precision:\n" +
					"   SHOULD BE DISTINCT AND NOT EQUAL";

			log(msg);
			div();
			log();
			div();
			break;
	}
};
