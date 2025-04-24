import {
	NNum,
	RFixed,
	RPrec,
	Str,
	TypeBase,
	WNum,
	ZNum,
} from "@/parser/types/type-types";
import { TypeMap } from "@/parser/types/type-map";

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

import { TypeValuePair } from "@/parser/types/parse-types";
import { NumberErr } from "@/parser/types/err-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { parse } from "node:path";
import { parseKeyHead } from "@/parser/utils/parse-key-head";
import {
	cleanMultiLineArray,
	cleanMultiLineString,
	cleanMultiLineStringToArray,
	formatNum,
	getCodePointCharLength,
	getMinTabCharsCount,
} from "@/utils/string";

import { normalizeStartEnd, StrSlice } from "@/utils/slice";
import {
	testRFixedTypeMap,
	testRPrecTypeMap,
	testZTypesTypeMap,
} from "@/my-tests/parser/types/test-type-map";
import { isEqual, sleep } from "moderndash";

import { parseLinesToHeads } from "@/parser/utils/lines-to-heads";
import {
	parseTrait,
	createRootHead,
} from "@/parser/utils/parse-trait";
import {
	expectedParseKeyHeadTestTextReport,
	parseKeyHeadErrorTestTextA1,
	parseKeyHeadTestText,
} from "@/tests/data/test-data";

import { KeyParams } from "@/parser/types/key-head";
import {
	KeyValueRequiredSource,
	ParserErrNode,
} from "@/parser/types/key-value";

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
