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
await logTraitReport("01b-err-num-trait-tree.txt");
