import { StrSlice } from "@/utils/slice";
import {
	MutMatchNav,
	MatchCodePoint,
	AltFirstLastMatchers,
	NumberOfMatches,
	matchUnicodeLetter,
	MatchRepeat,
	MatchAny,
} from "@/trex";

describe("AltFirstLastMatchers", () => {
	it("constructs with default nulls", () => {
		const alt = AltFirstLastMatchers.default;
		expect(alt.altFirstMatch).toBeNull();
		expect(alt.altLastMatch).toBeNull();
	});
	it("constructs with provided matchers", () => {
		const m1 = MatchCodePoint.fromString("A");
		const m2 = MatchCodePoint.fromString("B");
		const alt = AltFirstLastMatchers.from(m1, m2);
		expect(alt.altFirstMatch).toBe(m1);
		expect(alt.altLastMatch).toBe(m2);
	});
	it("from() creates instance with both matchers", () => {
		const m1 = MatchCodePoint.fromString("A");
		const m2 = MatchCodePoint.fromString("B");
		const alt = AltFirstLastMatchers.from(m1, m2);
		expect(alt.altFirstMatch).toBe(m1);
		expect(alt.altLastMatch).toBe(m2);
	});
	it("fromAltFirst() creates instance with only altFirstMatch", () => {
		const m1 = MatchCodePoint.fromString("A");
		const alt = AltFirstLastMatchers.fromAltFirst(m1);
		expect(alt.altFirstMatch).toBe(m1);
		expect(alt.altLastMatch).toBeNull();
	});
	it("fromAltLast() creates instance with only altLastMatch", () => {
		const m2 = MatchCodePoint.fromString("B");
		const alt = AltFirstLastMatchers.fromAltLast(m2);
		expect(alt.altFirstMatch).toBeNull();
		expect(alt.altLastMatch).toBe(m2);
	});
	it("getStartAndNextMatcher returns a MatchAny containing both matchers", () => {
		// Use dummy matcher objects for clarity
		const m1 = { match: () => null } as any;
		const m2 = { match: () => null } as any;
		const alt = AltFirstLastMatchers.fromAltFirst(m1);
		const [start, next] = alt.getStartAndNextMatcher(m2);
		// start should be a MatchAny containing m1 and m2
		expect(start.constructor.name).toBe("MatchAny");
		if (start.constructor.name === "MatchAny") {
			// @ts-expect-error: MatchAny has .matchers
			expect(start.matchers).toContain(m1);
			// @ts-expect-error: MatchAny has .matchers
			expect(start.matchers).toContain(m2);
		}
		expect(next).not.toBeNull();
	});
});

