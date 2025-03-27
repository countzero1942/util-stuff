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
	CodePointElement,
	CodePointSeq,
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
import { logGeneratePassword } from "@/utils/password";
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
import {
	CodePointRange,
	GhostMatch,
	MatchAllMatches,
	MutMatchNav,
	MatchCodePoint,
} from "@/trex";
import { KeyParams } from "@/parser/types/key-head";
import {
	KeyValueRequiredSource,
	ParserErrNode,
} from "@/parser/types/key-value";

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

// const s1 = "a😀";
// log(`0x${s1.charCodeAt(0).toString(16)}`);
// log(`0x${s1.charCodeAt(1).toString(16)}`);
// log(`0x${s1.charCodeAt(2).toString(16)}`);

// div();

// const s2 = "a😀";
// log(`0x${s2.codePointAt(0)?.toString(16)}`);
// log(`0x${s2.codePointAt(1)?.toString(16)}`);
// log(`0x${s2.codePointAt(2)?.toString(16)}`);

// div();

// const seq = new StrSeq("hello");
// // seq.foreach(x => log(x));
// // div();
// // seq.foreach(x => log(x));

// const arr1 = Array.from(seq.gen());
// logobj(arr1);
// // div();
// // const arr2 = seq.toArray();
// // logobj(arr2);

// const createLetterMatcher = (
// 	letter: string
// ): MatchCodePoint => {
// 	return new MatchCodePoint(letter.codePointAt(0)!);
// };

// const matcherA = createLetterMatcher("A");
// const matcherB = createLetterMatcher("B");
// const matcherComma = createLetterMatcher(",");
// const ghostComma = new GhostMatch(matcherComma);

// // First match A and B normally, then match comma as ghost at the end
// const sequence = new MatchAllMatches([
// 	matcherA,
// 	matcherB,
// 	ghostComma,
// ]);

// const nav = new MutMatchNav(new StrSlice("AB,C"));
// const result = sequence.match(nav);
// if (result) {
// 	div();
// 	log(`source: ${nav.source.value}`);
// 	log(`start: ${result.startIndex}`);
// 	log(`navIndex: ${result.navIndex}`);
// 	log(`captureIndex: ${result.captureIndex}`);
// 	log(`capture: '${result.captureMatch.value}'`);
// 	log(`ghost capture: '${result.ghostMatch.value}'`);
// } else {
// 	log("No match");
// }

const nav = new MutMatchNav(new StrSlice("test string"));
nav.moveCaptureForward(4); // Move to position 4 first
logobj(nav);
nav.moveStartForward(2); // Move start forward by 2
logobj(nav);
