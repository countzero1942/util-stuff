import { StrSlice } from "@/utils/slice";
import {
	MutMatchNav,
	MatchCodePoint,
	AltFirstLastMatchers,
	NumberOfMatches,
	matchUnicodeLetter,
	MatchRepeat,
	MatchAny,
	MatchCodePointSet,
	MatchCodePointRange,
	MatchOpt,
} from "@/trex";

describe("AltFirstLastMatchers", () => {
	test("constructs with default nulls", () => {
		const alt = AltFirstLastMatchers.default;
		expect(alt.altFirstMatch).toBeNull();
		expect(alt.altLastMatch).toBeNull();
	});
	test("constructs with provided matchers", () => {
		const m1 = MatchCodePoint.fromString("A");
		const m2 = MatchCodePoint.fromString("B");
		const alt = AltFirstLastMatchers.fromBoth(m1, m2);
		expect(alt.altFirstMatch).toBe(m1);
		expect(alt.altLastMatch).toBe(m2);
	});
	test("from() creates instance with both matchers", () => {
		const m1 = MatchCodePoint.fromString("A");
		const m2 = MatchCodePoint.fromString("B");
		const alt = AltFirstLastMatchers.fromBoth(m1, m2);
		expect(alt.altFirstMatch).toBe(m1);
		expect(alt.altLastMatch).toBe(m2);
	});
	test("fromAltFirst() creates instance with only altFirstMatch", () => {
		const m1 = MatchCodePoint.fromString("A");
		const alt = AltFirstLastMatchers.fromAltFirst(m1);
		expect(alt.altFirstMatch).toBe(m1);
		expect(alt.altLastMatch).toBeNull();
	});
	test("fromAltLast() creates instance with only altLastMatch", () => {
		const m2 = MatchCodePoint.fromString("B");
		const alt = AltFirstLastMatchers.fromAltLast(m2);
		expect(alt.altFirstMatch).toBeNull();
		expect(alt.altLastMatch).toBe(m2);
	});
});

describe("NumberOfMatches", () => {
	describe("constructor", () => {
		test("constructs with min and default max", () => {
			const n = NumberOfMatches.atLeast(2);
			expect(n.minNumber).toBe(2);
			expect(n.maxNumber).toBe(
				NumberOfMatches.maxNumberMatches
			);
		});
		test("constructs with min and explicit MAX_SAFE_INTEGER", () => {
			const n = NumberOfMatches.between(
				2,
				Number.MAX_SAFE_INTEGER
			);
			expect(n.minNumber).toBe(2);
			expect(n.maxNumber).toBe(
				NumberOfMatches.maxNumberMatches
			);
		});

		test("constructs with min and max of -1", () => {
			const n = NumberOfMatches.between(2, -1);
			expect(n.minNumber).toBe(2);
			expect(n.maxNumber).toBe(
				NumberOfMatches.maxNumberMatches
			);
		});

		test("constructs with min and max", () => {
			const n = NumberOfMatches.between(2, 5);
			expect(n.minNumber).toBe(2);
			expect(n.maxNumber).toBe(5);
		});
	});
	describe("static helpers", () => {
		test("return correct values with exactly method", () => {
			const exact = NumberOfMatches.exactly(1);
			expect(exact.minNumber).toBe(1);
			expect(exact.maxNumber).toBe(1);
		});
		test("return correct values with zeroOrMore method", () => {
			const zeroOrMore = NumberOfMatches.zeroOrMore;
			expect(zeroOrMore.minNumber).toBe(0);
			expect(zeroOrMore.maxNumber).toBe(
				NumberOfMatches.maxNumberMatches
			);
		});
		test("return correct values with oneOrMore method", () => {
			const oneOrMore = NumberOfMatches.oneOrMore;
			expect(oneOrMore.minNumber).toBe(1);
			expect(oneOrMore.maxNumber).toBe(
				NumberOfMatches.maxNumberMatches
			);
		});
		test("return correct values with between method", () => {
			const between = NumberOfMatches.between(2, 4);
			expect(between.minNumber).toBe(2);
			expect(between.maxNumber).toBe(4);
		});
		test("return correct values with atLeast method", () => {
			const atLeast = NumberOfMatches.atLeast(2);
			expect(atLeast.minNumber).toBe(2);
			expect(atLeast.maxNumber).toBe(
				NumberOfMatches.maxNumberMatches
			);
		});
	});
	describe("throws on errors", () => {
		test("throws on invalid minNumber", () => {
			expect(() => NumberOfMatches.exactly(-1)).toThrow(
				"NumberOfMatches: minNumber must be >= 0" +
					` (-1)`
			);
		});
		test("throws on invalid order of minNumber and maxNumber", () => {
			expect(() =>
				NumberOfMatches.between(1, 0)
			).toThrow(
				"NumberOfMatches: minNumber must be <= maxNumber" +
					` (1 > 0)`
			);
		});
		test("throws on invalid minNumber", () => {
			expect(() => NumberOfMatches.atLeast(-1)).toThrow(
				"NumberOfMatches: minNumber must be >= 0" +
					` (-1)`
			);
		});
	});
});

// Helper function to create simple matchers for testing
// const createLetterMatcher = (
// 	letter: string
// ): MatchCodePoint => {
// 	return new MatchCodePoint(letter.codePointAt(0)!);
// };

