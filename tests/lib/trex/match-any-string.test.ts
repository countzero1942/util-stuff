import { MatchAnyString } from "@/trex/match-any-string";
import { MutMatchNav } from "@/trex/nav";

describe("MatchAnyString", () => {
	describe("fromStrings", () => {
		it("creates a matcher from multiple strings", () => {
			const matcher = MatchAnyString.fromStrings(
				"foo",
				"bar",
				"baz"
			);
			expect(matcher).toBeInstanceOf(MatchAnyString);
			// Should match all provided strings
			expect(matcher.matchString("foo")).toBe(true);
			expect(matcher.matchString("bar")).toBe(true);
			expect(matcher.matchString("baz")).toBe(true);
			// Should not match non-provided strings
			expect(matcher.matchString("qux")).toBe(false);
		});
	});

	describe("match", () => {
		it("matches at the start of the string", () => {
			const matcher = MatchAnyString.fromStrings(
				"foo",
				"bar"
			);
			const nav = MutMatchNav.fromString("foobar");
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result!.source.value).toBe("foobar");
			// Should advance nav and capture by length of match
			// Here, 'foo' matches at position 0
			// After match, nav index should be 3
			// (We don't have direct accessors, but can check by matching again)
			const nav2 = MutMatchNav.fromString("foobar");
			matcher.match(nav2); // advances to 3
			const nav3 = matcher.match(nav2); // should match 'bar' at position 3
			expect(nav3).not.toBeNull();
		});

		it("returns null and invalidates nav on no match", () => {
			const matcher = MatchAnyString.fromStrings(
				"foo",
				"bar"
			);
			const nav = MutMatchNav.fromString("bazqux");
			const result = matcher.match(nav);
			expect(result).toBeNull();
			// nav should be invalidated
			expect(nav["_isInvalidated"]).toBe(true);
		});

		it("matches only at the correct position", () => {
			const matcher = MatchAnyString.fromStrings(
				"foo",
				"bar"
			);
			const nav = MutMatchNav.fromString("xxfoo");
			// Should not match at position 0
			const result = matcher.match(nav);
			expect(result).toBeNull();
		});

		it("prefers longer match if both candidates start with same code point", () => {
			const matcher = MatchAnyString.fromStrings(
				"foobar",
				"foo"
			);
			const nav = MutMatchNav.fromString("foobarbaz");
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
			// Should match 'foobar' first
			const after = result as any;
			// nav index should be 6 (length of 'foobar')
			expect(after._navIndex).toBe(6);
		});

		it("handles Unicode code points correctly", () => {
			const matcher = MatchAnyString.fromStrings(
				"😀foo",
				"bar"
			);
			const nav = MutMatchNav.fromString("😀foobar");
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
			// Should match '😀foo' at start
			const after = result as any;
			// nav index should be 4 (😀 is 2 code units, plus 'foo' = 3, total 5)
			expect(after._navIndex).toBe("😀foo".length);
		});

		it("returns null for empty input", () => {
			const matcher = MatchAnyString.fromStrings("foo");
			const nav = MutMatchNav.fromString("");
			const result = matcher.match(nav);
			expect(result).toBeNull();
		});

		it("returns null if no candidates for code point", () => {
			const matcher = MatchAnyString.fromStrings("foo");
			const nav = MutMatchNav.fromString("zzz");
			const result = matcher.match(nav);
			expect(result).toBeNull();
		});

		it("does not match partial prefix", () => {
			const matcher =
				MatchAnyString.fromStrings("foobar");
			const nav = MutMatchNav.fromString("foo");
			const result = matcher.match(nav);
			expect(result).toBeNull();
		});

		it("matches after advancing nav index", () => {
			const matcher = MatchAnyString.fromStrings(
				"foo",
				"bar"
			);
			const nav = MutMatchNav.fromString("xxfoo");
			// Advance both nav and capture indices to 2 (no ghost capture)
			nav.moveCaptureForward(2);
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
		});
	});

	describe("matchString", () => {
		it("returns true for a string in the set", () => {
			const matcher = MatchAnyString.fromStrings(
				"foo",
				"bar"
			);
			expect(matcher.matchString("foo")).toBe(true);
			expect(matcher.matchString("bar")).toBe(true);
		});
		it("returns false for a string not in the set", () => {
			const matcher = MatchAnyString.fromStrings(
				"foo",
				"bar"
			);
			expect(matcher.matchString("baz")).toBe(false);
		});
		it("handles Unicode strings", () => {
			const matcher =
				MatchAnyString.fromStrings("😀foo");
			expect(matcher.matchString("😀foo")).toBe(true);
			expect(matcher.matchString("foo")).toBe(false);
		});
	});
});
