import { NumberErr, NumberErrKind } from "@/parser/types/err-types";
import {
	AnalyzeNumberString,
	TypeValuePair,
} from "@/parser/types/parse-types";
import {
	regexRPrecExponentWithSeparators,
	regexRPrecZNumExponentNoSeparators,
	RegexExponentNumberGroups,
	regexHasInvalidLeadingZero,
	regexHasValidGroupingRPrecExponent,
	regexHasValidGroupingZNumExponent,
	regexHasValidCharsRPrecExponent,
	regexHasValidFormRPrecExponent,
	regexHasValidCharsZNumExponent,
	regexHasValidFormZNumExponent,
	regexZNumExponentWithSeparators,
	regexHasValidFormRPrec,
	regexHasValidFormZNum,
	regexHasValidCharsRPrec,
	regexHasValidCharsZNum,
	regexHasValidGroupingZNum,
	regexHasValidGroupingRPrec,
	regexRPrecWithSeparators,
	regexRPrecZNumNoSeparators,
	regexZNumWithSeparators,
} from "@/parser/types/regex";
import {
	NoNum,
	RPrec,
	Str,
	TypeBase,
	ZNum,
} from "@/parser/types/type-types";
import { StrCharSlice } from "@/utils/slice";

/**
 * Analyze a string representing a number to determine if it has a separator, decimal
 * point, sign, exponentiation, or breaking characters.
 *
 * @param value the string to analyze
 * @param breakingChars a RegExp of characters to stop the analysis at. Defaults to /[ ,;]/
 * @returns an object with flags indicating the presence of each of the above features
 */
const analyzeNumberString = (
	value: StrCharSlice,
	breakingChars: string = " ,;"
) => {
	const res: AnalyzeNumberString = {
		hasSeparator: false,
		hasDecimal: false,
		hasSign: false,
		hasENotation: false,
		hasGNotation: false,
		hasBreakingChars: false,
	};

	for (let i = value.startIncl; i < value.endExcl; i++) {
		const code = value.source.charCodeAt(i);
		switch (code) {
			case 0x5f: // "_":
				res.hasSeparator = true;
				continue;
			case 0x2d: // "-":
			case 0x2b: // "+":
				res.hasSign = true;
				continue;
			case 0x2e: // ".":
				res.hasDecimal = true;
				continue;
			case 0x65: // "e":
				res.hasENotation = true;
				continue;
			case 0x67: // "g":
				res.hasGNotation = true;
				continue;
			default:
				break;
		}

		for (let j = 0; j < breakingChars.length; j++) {
			if (code === breakingChars.charCodeAt(j)) {
				res.hasBreakingChars = true;
				break;
			}
		}
	}

	return res;
};

/**
 * @description
 * Returns the precision count of a number string with no separators.
 *
 * Leading zeros are not counted, but middle and trailing zeros are.
 * So ignore all 0s until precCount > 0
 *
 * Examples:
 *	+0.12030 => 5
 *	-0.12030 => 5
 *	0.12030 => 5
 *	.012030 => 5
 *	.00012030 => 5
 *
 * @param {string} numStr - The string of a number with no separators.
 * @returns {number} The precision count of the number string.
 */
