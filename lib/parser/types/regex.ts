///////////////////////////////////////////////////////////////
// Regexes for parsing exponent numbers
///////////////////////////////////////////////////////////////

/**
 * RegExp named-group type for parsing decimal and integer exponential notation
 */
export type RegexExponentNumberGroups = {
	num: string;
	pow: string;
};

/**
 * RegExp for parsing decimal and integer exponential notation
 * with NO separators.
 */
export const regexRPrecZNumExponentNoSeparators =
	/^(?<num>[+-]?(?:[1-9]\d*|[1-9]\d*\.\d*|[0]?\.\d+))(?:[eg])(?<pow>[+-]?\d+)$/;

/**
 * RegExp for parsing decimal exponential notation
 * with separators.
 */
export const regexRPrecExponentWithSeparators =
	/^(?<num>[+-]?(?:[1-9]\d{0,2}(?:_\d{3})*|0)?\.(?:(?:\d{3}_)*\d{1,3})?)(?:[eg])(?<pow>[+-]?\d+)$/;

/**
 * RegExp for parsing integer exponential notation
 * with separators.
 */
export const regexZNumExponentWithSeparators =
	/^(?<num>[+-]?(?:[1-9]\d{0,2}(?:_\d{3})*|0)?)(?:[eg])(?<pow>[+-]?\d+)$/;

///////////////////////////////////////////////////////////////
// Regexes for parsing plain numbers
///////////////////////////////////////////////////////////////

/**
 * RegExp for parsing plain decimal and integer
 * with NO separators.
 */
export const regexRPrecZNumNoSeparators =
	/^[+-]?(?:[1-9]\d*|[1-9]\d*\.\d*|0|[0]?\.\d+)$/;

/**
 * RegExp for parsing plain decimal with separators.
 */
export const regexRPrecWithSeparators =
	/^[+-]?(?:[1-9]\d{0,2}(?:_\d{3})*|0)?\.(?:(?:\d{3}_)*\d{1,3})?$/;

/**
 * RegExp for parsing plain integer with separators.
 */
export const regexZNumWithSeparators =
	/^[+-]?(?:[1-9]\d{0,2}(?:_\d{3})*|0)?$/;

////////////////////////////////////////////////////////////////
// Regexes for validating plain and exponent numbers
////////////////////////////////////////////////////////////////

/**
 * RegExp for has numbers that have an invalid leading zero
 */
export const regexHasInvalidLeadingZero = /^[+-]?(?:0\d|0_)/;

////////////////////////////////////////////////////////////////
// Regexes for validating exponent numbers
////////////////////////////////////////////////////////////////

/**
 * RegExp for valid chars in an RPrec exponent number
 */
export const regexHasValidFormRPrecExponent =
	/^[+-]?[_\w]*\.[_\w]*[eg][+-]?\w+$/;

/**
 * RegExp for valid chars in an ZNum exponent number
 */
export const regexHasValidFormZNumExponent =
	/^[+-]?[_\w]+[eg][+-]?\w+$/;

/**
 * RegExp for valid chars in an RPrec exponent number
 */
export const regexHasValidCharsRPrecExponent =
	/^[+-]?[_.\d]+[eg][+-]?\d+$/;

/**
 * RegExp for valid chars in an ZNum exponent number
 */
export const regexHasValidCharsZNumExponent =
	/^[+-]?[_\d]+[eg][+-]?\d+$/;

/**
 * RegExp for has decimal numbers that have valid digit grouping
 */
export const regexHasValidGroupingRPrecExponent =
	/^[+-]?(?:\d{1,3}(?:_\d{3})*|0)?\.(?:(?:\d{3}_)*\d{0,3})?[eg][+-]?\d+$/;

/**
 * RegExp for integer numbers that have valid grouping.
 */
export const regexHasValidGroupingZNumExponent =
	/^[+-]?\d{1,3}(?:_\d{3})+[eg][+-]?\d+$/;

////////////////////////////////////////////////////////////////
// Regexes for validating plain numbers
////////////////////////////////////////////////////////////////

/**
 * RegExp for valid form in an RPrec number
 */
export const regexHasValidFormRPrec =
	/^[+-]?(?:[_\w]+\.[_\w]*|[_\w]*\.[_\w]+)$/;

/**
 * RegExp for valid form in an ZNum number
 */
export const regexHasValidFormZNum = /^[+-]?[_\w]+$/;

/**
 * RegExp for has valid chars in an RPrec number
 */
export const regexHasValidCharsRPrec = /^[_.+-\d]+$/;

/**
 * RegExp for has valid chars in an ZNum number
 */
export const regexHasValidCharsZNum = /^[_+-\d]+$/;

/**
 * RegExp for has decimal numbers that have valid digit grouping
 */
export const regexHasValidGroupingRPrec =
	/^[+-]?(?:\d{1,3}(?:_\d{3})*|0)?\.(?:(?:\d{3}_)*\d{1,3})?$/;

/**
 * RegExp for integer numbers that have valid grouping.
 */
export const regexHasValidGroupingZNum = /^[+-]?\d{1,3}(?:_\d{3})+$/;
