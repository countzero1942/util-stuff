import { RPrec, TypeBase } from "@/parser/types/type-types";
import { logagn } from "@/utils/log";

type NumberErrorKind =
	| "Invalid sign"
	| "Invalid decimal"
	| "Invalid grouping"
	| "Invalid chars"
	| "Value > max"
	| "Value < min"
	| "Power > max"
	| "Power < min"
	| "RegEx Fail"
	| "Has breaking chars"
	| "NaN"
	| "TODO";

type AnalyzeNumberString = {
	hasSeparator: boolean;
	hasDecimal: boolean;
	hasSign: boolean;
	hasENotation: boolean;
	hasGNotation: boolean;
	hasBreakingChars: boolean;
};

const analyzeNumberString = (
	value: string,
	breakingChars: RegExp = /[ ,;]/
) => {
	const res: AnalyzeNumberString = {
		hasSeparator: false,
		hasDecimal: false,
		hasSign: false,
		hasENotation: false,
		hasGNotation: false,
		hasBreakingChars: false,
	};

	for (let char of value) {
		switch (char) {
			case "_":
				res.hasSeparator = true;
				continue;
			case "-":
			case "+":
				res.hasSign = true;
				continue;
			case ".":
				res.hasDecimal = true;
				continue;
			case "e":
				res.hasENotation = true;
				continue;
			case "g":
				res.hasGNotation = true;
				continue;
			default:
				break;
		}

		if (breakingChars.test(char)) {
			res.hasBreakingChars = true;
			break;
		}
	}

	return res;
};

export type ParseError = {
	type: "ParseError";
	message: string;
};

export type NumberError = {
	type: "NumberError";
	kind: NumberErrorKind;
};

export type TypeValuePair<T> = {
	type: "TypeValuePair";
	valueType: TypeBase;
	value: T;
};

const regexExponentNoSeparators =
	/^(?<num>[+-]?(?:[1-9]\d*|[1-9]\d*\.\d*|[0]?\.\d+))(?<sym>[eg])(?<pow>[+-]?\d+)$/;

const regexExponentWithSeparators =
	/^(?<num>[+-]?(?:[1-9]\d{0,2}(?:_\d{3})*|0)?\.(?:(?:\d{3}_)*\d{1,3})?)(?<sym>[eg])(?<pow>[+-]?\d+)$/;

const MAX_POWER = 307;
const MIN_POWER = -308;

type ExponentGroups = {
	num: string;
	sym: string;
	pow: string;
};

const getExponentRegex = (res: AnalyzeNumberString) => {
	if (res.hasSeparator) {
		return regexExponentWithSeparators;
	} else {
		return regexExponentNoSeparators;
	}
};

export const getPrecisionCount = (numStr: string) => {
	// numStr has no separators

	let precCount = 0;
	for (let char of numStr) {
		// Note: leading zeros are not counted
		//       but middle and trailing zeros are
		//       so ignore all 0s until precCount > 0
		//
		// +0.12030
		// -0.12030
		// 0.12030
		// .012030
		// .00012030

		switch (char) {
			case "+":
			case "-":
			case ".":
				continue;
			case "0":
				if (precCount === 0) {
					continue;
				} else {
					precCount++;
				}
				break;
			default:
				precCount++;
				break;
		}
	}

	return precCount;
};

const getNumberError = (errorKind: NumberErrorKind): NumberError => {
	return {
		type: "NumberError",
		kind: errorKind,
	};
};

export const parseRPrecSciNot = (
	value: string,
	res: AnalyzeNumberString
): TypeValuePair<number> | NumberError => {
	const regex = getExponentRegex(res);

	const match = regex.exec(value);

	if (!match) {
		return {
			type: "NumberError",
			kind: "RegEx Fail",
		};
	}

	const groups = match.groups as ExponentGroups;
	const numStr = res.hasSeparator
		? groups.num.replaceAll("_", "")
		: groups.num;
	const precision = Math.min(getPrecisionCount(numStr), 15);

	const pow = parseInt(groups.pow);
	if (pow > MAX_POWER) {
		return getNumberError("Power > max");
	} else if (pow < MIN_POWER) {
		return getNumberError("Power < min");
	}
	const useEngineeringNotation = res.hasGNotation;

	const finalNumStr = `${numStr}e${groups.pow}`;
	logagn("finalNumStr", finalNumStr);
	const num = Number(finalNumStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN");
	}

	return {
		type: "TypeValuePair",
		valueType: new RPrec(precision, useEngineeringNotation),
		value: num,
	};
};

export const parseZNumSciNot = (
	value: string,
	res: AnalyzeNumberString
) => {};

export const parseNumber = (
	value: string
): TypeValuePair<number> | NumberError => {
	const res = analyzeNumberString(value);
	logagn("analyzeNumberString", res);
	if (res.hasBreakingChars) {
		return {
			type: "NumberError",
			kind: "Has breaking chars",
		};
	}

	switch (true) {
		case (res.hasENotation || res.hasGNotation) && res.hasDecimal:
			return parseRPrecSciNot(value, res);
		default:
			break;
	}

	return getNumberError("TODO");
};
