import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import { MatchBase } from "@/trex/match-base";
import {
	MatchAnyMatch,
	MatchAllMatches,
	MatchOptMatch,
	MatchRepeatMatch,
	GhostMatch,
} from "@/trex/match-matches";
import { MatchCodePoint } from "@/trex/match-code-point";

// Helper function to create simple matchers for testing
const createLetterMatcher = (
	letter: string
): MatchCodePoint => {
	return new MatchCodePoint(letter.codePointAt(0)!);
};

describe("MatchAnyMatch", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified matchers array", () => {
			const matcher1 = createLetterMatcher("A");
			const matcher2 = createLetterMatcher("B");
			const anyMatcher = new MatchAnyMatch([
				matcher1,
				matcher2,
			]);

			expect(anyMatcher.matchers).toHaveLength(2);
			expect(anyMatcher.matchers[0]).toBe(matcher1);
			expect(anyMatcher.matchers[1]).toBe(matcher2);
		});
	});

	describe("match", () => {
		it("should match if any of the matchers match and return the first successful match", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const anyMatcher = new MatchAnyMatch([
				matcherA,
				matcherB,
			]);

			const navA = new MutMatchNav(new StrSlice("ABC"));
			const resultA = anyMatcher.match(navA);
			expect(resultA).not.toBeNull();
			expect(resultA?.captureMatch.toString()).toBe("A");

			const navB = new MutMatchNav(new StrSlice("BCD"));
			const resultB = anyMatcher.match(navB);
			expect(resultB).not.toBeNull();
			expect(resultB?.captureMatch.toString()).toBe("B");
		});

		it("should return null if none of the matchers match", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const anyMatcher = new MatchAnyMatch([
				matcherA,
				matcherB,
			]);

			const nav = new MutMatchNav(new StrSlice("XYZ"));
			const result = anyMatcher.match(nav);

			expect(result).toBeNull();
		});

		it("should try matchers in order and return the first match", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const anyMatcher = new MatchAnyMatch([
				matcherA,
				matcherB,
			]);

			// Both A and B could match, but A should be chosen as it's first
			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = anyMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe("A");
		});
	});
});

describe("MatchAllMatches", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified matchers array", () => {
			const matcher1 = createLetterMatcher("A");
			const matcher2 = createLetterMatcher("B");
			const allMatcher = new MatchAllMatches([
				matcher1,
				matcher2,
			]);

			expect(allMatcher.matchers).toHaveLength(2);
			expect(allMatcher.matchers[0]).toBe(matcher1);
			expect(allMatcher.matchers[1]).toBe(matcher2);
		});
	});

	describe("match", () => {
		it("should match if all matchers match in sequence", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const allMatcher = new MatchAllMatches([
				matcherA,
				matcherB,
			]);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe("AB");
		});

		it("should return null if any matcher in the sequence fails", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const matcherC = createLetterMatcher("C");
			const allMatcher = new MatchAllMatches([
				matcherA,
				matcherB,
				matcherC,
			]);

			// First two match but third doesn't
			const nav = new MutMatchNav(new StrSlice("ABX"));
			const result = allMatcher.match(nav);

			expect(result).toBeNull();
		});

		it("should pass the updated navigator to each subsequent matcher", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const matcherC = createLetterMatcher("C");
			const allMatcher = new MatchAllMatches([
				matcherA,
				matcherB,
				matcherC,
			]);

			const nav = new MutMatchNav(new StrSlice("ABCD"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe(
				"ABC"
			);
			expect(result?.captureIndex).toBe(3);
		});

		it("should work with an empty matchers array", () => {
			const allMatcher = new MatchAllMatches([]);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = allMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe("");
		});
	});
});

