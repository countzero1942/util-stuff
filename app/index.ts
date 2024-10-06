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
import { TestNeighborNumbersAreEqual } from "@/tests/math/neighbor-numbers";
import { getError } from "@/utils/error";
import JS from "@/utils/js";
import { log, logh, logln } from "@/utils/log";
import {
	areEqual,
	getRelativeEspilon,
	precisionRound,
	randomInteger,
	fixedRound,
} from "@/utils/math";
import { MathProdSeq, NumSeq, Seq } from "@/utils/seq";
import { formatNum } from "@/utils/string";
import { toFixedArray } from "@/utils/types";
import { ChildProcessWithoutNullStreams } from "child_process";
import { getRandomValues } from "crypto";
import { merge } from "moderndash";
import test from "node:test";
import { DeepPartial } from "utility-types";

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
	const r = fixedRound(n, digits);
	const lg10 = fixedRound(Math.log10(n), 4);

	log(
		`n: ${format(n)}, round digs: ${digits} -> ` +
			`rounded: ${format(r)}, log10: ${lg10}`
	);
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
	log(`   ARE EQUAL: ${areEqual(pr, cleanPR)}`);
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
				`shift: ${pow}, log10: ${fixedRound(lg10, 5)}`
		);
		logPreciscionRound(currentN, 6);
		div();
	}
};

const logPlusMinusRelEps = (n: number) => {
	const relEps = getRelativeEspilon(n);
	const cleanN = Number(n.toPrecision(15));
	const prRoundN = precisionRound(n, 15);

	div();
	log(`n:           ${n.toExponential()}:`);
	log(`clean n:     ${cleanN.toExponential()}`);
	log(`precRound n: ${prRoundN.toExponential()}`);
	log(`             1 234567890123456`);
	div();
	log(`   relEps:           ${relEps.toExponential()}`);
	const deltaCleanN = Math.abs(n - cleanN);
	const deltaPrecRN = Math.abs(n - prRoundN);
	const ratioCleanN = Math.round((deltaCleanN / relEps) * 100);
	const ratioPrecRN = Math.round((deltaPrecRN / relEps) * 100);
	log(`   delta cleanN =    ${deltaCleanN.toExponential()}`);
	log(`   delta precRN =    ${deltaPrecRN.toExponential()}`);
	log(` DCleanN/relEps =    ${ratioCleanN}%`);
	log(`  PrecRN/relEps =    ${ratioCleanN}%`);
	div();

	log(`   ARE EQUAL cleanN: ${areEqual(n, cleanN)}`);
	log(`   ARE EQUAL precRN: ${areEqual(n, prRoundN)}`);
	div();
	log();
};

const n = 123_123_123_123_123;

// logPrecisionRoundRange(n, 100, 5);

// log(Number.EPSILON);

// log(0.1 + 0.2);
// log(1.1 + 1.2);

//logPlusMinusRelEps(10.1 + 10.2);

const loopThruPowersOf10PlusFPErr = (maxPower: number = 20) => {
	const max = maxPower;
	const err = 0.1 + 0.7;
	logPlusMinusRelEps(err);
	for (let pow = 0; pow <= max; pow++) {
		const p1 = 10 ** pow;
		const n = p1 + 0.1 + 0.2;
		logPlusMinusRelEps(n);
	}
};

div();

// loopThruPowersOf10PlusFPErr(20);
// logPrecisionRoundRange(n, 100, 5);

// TestNeighborNumbersAreEqual({
// 	precisionLevel: "15",
// 	power: { kind: "single", single: -305 },
// });

// TestNeighborNumbersAreEqual({
// 	power: { kind: "single", single: -1 },
// });

// TestNeighborNumbersAreEqual({
// 	power: { kind: "single", single: -309 },
// 	logLevel: "verbose",
// 	precisionLevel: "15",
// 	numOfTests: 1,
// });

// TestNeighborNumbersAreEqual({
// 	power: {
// 		kind: "random-range",
// 		range: { min: -300, max: 300 },
// 	},
// 	logLevel: "minimal",
// 	precisionLevel: "16",
// 	numOfTests: 20,
// });

// TestNeighborNumbersAreEqual({
// 	power: {
// 		kind: "random-range",
// 		range: { min: -200, max: 200 },
// 	},
// 	logLevel: "minimal",
// 	precisionLevel: "15",
// 	numOfTests: 50,
// });

// const logAreEqual = (a: number, b: number) => {
// 	log(`a: ${a}, b: ${b}, areEqual: ${areEqual(a, b)}`);
// };

// logAreEqual(0.8, 0.7 + 0.1);
// logAreEqual(0.3, 0.2 + 0.1);
// logAreEqual(100.3, 100.2 + 100.1);

// 142857 142857 14285

// 0.14285714285714285
// 0.142857142857143
//   123456789012345

loopThruPowersOf10PlusFPErr();
