import {
	AnalyzeNumberString,
	NumberError,
	NumberErrorKind,
	TypeValuePair,
} from "@/parser/types/parse-types";
import {
	regexDecExponentWithSeparators,
	regexDecIntExponentNoSeparators,
	RegexExponentNumberGroups,
	regexHasInvalidLeadingZero,
	regexHasValidDecimalGrouping,
	regexHasValidIntegerGrouping,
	regexHasValidRPrecExponentChars,
	regexHasValidRPrecExponentForm,
	regexHasValidZNumExponentChars,
	regexHasValidZNumExponentForm,
	regexIntExponentWithSeparators,
} from "@/parser/types/regex";
import {
	NoNum,
	RPrec,
	TypeBase,
	ZNum,
} from "@/parser/types/type-types";
import { logagn } from "@/utils/log";
import { count } from "node:console";

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

const MAX_POWER = 307;
const MIN_POWER = -308;

const getDecimalExponentRegex = (res: AnalyzeNumberString) => {
	if (res.hasSeparator) {
		return regexDecExponentWithSeparators;
	} else {
		return regexDecIntExponentNoSeparators;
	}
};

const getIntExponentRegex = (res: AnalyzeNumberString) => {
	if (res.hasSeparator) {
		return regexIntExponentWithSeparators;
	} else {
		return regexDecIntExponentNoSeparators;
	}
};

const getNumberError = (
	errorKind: NumberErrorKind,
	numType: TypeBase
): NumberError => {
	return {
		type: "NumberError",
		numType,
		kind: errorKind,
	};
};

const hasValidExponentChar = (value: string) => {
	let count = 0;
	for (let char of value) {
		switch (char) {
			case "e":
			case "g":
				count++;
				break;
			default:
				break;
		}
	}

	return count === 1;
};

const getDetailedNumberError = (
	value: string,
	report: AnalyzeNumberString,
	numType: TypeBase
): NumberError => {
	switch (true) {
		case !hasValidExponentChar(value):
			return getNumberError("Invalid exponent", numType);
		// decimal exponent invalid form
		case report.hasDecimal &&
			!regexHasValidRPrecExponentForm.test(value):
			return getNumberError("Invalid form", numType);
		// integer exponent invalid form
		case !report.hasDecimal &&
			!regexHasValidZNumExponentForm.test(value):
			return getNumberError("Invalid form", numType);
		// decimal exponent invalid chars
		case report.hasDecimal &&
			!regexHasValidRPrecExponentChars.test(value):
			return getNumberError("Invalid chars", numType);
		// integer exponent invalid chars
		case !report.hasDecimal &&
			!regexHasValidZNumExponentChars.test(value):
			return getNumberError("Invalid chars", numType);
		// ivalid leading zero
		case regexHasInvalidLeadingZero.test(value):
			return getNumberError("Invalid leading zero", numType);
		// invalid decimal grouping
		case report.hasSeparator &&
			report.hasDecimal &&
			!regexHasValidDecimalGrouping.test(value):
			return getNumberError("Invalid grouping", numType);
		// invalid integer grouping
		case report.hasSeparator &&
			!report.hasDecimal &&
			!regexHasValidIntegerGrouping.test(value):
			return getNumberError("Invalid grouping", numType);
		// invalid number
		default:
			return getNumberError("Invalid number", numType);
	}
};

export const parseRPrecExponent = (
	value: string,
	report: AnalyzeNumberString
): TypeValuePair<number> | NumberError => {
	const regex = getDecimalExponentRegex(report);

	const match = regex.exec(value);

	if (!match) {
		return getDetailedNumberError(value, report, new RPrec());
	}

	const groups = match.groups as RegexExponentNumberGroups;
	const numStr = report.hasSeparator
		? groups.num.replaceAll("_", "")
		: groups.num;
	const precision = Math.min(getPrecisionCount(numStr), 15);
	const useEngineeringNotation = report.hasGNotation;
	const numType = new RPrec(precision, useEngineeringNotation);

	const pow = parseInt(groups.pow);
	if (pow > MAX_POWER) {
		return getNumberError("Power > max", numType);
	} else if (pow < MIN_POWER) {
		return getNumberError("Power < min", numType);
	}

	const finalNumStr = `${numStr}e${groups.pow}`;
	logagn("finalNumStr", finalNumStr);
	const num = Number(finalNumStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN", numType);
	}

	return {
		type: "TypeValuePair",
		valueType: numType,
		value: num,
	};
};

export const parseZNumExponent = (
	value: string,
	res: AnalyzeNumberString
): TypeValuePair<number> | NumberError => {
	const regex = getIntExponentRegex(res);

	const match = regex.exec(value);

	if (!match) {
		return getDetailedNumberError(value, res, new ZNum());
	}

	const groups = match.groups as RegexExponentNumberGroups;
	const numStr = res.hasSeparator
		? groups.num.replaceAll("_", "")
		: groups.num;
	const numType = new ZNum();

	const pow = parseInt(groups.pow);
	if (pow > MAX_POWER) {
		return getNumberError("Power > max", numType);
	} else if (pow < 0) {
		return getNumberError("Power must produce integer", numType);
	}

	const finalNumStr = `${numStr}e${groups.pow}`;
	logagn("finalNumStr", finalNumStr);
	const num = Number(finalNumStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN", numType);
	}

	if (!Number.isSafeInteger(num)) {
		return getNumberError("Not safe integer", numType);
	}

	return {
		type: "TypeValuePair",
		valueType: new ZNum(),
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
		return getNumberError("Invalid number input", new NoNum());
	}

	const hasExponent = res.hasENotation || res.hasGNotation;

	switch (true) {
		case hasExponent && res.hasDecimal:
			return parseRPrecExponent(value, res);
		case hasExponent && !res.hasDecimal:
			return parseZNumExponent(value, res);
		default:
			break;
	}

	return getNumberError("TODO", new NoNum());
};
