import { log, logh } from "@/utils/log";
import { clamp } from "@/utils/math";
import memoizee from "memoizee";

/**
 * Gets string with a number of tabs repeating.
 * Function is memoized with 5s timer.
 *
 * @param numOfTabs The number of tab chars in the string
 */
export const getTabIndentString = memoizee(
	(numOfTabs: number): string => {
		log(`--> Get tab string of size: ${numOfTabs}`);
		return "\t".repeat(numOfTabs);
	},
	{ maxAge: 5000 }
);

/**
 * Converts starting spaces to tabs
 *
 * @param text String to convert
 * @param tabSize Number of spaces per tab
 * @returns Converted string
 */
export const spacesToTabs = (
	text: string,
	tabSize: number
): string => {
	const pattern = `^( {${tabSize}})+`;
	const rx = new RegExp(pattern, "gm");
	const tabbedStr = text.replace(rx, match =>
		getTabIndentString(match.length / tabSize)
	);
	return tabbedStr;
};

/**
 * Searches source string for number of occurences of match string
 *
 * @param source Source string
 * @param match Match to find. (Empty match yields 0.)
 * @param pos Starting position (default: 0). Value is clamped.
 * @returns Number of occurences of match string in source string.
 * Will always be 0 or greater.
 */
export const countOccurencesOf = (
	source: string,
	match: string,
	pos: number = 0
): number => {
	if (match.length == 0) {
		return 0;
	}
	pos = clamp(pos, 0, source.length);
	let count = 0;
	while (true) {
		pos = source.indexOf(match, pos);
		if (pos >= 0) {
			count++;
			pos += match.length;
		} else {
			break;
		}
	}
	return count;
};

/**
 * Splits a string only once, instead of many times
 * with the built in 'split' funciton.
 *
 * @param source The string to split
 * @param split The splitter
 * @returns The readonly array of 2 split strings if splitter
 * found, or 1 string of the original 'source'
 */
export const splitStringOnce = (
	source: string,
	split: string
): readonly string[] => {
	// abc: def
	// 01234567

	const i = source.indexOf(split);
	if (i >= 0) {
		const left = source.slice(0, i);
		const right = source.slice(i + split.length);
		const arr = [left, right];
		return arr;
	} else {
		const arr = [source];
		return arr;
	}
};

/**
 * Formats number according to:
 *
 * ```ts
 * export const formatNum = (x: number) => {
 *	   return Intl.NumberFormat().format(x);
 * };
 * ```
 * @param n Number to format
 * @returns String format of 'n'
 */
export const formatNum = (n: number) => {
	return Intl.NumberFormat().format(n);
};
