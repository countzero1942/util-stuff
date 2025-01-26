import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Str } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";

export const parseDefaultValue = (
	value: StrSlice
): TypeValuePair | NumberErr => {
	const startsWithDigit = /^[+-_ ]*\d/.test(value.value);

	if (startsWithDigit) {
		return parseDefNumber(value);
	}

	return new TypeValuePair(new Str(), value);
};
