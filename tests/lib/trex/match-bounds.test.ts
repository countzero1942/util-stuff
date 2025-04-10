import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import {
	LookBehindCodePoint,
	LookBehindAnyString,
	MatchWord,
	matchWordStart,
	matchWordEnd,
	matchManyUnicodeSpaces,
	matchManyUnicodeWhiteSpace,
} from "@/trex/match-bounds";
import {
	MatchCodePoint,
	matchAnyCodePoint,
} from "@/trex/match-code-point";
import { MatchAnyString } from "@/trex/match-string";
import { CodePointPrefixIndex } from "@/trex/prefix-index";

describe("LookBehindCodePoint", () => {
	test("should match when the previous code point matches", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 1); // Position after 'a'
		const matcher = new LookBehindCodePoint(
			new MatchCodePoint("a".codePointAt(0)!)
		);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(1); // Position shouldn't change
	});

	test("should not match when the previous code point doesn't match", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 1); // Position after 'a'
		const matcher = new LookBehindCodePoint(
			new MatchCodePoint("b".codePointAt(0)!)
		);

		const result = matcher.match(nav);

		expect(result).toBeNull();
	});

	test("should not match at the beginning of the string", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 0); // Beginning of string
		const matcher = new LookBehindCodePoint(
			new MatchCodePoint("a".codePointAt(0)!)
		);

		const result = matcher.match(nav);

		expect(result).toBeNull();
	});

	test("should work with surrogate pairs", () => {
		const source = StrSlice.from("a😀b");
		const nav = new MutMatchNav(source, 3); // Position after emoji (surrogate pair)
		const matcher = new LookBehindCodePoint(
			new MatchCodePoint("😀".codePointAt(0)!)
		);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
	});
});

describe("LookBehindAnyString", () => {
	test("should match when the previous string is in the set", () => {
		const source = StrSlice.from("abcdef");
		const nav = new MutMatchNav(source, 3); // Position after 'abc'
		const anyString = MatchAnyString.fromStrings([
			"abc",
			"def",
		]);
		const matcher = new LookBehindAnyString(anyString);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(3); // Position shouldn't change
	});

	test("should not match when the previous string is not in the set", () => {
		const source = StrSlice.from("abcdef");
		const nav = new MutMatchNav(source, 3); // Position after 'abc'
		const anyString = MatchAnyString.fromStrings([
			"xyz",
			"def",
		]);
		const matcher = new LookBehindAnyString(anyString);

		const result = matcher.match(nav);

		expect(result).toBeNull();
	});

	test("should not match at the beginning of the string", () => {
		const source = StrSlice.from("abcdef");
		const nav = new MutMatchNav(source, 0); // Beginning of string
		const anyString = MatchAnyString.fromStrings([
			"abc",
			"def",
		]);
		const matcher = new LookBehindAnyString(anyString);

		const result = matcher.match(nav);

		expect(result).toBeNull();
	});

	test("should match with strings of different lengths", () => {
		const source = StrSlice.from("abcdefg");
		const nav = new MutMatchNav(source, 5); // Position after 'abcde'
		const anyString = MatchAnyString.fromStrings([
			"abc",
			"abcde",
			"xyz",
		]);
		const matcher = new LookBehindAnyString(anyString);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
	});
});

describe("matchManyUnicodeSpaces", () => {
	test("should match one or more spaces", () => {
		const source = StrSlice.from("   abc");
		const nav = new MutMatchNav(source, 0);

		const result = matchManyUnicodeSpaces.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(3); // Should consume all spaces
	});

	test("should not match when there are no spaces", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 0);

		const result = matchManyUnicodeSpaces.match(nav);

		expect(result).toBeNull();
	});

	test("should match various Unicode 'Zs' space chars -- NOT whitespace", () => {
		const str =
			"  \t\t\n\n\u00A0\u00A0\n\r\f\v\u00A0\u2000abc";
		//  012 3 4 5 6     7     8
		const source = StrSlice.from(str);

		{
			const nav = new MutMatchNav(source, 0);
			const result = matchManyUnicodeSpaces.match(nav);

			expect(result).not.toBeNull();
			expect(result?.navIndex).toBe(2); // Should consume the first whitespace
			expect(result?.captureMatch.value).toBe("  ");
		}

		{
			const nav = new MutMatchNav(source, 2);
			const result = matchManyUnicodeSpaces.match(nav);

			expect(result).toBeNull();
		}

		{
			const nav = new MutMatchNav(source, 4);
			const result = matchManyUnicodeSpaces.match(nav);

			expect(result).toBeNull();
		}

		{
			const nav = new MutMatchNav(source, 6);
			const result = matchManyUnicodeSpaces.match(nav);

			expect(result).not.toBeNull();
			expect(result?.navIndex).toBe(8); // Should consume the first whitespace
			expect(result?.captureMatch.value).toBe(
				"\u00A0\u00A0"
			);
		}
	});
});

