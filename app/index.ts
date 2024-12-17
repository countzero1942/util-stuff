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

// const str =
// 	"A beast in the sea .X.2:6:12" +
// 	" %y %z.2:2 $abc $def xyz >kg.m/s2 .Y:2 .Z %g";
// const str = "abc abc def abc def efg abc";

// const str = ".X.2.6_4.3^3.4";

const strs: string[] = [
	".X.2.6_4.3^3.4:6.28:zzy yzz:12.",
	"%y.abc def_4.5:777:abc:44",
	"%z_abc def^2.3:3.4:yyz zyy:33",
];

for (const str of strs) {
	log(`str: '${str}'`);
	log("      01234567890123456789");
	const sl1 = StrCharSlice.from(str, 1);
	log(`sl1: '${sl1.string}'`);

	const flagDivider: string[] = [".", "_", "^"];

	const colonParams = sl1.edgeSplitMany([":"]);
	for (let i = 0; i < colonParams.length; i++) {
		const colonParam = colonParams[i] as StrCharSlice;
		switch (true) {
			case i === 0:
				{
					log("name params:");
					const nameParams =
						colonParam.edgeSplitOrdered(flagDivider);
					for (const nameParam of nameParams) {
						log(`   '${nameParam}'`);
					}
				}
				break;
			default: {
				log(`colon param: ${colonParam.string}`);
			}
		}
	}
	div();
}
