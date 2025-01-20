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

export const isCodePointWhiteSpace = (codePoint: number) => {
	if (codePoint < 0x1680) {
		if (codePoint <= 0x20) {
			switch (codePoint) {
				case 0x20:
				case 0x0d:
				case 0x0a:
				case 0x09:
				case 0x0c:
				case 0x0b:
					return true;
				default:
					return false;
			}
		}
		if (codePoint === 0xa0) {
			return true;
		}
		return false;
	} else {
		switch (codePoint) {
			case 0x1680:
			case 0x2000:
			case 0x200a:
			case 0x2028:
			case 0x2029:
			case 0x202f:
			case 0x205f:
			case 0x3000:
			case 0xfeff:
				return true;
			default:
				return false;
		}
	}
};

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

export const formatTabsToSymbols = (value: string) => {
	return value.replaceAll("\t", "\\t");
};

/**
 * Given an array of strings, joins lines together that are not separated
 * by an empty line, except if they begin with a "-". The function will
 * return the cleaned array of lines
 *
 * This is for comments that have paragraph text broken up for
 * readability that needs to be joined back together for word wrapping.
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
 * If a string contains multiple spaces in between words,
 * returns a cleaned string with all multiple spaces removed.
 *
 * Otherwise, returns the original string.
 *
 * @param line The string to clean
 * @returns The cleaned string
 */
export const cleanLineOfMultipleSpaces = (line: string) => {
	const doMultipleSpacesExistInLine = (text: string): boolean => {
		return /\s{2,}/g.test(text);
	};

	line = line.trim();

	if (doMultipleSpacesExistInLine(line)) {
		const words = line.split(/\s+/);
		return words.join(" ");
	}
	return line;
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

		const joinCurrentLine = () => {
			return currentLine.words.join(" ");
		};

		resetCurrentLine();

		for (const word of words) {
			if (currentLine.charLength + word.length > maxChars) {
				wrappedLines.push(joinCurrentLine());
				resetCurrentLine();
			}
			addToCurrentLine(word);
		}
		wrappedLines.push(joinCurrentLine());
	};

	const wrappedLines: string[] = [];
	let i = 0;
	while (i < lines.length) {
		const line = cleanLineOfMultipleSpaces(lines[i] as string);
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
	const cleanLineOfCommentTags = (line: string) => {
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
		return cleanLineOfCommentTags(line.trim());
	});

	lines = removeEmptyLinesFromStartAndEnd(lines);

	lines = joinConnectedLinesWithoutDash(lines);

	lines = wordWrapLinesToMaxChars(lines, maxLineLength);

	return lines.join("\n");
};

export const getRepeatingMatchesCount = (
	source: string,
	match: string,
	index: number = 0
) => {
	// abcabc
	// 0123456
	// l = 6 - 3 + 1 = 4
	if (match.length === 0) return 0;
	let i = index;
	let count = 0;
	const length = source.length - match.length + 1;
	while (i < length) {
		if (source.startsWith(match, i)) {
			i += match.length;
			count++;
		} else {
			break;
		}
	}
	return count;
};

export const getMinTabCharsCount = (
	lines: string[],
	tabString: string = "\t"
) => {
	let minTabCharsCount = Number.MAX_SAFE_INTEGER;
	for (const line of lines) {
		if (line === "") continue;
		const tabCharsCount = getRepeatingMatchesCount(line, tabString);
		minTabCharsCount = Math.min(minTabCharsCount, tabCharsCount);
	}
	return minTabCharsCount === Number.MAX_SAFE_INTEGER
		? 0
		: minTabCharsCount;
};

export const cleanMultiLineArray = (
	lines: string[],
	tabString: string = "\t"
) => {
	lines = removeEmptyLinesFromStartAndEnd(lines);

	const minTabCharsCount = getMinTabCharsCount(lines, tabString);

	lines = lines.map(line => {
		if (line === "") return "";
		const tabCharsCount = getRepeatingMatchesCount(line, tabString);

		if (tabCharsCount >= minTabCharsCount) {
			return line.slice(minTabCharsCount * tabString.length);
		}
		return line;
	});

	return lines;
};

export const cleanMultiLineString = (
	multiLineString: string,
	tabString: string = "\t"
) => {
	let lines = multiLineString
		.split("\n")
		.map(line => line.trimEnd());

	lines = cleanMultiLineArray(lines, tabString);

	return lines.join("\n");
};
