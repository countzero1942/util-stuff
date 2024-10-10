import {
	logFibSeq,
	logFibTriFac,
	logFibTriSquare,
	logReduceFib,
	logReduceTriangular,
} from "@/app/reduce-test";
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
} from "@/app/seq-zip-old-proto";
import {
	logObjKeyValueSeqZip3Seq,
	logZip2Seq,
	logZip3Seq,
	logZip7bSeq,
	logZip7Seq,
	logZip8bSeq,
	logZip8Seq,
	logZip9bSeq,
	logZip9Seq,
} from "@/app/seq-zip-test";
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
import { getFullType } from "@/utils/types";
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

// logZipTwoSeq();
// logZipThreeSeq();
// logReduceTriangular(36);
// logReduceFib(12);
// logFibSeq(12);
// logFibTriFac(12);
//logFibTriSquare(36);

// logZip2Seq(20);
// logZip3Seq(20);
logZip7Seq(20);
// div();
// log();
// div();
// logZip7Seq(30);
// logZip7bSeq(20);
// logZip8Seq(20);
// logZip8Seq(20);
// logObjValueSeqZip3Seq(12);
// logObjKeyValueSeqZip3Seq(12);