describe("MatchOptMatch", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified matcher", () => {
			const innerMatcher = createLetterMatcher("A");
			const optMatcher = new MatchOptMatch(innerMatcher);

			expect(optMatcher.matcher).toBe(innerMatcher);
		});
	});

	describe("match", () => {
		it("should match and advance the navigator if the inner matcher matches", () => {
			const innerMatcher = createLetterMatcher("A");
			const optMatcher = new MatchOptMatch(innerMatcher);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe("A");
		});

		it("should return the original navigator without advancing if the inner matcher doesn't match", () => {
			const innerMatcher = createLetterMatcher("X");
			const optMatcher = new MatchOptMatch(innerMatcher);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const originalNavIndex = nav.navIndex;
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.navIndex).toBe(originalNavIndex);
			expect(result?.captureMatch.toString()).toBe("");
		});

		it("should not invalidate the navigator if the inner matcher doesn't match", () => {
			const innerMatcher = createLetterMatcher("X");
			const optMatcher = new MatchOptMatch(innerMatcher);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = optMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.isInvalidated).toBe(false);
		});
	});
});

describe("MatchRepeatMatch", () => {
	describe("constructor", () => {
		it("should create a matcher with default parameters", () => {
			const innerMatcher = createLetterMatcher("A");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher
			);

			expect(repeatMatcher.matcher).toBe(innerMatcher);
			expect(repeatMatcher.minNumberMatches).toBe(1);
			expect(repeatMatcher.maxNumberMatches).toBe(-1);
			expect(repeatMatcher.altFirstMatch).toBeNull();
			expect(repeatMatcher.altLastMatch).toBeNull();
		});

		it("should create a matcher with custom min and max values", () => {
			const innerMatcher = createLetterMatcher("A");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				2,
				5
			);

			expect(repeatMatcher.matcher).toBe(innerMatcher);
			expect(repeatMatcher.minNumberMatches).toBe(2);
			expect(repeatMatcher.maxNumberMatches).toBe(5);
		});

		it("should create a matcher with alternative first and last matchers", () => {
			const innerMatcher = createLetterMatcher("A");
			const altFirstMatcher = createLetterMatcher("B");
			const altLastMatcher = createLetterMatcher("C");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				1,
				-1,
				altFirstMatcher,
				altLastMatcher
			);

			expect(repeatMatcher.matcher).toBe(innerMatcher);
			expect(repeatMatcher.altFirstMatch).toBe(
				altFirstMatcher
			);
			expect(repeatMatcher.altLastMatch).toBe(
				altLastMatcher
			);
		});
	});

	describe("match", () => {
		it("should match the minimum required occurrences", () => {
			const innerMatcher = createLetterMatcher("A");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				2,
				5
			);

			const nav = new MutMatchNav(new StrSlice("AABC"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe("AA");
		});

		it("should match up to the maximum allowed occurrences", () => {
			const innerMatcher = createLetterMatcher("A");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				1,
				3
			);

			const nav = new MutMatchNav(new StrSlice("AAAAA"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe(
				"AAA"
			);
		});

		it("should return null if fewer than minimum occurrences match", () => {
			const innerMatcher = createLetterMatcher("A");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				3,
				5
			);

			const nav = new MutMatchNav(new StrSlice("AAB"));
			const result = repeatMatcher.match(nav);

			expect(result).toBeNull();
		});

		it("should match unlimited occurrences when max is -1", () => {
			const innerMatcher = createLetterMatcher("A");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				1,
				-1
			);

			const nav = new MutMatchNav(
				new StrSlice("AAAAAB")
			);
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe(
				"AAAAA"
			);
		});

		it("should use altFirstMatch for the first match if provided", () => {
			const innerMatcher = createLetterMatcher("A");
			const altFirstMatcher = createLetterMatcher("B");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				2,
				5,
				altFirstMatcher
			);

			const nav = new MutMatchNav(new StrSlice("BAAC"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe(
				"BAA"
			);
		});

		it("should use altLastMatch for the last match if provided", () => {
			const innerMatcher = createLetterMatcher("A");
			const altLastMatcher = createLetterMatcher("B");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				2,
				3,
				null,
				altLastMatcher
			);

			const nav = new MutMatchNav(new StrSlice("AABC"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe(
				"AAB"
			);
		});

		it("should match zero occurrences when min is 0", () => {
			const innerMatcher = createLetterMatcher("A");
			const repeatMatcher = new MatchRepeatMatch(
				innerMatcher,
				0,
				5
			);

			const nav = new MutMatchNav(new StrSlice("BCD"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe("");
		});
	});
});

describe("GhostMatch", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified matcher", () => {
			const innerMatcher = createLetterMatcher("A");
			const ghostMatcher = new GhostMatch(innerMatcher);

			expect(ghostMatcher.matcher).toBe(innerMatcher);
		});
	});

	describe("match", () => {
		it("should match but only advance the ghost capture, not the actual capture", () => {
			const innerMatcher = createLetterMatcher("A");
			const ghostMatcher = new GhostMatch(innerMatcher);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = ghostMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe("");
			expect(result?.ghostMatch.toString()).toBe("A");
		});

		it("should return null if the inner matcher doesn't match", () => {
			const innerMatcher = createLetterMatcher("X");
			const ghostMatcher = new GhostMatch(innerMatcher);

			const nav = new MutMatchNav(new StrSlice("ABC"));
			const result = ghostMatcher.match(nav);

			expect(result).toBeNull();
		});

		// Updated test case - ghost match should only be used at the end of a sequence
		it("should be used at the end of a match sequence to handle delimiters", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const matcherComma = createLetterMatcher(",");
			const ghostComma = new GhostMatch(matcherComma);

			// First match A and B normally, then match comma as ghost at the end
			const sequence = new MatchAllMatches([
				matcherA,
				matcherB,
				ghostComma,
			]);

			const nav = new MutMatchNav(new StrSlice("AB,C"));
			const result = sequence.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.toString()).toBe("AB");
			// The ghost match includes everything from capture index to nav index
			// The comma matcher advances nav index by 1, but the ghost capture includes all text
			expect(result?.ghostMatch.toString()).toBe(",");
			expect(result?.captureIndex).toBe(2);
			expect(result?.navIndex).toBe(3);
		});

		// New test case to demonstrate the error when ghost capture is in the middle
		it("should throw an error if a ghost match is followed by another match", () => {
			const matcherA = createLetterMatcher("A");
			const matcherComma = createLetterMatcher(",");
			const ghostComma = new GhostMatch(matcherComma);
			const matcherB = createLetterMatcher("B");

			// Incorrectly place ghost match in the middle of the sequence
			const sequence = new MatchAllMatches([
				matcherA,
				ghostComma, // This creates a ghost capture
				matcherB, // This will try to match after a ghost capture exists
			]);

			const nav = new MutMatchNav(new StrSlice("A,B"));

			// This should throw an error because we can't match after a ghost capture
			expect(() => {
				sequence.match(nav);
			}).toThrow(
				"Nav has ghost capture at end: cannot match further"
			);
		});

		it("should demonstrate proper use of ghost match in a sequence", () => {
			const matcherA = createLetterMatcher("A");
			const matcherComma = createLetterMatcher(",");
			const ghostComma = new GhostMatch(matcherComma);

			const nav = new MutMatchNav(new StrSlice("A,B"));

			// First match A normally
			const resultA = matcherA.match(nav);
			expect(resultA).not.toBeNull();
			expect(resultA?.captureMatch.toString()).toBe("A");
			expect(resultA?.ghostMatch.toString()).toBe("");

			// Then match comma as ghost at the end of this sequence
			const resultComma = ghostComma.match(resultA!);
			expect(resultComma).not.toBeNull();
			expect(resultComma?.captureMatch.toString()).toBe(
				"A"
			);
			// The ghost match includes everything from capture index to nav index
			// Even though only the comma is matched, the ghost capture includes all remaining text
			expect(resultComma?.ghostMatch.toString()).toBe(
				","
			);

			// At this point, we would need to start a new match sequence
			// by creating a new navigator or resetting the current one
			// before attempting to match 'B'
			const lastResult = resultComma!.copy();
		});
	});
});
