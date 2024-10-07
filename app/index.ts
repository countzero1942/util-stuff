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
import { loopThruPowersOf10PlusFPErr } from "@/tests/math/FP-error-tests";
import { TestNeighborNumbersAreEqual } from "@/tests/math/neighbor-numbers";
import { getError } from "@/utils/error";
import JS from "@/utils/js";
import { div, log, logh, logln } from "@/utils/log";
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
import { getRandomValues } from "crypto";
import { merge } from "moderndash";
import test from "node:test";
import { DeepPartial } from "utility-types";

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
// 	power: { kind: "single", single: 307 },
// 	logLevel: "none",
// 	precisionKind: "15",
// 	numOfTests: 100_000,
// });

// TestNeighborNumbersAreEqual({
// 	power: {
// 		kind: "random-range",
// 		range: { min: -300, max: 300 },
// 	},
// 	logLevel: "verbose",
// 	precisionKind: "random",
// 	numOfTests: 1,
// });

// TestNeighborNumbersAreEqual({
// 	power: {
// 		kind: "random-range",
// 		range: { min: -307, max: 307 },
// 	},
// 	logLevel: "minimal",
// 	precisionKind: "random",
// 	numOfTests: 10,
// });

// TestNeighborNumbersAreEqual({
// 	power: {
// 		kind: "random-range",
// 		range: { min: -500, max: 500 },
// 	},
// 	logLevel: "none",
// 	precisionKind: "random",
// 	numOfTests: 100_000,
// });

TestNeighborNumbersAreEqual({
	power: {
		kind: "random-range",
		range: { min: -320, max: 320 },
	},
	logLevel: "none",
	precisionKind: "15",
	numOfTests: 100_000,
});

// loopThruPowersOf10PlusFPErr(base => base + 0.1 + 0.7);
