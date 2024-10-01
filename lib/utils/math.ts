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
 * Rounds a floating point number to 'places' number
 * of decimal places
 * @param x The number to round
 * @param places The number of decimal places to round to
 * @returns The rounded floating point number
 */
export const round = (x: number, places: number = 0) => {
	switch (places) {
		case 0:
			return Math.round(x);
		default:
			const pow = Math.pow(10, places);
			return Math.round(x * pow) / pow;
	}
};
