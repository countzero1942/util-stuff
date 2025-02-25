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
	countDecimalPlaces,
	getPrecisionCount,
	parseDefNumber,
	parseWNum,
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
	compareParseKeyHeadReport,
	logParseDefaultValues,
	logParseKeyHeadReport,
	logParseTraits,
	logSplitHeads,
	logTraitReport,
	logTraitReportFromString,
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
import {
	KeyTrait,
	KeyValueDefinedField,
} from "@/parser/types/heads";
import { parseKeyHeadErrorTestTextA1 } from "@/tests/data/test-data";

logGeneratePassword();

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

// logParseKeyHeadReport();

// compareParseKeyHeadReport();

// const input = `
// a: 42
// 	invalid-a: misplaced children
// 	invalid-b: indent error
// `;

// const lines = cleanMultiLineStringToArray(input);
// const heads = await parseLinesToHeads(lines);
// const result = parseTrait(createRootHead(), heads, 0);

// const rootTrait = result.trait as KeyTrait;

// const childA = rootTrait.children[0] as KeyValueDefinedPair;

// logobj(childA);

// expect(childA.checkKey("a")).toBe(true);
// expect(childA.value.value).toBe(42);
// expect(childA.value.type).toBeInstanceOf(ZNum);

// await logTraitReportFromString(parseKeyHeadErrorTestTextA1);

// const input = StrSlice.all("0");
// const result = parseWNum(input);
// logobj(result);
// div();

// type Stuff = {
// 	a: number;
// 	b?: string;
// 	c: boolean | null;
// };

// const stuff1: Stuff = {
// 	a: 42,
// 	b: "hello",
// 	c: null,
// };

// logobj(stuff1);
// const stuff2: Stuff = {
// 	a: 42,
// 	c: null,
// };

// logobj(stuff2);

// const thing = stuff2.b;
// log(thing);

const slice = StrSlice.from("hello world");
const i1 = slice.indexOf("world", 5);
const i2 = slice.indexOf("world", 6);

const slice2 = StrSlice.from("abc hello world abc", 4, 15);
const str = slice2.value;
const i3 = slice2.lastIndexOf("world");
const i4 = slice2.lastIndexOf("world", 11);

div();
