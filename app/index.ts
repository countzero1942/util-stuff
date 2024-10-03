import {
	testBasicSeq,
	testLongNumberDirect,
	testLongNumberSeq,
	testNumberFilterSeq,
	testNumbers,
} from "@/app/seq-test";
import {
	cubicNumTriangularSeq,
	logTriangularSeq,
	squareNumTriangularSeq,
	squareSumTriangularSeq,
	triangularsSeq,
} from "@/app/seq-triangular";
import {
	testCustomZipFunction,
	testNewZipSeq,
	testSeqZipChained,
	testSeqZipFunctionToZipSeq,
	testZipManyProtoToArray,
	testZipManyProtoUnevenAndEmptySeqsToArray,
	testZipManyProtoUnevenSeqsToArray,
} from "@/app/seq-zip";
import { getError } from "@/utils/error";
import JS from "@/utils/js";
import { log, logh, logln } from "@/utils/log";
import { round } from "@/utils/math";
import { MathProdSeq, NumSeq, Seq } from "@/utils/seq";
import { formatNum } from "@/utils/string";

const div = () => {
	logln(40);
};

// const count = 100_000_000;
// await testLongNumberSeq(count);
// await testNumberFilterSeq(count);
// await testLongNumberDirect(count);

// logSquareNumTriangularSeq(med);
// logSquareSumTriangularSeq(100_000_000);
// logCubicNumTriangularSeq(10_000);

// testNewZipSeq();
// div();
// testSeqZipFunctionToZipSeq();

// logTriangularSeq(100);

// testCustomZipFunction();
// testNewZipSeq();
// testSeqZipFunctionToZipSeq();
// testSeqZipChained();

// testZipManyProtoToArray();
// testZipManyProtoUnevenSeqsToArray();
// testZipManyProtoUnevenAndEmptySeqsToArray();

const getSignificantPower = (n: number) => {
	return Math.log10(n);
};

const format = (n: number) => {
	switch (true) {
		case n >= 10e5 && n <= 10e15:
			return formatNum(n);
		case n > 10e15:
			return n.toExponential();
		default:
			return n.toString();
	}
};

const logRounded = (n: number, digits: number) => {
	const r = round(n, digits);
	const lg10 = round(Math.log10(n), 4);

	log(
		`n: ${format(n)}, round digs: ${digits} -> ` +
			`rounded: ${format(r)}, log10: ${lg10}`
	);
};

const getRelativeEspilon = (n: number): number => {
	const log = Math.ceil(Math.log10(n));
	const relEpsilon = Number.EPSILON * 10 ** log;
	return relEpsilon;
};

const isEqual = (a: number, b: number): boolean => {
	const logA = Math.ceil(Math.log10(a));
	const logB = Math.ceil(Math.log10(a));
	if (logA !== logB) {
		return false;
	}
	const relEpsilon = Number.EPSILON * 10 ** logA;
	return Math.abs(a - b) <= relEpsilon;
};

const precisionRound = (n: number, sigDigits: number) => {
	// 123,456,789 -> round(-3) -> 123,456,000
	// num-digs: 9, sig-digs: 6, round: -3
	// sig-digs - num-digs = round
	// 6 - 9 = -3
	// try: num-digs = ceil(log10)
	const numDigits = Math.ceil(Math.log10(n));
	const r = sigDigits - numDigits;
	return round(n, r);
};

const logPreciscionRound = (n: number, sigDigits: number) => {
	const pr = precisionRound(n, sigDigits);
	const relEps = getRelativeEspilon(n);
	const cleanPR = Number(pr.toPrecision(15));
	log(`n: ${format(n)}; sigDig: ${sigDigits}`);
	log(
		`   precRound: ${format(pr)} : clean precRound: ${format(
			cleanPR
		)}`
	);
	log(`  precRound - clearPrecRound = ${Math.abs(pr - cleanPR)}`);
	log(`  relEpsilon:                  ${relEps}`);
	div();
	log(`   ARE EQUAL: ${isEqual(pr, cleanPR)}`);
};

const logPrecisionRoundRange = (
	n: number,
	range: number,
	inc: number = 1
) => {
	const min = -range;
	const max = range;
	for (let pow = min; pow <= max; pow += inc) {
		const currentN = n * 10 ** pow;
		const lg10 = Math.log10(currentN);
		log(
			`pow of 10: ${pow + 14}, ` +
				`shift: ${pow}, log10: ${round(lg10, 5)}`
		);
		logPreciscionRound(currentN, 6);
		div();
	}
};

const logPlusMinusRelEps = (n: number) => {
	const relPow = Math.ceil(Math.log10(n));
	const shift = 10 ** relPow;
	const relEps = Number.EPSILON * shift;
	const pr1 = n + relEps;
	const pr2 = n - relEps;
	const cleanN = Number(n.toPrecision(15));

	// log(`n: ${format(n)}`);
	// log(`   relEpsilon: ${format(relEps)}`);
	// log(`   pr+: ${format(pr1)}`);
	// log(`   pr-: ${format(pr2)}`);

	div();
	log(`n:      ${n}:   clean n: ${cleanN}`);
	log(`        012345678901234567890123456789`);
	log(`                  10        20`);
	div();
	log(`   relEps:   ${relEps}`);
	log(`   a - b =   ${Math.abs(n - cleanN)}`);
	div();
	log(`   IS EQUAL: ${isEqual(n, cleanN)}`);
	div();
	log();
};

