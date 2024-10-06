import { log } from "node:console";

/**
 * Gets a random integer between min-inclusive and max-inclusive
 *
 * @param minIncl Min integer inclusive
 * @param maxIncl Max integer inclusive
 * @returns Random integer in min-inclusive and max-inclusive
 */
export function randomInteger(minIncl: number, maxIncl: number) {
	return (
		Math.floor(Math.random() * (maxIncl - minIncl + 1)) + minIncl
	);
}

/**
 * Gets a random floating-point Number between min-inclusive
 * and max-exclusive
 *
 * @param minIncl Min real Number inclusive
 * @param maxExcl Max real number exclusive
 * @returns Random floating-point number in min-inclusive and max-exclusive
 */
export function randomNumber(minIncl: number, maxExcl: number) {
	return Math.random() * (maxExcl - minIncl) + minIncl;
}

/**
 * Clamps number within range of min and max.
 *
 * @param num Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped number
 */
export const clamp = (num: number, min: number, max: number) =>
	Math.min(Math.max(num, min), max);

/**
 * Rounds a floating point number to `places` number
 * of fixed decimal places.
 *
 * This function can return floating point errors that are smaller
 * than the number's relative epsilon.
 *
 * Therefore compare these rounded numbers with `areEqual(a, b)`
 * which takes into account floating point errors.
 *
 * Also when converting to string use `toFixed()` function.
 *
 * See also: `precisionRound`
 *
 * @param x The number to round to fixed decimal places
 * @param places The number of decimal places to round to.
 *
 * This number can be positive or negative.
 *
 * It can be used to shift very large and very tiny numbers
 * into the rounding position and back for precision
 * rounding.
 *
 * @returns The fixed-place rounded floating point number
 */
export const fixedRound = (x: number, places: number = 0) => {
	switch (places) {
		case 0:
			return Math.round(x);
		default:
			const pow = Math.pow(10, places);
			return Math.round(x * pow) / pow;
	}
};

/**
 * This function rounds a number according to precision, instead
 * of decimal place.
 *
 * This function can return floating point errors that are smaller
 * than the number's relative epsilon.
 *
 * Therefore compare these rounded numbers with `areEqual(a, b)`
 * which takes into account floating point errors.
 *
 * Also when converting to string use `toPrecision()` function.
 *
 * See also: `fixedRound`
 *
 * @param n The number to be rounded according to precision.
 * @param sigDigits The number of significant digits of precision (max: 15).
 * @returns The rounded number which may include floating point errors.
 * So compare numbers with `areEquals(a,b)` not `a === b`
 */
export function precisionRound(n: number, sigDigits: number) {
	// 123,456,789 -> round(-3) -> 123,456,000
	// num-digs: 9, sig-digs: 6, round: -3
	// sig-digs - num-digs = round
	// 6 - 9 = -3
	// try: num-digs = ceil(log10)
	const clamSigDigits = clamp(sigDigits, 1, 15);
	const numDigits = Math.ceil(Math.log10(n));
	const roundPlaces = clamSigDigits - numDigits;
	return fixedRound(n, roundPlaces);
}

/**
 * Determines is number is zero in 15 digits of precision.
 *
 * This will weed out all floating point errors that are
 * in the 16th digit of precision.
 *
 * @param x The number to compare to zero.
 * @returns True if the number is zero within 15 digits of precision.
 */
function isZero(n: number) {
	// Note: precision rounding can't be used here. Because precision
	// keeps digits according to its power. There is no way to
	// round down to zero in this case.

	// Foating point errors occur in the 16th digit of precision
	// and are within the range of Number.Epsilon. So no need
	// to round to 15 digits of precision. There can be use-cases
	// for such rounded, but they are external to this function.

	// One could round a number according to some fixed decimal place.
	// But this is an external use-case to this function.

	Math.abs(n) < Number.EPSILON;
}