export const getPrecisionCount = (numStr: string) => {
	// numStr has no separators

	let precCount = 0;
	for (let i = 0; i < numStr.length; i++) {
		// Note: leading zeros are not counted
		//       but middle and trailing zeros are
		//       so ignore all 0s until precCount > 0
		//
		// +0.12030
		// -0.12030
		// 0.12030
		// .012030
		// .00012030
		const code = numStr.charCodeAt(i);

		switch (code) {
			case 0x2b: // "+":
			case 0x2d: // "-":
			case 0x2e: // ".":
				continue;
			case 0x30: // "0":
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

/**
 * Max exponent power of a 64-bit floating-point number => 10^307
 */
const MAX_POWER = 307;

/**
 * Min exponent power of a 64-bit floating-point number => 10^-308
 */
const MIN_POWER = -308;

/**
 * Returns the appropriate regex for parsing decimal exponent notation
 * given the presence/absence of a separator.
 *
 * @param {AnalyzeNumberString} report - The result of calling analyzeNumberString() on the number string.
 * @return {RegExp} The regex for parsing decimal exponent notation.
 */
const getDecimalExponentRegex = (report: AnalyzeNumberString) => {
	if (report.hasSeparator) {
		return regexRPrecExponentWithSeparators;
	} else {
		return regexRPrecZNumExponentNoSeparators;
	}
};

/**
 * Returns the appropriate regex for parsing integer exponent notation
 * given the presence/absence of a separator.
 *
 * @param {AnalyzeNumberString} report - The result of calling analyzeNumberString() on the number string.
 * @return {RegExp} The regex for parsing integer exponent notation.
 */
const getIntExponentRegex = (report: AnalyzeNumberString) => {
	if (report.hasSeparator) {
		return regexZNumExponentWithSeparators;
	} else {
		return regexRPrecZNumExponentNoSeparators;
	}
};

/**
 * Returns the appropriate regex for parsing a plain decimal number
 * given the presence/absence of a separator.
 *
 * @param {AnalyzeNumberString} report - The result of calling analyzeNumberString() on the number string.
 * @return {RegExp} The regex for parsing decimal notation.
 */
const getDecimalRegex = (report: AnalyzeNumberString) => {
	if (report.hasSeparator) {
		return regexRPrecWithSeparators;
	} else {
		return regexRPrecZNumNoSeparators;
	}
};

/**
 * Returns the appropriate regex for parsing a plain integer number
 * given the presence/absence of a separator.
 *
 * @param {AnalyzeNumberString} report - The result of calling analyzeNumberString() on the number string.
 * @return {RegExp} The regex for parsing integer notation.
 */
const getIntRegex = (report: AnalyzeNumberString) => {
	if (report.hasSeparator) {
		return regexZNumWithSeparators;
	} else {
		return regexRPrecZNumNoSeparators;
	}
};

/**
 * Creates a NumberError object from the given error kind and number type.
 *
 * @param {NumberErrKind} errorKind - The type of error.
 * @param {TypeBase} numType - The type of the number that caused the error.
 * @return {NumberErr} The NumberError object.
 */
const getNumberError = (
	errorKind: NumberErrKind,
	numType: TypeBase
): NumberErr => {
	return new NumberErr(numType, errorKind);
};

/**
 * Returns true if the given string has exactly one valid exponent character.
 *
 * Valid exponent characters are "e" and "g".
 *
 * @param {string} value - The string to check.
 * @return {boolean} True if the string has exactly one valid exponent character, false otherwise.
 */
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

/**
 * Returns a NumberError object based on the given value and report.
 *
 * The possible error kinds are:
 * - Invalid exponent
 * - Invalid form
 * - Invalid chars
 * - Invalid leading zero
 * - Invalid grouping
 * - Invalid number
 *
 * The function tests the given value against a series of regular
 * expressions to determine the error kind.
 *
 * @param {string} value - The string to test.
 * @param {AnalyzeNumberString} report - The result of the analyzeNumberString
 * function.
 * @param {TypeBase} numType - The type of the number that caused the error.
 * @return {NumberErr} The NumberError object.
 */
const getDetailedExponentNumberError = (
	value: string,
	report: AnalyzeNumberString,
	numType: TypeBase
): NumberErr => {
	switch (true) {
		case !hasValidExponentChar(value):
			return getNumberError("Invalid exponent", numType);
		// decimal exponent invalid form
		case report.hasDecimal &&
			!regexHasValidFormRPrecExponent.test(value):
			return getNumberError("Invalid form", numType);
		// integer exponent invalid form
		case !report.hasDecimal &&
			!regexHasValidFormZNumExponent.test(value):
			return getNumberError("Invalid form", numType);
		// decimal exponent invalid chars
		case report.hasDecimal &&
			!regexHasValidCharsRPrecExponent.test(value):
			return getNumberError("Invalid chars", numType);
		// integer exponent invalid chars
		case !report.hasDecimal &&
			!regexHasValidCharsZNumExponent.test(value):
			return getNumberError("Invalid chars", numType);
		// ivalid leading zero
		case regexHasInvalidLeadingZero.test(value):
			return getNumberError("Invalid leading zero", numType);
		// invalid decimal grouping
		case report.hasSeparator &&
			report.hasDecimal &&
			!regexHasValidGroupingRPrecExponent.test(value):
			return getNumberError("Invalid grouping", numType);
		// invalid integer grouping
		case report.hasSeparator &&
			!report.hasDecimal &&
			!regexHasValidGroupingZNumExponent.test(value):
			return getNumberError("Invalid grouping", numType);
		// invalid number
		default:
			return getNumberError("Invalid number", numType);
	}
};

/**
 * Returns a NumberError object based on the given value and report.
 *
 * The possible error kinds are:
 * - Invalid form
 * - Invalid chars
 * - Invalid leading zero
 * - Invalid grouping
 * - Invalid number
 *
 * The function tests the given value against a series of regular
 * expressions to determine the error kind.
 *
 * @param {string} value - The string to test.
 * @param {AnalyzeNumberString} report - The result of the analyzeNumberString
 * function.
 * @param {TypeBase} numType - The type of the number that caused the error.
 * @return {NumberErr} The NumberError object.
 */
const getDetailedNumberError = (
	value: string,
	report: AnalyzeNumberString,
	numType: TypeBase
): NumberErr => {
	switch (true) {
		// decimal exponent invalid form
		case report.hasDecimal && !regexHasValidFormRPrec.test(value):
			return getNumberError("Invalid form", numType);
		// integer exponent invalid form
		case !report.hasDecimal && !regexHasValidFormZNum.test(value):
			return getNumberError("Invalid form", numType);
		// decimal exponent invalid chars
		case report.hasDecimal && !regexHasValidCharsRPrec.test(value):
			return getNumberError("Invalid chars", numType);
		// integer exponent invalid chars
		case !report.hasDecimal && !regexHasValidCharsZNum.test(value):
			return getNumberError("Invalid chars", numType);
		// ivalid leading zero
		case regexHasInvalidLeadingZero.test(value):
			return getNumberError("Invalid leading zero", numType);
		// invalid decimal grouping
		case report.hasSeparator &&
			report.hasDecimal &&
			!regexHasValidGroupingRPrec.test(value):
			return getNumberError("Invalid grouping", numType);
		// invalid integer grouping
		case report.hasSeparator &&
			!report.hasDecimal &&
			!regexHasValidGroupingZNum.test(value):
			return getNumberError("Invalid grouping", numType);
		// invalid number
		default:
			return getNumberError("Invalid number", numType);
	}
};

/**
 * Parses a string as a decimal number with an exponent.
 *
 * The returned type is a RPrec type.
 *
 * @param {string} value - The string to parse.
 * @param {AnalyzeNumberString} report - The result of the analyzeNumberString
 * function.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
export const parseRPrecExponent = (
	value: string,
	report: AnalyzeNumberString
): TypeValuePair<number> | NumberErr => {
	const regex = getDecimalExponentRegex(report);

	const match = regex.exec(value);

	if (!match) {
		return getDetailedExponentNumberError(
			value,
			report,
			new RPrec()
		);
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
	const num = Number(finalNumStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN", numType);
	}

	return new TypeValuePair<number>(numType, num);
};

/**
 * Parses a string as an integer number with an exponent.
 *
 * The returned type is a ZNum type.
 *
 * @param {string} value - The string to parse.
 * @param {AnalyzeNumberString} report - The result of the analyzeNumberString
 * function.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
export const parseZNumExponent = (
	value: string,
	res: AnalyzeNumberString
): TypeValuePair<number> | NumberErr => {
	const regex = getIntExponentRegex(res);

	const match = regex.exec(value);

	if (!match) {
		return getDetailedExponentNumberError(value, res, new ZNum());
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
	const num = Number(finalNumStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN", numType);
	}

	if (!Number.isSafeInteger(num)) {
		return getNumberError("Not safe integer", numType);
	}
	return new TypeValuePair<number>(numType, num);
};

/**
 * Parses a string as a decimal number.
 *
 * The returned type is a RPrec type.
 *
 * @param {string} value - The string to parse.
 * @param {AnalyzeNumberString} report - The result of the analyzeNumberString
 * function.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
export const parseRPrec = (
	value: string,
	report: AnalyzeNumberString
): TypeValuePair<number> | NumberErr => {
	const regex = getDecimalRegex(report);

	const match = regex.exec(value);

	if (!match) {
		return getDetailedNumberError(value, report, new RPrec());
	}

	const numStr = report.hasSeparator
		? match[0].replaceAll("_", "")
		: match[0];
	const precision = Math.min(getPrecisionCount(numStr), 15);
	const useEngineeringNotation = report.hasGNotation;
	const numType = new RPrec(precision, useEngineeringNotation);

	const num = Number(numStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN", numType);
	}

	return new TypeValuePair<number>(numType, num);
};

/**
 * Parses a string as an integer number.
 *
 * The returned type is a ZNum type.
 *
 * @param {string} value - The string to parse.
 * @param {AnalyzeNumberString} res - The result of the analyzeNumberString
 * function.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
export const parseZNum = (
	value: string,
	res: AnalyzeNumberString
): TypeValuePair<number> | NumberErr => {
	const regex = getIntRegex(res);

	const match = regex.exec(value);

	if (!match) {
		return getDetailedNumberError(value, res, new ZNum());
	}

	const numStr = res.hasSeparator
		? match[0].replaceAll("_", "")
		: match[0];
	const numType = new ZNum();

	const num = Number(numStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN", numType);
	}

	if (!Number.isSafeInteger(num)) {
		return getNumberError("Not safe integer", numType);
	}

	return new TypeValuePair<number>(numType, num);
};

/**
 * Parses a string as a number.
 *
 * The returned type is either a ZNum, RPrec, or a NumberError.
 *
 * Can parse: decimal or integer exponent notation number
 * OR plain integer or decimal number.
 *
 * The possible kinds of NumberError are:
 * - Invalid number input
 * - Invalid form
 * - Invalid chars
 * - Invalid leading zero
 * - Invalid grouping
 * - Invalid number
 * - Power > max
 * - Power < min
 * - NaN
 * - Not safe integer
 *
 * The function tests the given value against a series of regular
 * expressions to determine the error kind.
 *
 * @param {string} value - The string to parse.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
export const parseDefNumber = (
	value: StrCharSlice
): TypeValuePair<number> | NumberErr => {
	const report = analyzeNumberString(value);
	if (report.hasBreakingChars) {
		return getNumberError("Invalid number input", new NoNum());
	}

	const hasExponent = report.hasENotation || report.hasGNotation;

	const valueStr = value.string;

	switch (true) {
		case hasExponent && report.hasDecimal:
			return parseRPrecExponent(valueStr, report);
		case hasExponent && !report.hasDecimal:
			return parseZNumExponent(valueStr, report);
		case !hasExponent && report.hasDecimal:
			return parseRPrec(valueStr, report);
		case !hasExponent && !report.hasDecimal:
			return parseZNum(valueStr, report);
		default:
			return getNumberError("NEVER", new NoNum());
	}
};
