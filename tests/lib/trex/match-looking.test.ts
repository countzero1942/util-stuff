import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import {
	LookBehindCodePoint,
	LookBehindAnyString,
	LookAheadCodePoint,
	LookAheadAnyString,
} from "@/trex/match-looking";
import { MatchCodePoint } from "@/trex/match-code-point";
import { MatchAnyString } from "@/trex/match-any-string";
import { matchUnicodeSpace } from "@/trex";

describe("LookBehindCodePoint", () => {
	it("matches when the previous code point matches: nav position", () => {
		const nav = MutMatchNav.fromString("abc", 1); // zero-width lookbehind
		const matcher = LookBehindCodePoint.from(
			MatchCodePoint.fromString("a")
		);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(1); // Position shouldn't change
	});

	it("matches when the previous code point matches: capture", () => {
		const nav = MutMatchNav.fromString("abc"); // zero-width lookbehind
		nav.moveCaptureForward(1);
		const matcher = LookBehindCodePoint.from(
			MatchCodePoint.fromString("a")
		);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("a"); // Capture shouldn't change
	});

	it("does not match when the previous code point does not match", () => {
		const nav = MutMatchNav.fromString("abc", 1);
		const matcher = LookBehindCodePoint.from(
			MatchCodePoint.fromString("b")
		);

		const result = matcher.match(nav);

		expect(result).toBeNull();
	});

	it("does not match at the beginning of the string", () => {
		const nav = MutMatchNav.fromString("abc"); // Beginning of string
		const matcher = LookBehindCodePoint.from(
			MatchCodePoint.fromString("a")
		);

		const result = matcher.match(nav);

		expect(result).toBeNull();
	});

	it("matches correctly with surrogate pairs: nav position", () => {
		const nav = MutMatchNav.fromString("a😀b", 3); // zero-width lookbehind
		const matcher = LookBehindCodePoint.from(
			MatchCodePoint.fromString("😀")
		);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(3); // Position shouldn't change
	});

	it("matches correctly with surrogate pairs: capture", () => {
		const nav = MutMatchNav.fromString("a😀b"); // zero-width lookbehind
		nav.moveCaptureForward(3);
		const matcher = LookBehindCodePoint.from(
			MatchCodePoint.fromString("😀")
		);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("a😀"); // Capture shouldn't change
	});
});

describe("LookBehindAnyString", () => {
	it("matches when the previous string is in the set: nav position", () => {
		const nav = MutMatchNav.fromString("abcdef", 3); // zero-width lookbehind
		const anyString = MatchAnyString.fromStrings(
			"abc",
			"def"
		);
		const matcher = LookBehindAnyString.from(anyString);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(3); // Position shouldn't change
	});

	it("matches when the previous string is in the set: capture", () => {
		const nav = MutMatchNav.fromString("abcdef"); // zero-width lookbehind
		nav.moveCaptureForward(3);
		const anyString = MatchAnyString.fromStrings(
			"abc",
			"def"
		);
		const matcher = LookBehindAnyString.from(anyString);

		const result = matcher.match(nav);

		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("abc"); // capture shouldn't change
	});

	it("does not match when the previous string is not in the set: nav position", () => {
		const nav = MutMatchNav.fromString("abcdef", 3); // zero-width lookbehind
		const anyString = MatchAnyString.fromStrings(
			"xyz",
			"uvw"
		);
		const matcher = LookBehindAnyString.from(anyString);

		const result = matcher.match(nav);

		expect(result).toBeNull();
	});
});

