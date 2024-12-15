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
	logg,
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
import {
	testAParseRPrecExp,
	testBParseRPrec,
	testBParseRPrecExp,
	testCParseRPrecExp,
	testDParseRPrecExp,
	testErrParseRPrec,
	testErrParseZNum,
	testErrParseZnumExp,
} from "@/my-tests/parser/test-parseNumber";
import {
	logParseDefaultValues,
	logParseTraits,
	logSplitHeads,
	logTraitReport,
} from "@/parser/parser-start";
import {
	getInversePiSumSeq,
	getPiSumSeq,
	getPiThingSumSeq,
} from "@/app/math-series";
import { NumSeq, StrGraphemeSeq, StrSeq } from "@/utils/seq";
import { TypeValuePair } from "@/parser/types/parse-types";
import { NumberErr } from "@/parser/types/err-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { parse } from "node:path";
import { parseKeyHead } from "@/parser/utils/parse-key-head";
import { formatNum } from "@/utils/string";
import { StrCharSlice } from "@/utils/slice";

const keyHeads = [
	// "A beast in the sea in .X.2:6:12 %y %z.2:2 $abc $def xyz >kg.m/s2 .Y:2 .Z %g",
	"A beast in the sea in .X.2.6:6.28:abc def:12. %y %z.2:2 $abc $def xyz >kg.m/s2 .Y:2 .Z %g",
];

// for (const keyHead of keyHeads) {
// 	const keyParams = parseKeyHead(keyHead);
// 	logobj(keyParams);
// }

// await logSplitHeads();

// await logParseDefaultValues();

// testRPrec();
// ddivln();
// testRFixed();
// ddivln();
// testZTypes();
// ddivln();

// testAParseRPrecExp();
// testBParseRPrecExp();
// testCParseRPrecExp();
// testDParseRPrecExp();
// testErrParseZnumExp();

// testErrParseZnumExp();
// testErrParseRPrec();
// testErrParseZNum();

// await logParseTraits();

// await logTraitReport("01-err-trait-tree.txt");
// await logTraitReport("01b-err-num-trait-tree.txt");

const strs: string[] = ["   abc", "abc   ", "   abc   ", "abc"];

for (const str of strs) {
	const slice = StrCharSlice.all(str);
	const startTrim = slice.trimStart();
	const endTrim = slice.trimEnd();
	const allTrim = slice.trim();

	log(`slice: '${slice.string}'`);
	log(`   startIncl: ${slice.startIncl}, endExcl: ${slice.endExcl}`);

	log(
		`startTrim: '${startTrim.string}', ref equals slice: ${
			startTrim === slice
		}`
	);
	log(
		`   startIncl: ${startTrim.startIncl}, endExcl: ${startTrim.endExcl}`
	);

	log(
		`endTrim: '${endTrim.string}', ref equals slice: ${
			endTrim === slice
		}`
	);
	log(
		`   startIncl: ${endTrim.startIncl}, endExcl: ${endTrim.endExcl}`
	);

	log(
		`allTrim: '${allTrim.string}', ref equals slice: ${
			allTrim === slice
		}`
	);
	log(
		`   startIncl: ${allTrim.startIncl}, endExcl: ${allTrim.endExcl}`
	);
	div();
}
