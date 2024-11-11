import {
	log,
	logh,
	div,
	loggn,
	ddivl,
	logn,
	divl,
	ddivln,
	loghn,
	logagn,
	logag,
	logobj,
} from "@/utils/log";
import {
	NNum,
	RFixed,
	RPrec,
	TypeBase,
	WNum,
	ZNum,
} from "@/parser/types/type-types";
import { TypeMap } from "@/parser/types/type-map";
import { getFullType } from "@/utils/types";
import { get } from "node:http";
import {
	getPrecisionCount,
	parseDefNumber,
} from "@/parser/utils/parse-num";
import { testErrParseZNum } from "@/my-tests/parser/test-parseNumber";
import {
	logParseDefaultValues,
	logSplitHeads,
} from "@/parser/parser-start";
import {
	getInversePiSumSeq,
	getPiSumSeq,
	getPiThingSumSeq,
} from "@/app/math-series";
import { NumSeq, StrGraphemeSeq, StrSeq } from "@/utils/seq";
import { Slice } from "@/parser/types/general";

// await logSplitHeads();

// await logParseDefaultValues();

// testRPrec();
// ddivln();
// testRFixed();
// ddivln();
// testZTypes();
// ddivln();

// testLog();

// const a = 1e20;
// log(a);
// log(a.toPrecision());

// testAParseRPrecExp();
// testBParseRPrecExp();
// testCParseRPrecExp();
// testDParseRPrecExp();
// testErrParseZnumExp();

// testErrParseZnumExp();
// testBParseRPrec();
// testErrParseRPrec();

// testErrParseZNum();

// const logTestErrors = (vars: string[]) => {
// 	for (const v of vars) {
// 		const i = v.indexOf(": ");
// 		if (i < 0) continue;
// 		const slice = Slice.from(i + 2);
// 		log(v);
// 		log(slice.getErrorString(v));
// 		div();
// 	}
// };

// const strs: string[] = [
// 	"a: 1e20",
// 	"b: 1.23e20",
// 	"c: +1.12e20",
// 	"d: -1.12e200",
// ];

// logTestErrors(strs);

let str = "abcдрй😀😺👨‍👦👩‍👩‍👦‍👦";
// let str = "abcдрй😀😺👨‍👦";
// str = "Здрй👨‍👦😀😺";
//           01234  5 6
log(str);

const seq = StrGraphemeSeq.from(str);

const testNegStart = () => {
	let count = seq.count();
	log(`str: '${str}'`);
	log(`count: ${count}`);
	log(`len: ${str.length}`);
	for (let i = -count; i <= 0; i++) {
		log(`i: ${i}: '${seq.slice(i)}'`);
		div();
	}
};

const testStartPlusLen = (len: number) => {
	let count = seq.count();
	log(`str: '${str}'`);
	log(`count: ${count}`);
	log(`len: ${str.length}`);
	for (let i = 0; i <= count; i++) {
		const s = seq.slice(i, i + len);
		log(`i: ${i}, char-len: ${s.length}: '${s}'`);
		div();
	}
};

logh("Test negative start loop");
testNegStart();
div();
logh("Test positive loop with length = 1");
testStartPlusLen(1);
div();
logh("Test positive loop with length = 3");
testStartPlusLen(3);
