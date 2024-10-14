import { log, logh } from "@/utils/log";
import { clamp } from "@/utils/math";
import memoizee from "memoizee";
import { get } from "node:http";

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

/**
 * Given an array of strings, joins lines together that are not separated
 * by an empty line, except if they begin with a "-". The function will
 * return the cleaned array of lines
 *
 * @param lines The array of strings to clean
 * @returns The array of strings with joined lines
 */
export const joinConnectedLinesWithoutDash = (lines: string[]) => {
	const newLines: string[] = [];

	let currentLine: string[] = [];

	const resetCurrentLine = () => {
		currentLine = [];
	};
	const isCurrentLineEmpty = () => {
		return currentLine.length === 0;
	};

	const addToCurrentLine = (line: string) => {
		currentLine.push(line);
	};

	const joinCurrentLine = () => {
		return currentLine.join(" ");
	};

	for (const line of lines) {
		switch (true) {
			case line === "":
				if (!isCurrentLineEmpty()) {
					newLines.push(joinCurrentLine());
					newLines.push("");
				}
				resetCurrentLine();
				break;
			case line.startsWith("-"):
				if (!isCurrentLineEmpty()) {
					newLines.push(joinCurrentLine());
					resetCurrentLine();
				}
				addToCurrentLine(line);
				break;
			default:
				addToCurrentLine(line);
				break;
		}
	}

	if (!isCurrentLineEmpty()) {
		newLines.push(joinCurrentLine());
	}

	return newLines;
};
/**
 * Given an array of strings, takes each string and word wraps it to a
 * maximum number of characters. The wrapped lines are inserted in place
 * of the original lines.
 *
 * @param lines The array of strings to word wrap
 * @returns The array of strings with word wrapping inserted
 */
export const wordWrapLinesToMaxChars = (
	lines: string[],
	maxChars: number
) => {
	/**
	 * Internal function to wrap a single line of text to a maximum number of
	 * characters by inserting line breaks. The wrapped lines are inserted in
	 * place of the original lines in the array.
	 * @param line The line of text to wrap
	 * @param wrappedLines The array of wrapped lines
	 */
	const wrapLine = (line: string, wrappedLines: string[]) => {
		const words = line.split(" ");
		let currentLine: {
			words: string[];
			charLength: number;
		} = {
			words: [],
			charLength: 0,
		};

		const resetCurrentLine = () => {
			currentLine = {
				words: [],
				charLength: 0,
			};
		};

		const addToCurrentLine = (word: string) => {
			// add 1 for space, but not at start of line
			if (currentLine.words.length > 0) {
				currentLine.charLength += 1;
			}
			currentLine.words.push(word);
			currentLine.charLength += word.length;
		};

		const getCurrentLineString = () => {
			return currentLine.words.join(" ");
		};

		resetCurrentLine();

		for (const word of words) {
			if (currentLine.charLength + word.length > maxChars) {
				wrappedLines.push(getCurrentLineString());
				resetCurrentLine();
			}
			addToCurrentLine(word);
		}
		wrappedLines.push(getCurrentLineString());
	};

	const wrappedLines: string[] = [];
	let i = 0;
	while (i < lines.length) {
		const line = lines[i] as string;
		if (line.length <= maxChars) {
			wrappedLines.push(line);
		} else {
			wrapLine(line, wrappedLines);
		}
		i++;
	}
	return wrappedLines;
};

/**
 * Given an array of strings, removes empty lines from
 * the start and end of the array and returns the
 * resulting array.
 *
 * This function expects lines to be already trimmed of whitespace.
 *
 * @param lines The array of strings
 * @returns The array of strings with empty lines removed
 * from the start and end
 */
export const removeEmptyLinesFromStartAndEnd = (lines: string[]) => {
	let start = 0;
	while (start < lines.length && lines[start] === "") {
		start++;
	}
	let end = lines.length - 1;
	while (end > start && lines[end] === "") {
		end--;
	}

	return lines.slice(start, end + 1);
};

/**
 * Cleans JSDoc description string.
 *
 * Removes JSDoc comment tags and '@param' tags if
 * 'eliminateParams' is true.
 *
 * Also trims lines and removes all empty lines from
 * the start and end of the string.
 *
 * @param description The JSDoc description string
 * @param eliminateParams Remove '@param' tags if true (default: true)
 * @returns The cleaned JSDoc description string
 */
export const cleanJSDocDescription = (
	description: string,
	eliminateParams: boolean = true,
	maxLineLength: number = 80
) => {
	const cleanLine = (line: string) => {
		switch (true) {
			case eliminateParams && line.startsWith("* @param"):
				return "";
			case line.startsWith("/**"):
				return line.slice(3).trim();
			case line.startsWith("*/"):
				return line.slice(2).trim();
			case line.startsWith("*"):
				return line.slice(1).trim();
			default:
				return line.trim();
		}
	};

	let lines = description.split("\n").map(line => {
		return cleanLine(line.trim());
	});

	lines = removeEmptyLinesFromStartAndEnd(lines);

	lines = joinConnectedLinesWithoutDash(lines);

	lines = wordWrapLinesToMaxChars(lines, maxLineLength);
	return lines.join("\n");
};
