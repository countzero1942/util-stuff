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
export const regexDecIntExponentNoSeparators =
	/^(?<num>[+-]?(?:[1-9]\d*|[1-9]\d*\.\d*|[0]?\.\d+))(?:[eg])(?<pow>[+-]?\d+)$/;

/**
 * RegExp for parsing decimal exponential notation
 * with separators.
 */
export const regexDecExponentWithSeparators =
	/^(?<num>[+-]?(?:[1-9]\d{0,2}(?:_\d{3})*|0)?\.(?:(?:\d{3}_)*\d{1,3})?)(?:[eg])(?<pow>[+-]?\d+)$/;

/**
 * RegExp for parsing integer exponential notation
 * with separators.
 */
export const regexIntExponentWithSeparators =
	/^(?<num>[+-]?(?:[1-9]\d{0,2}(?:_\d{3})*|0)?)(?:[eg])(?<pow>[+-]?\d+)$/;

/**
 * RegExp for valid chars in an RPrec exponent number
 */
export const regexRPrecExponentValidChars = /^[1-9.+-e]+$/;

/**
 * RegExp for valid chars in an RPrec number
 */
export const regexRPrecValidChars = /^[1-9.+-]+$/;

/**
 * RegExp for valid chars in an ZNum exponent number
 */
export const regexZNumExponentValidChars = /^[1-9+-e]+$/;

/**
 * RegExp for valid chars in an ZNum number
 */
export const regexZNumValidChars = /^[1-9+-]+$/;