describe("NumberOfMatches", () => {
	describe("constructor", () => {
		it("constructs with min and default max", () => {
			const n = NumberOfMatches.atLeast(2);
			expect(n.minNumber).toBe(2);
			expect(n.maxNumber).toBe(Number.MAX_SAFE_INTEGER);
		});
		it("constructs with min and explicit default max", () => {
			const n = NumberOfMatches.between(
				2,
				Number.MAX_SAFE_INTEGER
			);
			expect(n.minNumber).toBe(2);
			expect(n.maxNumber).toBe(Number.MAX_SAFE_INTEGER);
		});

		it("constructs with min and max", () => {
			const n = NumberOfMatches.between(2, 5);
			expect(n.minNumber).toBe(2);
			expect(n.maxNumber).toBe(5);
		});
	});
	describe("static helpers", () => {
		it("return correct values with exactly method", () => {
			const exact = NumberOfMatches.exactly(1);
			expect(exact.minNumber).toBe(1);
			expect(exact.maxNumber).toBe(1);
		});
		it("return correct values with zeroOrMore method", () => {
			const zeroOrMore = NumberOfMatches.zeroOrMore();
			expect(zeroOrMore.minNumber).toBe(0);
			expect(zeroOrMore.maxNumber).toBe(
				Number.MAX_SAFE_INTEGER
			);
		});
		it("return correct values with oneOrMore method", () => {
			const oneOrMore = NumberOfMatches.oneOrMore();
			expect(oneOrMore.minNumber).toBe(1);
			expect(oneOrMore.maxNumber).toBe(
				Number.MAX_SAFE_INTEGER
			);
		});
		it("return correct values with between method", () => {
			const between = NumberOfMatches.between(2, 4);
			expect(between.minNumber).toBe(2);
			expect(between.maxNumber).toBe(4);
		});
		it("return correct values with atLeast method", () => {
			const atLeast = NumberOfMatches.atLeast(2);
			expect(atLeast.minNumber).toBe(2);
			expect(atLeast.maxNumber).toBe(
				Number.MAX_SAFE_INTEGER
			);
		});
	});
	describe("throws on errors", () => {
		it("throws on invalid minNumber", () => {
			expect(() => NumberOfMatches.exactly(-1)).toThrow(
				"NumberOfMatches: minNumber must be >= 0" +
					` (-1)`
			);
		});
		it("throws on invalid order of minNumber and maxNumber", () => {
			expect(() =>
				NumberOfMatches.between(1, 0)
			).toThrow(
				"NumberOfMatches: minNumber must be <= maxNumber" +
					` (1 > 0)`
			);
		});
		it("throws on invalid minNumber", () => {
			expect(() => NumberOfMatches.atLeast(-1)).toThrow(
				"NumberOfMatches: minNumber must be >= 0" +
					` (-1)`
			);
		});
	});

	describe("handles getStartAndNextMatcher correctly", () => {
		it("returns correct matchers for altFirstMatch and altLastMatch", () => {
			const altFirstMatch =
				MatchCodePoint.fromString("{");
			const altLastMatch =
				MatchCodePoint.fromString("}");
			const alt = AltFirstLastMatchers.from(
				altFirstMatch,
				altLastMatch
			);
			const matcher = matchUnicodeLetter;

			const [start, next] =
				alt.getStartAndNextMatcher(matcher);
			expect(start).toBeInstanceOf(MatchAny);
			if (!(start instanceof MatchAny)) {
				throw new Error("start is not a MatchAny");
			}
			expect(start.matchers[0]).toBe(altFirstMatch);
			expect(start.matchers[1]).toBe(matcher);
			expect(next).toBeInstanceOf(MatchAny);
			if (!(next instanceof MatchAny)) {
				throw new Error("next is not a MatchAny");
			}
			expect(next.matchers[0]).toBe(matcher);
			expect(next.matchers[1]).toBe(altLastMatch);
		});

		it("returns correct matchers for altFirstMatch only", () => {
			const altFirstMatch =
				MatchCodePoint.fromString("{");
			const alt =
				AltFirstLastMatchers.fromAltFirst(
					altFirstMatch
				);
			const matcher = matchUnicodeLetter;

			const [start, next] =
				alt.getStartAndNextMatcher(matcher);
			expect(start).toBeInstanceOf(MatchAny);
			if (!(start instanceof MatchAny)) {
				throw new Error("start is not a MatchAny");
			}
			expect(start.matchers[0]).toBe(altFirstMatch);
			expect(start.matchers[1]).toBe(matcher);
			expect(next).toBe(matcher);
		});

		it("returns correct matchers for altLastMatch only", () => {
			const altLastMatch =
				MatchCodePoint.fromString("}");
			const alt =
				AltFirstLastMatchers.fromAltLast(altLastMatch);
			const matcher = matchUnicodeLetter;

			const [start, next] =
				alt.getStartAndNextMatcher(matcher);
			expect(start).toBe(matcher);
			expect(next).toBeInstanceOf(MatchAny);
			if (!(next instanceof MatchAny)) {
				throw new Error("next is not a MatchAny");
			}
			expect(next.matchers[0]).toBe(matcher);
			expect(next.matchers[1]).toBe(altLastMatch);
		});

		it("returns correct matchers for altFirstMatch and altLastMatch both null", () => {
			const alt = AltFirstLastMatchers.default;
			const matcher = matchUnicodeLetter;

			const [start, next] =
				alt.getStartAndNextMatcher(matcher);
			expect(start).toBe(matcher);
			expect(next).toBe(matcher);
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
		it("creates a matcher with default parameters", () => {
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
			).toBe(Number.MAX_SAFE_INTEGER);
			expect(
				repeatMatcher.altFirstLastMatchers.altFirstMatch
			).toBeNull();
			expect(
				repeatMatcher.altFirstLastMatchers.altLastMatch
			).toBeNull();
		});

		it("creates a matcher with custom min and max values", () => {
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

		it("creates a matcher with alternative first and last matchers", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const altFirstMatcher =
				MatchCodePoint.fromString("B");
			const altLastMatcher =
				MatchCodePoint.fromString("C");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.oneOrMore(),
				AltFirstLastMatchers.from(
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

	describe("match", () => {
		it("matches the minimum required occurrences", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(2, 5)
			);

			const nav = new MutMatchNav(new StrSlice("AABC"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).not.toBe(nav); // Should be a new instance
			expect(result?.captureMatch.value).toBe("AA");
		});

		it("matches up to the maximum allowed occurrences", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(1, 3)
			);

			const nav = new MutMatchNav(new StrSlice("AAAAA"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).not.toBe(nav); // Should be a new instance
			expect(result?.captureMatch.value).toBe("AAA");
		});

		it("returns null if fewer than minimum occurrences match", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(3, 5)
			);

			const nav = new MutMatchNav(new StrSlice("AAB"));
			const result = repeatMatcher.match(nav);

			expect(result).toBeNull();
		});

		it("matches unlimited occurrences when max is -1", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.oneOrMore()
			);

			const nav = new MutMatchNav(
				new StrSlice("AAAAAB")
			);
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).not.toBe(nav); // Should be a new instance
			expect(result?.captureMatch.value).toBe("AAAAA");
		});

		it("uses altFirstMatch for the first match if provided", () => {
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

			const nav = new MutMatchNav(new StrSlice("BAAC"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).not.toBe(nav); // Should be a new instance
			expect(result?.captureMatch.value).toBe("BAA");
		});

		it("uses altLastMatch for the last match if provided", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const altLastMatcher =
				MatchCodePoint.fromString("B");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(2, 3),
				AltFirstLastMatchers.fromAltLast(altLastMatcher)
			);

			const nav = new MutMatchNav(new StrSlice("AABC"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result).not.toBe(nav); // Should be a new instance
			expect(result?.captureMatch.value).toBe("AAB");
		});

		it("should match zero occurrences when min is 0", () => {
			const innerMatcher =
				MatchCodePoint.fromString("A");
			const repeatMatcher = MatchRepeat.from(
				innerMatcher,
				NumberOfMatches.between(0, 5)
			);

			const nav = new MutMatchNav(new StrSlice("BCD"));
			const result = repeatMatcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("");
		});
	});
});
