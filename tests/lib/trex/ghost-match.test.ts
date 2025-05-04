import {
	MatchCodePoint,
	GhostMatch,
	MutMatchNav,
	MatchAll,
} from "@/trex";
import { StrSlice } from "@/utils/slice";

// Helper function to create simple matchers for testing
const createLetterMatcher = (
	letter: string
): MatchCodePoint => {
	return MatchCodePoint.fromNumber(letter.codePointAt(0)!);
};

describe("GhostMatch", () => {
	describe("constructor", () => {
		it("creates a matcher with the specified matcher", () => {
			const innerMatcher = createLetterMatcher("A");
			const ghostMatcher = GhostMatch.from(innerMatcher);

			expect(ghostMatcher.matcher).toBe(innerMatcher);
		});
	});

	describe("match", () => {
		it("should match but only advance the ghost capture, not the actual capture", () => {
			const innerMatcher = createLetterMatcher("A");
			const ghostMatcher = GhostMatch.from(innerMatcher);

			const nav = MutMatchNav.fromString("ABC");
			const result = ghostMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).toBe(nav); // Should be the same instance
			expect(result?.captureMatch.value).toBe("");
			expect(result?.ghostMatch.value).toBe("A");
		});

		it("should return null if the inner matcher doesn't match", () => {
			const innerMatcher = createLetterMatcher("X");
			const ghostMatcher = GhostMatch.from(innerMatcher);

			const nav = MutMatchNav.fromString("ABC");
			const result = ghostMatcher.match(nav);

			expect(result).toBeNull();
		});

		// Updated test case - ghost match should only be used at the end of a sequence
		it("is used at the end of a match sequence to handle delimiters", () => {
			const matcherA = createLetterMatcher("A");
			const matcherB = createLetterMatcher("B");
			const matcherComma = createLetterMatcher(",");
			const ghostComma = GhostMatch.from(matcherComma);

			// First match A and B normally, then match comma as ghost at the end
			const sequence = MatchAll.from(
				matcherA,
				matcherB,
				ghostComma
			);

			const nav = MutMatchNav.fromString("AB,C");
			const result = sequence.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("AB");
			// The ghost match includes everything from capture index to nav index
			// The comma matcher advances nav index by 1, but the ghost capture includes all text
			expect(result?.ghostMatch.value).toBe(",");
			expect(result?.captureIndex).toBe(2);
			expect(result?.navIndex).toBe(3);
		});

		// New test case to demonstrate the error when ghost capture is in the middle
		it("throws an error if a ghost match is followed by another match", () => {
			const matcherA = createLetterMatcher("A");
			const matcherComma = createLetterMatcher(",");
			const ghostComma = GhostMatch.from(matcherComma);
			const matcherB = createLetterMatcher("B");

			// Incorrectly place ghost match in the middle of the sequence
			const sequence = MatchAll.from(
				matcherA,
				ghostComma, // This creates a ghost capture
				matcherB // This will try to match after a ghost capture exists
			);

			const nav = MutMatchNav.fromString("A,B");

			// This should throw an error because we can't match after a ghost capture
			expect(() => {
				sequence.match(nav);
			}).toThrow(
				"Navigator has ghost capture at end: cannot match further"
			);
		});

		it("demonstrates proper use of ghost match in a sequence", () => {
			const matcherA = createLetterMatcher("A");
			const matcherComma = createLetterMatcher(",");
			const ghostComma = GhostMatch.from(matcherComma);

			const nav = MutMatchNav.fromString("A,B");

			// First match A normally
			const resultA = matcherA.match(nav);
			expect(resultA).not.toBeNull();
			expect(resultA?.captureMatch.value).toBe("A");
			expect(resultA?.ghostMatch.value).toBe("");

			// Then match comma as ghost at the end of this sequence
			const resultComma = ghostComma.match(resultA!);
			expect(resultComma).not.toBeNull();
			expect(resultComma?.captureMatch.value).toBe("A");
			// The ghost match includes everything from capture index to nav index
			// Even though only the comma is matched, the ghost capture includes all remaining text
			expect(resultComma?.ghostMatch.value).toBe(",");

			// At this point, we would need to start a new match sequence
			// by creating a new navigator or resetting the current one
			// before attempting to match 'B'
			const lastResult = resultComma!.copy();
		});
	});
});