/**
 * Gets the relative epsilon of a number based on its
 * ten-based power.
 *
 * Number.Epsilon only weeds out floating-point errors
 * in: 0.1 <= n <= 1.
 *
 * The relative epsilon is Number.Epsilon shifted to
 * the number's ten-based power.
 *
 * @param n
 * @returns
 */
export function getRelativeEspilon(n: number): number {
	// Number.Epsilon is for 15-prec numbers in: 0.1 <= n < 1
	// So this is for numbers with a 10-based power of -1
	// Therefore ceil is used to shift the -1 power to 0 to
	// preserve the default epsilon
	// And this will also shift all other powers-of-ten and yeild
	// the proper relative epsilon

	// avoid log(0)! Compare against default epsilon in this case

	const log = Math.ceil(Math.log10(n));
	const relEpsilon = 2 * Number.EPSILON * 10 ** log;
	return relEpsilon;
}

/**
 * Determines if two numbers are equal to 15 digit precision.
 *
 * Weeds out floating-point errors in the 16th digit of precision.
 *
 * Method uses a relative Number.Epsilon to determine if
 * two numbers are within this range.
 *
 * Number.Epsilon only works in: 0.1 <= n <= 1. Therefore the relative
 * epsilon is shifted to the 10-based power of the numbers being compared.
 *
 * Note: for very tiny numbers that yeild a relative epsilon of 0, these
 * are considered true. That is, the numbers are indistinct. Only distinct
 * numbers within a full 15-digit precision are not considered equal.
 *
 * @param a First number to be compared
 * @param b Second number to be compared
 * @returns True if numbers are equal within 15 digits of precision.
 */
export function areEqual3(a: number, b: number): boolean {
	// Number.Epsilon is for 15-prec numbers in: 0.1 <= n < 1
	// So this is for numbers with a 10-based power of -1
	// Therefore ceil is used to shift the -1 power to 0 to
	// preserve the default epsilon
	// And this will also shift all other powers-of-ten and yeild
	// the proper relative epsilon

	// avoid log(0)! Compare against default epsilon in this case

	const logA = Math.ceil(Math.log10(a));
	const logB = Math.ceil(Math.log10(b));
	// if (logA !== logB) {
	// 	return false;
	// }
	const relativeEpsilon = 2 * Number.EPSILON * 10 ** logA;
	return relativeEpsilon > 0
		? Math.abs(a - b) < relativeEpsilon
		: true;
}

export function areEqual(a: number, b: number): boolean {
	// Number.Epsilon is for 15-prec numbers in: 0.1 <= n < 1
	// So this is for numbers with a 10-based power of -1
	// Therefore ceil is used to shift the -1 power to 0 to
	// preserve the default epsilon
	// And this will also shift all other powers-of-ten and yeild
	// the proper relative epsilon

	// avoid log(0)! Compare against default epsilon in this case

	switch (true) {
		// simple equality check: checks for 0
		case a === b:
			return true;
		// XOR: if one is zero the other is non-zero
		case a === 0 || b === 0:
			return false;
		// both a and b are non-zero: log(n) is safe
		default:
			const logA = Math.ceil(Math.log10(a));
			const logB = Math.ceil(Math.log10(b));
			// log(`===> a: ${a}, logA: ${logA}`);
			// log(`===> b: ${b}, logA: ${logB}`);
			if (Math.abs(logA - logB) > 1) {
				return false;
			}
			// if (logA !== logB) {
			// 	return false;
			// }
			const logX = Math.max(logA, logB);
			// log(`===> logX: ${logX}`);
			const relativeEpsilon = 2 * Number.EPSILON * 10 ** logX;
			// log(`===> relEps: ${relativeEpsilon}`);
			// log(`===> D(a,b): ${Math.abs(a - b)}`);
			// log(
			// 	`===> D(a,b)/relEps ${Math.round(
			// 		(Math.abs(a - b) / relativeEpsilon) * 100
			// 	)}%`
			// );
			return relativeEpsilon > 0
				? Math.abs(a - b) < relativeEpsilon
				: true;
	}
}
