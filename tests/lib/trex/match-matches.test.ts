import { StrSlice } from "@/utils/slice";
import {
	MutMatchNav,
	MatchAny,
	MatchAll,
	MatchOpt,
	MatchRepeat,
	GhostMatch,
	MatchCodePoint,
	NumberOfMatches,
	AltFirstLastMatchers,
} from "@/trex";

// Helper function to create simple matchers for testing
const createLetterMatcher = (
	letter: string
): MatchCodePoint => {
	return new MatchCodePoint(letter.codePointAt(0)!);
};

describe("MatchAny", () => {
	describe("constructor", () => {
		it("creates a matcher with the specified matchers array", () => {
			const matcher1 = createLetterMatcher("A");
			const matcher2 = createLetterMatcher("B");
			const anyMatcher = new MatchAny([
				matcher1,
				matcher2,
			]);

			expect(anyMatcher.matchers).toHaveLength(2);
			expect(anyMatcher.matchers[0]).toBe(matcher1);
			expect(anyMatcher.matchers[1]).toBe(matcher2);
		});
	});

	describe("match", () => {
		it("matches if any of the matchers match and returns the first successful match", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const anyMatcher = new MatchAny([
				matcherA,
				matcherB,
			]);

			const navA = new MutMatchNav(new StrSlice("ABC"));
			const resultA = anyMatcher.match(navA);
			expect(resultA).not.toBeNull();
			expect(resultA?.captureMatch.value).toBe("A");

			const navB = new MutMatchNav(new StrSlice("BCD"));
			const resultB = anyMatcher.match(navB);
			expect(resultB).not.toBeNull();
			expect(resultB?.captureMatch.value).toBe("B");
		});

		it("returns null if none of the matchers match", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const anyMatcher = new MatchAny([
				matcherA,
				matcherB,
			]);

			const nav = new MutMatchNav(new StrSlice("XYZ"));
			const result = anyMatcher.match(nav);

			expect(result).toBeNull();
		});

		it("tries matchers in order and returns the first match", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const anyMatcher = new MatchAny([
				matcherA,
				matcherB,
			]);

			// Both A and B could match, but A should be chosen as it's first
			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = anyMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("A");
		});

		it("throws on invalid navigator", () => {
			const matcherA = createLetterMatcher("A");
			const anyMatcher = new MatchAny([matcherA]);

			const nav = new MutMatchNav(new StrSlice("XYZ"));
			nav.invalidate();
			expect(() => anyMatcher.match(nav)).toThrow(
				"Illegal use of invalidated navigator"
			);
		});
	});
});

describe("MatchAll", () => {
	describe("constructor", () => {
		it("creates a matcher with the specified matchers array", () => {
			const matcher1 = createLetterMatcher("A");
			const matcher2 = createLetterMatcher("B");
			const allMatcher = new MatchAll([
				matcher1,
				matcher2,
			]);

			expect(allMatcher.matchers).toHaveLength(2);
			expect(allMatcher.matchers[0]).toBe(matcher1);
			expect(allMatcher.matchers[1]).toBe(matcher2);
		});
	});

	describe("match", () => {
		it("matches if all matchers match in sequence", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const allMatcher = new MatchAll([
				matcherA,
				matcherB,
			]);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).toBe(nav);
			expect(result?.captureMatch.value).toBe("AB");
		});

		it("returns null if any matcher in the sequence fails", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const matcherC = createLetterMatcher("C");
			const allMatcher = new MatchAll([
				matcherA,
				matcherB,
				matcherC,
			]);

			// First two match but third doesn't
			const nav = new MutMatchNav(new StrSlice("ABX"));
			const result = allMatcher.match(nav);

			expect(result).toBeNull();
		});

		it("passes the updated navigator to each subsequent matcher", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const matcherC = createLetterMatcher("C");
			const allMatcher = new MatchAll([
				matcherA,
				matcherB,
				matcherC,
			]);

			const nav = new MutMatchNav(new StrSlice("ABCD"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("ABC");
			expect(result).toBe(nav);
		});

		it("works with an empty matchers array", () => {
			const allMatcher = new MatchAll([]);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("");
		});
	});
});

describe("MatchOpt", () => {
	describe("constructor", () => {
		it("creates a matcher with the specified matcher", () => {
			const innerMatcher = createLetterMatcher("A");
			const optMatcher = new MatchOpt(innerMatcher);

			expect(optMatcher.matcher).toBe(innerMatcher);
		});
	});

	describe("match", () => {
		it("matches and advances the navigator if the inner matcher matches", () => {
			const innerMatcher = createLetterMatcher("A");
			const optMatcher = new MatchOpt(innerMatcher);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("A");
		});

		it("returns the original navigator without advancing if the inner matcher does not match", () => {
			const innerMatcher = createLetterMatcher("X");
			const optMatcher = new MatchOpt(innerMatcher);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const originalNavIndex = nav.navIndex;
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.navIndex).toBe(originalNavIndex);
			expect(result?.captureMatch.value).toBe("");
		});

		it("does not invalidate the navigator if the inner matcher does not match", () => {
			const innerMatcher = createLetterMatcher("X");
			const optMatcher = new MatchOpt(innerMatcher);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.isInvalidated).toBe(false);
		});
	});
});
