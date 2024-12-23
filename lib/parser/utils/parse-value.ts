import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Str } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";
import { StrCharSlice } from "@/utils/slice";

export const parseDefaultValue = (
	value: StrCharSlice
): TypeValuePair<any> | NumberErr => {
	const startsWithDigit = /^[+-_ ]*\d/.test(value.string);

	if (startsWithDigit) {
		return parseDefNumber(value);
	}

	return new TypeValuePair(new Str(), value);
};
