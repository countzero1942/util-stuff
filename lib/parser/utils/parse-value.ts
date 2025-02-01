import {
	NumberErr,
	ParserNumberErr,
} from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Str } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";
import {
	KeyHead,
	ParserErrHead,
} from "@/parser/types/heads";

export const parseDefaultValue = (
	head: KeyHead,
	value: StrSlice
): TypeValuePair | ParserErrHead => {
	const startsWithDigit = /^[+-_ ]*\d/.test(value.value);

	if (startsWithDigit) {
		const typeValuePairOrErr = parseDefNumber(value);
		if (typeValuePairOrErr instanceof NumberErr) {
			return new ParserErrHead(
				new ParserNumberErr(
					head,
					value,
					typeValuePairOrErr // is NumberErr
				),
				head.lineInfo
			);
		}
		return typeValuePairOrErr; // is TypeValuePair
	}

	return new TypeValuePair(new Str(), value);
};
