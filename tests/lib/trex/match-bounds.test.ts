import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import {
	LookBehindCodePoint,
	LookBehindAnyString,
	LookAheadCodePoint,
	LookAheadAnyString,
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
			"uvw",
		]);
		const matcher = new LookBehindAnyString(anyString);

		const result = matcher.match(nav);

		expect(result).toBeNull();
	});
});

// ------------------ LookAheadCodePoint ------------------
describe("LookAheadCodePoint", () => {
	test("should match when the next code point matches", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 0); // At 'a', next is 'b'
		const matcher = new LookAheadCodePoint(
			new MatchCodePoint("b".codePointAt(0)!)
		);
		const result = matcher.match(nav);
		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(0); // Should not advance
	});

	test("should not match when the next code point doesn't match", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 0); // At 'a', next is 'b'
		const matcher = new LookAheadCodePoint(
			new MatchCodePoint("c".codePointAt(0)!)
		);
		const result = matcher.match(nav);
		expect(result).toBeNull();
	});

	test("should not match at the end of the string", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 2); // At 'c', next is end
		const matcher = new LookAheadCodePoint(
			new MatchCodePoint("d".codePointAt(0)!)
		);
		const result = matcher.match(nav);
		expect(result).toBeNull();
	});

	test("should work with surrogate pairs", () => {
		const source = StrSlice.from("a😀b");
		const nav = new MutMatchNav(source, 0); // At 'a', next is '😀'
		const matcher = new LookAheadCodePoint(
			new MatchCodePoint("😀".codePointAt(0)!)
		);
		const result = matcher.match(nav);
		expect(result).not.toBeNull();
	});
});

// ------------------ LookAheadAnyString ------------------
describe("LookAheadAnyString", () => {
	test("should lookahead match at start of slice", () => {
		const source = StrSlice.from("abcdef");
		const nav = new MutMatchNav(source, 0); // zero-width lookahead
		const anyString = MatchAnyString.fromStrings([
			"abc",
			"def",
		]);
		const matcher = new LookAheadAnyString(anyString);
		const result = matcher.match(nav);
		expect(nav.captureMatch.value).toBe("");
		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("");
	});

	test("should lookahead match at middle of slice with capture", () => {
		const source = StrSlice.from("abcdef");
		let nav: MutMatchNav | null = new MutMatchNav(
			source,
			0
		); // zero-width lookahead
		const anyStringMatcher = MatchAnyString.fromStrings([
			"abc",
			"def",
		]);
		const matcher = new LookAheadAnyString(
			anyStringMatcher
		);
		nav = anyStringMatcher.match(nav); // capture is "abc", next is "def"
		if (!nav) {
			throw new Error("Failed to match");
		}
		const result = matcher.match(nav);
		expect(nav.captureMatch.value).toBe("abc");
		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("abc");
	});

	test("ensure lookahead match doesn't go beyond slice bounds", () => {
		const source = StrSlice.from("xxxabcdef").slice(3, 6);
		expect(source.value).toBe("abc");
		let nav: MutMatchNav | null = new MutMatchNav(
			source,
			0
		); // zero-width lookahead
		const anyStringMatcher = MatchAnyString.fromStrings([
			"abc",
			"def",
		]);
		const matcher = new LookAheadAnyString(
			anyStringMatcher
		);
		nav = anyStringMatcher.match(nav); // capture is "abc", next should NOT be "def"
		if (!nav) {
			throw new Error("Failed to match");
		}
		const result = matcher.match(nav);
		expect(nav.captureMatch.value).toBe("abc");
		expect(result).toBeNull();
	});

	test("should lookahead not match when the next string is not in the set", () => {
		const source = StrSlice.from("abcdef");
		const nav = new MutMatchNav(source, 0); // zero-width lookahead
		const anyString = MatchAnyString.fromStrings([
			"xy",
			"yz",
		]);
		const matcher = new LookAheadAnyString(anyString);
		const result = matcher.match(nav);
		expect(result).toBeNull();
	});

	test("should not match at the end of the string", () => {
		const source = StrSlice.from("abc");
		const nav = new MutMatchNav(source, 2); // zero-width lookahead
		const anyString = MatchAnyString.fromStrings(["d"]);
		const matcher = new LookAheadAnyString(anyString);
		const result = matcher.match(nav);
		expect(result).toBeNull();
	});

	test("should work with surrogate pairs", () => {
		const source = StrSlice.from("🐶😀🐱");
		let nav: MutMatchNav | null = new MutMatchNav(
			source,
			0
		); // zero-width lookahead
		const animalMatcher = MatchAnyString.fromStrings([
			"🐱",
			"🐶",
		]);
		const peopleMatcher = MatchAnyString.fromStrings([
			"😀",
			"😍",
		]);
		const lookAheadMatcher = new LookAheadAnyString(
			peopleMatcher
		);
		nav = animalMatcher.match(nav); // capture is "🐶", next is "😀"
		if (!nav) {
			throw new Error("Failed to match");
		}
		const result = lookAheadMatcher.match(nav);

		expect(nav.captureMatch.value).toBe("🐶");
		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("🐶");
	});
});
