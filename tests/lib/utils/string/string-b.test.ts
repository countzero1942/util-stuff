import {
	getTabIndentString,
	isCodePointLoneSurrogate,
	isCodePointWhiteSpace,
	getCodePointCharLength,
	spacesToTabs,
	countOccurencesOf,
	splitStringOnce,
	formatNum,
	formatTabsToSymbols,
	joinConnectedLinesWithoutDash,
	wordWrapLinesToMaxChars,
	cleanJSDocDescription,
	cleanMultiLineArray,
	cleanMultiLineStringToArray,
	isCodePointValid,
} from "@/utils/string";

describe("getTabIndentString", () => {
	it("returns correct number of tabs", () => {
		expect(getTabIndentString(0)).toBe("");
		expect(getTabIndentString(1)).toBe("\t");
		expect(getTabIndentString(3)).toBe("\t\t\t");
	});
});

describe("isLoneSurrogate", () => {
	it("detects lone surrogates", () => {
		expect(isCodePointLoneSurrogate(0xd800)).toBe(true);
		expect(isCodePointLoneSurrogate(0xdfff)).toBe(true);
		expect(isCodePointLoneSurrogate(0xd7ff)).toBe(false);
		expect(isCodePointLoneSurrogate(0xe000)).toBe(false);
	});
});

describe("isCodePointValid", () => {
	it("detects valid code points", () => {
		expect(isCodePointValid(0x0000)).toBe(true);
		expect(isCodePointValid(0x10ffff)).toBe(true);
		expect(isCodePointValid(0x110000)).toBe(false);
		expect(isCodePointValid(-1)).toBe(false);
		expect(isCodePointValid(0xd7ff)).toBe(true);
		expect(isCodePointValid(0xd800)).toBe(false);
		expect(isCodePointValid(0xdfff)).toBe(false);
		expect(isCodePointValid(0xe000)).toBe(true);
	});
});

describe("isCodePointWhiteSpace", () => {
	it("detects ASCII whitespace", () => {
		expect(isCodePointWhiteSpace(0x20)).toBe(true); // space
		expect(isCodePointWhiteSpace(0x0a)).toBe(true); // LF
		expect(isCodePointWhiteSpace(0x09)).toBe(true); // tab
		expect(isCodePointWhiteSpace(0x41)).toBe(false); // 'A'
	});
	it("detects Unicode whitespace", () => {
		expect(isCodePointWhiteSpace(0x1680)).toBe(true);
		expect(isCodePointWhiteSpace(0x2000)).toBe(true);
		expect(isCodePointWhiteSpace(0x2028)).toBe(true);
		expect(isCodePointWhiteSpace(0x3000)).toBe(true);
		expect(isCodePointWhiteSpace(0x1234)).toBe(false);
	});
});

describe("getCodePointCharLength", () => {
	it("returns 1 for BMP", () => {
		expect(getCodePointCharLength(0x41)).toBe(1); // 'A'
		expect(getCodePointCharLength(0xd7ff)).toBe(1);
	});
	it("returns 2 for astral code points", () => {
		expect(getCodePointCharLength(0x10000)).toBe(2);
		expect(getCodePointCharLength(0x1f600)).toBe(2); // 😀
	});
});

describe("spacesToTabs", () => {
	it("converts leading spaces to tabs", () => {
		expect(spacesToTabs("    foo", 4)).toBe("\tfoo");
		expect(spacesToTabs("        bar", 4)).toBe(
			"\t\tbar"
		);
		expect(spacesToTabs("  baz", 2)).toBe("\tbaz");
	});
	it("does not convert spaces in middle", () => {
		expect(spacesToTabs("foo    bar", 4)).toBe(
			"foo    bar"
		);
	});
});

describe("countOccurencesOf", () => {
	it("counts occurrences of substring", () => {
		expect(countOccurencesOf("abcabcabc", "abc")).toBe(3);
		expect(countOccurencesOf("aaaa", "aa")).toBe(2);
	});
	it("returns 0 for empty match", () => {
		expect(countOccurencesOf("foo", "")).toBe(0);
	});
	it("respects start position", () => {
		expect(countOccurencesOf("abcabcabc", "abc", 3)).toBe(
			2
		);
		expect(countOccurencesOf("abcabcabc", "abc", 9)).toBe(
			0
		);
	});
});

describe("splitStringOnce", () => {
	it("splits at first occurrence", () => {
		expect(splitStringOnce("a:b:c", ":")).toEqual([
			"a",
			"b:c",
		]);
		expect(splitStringOnce("foo=bar", "=")).toEqual([
			"foo",
			"bar",
		]);
	});
	it("returns original if splitter not found", () => {
		expect(splitStringOnce("foobar", ":")).toEqual([
			"foobar",
		]);
	});
});

describe("formatNum", () => {
	it("formats numbers with commas", () => {
		expect(formatNum(1000)).toMatch(
			/1,000|1\u202f000|1\u00a0000/
		); // allow locale
		expect(formatNum(1234567)).toMatch(
			/1,234,567|1\u202f234\u202f567|1\u00a0234\u00a0567/
		);
	});
});

describe("formatTabsToSymbols", () => {
	it("replaces tabs with \\t", () => {
		expect(formatTabsToSymbols("foo\tbar\tbaz")).toBe(
			"foo\\tbar\\tbaz"
		);
		expect(formatTabsToSymbols("no tabs")).toBe(
			"no tabs"
		);
	});
});

describe("cleanJSDocDescription", () => {
	it("removes JSDoc tags and trims lines", () => {
		const input = `/**\n * This is a test.\n * @param foo\n * More description.\n */`;
		expect(cleanJSDocDescription(input)).toMatch(
			/This is a test\..*More description\./s
		);
	});
	it("keeps @param if eliminateParams is false", () => {
		const input = `/**\n * Description.\n * @param foo\n */`;
		expect(cleanJSDocDescription(input, false)).toMatch(
			/@param foo/
		);
	});
});

describe("cleanMultiLineArray", () => {
	it("removes leading indentation and empty lines", () => {
		const input = ["", "\t\tline1", "\t\tline2", ""];
		expect(cleanMultiLineArray(input)).toEqual([
			"line1",
			"line2",
		]);
	});
	it("adds extra indents if specified", () => {
		const input = ["\t\tfoo", "\t\tbar"];
		expect(
			cleanMultiLineArray(input, { extraIndents: 1 })
		).toEqual(["\tfoo", "\tbar"]);
	});
});

describe("cleanMultiLineStringToArray", () => {
	it("splits and cleans multi-line string", () => {
		const input = "\n\t\tfoo\n\t\tbar\n";
		expect(cleanMultiLineStringToArray(input)).toEqual([
			"foo",
			"bar",
		]);
	});
	it("handles extra indents option", () => {
		const input = "\n\t\tfoo\n\t\tbar\n";
		expect(
			cleanMultiLineStringToArray(input, {
				extraIndents: 1,
			})
		).toEqual(["\tfoo", "\tbar"]);
	});
});