describe("MatchRepeat", () => {
	describe("constructor", () => {
		test("creates a matcher with default parameters", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher =
				MatchRepeat.from(innerMatcher);

			expect(repeatMatcher.matcher).toBe(innerMatcher);
			expect(
				repeatMatcher.numberOfMatches.minNumber
			).toBe(1);
			expect(
				repeatMatcher.numberOfMatches.maxNumber
			).toBe(NumberOfMatches.maxNumberMatches);
			expect(
				repeatMatcher.altFirstLastMatchers.altFirstMatch
			).toBeNull();
			expect(
				repeatMatcher.altFirstLastMatchers.altLastMatch
			).toBeNull();
		});

		test("creates a matcher with custom min and max values", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(2, 5)
			);

			expect(repeatMatcher.matcher).toBe(innerMatcher);
			expect(
				repeatMatcher.numberOfMatches.minNumber
			).toBe(2);
			expect(
				repeatMatcher.numberOfMatches.maxNumber
			).toBe(5);
		});

		test("creates a matcher with alternative first and last matchers", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const altFirstMatcher =
				MatchCodePoint.fromString("B");
			const altLastMatcher =
				MatchCodePoint.fromString("C");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.oneOrMore,
				AltFirstLastMatchers.fromBoth(
					altFirstMatcher,
					altLastMatcher
				)
			);

			expect(repeatMatcher.matcher).toBe(innerMatcher);
			expect(
				repeatMatcher.altFirstLastMatchers.altFirstMatch
			).toBe(altFirstMatcher);
			expect(
				repeatMatcher.altFirstLastMatchers.altLastMatch
			).toBe(altLastMatcher);
		});
	});

	describe("match repeat with NumberOfMatches", () => {
		const hasAllAs = (str: string | undefined) => {
			return (
				str?.split("").every(c => c === "A") ?? false
			);
		};

		test("matches the minimum required occurrences: atLeast", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.atLeast(2)
			);

			const successfulNavStrs = [
				"AA",
				"AABC",
				"AAA",
				"AAABC",
			];

			for (const navStr of successfulNavStrs) {
				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).not.toBeNull();
				expect(result).not.toBe(nav); // Should be a new instance
				expect(
					hasAllAs(result?.captureMatch.value)
				).toBe(true);
			}

			const failedNavStrs = ["A", "B", "AB", "ABC"];

			for (const navStr of failedNavStrs) {
				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).toBeNull();
			}
		});

		test("matches within range: between", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(2, 3)
			);

			const successfulNavStrs = [
				"AA",
				"AAA",
				"AAB",
				"AAAB",
			];

			for (const navStr of successfulNavStrs) {
				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).not.toBeNull();
				expect(result).not.toBe(nav); // Should be a new instance
				expect(
					hasAllAs(result?.captureMatch.value)
				).toBe(true);
			}

			const failedNavStrs = [
				"A",
				"B",
				"AB",
				"AAAA",
				"AAAAB",
				"AAAAA",
			];

			for (const navStr of failedNavStrs) {
				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).toBeNull();
			}
		});

		test("matches one or more", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.oneOrMore
			);

			const successfulNavStrs = ["A", "AA", "AAA"];

			for (const navStr of successfulNavStrs) {
				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).not.toBeNull();
				expect(result).not.toBe(nav); // Should be a new instance
				expect(
					hasAllAs(result?.captureMatch.value)
				).toBe(true);
			}

			const failedNavStrs = ["", "B", "BB"];

			for (const navStr of failedNavStrs) {
				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).toBeNull();
			}
		});

		test("matches zero or more", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.zeroOrMore
			);

			const successfulNavStrs = ["A", "AA", "AAA"];

			for (const navStr of successfulNavStrs) {
				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).not.toBeNull();
				expect(result).not.toBe(nav); // Should be a new instance
				expect(
					hasAllAs(result?.captureMatch.value)
				).toBe(true);
			}

			const optionalNavStrs = ["", "B", "BB"];

			for (const navStr of optionalNavStrs) {
				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).not.toBeNull();
				expect(result?.captureMatch.value).toBe("");
			}
		});

		test("uses altFirstMatch for the first match if provided", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const altFirstMatcher =
				MatchCodePoint.fromString("B");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(2, 5),
				AltFirstLastMatchers.fromAltFirst(
					altFirstMatcher
				)
			);

			const nav = MutMatchNav.fromString("BAAC");
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).not.toBe(nav); // Should be a new instance
			expect(result?.captureMatch.value).toBe("BAA");
		});

		test("uses altLastMatch for the last match if provided", () => {
			const contentMatcher = MatchOpt.from(
				MatchCodePoint.fromString("A")
			);
			const altLastMatcher = MatchOpt.from(
				MatchCodePoint.fromString("B")
			);
			const repeatMatcher = MatchRepeat.from(
				contentMatcher,
				NumberOfMatches.between(2, 3),
				AltFirstLastMatchers.fromAltLast(altLastMatcher)
			);

			const successfulNavStrs = [
				"AA->AA",
				"AB->AB",
				"AAA->AAA",
				"AAB->AAB",
				"AAAC->AAA",
				"AABC->AAB",
			];

			for (const pair of successfulNavStrs) {
				const [navStr, expected] = pair.split("->");

				const nav = MutMatchNav.fromString(navStr);
				const result = repeatMatcher.match(nav);
				expect(result).not.toBeNull();
				expect(result).not.toBe(nav); // Should be a new instance
				expect(result?.captureMatch.value).toBe(
					expected
				);
			}
		});

		test("should match zero occurrences when min is 0", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(0, 5)
			);

			const nav = MutMatchNav.fromString("BCD");
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("");
		});
	});
});
