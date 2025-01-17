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
import {
	cleanMultiLineString,
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

const sqlLast10Customers = `
		SELECT * FROM
		(
			SELECT * FROM customers 
			ORDER BY CustomerID DESC 
			LIMIT 10
		) AS sub
		ORDER BY CustomerID ASC;   
	`;

const sqlLast10CustomersWithOffset = `
		SELECT * FROM customers
		ORDER BY CustomerID DESC
		LIMIT 10 OFFSET (n - 10);
	`;

// const clean1 = cleanMultiLineString(sqlLast10Customers);
// const clean2 = cleanMultiLineString(sqlLast10CustomersWithOffset);

// log(sqlLast10Customers);
// div();
// log(clean1);
// ddiv();
// log(sqlLast10CustomersWithOffset);
// div();
// log(clean2);
// div();

const input = `
xxxxxxFirst line
xxxxxxxxxSecond line
xxxxxxThird line
		  `;

const s = cleanMultiLineString(input, "xxx");
log(input);
log(s);
