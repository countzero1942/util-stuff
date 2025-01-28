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
	ddiv,
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
	analyzeNumberString,
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
	testErrParseRPrecExp,
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
import {
	NumSeq,
	StrGraphemeSeq,
	StrSeq,
} from "@/utils/seq";
import { TypeValuePair } from "@/parser/types/parse-types";
import { NumberErr } from "@/parser/types/err-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { parse } from "node:path";
import { parseKeyHead } from "@/parser/utils/parse-key-head";
import {
	cleanMultiLineString,
	cleanMultiLineStringToArray,
	formatNum,
	getMinTabCharsCount,
} from "@/utils/string";
import { normalizeStartEnd, StrSlice } from "@/utils/slice";
import {
	testRFixedTypeMap,
	testRPrecTypeMap,
	testZTypesTypeMap,
} from "@/my-tests/parser/types/test-type-map";
import { isEqual, sleep } from "moderndash";
import { logGeneratePassword } from "@/utils/password";
import { parseLinesToHeads } from "@/parser/utils/lines-to-heads";
import {
	parseTrait,
	createRootHead,
} from "@/parser/utils/parse-trait";
import { KeyTrait } from "@/parser/types/heads";

// logGeneratePassword();

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
// testErrParseRPrec();
// testErrParseRPrecExp();

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

// const slice = StrSlice.from(":::hello worldly:", 3, -3);
// const sliceStr = slice.value;
// const sliceOf = slice.sliceOf(":");
// const sliceOfStr = sliceOf.value;
// const shouldBe = slice.slice(0, 0);
// const shouldBeStr = shouldBe.value;
// const b1 = sliceOf.equals(shouldBe);
// div();

// :::hello worldly:
//    012345678901
// 012345678901234567
//       10987654321-

// const input = `
// a: 42
// 	invalid-a: misplaced children
// 	invalid-b: indent error
// `;

// const lines = cleanMultiLineStringToArray(input);
// const heads = await parseLinesToHeads(lines);
// const result = parseTrait(createRootHead(), heads, 0);
// const rootTrait = result.trait as KeyTrait;
// log(rootTrait.children.length);
// logobj(result);

await logTraitReport("01-err-trait-tree.txt");

// const input = `
// d:
//    spaces: 23
// `;

// const lines = cleanMultiLineStringToArray(input);
// const heads = await parseLinesToHeads(lines);
// const result = parseTrait(createRootHead(), heads, 0);
// logobj(result);
