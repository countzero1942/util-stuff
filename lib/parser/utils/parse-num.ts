import {
	NumberErr,
	NumberErrKind,
} from "@/parser/types/err-types";
import {
	AnalyzeNumberStringReport,
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
	NNum,
	NoNum,
	RFixed,
	RPrec,
	Str,
	TypeBase,
	WNum,
	ZNum,
} from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";

/**
 * Analyze a string representing a number to determine if it has a separator, decimal
 * point, sign, exponentiation, or breaking characters.
 *
 * @param value the string to analyze
 * @param breakingChars a RegExp of characters to stop the analysis at. Defaults to /[ ,;]/
 * @returns an object with flags indicating the presence of each of the above features
 */
export const analyzeNumberString = (
	value: StrSlice,
	breakingChars: string = " ,;:^"
) => {
	const res: AnalyzeNumberStringReport = {};

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
			case 0x5f: // "_":
				continue;
			case 0x30: // "0":
				if (precCount === 0) {
					continue;
				} else {
					precCount++;
				}
				break;
			case 0x65: // "e":
			case 0x67: // "g":
				return precCount;
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
 * @param {AnalyzeNumberStringReport} report - The result of calling analyzeNumberString() on the number string.
 * @return {RegExp} The regex for parsing decimal exponent notation.
 */
const getDecimalExponentRegex = (
	report: AnalyzeNumberStringReport
) => {
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
 * @param {AnalyzeNumberStringReport} report - The result of calling analyzeNumberString() on the number string.
 * @return {RegExp} The regex for parsing integer exponent notation.
 */
const getIntExponentRegex = (
	report: AnalyzeNumberStringReport
) => {
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
 * @param {AnalyzeNumberStringReport} report - The result of calling analyzeNumberString() on the number string.
 * @return {RegExp} The regex for parsing decimal notation.
 */
const getDecimalRegex = (
	report: AnalyzeNumberStringReport
) => {
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
 * @param {AnalyzeNumberStringReport} report - The result of calling analyzeNumberString() on the number string.
 * @return {RegExp} The regex for parsing integer notation.
 */
const getIntRegex = (report: AnalyzeNumberStringReport) => {
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
 * @param {AnalyzeNumberStringReport} report - The result of the analyzeNumberString
 * function.
 * @param {TypeBase} numType - The type of the number that caused the error.
 * @return {NumberErr} The NumberError object.
 */
const getDetailedExponentNumberError = (
	value: string,
	report: AnalyzeNumberStringReport,
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
			return getNumberError(
				"Invalid leading zero",
				numType
			);
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
 * @param {AnalyzeNumberStringReport} report - The result of the analyzeNumberString
 * function.
 * @param {TypeBase} numType - The type of the number that caused the error.
 * @return {NumberErr} The NumberError object.
 */
const getDetailedNumberError = (
	value: string,
	report: AnalyzeNumberStringReport,
	numType: TypeBase
): NumberErr => {
	switch (true) {
		// decimal exponent invalid form
		case report.hasDecimal &&
			!regexHasValidFormRPrec.test(value):
			return getNumberError("Invalid form", numType);
		// integer exponent invalid form
		case !report.hasDecimal &&
			!regexHasValidFormZNum.test(value):
			return getNumberError("Invalid form", numType);
		// decimal exponent invalid chars
		case report.hasDecimal &&
			!regexHasValidCharsRPrec.test(value):
			return getNumberError("Invalid chars", numType);
		// integer exponent invalid chars
		case !report.hasDecimal &&
			!regexHasValidCharsZNum.test(value):
			return getNumberError("Invalid chars", numType);
		// ivalid leading zero
		case regexHasInvalidLeadingZero.test(value):
			return getNumberError(
				"Invalid leading zero",
				numType
			);
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

const parseDefaultRPrecExponent = (
	valueSlice: StrSlice,
	numberStringReport: AnalyzeNumberStringReport
): TypeValuePair | NumberErr => {
	const regex = getDecimalExponentRegex(
		numberStringReport
	);

	const match = regex.exec(valueSlice.value);

	if (!match) {
		return getDetailedExponentNumberError(
			valueSlice.value,
			numberStringReport,
			new RPrec()
		);
	}

	const groups = match.groups as RegexExponentNumberGroups;
	const numStr = numberStringReport.hasSeparator
		? groups.num.replaceAll("_", "")
		: groups.num;
	const precision = Math.min(
		getPrecisionCount(numStr),
		15
	);
	const useEngineeringNotation =
		numberStringReport.hasGNotation;
	const numType = new RPrec(
		precision,
		useEngineeringNotation
	);

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

	return new TypeValuePair(
		numType,
		num,
		valueSlice,
		numberStringReport
	);
};

/**
 * Parses a string as an integer number with an exponent.
 *
 * The returned type is a ZNum type.
 *
 * @param {string} valueSlice - The string to parse.
 * @param {AnalyzeNumberStringReport} numberStringReport - The result of the analyzeNumberString
 * function.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
const parseDefaultZNumExponent = (
	valueSlice: StrSlice,
	numberStringReport: AnalyzeNumberStringReport
): TypeValuePair | NumberErr => {
	const regex = getIntExponentRegex(numberStringReport);

	const match = regex.exec(valueSlice.value);

	if (!match) {
		return getDetailedExponentNumberError(
			valueSlice.value,
			numberStringReport,
			new ZNum()
		);
	}

	const groups = match.groups as RegexExponentNumberGroups;
	const numStr = numberStringReport.hasSeparator
		? groups.num.replaceAll("_", "")
		: groups.num;
	const numType = new ZNum();

	const pow = parseInt(groups.pow);
	if (pow > MAX_POWER) {
		return getNumberError("Power > max", numType);
	} else if (pow < 0) {
		return getNumberError(
			"Power must produce integer",
			numType
		);
	}

	const finalNumStr = `${numStr}e${groups.pow}`;
	const num = Number(finalNumStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN", numType);
	}

	if (!Number.isSafeInteger(num)) {
		return getNumberError("Not safe integer", numType);
	}
	return new TypeValuePair(
		numType,
		num,
		valueSlice,
		numberStringReport
	);
};

/**
 * Parses a string as a decimal number.
 *
 * The returned type is a RPrec type.
 *
 * @param {string} value - The string to parse.
 * @param {AnalyzeNumberStringReport} numberStringReport - The result of the analyzeNumberString
 * function.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
const parseDefaultRPrec = (
	valueSlice: StrSlice,
	numberStringReport: AnalyzeNumberStringReport
): TypeValuePair | NumberErr => {
	const regex = getDecimalRegex(numberStringReport);

	const match = regex.exec(valueSlice.value);

	if (!match) {
		return getDetailedNumberError(
			valueSlice.value,
			numberStringReport,
			new RPrec()
		);
	}

	const numStr = numberStringReport.hasSeparator
		? match[0].replaceAll("_", "")
		: match[0];
	const precision = Math.min(
		getPrecisionCount(numStr),
		15
	);
	const useEngineeringNotation =
		numberStringReport.hasGNotation;
	const numType = new RPrec(
		precision,
		useEngineeringNotation
	);

	const num = Number(numStr);

	if (Number.isNaN(num)) {
		return getNumberError("NaN", numType);
	}

	return new TypeValuePair(
		numType,
		num,
		valueSlice,
		numberStringReport
	);
};

/**
 * Parses a string as an integer number.
 *
 * The returned type is a ZNum type.
 *
 * @param {string} valueSlice - The string to parse.
 * @param {AnalyzeNumberStringReport} numberStringReport - The result of the analyzeNumberString
 * function.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
const parseDefaultZNum = (
	valueSlice: StrSlice,
	numberStringReport: AnalyzeNumberStringReport
): TypeValuePair | NumberErr => {
	const regex = getIntRegex(numberStringReport);

	const match = regex.exec(valueSlice.value);

	if (!match) {
		return getDetailedNumberError(
			valueSlice.value,
			numberStringReport,
			new ZNum()
		);
	}

	const numStr = numberStringReport.hasSeparator
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

	return new TypeValuePair(
		numType,
		num,
		valueSlice,
		numberStringReport
	);
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
 * @param {string} valueSlice - The string to parse.
 * @return {TypeValuePair<number>|NumberErr} The parsed number, or a NumberError
 * if the string is invalid.
 */
export const parseDefNumber = (
	valueSlice: StrSlice
): TypeValuePair | NumberErr => {
	const report = analyzeNumberString(valueSlice);
	if (report.hasBreakingChars) {
		return getNumberError(
			"Invalid number input",
			new NoNum()
		);
	}

	const hasExponent =
		report.hasENotation || report.hasGNotation;

	switch (true) {
		case hasExponent && report.hasDecimal:
			return parseDefaultRPrecExponent(
				valueSlice,
				report
			);
		case hasExponent && !report.hasDecimal:
			return parseDefaultZNumExponent(
				valueSlice,
				report
			);
		case !hasExponent && report.hasDecimal:
			return parseDefaultRPrec(valueSlice, report);
		case !hasExponent && !report.hasDecimal:
			return parseDefaultZNum(valueSlice, report);
		default:
			return getNumberError("NEVER", new NoNum());
	}
};

export const parseZNum = (
	valueSlice: StrSlice
): TypeValuePair | NumberErr => {
	const typeValuePairOrErr = parseDefNumber(valueSlice);
	if (typeValuePairOrErr instanceof NumberErr) {
		return typeValuePairOrErr;
	}
	const typeValuePair = typeValuePairOrErr;
	if (!(typeValuePair.type instanceof ZNum)) {
		return getNumberError(
			"Not an Integer",
			typeValuePair.type
		);
	}
	return typeValuePair.trim();
};

export const parseWNum = (
	valueSlice: StrSlice
): TypeValuePair | NumberErr => {
	const typeValuePairOrErr = parseDefNumber(valueSlice);
	if (typeValuePairOrErr instanceof NumberErr) {
		return typeValuePairOrErr;
	}
	const typeValuePair = typeValuePairOrErr;
	if (!(typeValuePair.type instanceof ZNum)) {
		return getNumberError(
			"Not an Integer",
			typeValuePair.type
		);
	}

	const report = typeValuePair.numberStringReport;
	if (report?.hasSign) {
		return getNumberError(
			"Natural and Whole numbers can't have signs",
			typeValuePair.type
		);
	}

	return new TypeValuePair(
		new WNum(),
		typeValuePair.typeValue
	);
};

export const parseNNum = (
	valueSlice: StrSlice
): TypeValuePair | NumberErr => {
	const typeValuePairOrErr = parseWNum(valueSlice);
	if (typeValuePairOrErr instanceof NumberErr) {
		return typeValuePairOrErr;
	}
	const typeValuePair = typeValuePairOrErr;
	const value = typeValuePair.typeValue as number;
	if (value < 1) {
		return getNumberError(
			"Not a Natural number",
			typeValuePair.type
		);
	}
	return new TypeValuePair(
		new NNum(),
		typeValuePair.typeValue
	);
};

export const parseRPrecNum = (
	valueSlice: StrSlice
): TypeValuePair | NumberErr => {
	const typeValuePairOrErr = parseDefNumber(valueSlice);
	if (typeValuePairOrErr instanceof NumberErr) {
		return typeValuePairOrErr;
	}
	const typeValuePair = typeValuePairOrErr;
	if (typeValuePair.type instanceof RPrec) {
		return typeValuePair.trim();
	}
	return getNumberError(
		"Not a Real precision number",
		typeValuePair.type
	);
};

export const countDecimalPlaces = (
	valueSlice: StrSlice
): number => {
	let decimalPlacesCount = 0;
	let isPastDecimal = false;
	for (
		let i = valueSlice.startIncl;
		i < valueSlice.endExcl;
		i++
	) {
		const charCode = valueSlice.source.charCodeAt(i);
		switch (true) {
			case charCode === 46: // "."
				if (isPastDecimal) {
					return -1;
				}
				isPastDecimal = true;
				break;
			case charCode >= 48 && charCode <= 57: // "0"-"9"
				if (isPastDecimal) {
					decimalPlacesCount++;
				}
				break;
			case charCode === 95: // "_"
			case charCode === 45: // "-"
			case charCode === 43: // "+"
				break;
			default:
				return -1;
		}
	}
	return decimalPlacesCount;
};

export const parseRFixedNum = (
	valueSlice: StrSlice,
	decimalPlaces: number
): TypeValuePair | NumberErr => {
	const MAX_DIGITS = 15;

	const typeValuePairOrErr = parseDefNumber(valueSlice);
	if (typeValuePairOrErr instanceof NumberErr) {
		return typeValuePairOrErr;
	}
	const typeValuePair = typeValuePairOrErr;
	if (!(typeValuePair.type instanceof RPrec)) {
		return getNumberError(
			"Not a Real fixed-place number",
			typeValuePair.type
		);
	}
	const report = typeValuePair.numberStringReport;
	if (report !== undefined) {
		if (report.hasENotation || report.hasGNotation) {
			return getNumberError(
				"Fixed-place can't have exponent",
				typeValuePair.type
			);
		}
	}

	const decimalPlacesCount =
		countDecimalPlaces(valueSlice);
	if (decimalPlacesCount === -1) {
		return getNumberError(
			"Invalid form",
			typeValuePair.type
		);
	}
	if (decimalPlacesCount !== decimalPlaces) {
		return getNumberError(
			"Wrong number of fixed-place digits",
			typeValuePair.type
		);
	}

	const digitsCount = getPrecisionCount(valueSlice.value);
	if (digitsCount > MAX_DIGITS) {
		return getNumberError(
			"Fixed-place number digit count > max safe precision",
			typeValuePair.type
		);
	}

	return new TypeValuePair(
		new RFixed(decimalPlaces),
		typeValuePair.typeValue
	);
};
