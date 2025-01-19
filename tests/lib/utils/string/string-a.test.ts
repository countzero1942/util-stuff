import {
	cleanLineOfMultipleSpaces,
	getRepeatingMatchesCount,
	removeEmptyLinesFromStartAndEnd,
	getMinTabCharsCount,
	cleanMultiLineString,
} from "@/utils/string";

describe("cleanLineOfMultipleSpaces", () => {
	it("returns the original string if no multiple spaces are found", () => {
		expect(cleanLineOfMultipleSpaces("abc def")).toBe("abc def");
	});

	it("removes multiple spaces in the middle of a string", () => {
		expect(cleanLineOfMultipleSpaces("abc   def")).toBe("abc def");
	});

	it("removes multiple spaces at the start of a string", () => {
		expect(cleanLineOfMultipleSpaces("   abc def")).toBe("abc def");
	});

	it("removes multiple spaces at the end of a string", () => {
		expect(cleanLineOfMultipleSpaces("abc def   ")).toBe("abc def");
	});
});

describe("removeEmptyLinesFromStartAndEnd", () => {
	it("removes empty lines from the start and end of an array", () => {
		const input = ["", "abc", "", "def", "", "ghi", ""];
		const expectedOutput = ["abc", "", "def", "", "ghi"];
		expect(removeEmptyLinesFromStartAndEnd(input)).toEqual(
			expectedOutput
		);
	});

	it("returns the original array if no empty lines are found at the start and end", () => {
		const input = ["abc", "def", "ghi"];
		const expectedOutput = ["abc", "def", "ghi"];
		expect(removeEmptyLinesFromStartAndEnd(input)).toEqual(
			expectedOutput
		);
	});

	it("handles arrays with only empty lines", () => {
		const input = ["", "", "", "", ""];
		const expectedOutput: string[] = [];
		expect(removeEmptyLinesFromStartAndEnd(input)).toEqual(
			expectedOutput
		);
	});
});

describe("getRepeatingMatchesCount", () => {
	it("returns 0 if the pattern is not found at start of string", () => {
		expect(getRepeatingMatchesCount("xabc", "abc")).toBe(0);
	});

	it("returns number of occurrences of pattern at start of string", () => {
		expect(getRepeatingMatchesCount("abczzzabcabc", "abc")).toBe(1);
		expect(getRepeatingMatchesCount("abcabczzzabc", "abc")).toBe(2);
		expect(getRepeatingMatchesCount("abcabcabcabc", "abc")).toBe(4);
	});

	it("returns number of occurrences of single char pattern at start of string", () => {
		expect(getRepeatingMatchesCount("zzzzabcabc", "z")).toBe(4);
		expect(getRepeatingMatchesCount("zzabc", "z")).toBe(2);
		expect(getRepeatingMatchesCount("zabcabcabcabc", "z")).toBe(1);
	});

	it("doesn't handle overlapping patterns", () => {
		expect(getRepeatingMatchesCount("aaa", "aa")).toBe(1);
	});

	it("returns 0 if the pattern is not found at index in string", () => {
		expect(getRepeatingMatchesCount("xabc", "abc", 0)).toBe(0);
		expect(getRepeatingMatchesCount("xxxabc", "abc", 2)).toBe(0);
	});

	it("returns number of occurrences of pattern at index in string", () => {
		expect(
			getRepeatingMatchesCount("zzzabczzzabcabc", "abc", 3)
		).toBe(1);
		expect(
			getRepeatingMatchesCount("zzzabcabcabcabc", "abc", 3)
		).toBe(4);
		expect(getRepeatingMatchesCount("abczzzabcabc", "abc", 0)).toBe(
			1
		);
		expect(getRepeatingMatchesCount("abcabcabcabc", "abc", 0)).toBe(
			4
		);
	});

	it("returns number of occurrences of single char pattern at index in string", () => {
		expect(getRepeatingMatchesCount("abczzzzabcabc", "z", 3)).toBe(
			4
		);
		expect(
			getRepeatingMatchesCount("abczabcabcabcabc", "z", 3)
		).toBe(1);
		expect(getRepeatingMatchesCount("zzzzabcabc", "z", 0)).toBe(4);
	});

	it("handles match at end of string: single and multiple char pattern", () => {
		expect(getRepeatingMatchesCount("abc", "abc", 0)).toBe(1);
		expect(getRepeatingMatchesCount("zzzabc", "abc", 3)).toBe(1);
		expect(getRepeatingMatchesCount("z", "z", 0)).toBe(1);
		expect(getRepeatingMatchesCount("abcz", "z", 3)).toBe(1);
	});

	it("handles failed partial match at end of string", () => {
		expect(getRepeatingMatchesCount("ab", "abc", 0)).toBe(0);
		expect(getRepeatingMatchesCount("zzzab", "abc", 3)).toBe(0);
	});

	it("handles search beyond length of string", () => {
		expect(getRepeatingMatchesCount("abc", "abc", 3)).toBe(0);
	});
});