const n = 123_123_123_123_123;

// logPrecisionRoundRange(n, 100, 5);

// log(Number.EPSILON);

// log(0.1 + 0.2);
// log(1.1 + 1.2);

//logPlusMinusRelEps(10.1 + 10.2);

const loopThruPowersOf10PlusFPErr = (
	range: number,
	inc: number = 1
) => {
	const min = -range;
	const max = range;
	const err = 0.1 + 0.2;
	logPlusMinusRelEps(err);
	for (let pow = 0; pow <= max; pow += inc) {
		const p1 = 10 ** pow;
		const n = p1 + 0.1 + 0.2;
		logPlusMinusRelEps(n);
	}
};

function randomInteger(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a 13 Sig Dig String from 0 to 1
 *
 * String will be in the form of "0.1234567895123"
 *
 * So the length of the string will be 2 more than
 * the number of significant digits
 *
 * @param sigDigits Default 13 for 15 significant digits.
 * Can change the value to 14 for 16 sig digit false positives!
 * @returns
 */
const generateRandom13SigDigitNumberString = (sigDigits = 13) => {
	const strs: string[] = [];
	strs.push("0.");

	for (let i = 0; i < sigDigits; i++) {
		const n = i === 0 ? randomInteger(1, 9) : randomInteger(1, 9);
		strs.push(n.toString());
	}
	return strs.join("");
};

/**
 *
 * @param s A 13 char decimal string: e.g.: "0.1234567895123"
 */
const testPrec15NeighborNumbersAgainstAreEqual = (
	s: string = "0.1234567895123",
	loglevel: "minimal" | "verbose" | "verbose-no-throw" = "verbose"
) => {
	// const s = "0.1234567895123"; => 13 SigDig & 15 char length
	//           123456789012345678901234567890

	if (s.startsWith("0.0")) {
		log(`=======> CAN NOT USE BASE STRING: "${s}"`);
		log(
			"Any digit string starting with '0.0...' will lower testing range."
		);
		log("Test numbers must be a power of 10^-1");
		log("If a number string starts with '0.0nnnn' it is 10^-2");
		return;
	}

	const expectedIsEqual: boolean = s.length <= 15 ? false : true;

	const nums: number[] = [];

	for (let i = 0; i <= 9; i++) {
		for (let j = 0; j <= 9; j++) {
			const numstr = `${s}${i.toString()}${j.toString()}`;
			nums.push(Number(numstr));
		}
	}

	for (let i = 0; i < 100; i++) {
		if (i > 0) {
			const a = nums[i - 1];
			const b = nums[i];
			if (a !== undefined && b !== undefined) {
				switch (loglevel) {
					case "minimal":
						{
							const isEq = isEqual(a, b);
							if (isEq !== expectedIsEqual) {
								throw Error("Unexpected Result");
							}
						}
						break;
					case "verbose":
						{
							log(`a: ${a}`);
							log(`b: ${b}`);
							log("     123456789012345");
							const isEq = isEqual(a, b);
							log(`ARE EQUAL: ${isEq}`);
							div();
							if (isEq !== expectedIsEqual) {
								throw Error("Unexpected Result");
							}
						}
						break;
					case "verbose-no-throw":
						{
							log(`a: ${a}`);
							log(`b: ${b}`);
							log("     123456789012345");
							const isEq = isEqual(a, b);
							log(`ARE EQUAL: ${isEq}`);
							div();
							if (isEq !== expectedIsEqual) {
								log("================> UNEXPECTED RESULT");
							}
						}
						break;
				}
			}
		}
	} // for 1 .. 100

	log(
		`Number base: "${s}", total digit precision: ${s.length} -> PASSED`
	);
	log(
		`All 100 tests matched expected 'areEqual(a,b)' ` +
			`result: ${expectedIsEqual}`
	);
	const msg: string = expectedIsEqual
		? "All neighbor numbers > 15 digit precision: SHOULD FALSELY BE EQUAL"
		: "All neighbor numbers in 15 digit precision: SHOULD NOT BE EQUAL";
	log(msg);
	div();
};

log(`Epsilon: ${Number.EPSILON}`);
div();
// loopThruPowersOf10PlusFPErr(20);
//logPrecisionRoundRange(n, 100, 5);

try {
	// test 15 prec neighbor numbers
	// (13 char base string): expect false (should not be equal)
	// testPrec15NeighborNumbersAgainstAreEqual("0.1234567895123", false);
	// test 16 prec neighbor numbers
	// (14 char base string): expect true (are falsely equal)
	// testPrec15NeighborNumbersAgainstAreEqual("0.12345678951234", true);

	// test 15 prec neighbor numbers
	// (13 char base string): expect false (should not be equal)
	// 0.09545014601900
	//   1234567890123456
	// const s = "0.09545014601900";
	// log(`s: "${s}", len: ${s.length}`);
	// log("    1234567890123");

	for (let i = 0; i < 200000; i++) {
		const s = generateRandom13SigDigitNumberString(
			randomInteger(13, 14)
		);
		log("Test: ", formatNum(i + 1));
		testPrec15NeighborNumbersAgainstAreEqual(s, "minimal");
	}
} catch (error) {
	log(getError(error));
}
