/**
 * Log Line
 *
 * @param length The length of the dividing line
 * @returns
 */
export const logln = (length: number = 20) =>
	console.log("-".repeat(length));

/**
 * Calls 'console.log'. If a single number is given,
 * a line will be drawn of that length.
 *
 * @param data The args to log, or if a single number, a line.
 */
export const log = (...data: any) => {
	console.log(...data);
};

/**
 * Log header. Surrounds with lines of same length.
 * @param header The text of the header
 */
export const logh = (header: string) => {
	const line = "-".repeat(header.length);
	log(line);
	log(header);
	log(line);
};

/**
 * Quick line
 */
export const div = () => {
	logln(40);
};
