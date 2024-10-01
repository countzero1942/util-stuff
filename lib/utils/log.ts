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
	const arg1 = data[0];
	if (arg1 !== undefined && typeof arg1 === "number") {
		logln(arg1);
	} else {
		console.log(...data);
	}
};

/**
 * Log header. Surrounds with lines of same length.
 * @param header The text of the header
 */
export const logh = (header: string) => {
	log();
	const line = "-".repeat(header.length);
	log(line);
	log(header);
	log(line);
};
