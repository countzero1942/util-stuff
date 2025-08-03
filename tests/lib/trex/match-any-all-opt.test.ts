import { StrSlice } from "@/utils/slice";
import {
	MutMatchNav,
	MatchAny,
	MatchAll,
	MatchOpt,
	MatchCodePoint,
} from "@/trex";

// Helper function to create simple matchers for testing
// const createLetterMatcher = (
// 	letter: string
// ): MatchCodePoint => {
// 	return MatchCodePoint.fromNumber(letter.codePointAt(0)!);
// };

describe("MatchAny", () => {
	describe("constructor", () => {
		test("creates a matcher with the specified matchers array", () => {
			const matcher1 = MatchCodePoint.fromString("A");
			const matcher2 = MatchCodePoint.fromString("B");
			const anyMatcher = MatchAny.from(
				matcher1,
				matcher2
			);

			expect(anyMatcher.matchers).toHaveLength(2);
			expect(anyMatcher.matchers[0]).toBe(matcher1);
			expect(anyMatcher.matchers[1]).toBe(matcher2);
		});
	});

	describe("match", () => {
		test("matches if any of the matchers match and returns the first successful match", () => {
			const matcherA = MatchCodePoint.fromString("A");
			const matcherB = MatchCodePoint.fromString("B");
			const anyMatcher = MatchAny.from(
				matcherA,
				matcherB
			);

			const navA = MutMatchNav.from(new StrSlice("ABC"));
			const resultA = anyMatcher.match(navA);
			expect(resultA).not.toBeNull();
			expect(resultA?.captureMatch.value).toBe("A");

			const navB = MutMatchNav.from(new StrSlice("BCD"));
			const resultB = anyMatcher.match(navB);
			expect(resultB).not.toBeNull();
			expect(resultB?.captureMatch.value).toBe("B");
		});

		test("returns null if none of the matchers match", () => {
			const matcherA = MatchCodePoint.fromString("A");
			const matcherB = MatchCodePoint.fromString("B");
			const anyMatcher = MatchAny.from(
				matcherA,
				matcherB
			);

			const nav = MutMatchNav.from(new StrSlice("XYZ"));
			const result = anyMatcher.match(nav);

			expect(result).toBeNull();
		});

		test("tries matchers in order and returns the first match", () => {
			const matcherA = MatchCodePoint.fromString("A");
			const matcherB = MatchCodePoint.fromString("B");
			const anyMatcher = MatchAny.from(
				matcherA,
				matcherB
			);

			// Both A and B could match, but A should be chosen as it's first
			const nav = MutMatchNav.from(new StrSlice("ABC"));
			const result = anyMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("A");
		});

		test("throws on invalid navigator", () => {
			const matcherA = MatchCodePoint.fromString("A");
			const anyMatcher = MatchAny.from(matcherA);

			const nav = MutMatchNav.from(new StrSlice("XYZ"));
			nav.invalidate();
			expect(() => anyMatcher.match(nav)).toThrow(
				"Illegal use of invalidated navigator"
			);
		});
	});
});

describe("MatchAll", () => {
	describe("constructor", () => {
		test("creates a matcher with the specified matchers array", () => {
			const matcher1 = MatchCodePoint.fromString("A");
			const matcher2 = MatchCodePoint.fromString("B");
			const allMatcher = MatchAll.from(
				matcher1,
				matcher2
			);

			expect(allMatcher.matchers).toHaveLength(2);
			expect(allMatcher.matchers[0]).toBe(matcher1);
			expect(allMatcher.matchers[1]).toBe(matcher2);
		});
	});

	describe("match", () => {
		test("matches if all matchers match in sequence", () => {
			const matcherA = MatchCodePoint.fromString("A");
			const matcherB = MatchCodePoint.fromString("B");
			const allMatcher = MatchAll.from(
				matcherA,
				matcherB
			);

			const nav = MutMatchNav.from(new StrSlice("ABC"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).toBe(nav);
			expect(result?.captureMatch.value).toBe("AB");
		});

		test("returns null if any matcher in the sequence fails", () => {
			const matcherA = MatchCodePoint.fromString("A");
			const matcherB = MatchCodePoint.fromString("B");
			const matcherC = MatchCodePoint.fromString("C");
			const allMatcher = MatchAll.from(
				matcherA,
				matcherB,
				matcherC
			);

			// First two match but third doesn't
			const nav = MutMatchNav.from(new StrSlice("ABX"));
			const result = allMatcher.match(nav);

			expect(result).toBeNull();
		});

		test("passes the updated navigator to each subsequent matcher", () => {
			const matcherA = MatchCodePoint.fromString("A");
			const matcherB = MatchCodePoint.fromString("B");
			const matcherC = MatchCodePoint.fromString("C");
			const allMatcher = MatchAll.from(
				matcherA,
				matcherB,
				matcherC
			);

			const nav = MutMatchNav.from(new StrSlice("ABCD"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("ABC");
			expect(result).toBe(nav);
		});

		test("works with an empty matchers array", () => {
			const allMatcher = MatchAll.from();

			const nav = MutMatchNav.from(new StrSlice("ABC"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("");
		});
	});
});

describe("MatchOpt", () => {
	describe("constructor", () => {
		test("creates a matcher with the specified matcher", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const optMatcher = MatchOpt.from(innerMatcher);

			expect(optMatcher.matcher).toBe(innerMatcher);
		});
	});

	describe("match", () => {
		test("matches and advances the navigator if the inner matcher matches", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const optMatcher = MatchOpt.from(innerMatcher);

			const nav = MutMatchNav.from(new StrSlice("ABC"));
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("A");
		});

		test("returns the original navigator without advancing if the inner matcher does not match", () => {
			const innerMatcher =
				MatchCodePoint.fromString("X");
			const optMatcher = MatchOpt.from(innerMatcher);

			const nav = MutMatchNav.from(new StrSlice("ABC"));
			const originalNavIndex = nav.captureIndex;
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(
				originalNavIndex
			);
			expect(result?.captureMatch.value).toBe("");
		});

		test("does not invalidate the navigator if the inner matcher does not match", () => {
			const innerMatcher =
				MatchCodePoint.fromString("X");
			const optMatcher = MatchOpt.from(innerMatcher);

			const nav = MutMatchNav.from(new StrSlice("ABC"));
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.isInvalidated).toBe(false);
		});
	});
});
