import {
	NumberErr,
	ParserNumberErr,
} from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Str } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";
import {
	KeyValueBase,
	ParserErrNode,
} from "@/parser/types/key-value";

export const convertParseNumberToHeadVersion = (
	typeValuePairOrErr: TypeValuePair | NumberErr,
	head: KeyValueBase,
	value: StrSlice
) => {
	if (typeValuePairOrErr instanceof NumberErr) {
		return new ParserErrNode(
			new ParserNumberErr(
				head,
				value,
				typeValuePairOrErr // is NumberErr
			),
			head.lineInfo
		);
	}
	return typeValuePairOrErr; // is TypeValuePair
};

export const parseDefaultValue = (
	head: KeyValueBase,
	value: StrSlice
): TypeValuePair | ParserErrNode => {
	const startsWithDigit = /^[+-_ ]*\d/.test(value.value);

	if (startsWithDigit) {
		const typeValuePairOrErr = parseDefNumber(value);
		return convertParseNumberToHeadVersion(
			typeValuePairOrErr,
			head,
			value
		);
		// if (typeValuePairOrErr instanceof NumberErr) {
		// 	return new ParserErrHead(
		// 		new ParserNumberErr(
		// 			head,
		// 			value,
		// 			typeValuePairOrErr // is NumberErr
		// 		),
		// 		head.lineInfo
		// 	);
		// }
		// return typeValuePairOrErr; // is TypeValuePair
	}

	return new TypeValuePair(new Str(), value);
};
