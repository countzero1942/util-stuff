import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Str } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";

export const parseDefaultValue = (
	value: string
): TypeValuePair<any> | NumberErr => {
	const startsWithDigit = /^[+-]?\d/.test(value);

	if (startsWithDigit) {
		return parseDefNumber(value);
	}

	return new TypeValuePair(new Str(), value);
};