describe("matchManyUnicodeWhiteSpace", () => {
	test("should match one or more spaces", () => {
		const source = StrSlice.from(" \t\nabc");
		const nav = new MutMatchNav(source, 0);

		const result = matchManyUnicodeWhiteSpace.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(3); // Should consume all spaces
		expect(result?.captureMatch.value).toBe(" \t\n");
	});

	test("should not match when there are no spaces", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 0);

		const result = matchManyUnicodeWhiteSpace.match(nav);

		expect(result).toBeNull();
	});

	test("should match various Unicode whitespace codepoints", () => {
		const str = "  \t\t\n\n\u00A0\u00A0\n\r\f\v\u2000abc";
		//  012 3 4 5 6     7     8 9 0 1 2     3
		const source = StrSlice.from(str);

		{
			const nav = new MutMatchNav(source, 0);
			const result =
				matchManyUnicodeWhiteSpace.match(nav);

			expect(result).not.toBeNull();
			expect(result?.navIndex).toBe(13); // Should consume the first whitespace
			expect(result?.captureMatch.value).toBe(
				"  \t\t\n\n\u00A0\u00A0\n\r\f\v\u2000"
			);
		}
	});
});

describe("matchWordStart", () => {
	test("should match at the beginning of the string", () => {
		const source = StrSlice.from("abc def");
		const nav = new MutMatchNav(source, 0);

		const result = matchWordStart.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(0);
	});

	test("should match after a space", () => {
		const source = StrSlice.from("abc def");
		const nav = new MutMatchNav(source, 4); // Position after space

		const result = matchWordStart.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(4);
	});

	test("should not match in the middle of a word", () => {
		const source = StrSlice.from("abc def");
		const nav = new MutMatchNav(source, 2); // Position at 'c'

		const result = matchWordStart.match(nav);

		expect(result).toBeNull();
	});
});

describe("matchWordEnd", () => {
	test("should match at the end of the string", () => {
		const source = StrSlice.from("abc def");
		const nav = new MutMatchNav(source, 7); // End of string

		const result = matchWordEnd.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(7);
	});

	test("should match before a space", () => {
		const source = StrSlice.from("abc def");
		const nav = new MutMatchNav(source, 3); // Position before space

		const result = matchWordEnd.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(4);
	});

	test("should not match in the middle of a word", () => {
		const source = StrSlice.from("abc def");
		const nav = new MutMatchNav(source, 1); // Position at 'b'

		const result = matchWordEnd.match(nav);

		expect(result).toBeNull();
	});
});

describe("MatchWord", () => {
	test("should match a word at the beginning of the string", () => {
		const source = StrSlice.from("abc def");
		const nav = new MutMatchNav(source, 0);
		const matcher = MatchAnyString.fromStrings(["abc"]);
		const wordMatcher = new MatchWord(matcher);

		const result = wordMatcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("abc");
	});

	test("should match a word in the middle of the string", () => {
		const source = StrSlice.from("abc def ghi");
		const nav = new MutMatchNav(source, 4); // Position at 'd'
		const matcher = MatchAnyString.fromStrings(["def"]);
		const wordMatcher = new MatchWord(matcher);

		const result = wordMatcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("def");
	});

	test("should match a word at the end of the string", () => {
		const source = StrSlice.from("abc def");
		const nav = new MutMatchNav(source, 4); // Position at 'd'
		const matcher = MatchAnyString.fromStrings(["def"]);
		const wordMatcher = new MatchWord(matcher);

		const result = wordMatcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("def");
	});

	test("should not match a substring of a word", () => {
		const source = StrSlice.from("abcdef");
		const nav = new MutMatchNav(source, 0);
		const matcher = MatchAnyString.fromStrings(["abc"]);
		const wordMatcher = new MatchWord(matcher);

		const result = wordMatcher.match(nav);

		expect(result).toBeNull();
	});

	test("should match any of multiple words", () => {
		const source = StrSlice.from("abc def ghi");
		const nav = new MutMatchNav(source, 0);
		const matcher = MatchAnyString.fromStrings([
			"abc",
			"def",
			"ghi",
		]);
		const wordMatcher = new MatchWord(matcher);

		const result = wordMatcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("abc");
	});
});
