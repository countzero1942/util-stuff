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
	testAParseZnumExp,
	testBParseRPrec,
	testBParseRPrecExp,
	testBParseZnumExp,
	testCParseRPrecExp,
	testDParseRPrecExp,
	testErrParseRPrec,
	testErrParseZNum,
	testErrParseZnumExp,
	testPrecisionCount,
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
import {
	testRFixedTypeMap,
	testRPrecTypeMap,
	testZTypesTypeMap,
} from "@/my-tests/parser/types/test-type-map";
import { sleep } from "moderndash";

/**
 * Test TypeMap
 */

// testRPrecTypeMap();
// ddivln();
// testRFixedTypeMap();
// ddivln();
// testZTypesTypeMap();
// ddivln();

/**
 * Test parseNumber
 */

// testPrecisionCount();
// testAParseRPrecExp();
// testBParseRPrecExp();
// testCParseRPrecExp();
// testDParseRPrecExp();
// testAParseZnumExp();
// testBParseZnumExp();

// testErrParseZnumExp();
// testErrParseRPrec();
// testErrParseZNum();

/**
 * Test split heads
 */

// await logSplitHeads();

// const s1 = "key: head";
// const sl1 = StrCharSlice.all(s1);
// const parts = sl1.split(": ", 1);

// const str1 = "hello world";
// //            012345678901
// const sl1 = StrCharSlice.all(str1);
// const i = sl1.lastIndexOf("world");

// for (let i = str1.length + 3; i >= 0; i--) {
// 	const index = sl1.lastIndexOf("world", i);
// 	log(`i: ${i}, lastIndexOf: ${index}`);
// }

const slice = StrCharSlice.from("hello world");
const value1 = StrCharSlice.from("hello");
const value2 = StrCharSlice.from("world");
const resulta = slice.startsWith(value1);
const resultb = slice.startsWith(value2, 6);
const resultc = slice.endsWith(value2);
const resultd = slice.endsWith(value1, value1.length);

div();
// await logParseDefaultValues();

/**
 * Test Parse Traits
 */

// await logParseTraits();

// await logTraitReport("01-err-trait-tree.txt");
// await logTraitReport("01b-err-num-trait-tree.txt");

/**
 *
 */

/**
 * Test parseKeyHead
 */

const keyHeads = [
	// "A beast in the sea .X.2:6:12 %m %n.2:4 %p.dot_sub^sup:22:44:77 $abc $def xyz >kg.m/s2 .Y:2 .Z %g",
	"A beast in the sea in .X.2.6:6.28:abc def:12. " +
		"%m %n.2:4 %p.dot_sub^sup:22:44:77 $abc $def xyz >kg.m/s2 .Y:2 .Z %g",
];

// for (const keyHead of keyHeads) {
// 	const keyParams = parseKeyHead(keyHead);
// 	logobj(keyParams);
// }

// const str =
// 	"A beast in the sea .X.2:6:12" +
// 	" %y %z.2:2 $abc $def xyz >kg.m/s2 .Y:2 .Z %g";
// const str = "abc abc def abc def efg abc";
