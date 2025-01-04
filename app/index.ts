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
import { StrSlice } from "@/utils/slice";
import {
	testRFixedTypeMap,
	testRPrecTypeMap,
	testZTypesTypeMap,
} from "@/my-tests/parser/types/test-type-map";
import { isEqual, sleep } from "moderndash";

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

/**
 * Test StrSlice
 */

// const slice1 = new StrSlice("abc,def,ghi");
// const values1 = slice1.split(",");
// const matches = values1.map(s => s.value);
// log(values1);
// div();
// log(matches);

const matches = [".", "_", "^"];
const strs = [
	".999.2.6_4.3^3.4^999",
	"_999_4.3^3.4^999",
	".999.2.6^3.4^999",
	".999.2.6_4.3^999",
	".999.2.6_999",
	"_999_4.3^999",
	"^999^3.4^999",
	".999X_999",
	".999X and some stuff_999",
];
const strsShouldBe = [
	".2.6_4.3^3.4",
	"_4.3^3.4",
	".2.6^3.4",
	".2.6_4.3",
	".2.6",
	"_4.3",
	"^3.4",
	"X",
	"X and some stuff",
];
const results = [
	[".2.6", "_4.3", "^3.4"],
	["_4.3", "^3.4"],
	[".2.6", "^3.4"],
	[".2.6", "_4.3"],
	[".2.6"],
	["_4.3"],
	["^3.4"],
	["X"],
	["X and some stuff"],
	[""],
];

for (let i = 0; i < strs.length; i++) {
	const slice = new StrSlice(strs[i]!, 4, -4);

	// expect(slice.value).toBe(strsShouldBe[i]);
	const shouldBeEqual = slice.value === strsShouldBe[i];
	const result = slice
		.edgeSplitOrdered(matches)
		.map(s => s.value) as string[];
	const shouldResult = results[i];
	const areEquals = isEqual(result, shouldResult);

	log(`'${slice.value}'`);
	log(`'${strsShouldBe[i]}'`);
	log(shouldBeEqual);
	log(result);
	log(shouldResult);
	log(areEquals);
	div();
}