// ------------------ LookAheadCodePoint ------------------
describe("LookAheadCodePoint", () => {
	it("matches when the next code point matches", () => {
		const nav = MutMatchNav.fromString("abc", 0); // zero-width lookahead
		const matcher = LookAheadCodePoint.from(
			MatchCodePoint.fromString("a")
		);
		const result = matcher.match(nav);
		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(0); // Should not advance
	});

	it("does not match when the next code point does not match", () => {
		const nav = MutMatchNav.fromString("abc", 0); // zero-width lookahead
		const matcher = LookAheadCodePoint.from(
			MatchCodePoint.fromString("b")
		);
		const result = matcher.match(nav);
		expect(result).toBeNull();
	});

	it("does not match at the end of the string", () => {
		const nav = MutMatchNav.fromString("abc", 0); // zero-width lookahead
		const matcher = LookAheadCodePoint.from(
			MatchCodePoint.fromString("d")
		);
		const result = matcher.match(nav);
		expect(result).toBeNull();
	});

	it("matches correctly with surrogate pairs", () => {
		const nav = MutMatchNav.fromString("a😀b", 0); // zero-width lookahead
		nav.moveCaptureForward(1);
		const matcher = LookAheadCodePoint.from(
			MatchCodePoint.fromString("😀")
		);
		const result = matcher.match(nav);
		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("a"); // Should not advance
	});

	it("works with any string matcher", () => {
		const nav = MutMatchNav.fromString("xxx ", 0); // zero-width lookahead
		const anyStringMatcher = MatchAnyString.fromStrings(
			"xxx",
			"yyy"
		);

		const lookAheadMatcher = LookAheadCodePoint.from(
			matchUnicodeSpace
		);
		const result1 = anyStringMatcher.match(nav);
		expect(result1).not.toBeNull();
		expect(result1?.captureMatch.value).toBe("xxx");
		const result2 = lookAheadMatcher.match(result1!);
		expect(result2).not.toBeNull();
	});
});

// ------------------ LookAheadAnyString ------------------
describe("LookAheadAnyString", () => {
	it("matches at start of slice", () => {
		const nav = MutMatchNav.fromString("abcdef", 0); // zero-width lookahead
		const anyString = MatchAnyString.fromStrings(
			"abc",
			"def"
		);
		const matcher = LookAheadAnyString.from(anyString);
		const result = matcher.match(nav);
		expect(nav.captureMatch.value).toBe("");
		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("");
	});

	it("matches at middle of slice with capture", () => {
		let nav: MutMatchNav | null = MutMatchNav.fromString(
			"abcdef",
			0
		); // zero-width lookahead
		const anyStringMatcher = MatchAnyString.fromStrings(
			"abc",
			"def"
		);
		const matcher = LookAheadAnyString.from(
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

	it("does not match beyond slice bounds", () => {
		const source = StrSlice.from("xxxabcdef").slice(3, 6);
		expect(source.value).toBe("abc");
		let nav: MutMatchNav | null = MutMatchNav.from(
			source,
			0
		); // zero-width lookahead
		const anyStringMatcher = MatchAnyString.fromStrings(
			"abc",
			"def"
		);
		const matcher = LookAheadAnyString.from(
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

	it("does not match when the next string is not in the set", () => {
		const nav = MutMatchNav.fromString("abcdef", 0); // zero-width lookahead
		const anyString = MatchAnyString.fromStrings(
			"xy",
			"yz"
		);
		const matcher = LookAheadAnyString.from(anyString);
		const result = matcher.match(nav);
		expect(result).toBeNull();
	});

	it("does not match at the end of the string", () => {
		const nav = MutMatchNav.fromString("abc", 2); // zero-width lookahead
		const anyString = MatchAnyString.fromStrings("d");
		const matcher = LookAheadAnyString.from(anyString);
		const result = matcher.match(nav);
		expect(result).toBeNull();
	});

	it("matches correctly with surrogate pairs and nav reference preserved", () => {
		let nav: MutMatchNav | null =
			MutMatchNav.fromString("🐶😀🐱");
		const animalMatcher = MatchAnyString.fromStrings(
			"🐱",
			"🐶"
		);
		const peopleMatcher = MatchAnyString.fromStrings(
			"😀",
			"😍"
		);
		const lookAheadMatcher =
			LookAheadAnyString.from(peopleMatcher);
		nav = animalMatcher.match(nav); // capture is "🐶", next is "😀"
		if (!nav) {
			throw new Error("Failed to match");
		}
		const result = lookAheadMatcher.match(nav);

		expect(nav.captureMatch.value).toBe("🐶");
		expect(result).not.toBeNull();
		expect(result?.captureMatch.value).toBe("🐶");
		expect(nav).toBe(result);
	});
});
