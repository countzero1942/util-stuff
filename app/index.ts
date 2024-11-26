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
import { TypeValuePair } from "@/parser/types/parse-types";
import { NumberErr } from "@/parser/types/err-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";

export type FlagParam = {
	readonly name: string;
	readonly dotParam: TypeValuePair<any> | NumberErr | undefined;
	readonly colonParams: TypeValuePair<any>[];
};

export type TypeInfo = {
	readonly name: string;
	readonly dotParam: TypeValuePair<any> | NumberErr | undefined;
	readonly colonParams: TypeValuePair<any>[];
	readonly flagParams: FlagParam[];
	readonly stringParams: string[];
};

export type KeyInfo = {
	readonly name: string;
	readonly types?: TypeInfo[];
};

const getTypeStrs = (rest: string) => {
	const typeStrs: string[] = [];
	let i_start = 0;
	while (true) {
		const i = rest.indexOf(" .", i_start);
		const i_end = i === -1 ? rest.length : i;
		const typeStr = rest.substring(i_start, i_end);
		// log(`--> typeStr: '${typeStr}'`);
		typeStrs.push(typeStr);
		if (i === -1) break;
		i_start = i_end + 1;
	}
	return typeStrs;
};

const parseTypeOrFlag = (typeOrFlag: string): FlagParam => {
	let rest = typeOrFlag;
	let name: string = "";
	let dotParam: TypeValuePair<any> | NumberErr | undefined;
	let colonParams: TypeValuePair<any>[] = [];
	const matchName = /[.%][a-zA-Z][\w\-_]*[ ]*/.exec(rest);
	if (matchName) {
		name = matchName[0].trim();
		rest = rest.substring(matchName.index + matchName[0].length);
	}
	const matchDotParam = /[._^][\w\-_]*[ ]*/.exec(rest);
	if (matchDotParam) {
		const dotParamStr = matchDotParam[0].trim();
		if (dotParamStr.length > 1) {
			dotParam = parseDefaultValue(dotParamStr.slice(1));
			rest = rest.substring(
				matchDotParam.index + matchDotParam[0].length
			);
		}
	}
	while (true) {
		const matchColonParam = /[:][\w\-_.]*[ ]*/.exec(rest);
		if (!matchColonParam) break;
		const colonParamStr = matchColonParam[0].trim();
		const result = parseDefaultValue(colonParamStr.slice(1));
		if (result instanceof NumberErr) break;
		colonParams.push(result);
		rest = rest.substring(
			matchColonParam.index + matchColonParam[0].length
		);
	}
	return { name, dotParam, colonParams };
};

const parseTypes = (rest: string) => {
	const typeStrs = getTypeStrs(rest);
	for (const typeStr of typeStrs) {
		log(`typeStr: '${typeStr}'`);
		const { name, dotParam, colonParams } =
			parseTypeOrFlag(typeStr);
		logag("name", name);
		logag("dotParam", dotParam);
		logag("colonParams", colonParams);
	}
};

export const parseKeyHead = (keyhead: string): KeyInfo => {
	const getName = (i: number) => {
		let name = keyhead.substring(0, i).trim();
		return name.endsWith("in")
			? name.substring(0, name.length - 2).trim()
			: name;
	};

	const i = keyhead.indexOf(" .");
	if (i === -1) {
		return {
			name: keyhead,
		};
	}
	log(`keyhead: '${keyhead}'`);
	const name = getName(i);
	log(`name: '${name}'`);
	const rest = keyhead.substring(i + 1);
	log(`rest: '${rest}'`);
	parseTypes(rest);
	div();
	return {
		name,
	};
};

const keyHeads = [
	"A beast in the sea in .X.2:6:12 %y %z.2:2 $abc $def xyz >kg.m/s2 .Y:2 .Z %g",
	"A beast in the sea in .X.2.6:6.28:abc-def:12. %y %z.2:2 $abc $def xyz >kg.m/s2 .Y:2 .Z %g",
];

for (const keyHead of keyHeads) {
	const keyInfo = parseKeyHead(keyHead);
	log(keyInfo);
}

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