// write tests for getMinTabCharsCount
describe("getMinTabCharsCount", () => {
	it("returns 0 for an empty array", () => {
		expect(getMinTabCharsCount([])).toBe(0);
	});

	it("returns 0 for an array with no tabs", () => {
		expect(getMinTabCharsCount(["abc", "def", "ghi"])).toBe(0);
	});

	it("returns the minimum number of tabs at the start of non-empty lines", () => {
		expect(getMinTabCharsCount(["\tabc", "\t\tdef", "\tghi"])).toBe(
			1
		);
	});

	it("ignores empty lines", () => {
		expect(
			getMinTabCharsCount(["", "\tabc", "", "\t\tdef", "\tghi"])
		).toBe(1);
	});

	it("handles mixed indentation", () => {
		expect(getMinTabCharsCount(["\tabc", "def", "\t\tghi"])).toBe(
			0
		);
	});

	it("works with custom tab character", () => {
		expect(
			getMinTabCharsCount(["  abc", "    def", "  ghi"], "  ")
		).toBe(1);
	});

	it("returns 0 when no lines start with the tab character", () => {
		expect(
			getMinTabCharsCount([" abc", "  def", " ghi"], "\t")
		).toBe(0);
	});
});

describe("cleanMultiLineString", () => {
	it("removes leading and trailing empty lines", () => {
		const input = `

		Hello
		World

		`;
		expect(cleanMultiLineString(input)).toBe("Hello\nWorld");
	});

	it("removes common indentation", () => {
		const input = `
				First line
				Second line
				Third line
		  `;
		expect(cleanMultiLineString(input)).toBe(
			"First line\nSecond line\nThird line"
		);
	});

	it("preserves relative indentation", () => {
		const input = `
				First line
					Indented line
				Third line
		  `;
		expect(cleanMultiLineString(input)).toBe(
			"First line\n\tIndented line\nThird line"
		);
	});

	it("handles mixed indentation", () => {
		const input = `
				First line
		Second line
					Third line
		  `;
		expect(cleanMultiLineString(input)).toBe(
			"\t\tFirst line\nSecond line\n\t\t\tThird line"
		);
	});

	it("works with custom tab character", () => {
		const input = `
      First line
         Second line
      Third line
		  `;
		expect(cleanMultiLineString(input, "   ")).toBe(
			"First line\n   Second line\nThird line"
		);
	});

	it("works with single spaces", () => {
		const input = `
      First line
         Second line
      Third line
		  `;
		expect(cleanMultiLineString(input, " ")).toBe(
			"First line\n   Second line\nThird line"
		);
	});

	it("handles empty string", () => {
		expect(cleanMultiLineString("")).toBe("");
	});

	it("preserves empty lines in the middle", () => {
		const input = `
				First line

				Third line
		  `;
		expect(cleanMultiLineString(input)).toBe(
			"First line\n\nThird line"
		);
	});
});
