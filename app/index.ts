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
import { parseKeyHeadErrorTestTextA1 } from "@/tests/data/test-data";
import { CodePointRange } from "@/trex";

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

const repeats = 1_000_000;

function* noCommas(str: string): Generator<number> {
	const length = str.length;
	let i = 0;
	while (i < length) {
		const codePoint = str.codePointAt(i);
		if (codePoint === undefined) break;
		if (codePoint !== 44) {
			yield codePoint;
		}
		i += getCodePointCharLength(codePoint);
	}
}

const doGenRemove = (str: string) => {
	logh("doGenRemove");
	log(`str before: ${str}`);
	log(
		`str after: ${String.fromCodePoint(...noCommas(str))}`
	);
	div();

	const start = performance.now();

	for (let i = 0; i < repeats; i++) {
		let s = String.fromCodePoint(...noCommas(str));
	}

	const end = performance.now();
	const time = end - start;
	log(`Time: ${time.toFixed(3)} ms`);
	div();
};

const doStringRemove = (str: string) => {
	logh("doStringRemove");
	log(`str before: ${str}`);
	log(`str after: ${str.replace(/,/g, "")}`);
	div();

	const start = performance.now();
	for (let i = 0; i < repeats; i++) {
		let s = str.replace(/,/g, "");
	}

	const end = performance.now();
	const time = end - start;
	log(`Time: ${time.toFixed(3)} ms`);
	div();
};

const numString1 = "1,234,567,890,123,456,789,012,345,678";
const numString2 = "1,234,567";

doGenRemove(numString1);

doStringRemove(numString1);
