import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import {
	MatchPositionBase,
	MatchStartSlice,
	MatchEndSlice,
	MatchCodePoint,
	MatchCodePointLambda,
	MatchCodePointSet,
	MatchCodePointCategories,
	allUnicodeCategories,
	CodePointRange,
	MatchCodePointRange,
	MatchCodePointRanges,
	matchAnyCodePoint,
	MatchNotCodePointOrPosition,
} from "@/trex";

describe("MatchCodePoint", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified code point", () => {
			const codePoint = 65; // 'A'
			const matcher = new MatchCodePoint(codePoint);
			expect(matcher.matchValue).toBe(codePoint);
		});
	});

	describe("match", () => {
		it("should match a single code point and advance the navigator", () => {
			const matcher = new MatchCodePoint(65); // 'A'
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		it("should return null if the code point doesn't match", () => {
			const matcher = new MatchCodePoint(65); // 'A'
			const nav = new MutMatchNav(new StrSlice("XYZ"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});

		it("should handle surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const codePoint = 0x1f600;
			const matcher = new MatchCodePoint(codePoint);
			const nav = new MutMatchNav(new StrSlice("😀BC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(2); // Surrogate pair takes 2 chars
			expect(result?.navIndex).toBe(2);
			expect(result?.captureMatch.value).toBe("😀");
		});
	});

	describe("matchCodePoint", () => {
		it("should return true for matching code point", () => {
			const matcher = new MatchCodePoint(65); // 'A'
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		it("should return false for non-matching code point", () => {
			const matcher = new MatchCodePoint(65); // 'A'
			expect(matcher.matchCodePoint(66)).toBe(false);
		});
	});
});

describe("MatchCodePointLambda", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified lambda function", () => {
			const lambda = (cp: number) =>
				cp >= 65 && cp <= 90;
			const matcher = new MatchCodePointLambda(lambda);
			expect(matcher.lambda).toBe(lambda);
		});
	});

	describe("match", () => {
		it("should match a code point that satisfies the lambda and advance the navigator", () => {
			const matcher = new MatchCodePointLambda(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		it("should return null if the code point doesn't satisfy the lambda", () => {
			const matcher = new MatchCodePointLambda(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			const nav = new MutMatchNav(new StrSlice("abc"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("should return true for code point satisfying the lambda", () => {
			const matcher = new MatchCodePointLambda(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		it("should return false for code point not satisfying the lambda", () => {
			const matcher = new MatchCodePointLambda(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			expect(matcher.matchCodePoint(97)).toBe(false);
		});
	});
});

describe("MatchCodePointSet", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified code point set", () => {
			const codePointSet = {
				65: true,
				66: true,
				67: true,
			}; // A, B, C
			const matcher = new MatchCodePointSet(
				codePointSet
			);
			expect(matcher.codePointSet).toBe(codePointSet);
		});
	});

	describe("match", () => {
		it("should match a code point in the set and advance the navigator", () => {
			const matcher = new MatchCodePointSet({
				65: true,
				66: true,
				67: true,
			}); // A, B, C
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		it("should handle surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const matcher =
				MatchCodePointSet.fromString("A😀C");

			const nav = new MutMatchNav(new StrSlice("😀BC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(2);
			expect(result?.navIndex).toBe(2);
			expect(result?.captureMatch.value).toBe("😀");
		});

		it("should return null if the code point is not in the set", () => {
			const matcher = new MatchCodePointSet({
				65: true,
				66: true,
				67: true,
			}); // A, B, C
			const nav = new MutMatchNav(new StrSlice("XYZ"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("should return true for code point in the set", () => {
			const matcher = new MatchCodePointSet({
				65: true,
				66: true,
				67: true,
			}); // A, B, C
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		it("should return false for code point not in the set", () => {
			const matcher = new MatchCodePointSet({
				65: true,
				66: true,
				67: true,
			}); // A, B, C
			expect(matcher.matchCodePoint(68)).toBe(false);
		});
	});

	describe("fromString", () => {
		it("should create a matcher from a string of characters", () => {
			const matcher =
				MatchCodePointSet.fromString("ABC");

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(66)).toBe(true); // B
			expect(matcher.matchCodePoint(67)).toBe(true); // C
			expect(matcher.matchCodePoint(68)).toBe(false); // D
		});

		it("should handle surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const matcher =
				MatchCodePointSet.fromString("A😀C");

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(0x1f600)).toBe(true); // 😀
			expect(matcher.matchCodePoint(67)).toBe(true); // C
		});
	});

	describe("fromArray", () => {
		it("should create a matcher from an array of code points", () => {
			const matcher = MatchCodePointSet.fromArray([
				65, 66, 67,
			]); // A, B, C

			expect(matcher.matchCodePoint(65)).toBe(true);
			expect(matcher.matchCodePoint(66)).toBe(true);
			expect(matcher.matchCodePoint(67)).toBe(true);
			expect(matcher.matchCodePoint(68)).toBe(false);
		});
	});
});

describe("allUnicodeCategories", () => {
	it("should contain all Unicode general categories", () => {
		expect(allUnicodeCategories).toBeInstanceOf(Object);

		// Check for some common categories
		expect(allUnicodeCategories["Lu"]).toBe(true); // Uppercase Letter
		expect(allUnicodeCategories["Ll"]).toBe(true); // Lowercase Letter
		expect(allUnicodeCategories["Nd"]).toBe(true); // Decimal Number
		expect(allUnicodeCategories["Zs"]).toBe(true); // Space Separator
		expect(allUnicodeCategories["Cn"]).toBe(true); // Unassigned

		// Check total number of categories (should be 30)
		expect(Object.keys(allUnicodeCategories).length).toBe(
			30
		);
	});
});

describe("MatchCodePointCategories", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified categories", () => {
			const categories = { Lu: true, Ll: true }; // Uppercase and lowercase letters
			const matcher = new MatchCodePointCategories(
				categories
			);
			expect(matcher.categories).toBe(categories);
		});
	});

	describe("match", () => {
		it("should match a code point in the specified categories and advance the navigator", () => {
			const matcher = new MatchCodePointCategories({
				Lu: true,
			}); // Uppercase letters
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("A");
		});

		it("should return null if the code point is not in the specified categories", () => {
			const matcher = new MatchCodePointCategories({
				Ll: true,
			}); // Lowercase letters
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("should return true for code point in the specified categories", () => {
			const matcher = new MatchCodePointCategories({
				Lu: true,
			}); // Uppercase letters
			expect(matcher.matchCodePoint(65)).toBe(true); // 'A'
		});

		it("should return false for code point not in the specified categories", () => {
			const matcher = new MatchCodePointCategories({
				Ll: true,
			}); // Lowercase letters
			expect(matcher.matchCodePoint(65)).toBe(false); // 'A'
		});
	});

	describe("fromString", () => {
		it("should create a matcher from a space-separated string of categories", () => {
			const matcher =
				MatchCodePointCategories.fromString("Lu Ll");

			expect(matcher.matchCodePoint(65)).toBe(true); // 'A' (Lu)
			expect(matcher.matchCodePoint(97)).toBe(true); // 'a' (Ll)
			expect(matcher.matchCodePoint(48)).toBe(false); // '0' (Nd)
		});

		it("should throw an error for invalid category", () => {
			expect(() => {
				MatchCodePointCategories.fromString(
					"Lu InvalidCategory"
				);
			}).toThrow(
				"Invalid Unicode category: InvalidCategory"
			);
		});
	});
});

describe("CodePointRange", () => {
	describe("constructor", () => {
		it("should create a range with the specified start and end", () => {
			const range = new CodePointRange(65, 90); // A-Z

			expect(range.start).toBe(65);
			expect(range.end).toBe(90);
		});

		it("should throw an error if start > end", () => {
			expect(() => {
				new CodePointRange(90, 65);
			}).toThrow(
				"Invalid code point range: start > end"
			);
		});
	});

	describe("contains", () => {
		it("should return true for code point within range", () => {
			const range = new CodePointRange(65, 90); // A-Z

			expect(range.contains(65)).toBe(true); // A
			expect(range.contains(77)).toBe(true); // M
			expect(range.contains(90)).toBe(true); // Z
		});

		it("should return false for code point outside range", () => {
			const range = new CodePointRange(65, 90); // A-Z

			expect(range.contains(64)).toBe(false); // @
			expect(range.contains(91)).toBe(false); // [
		});
	});

	describe("fromString", () => {
		it("should create a range from a string in format 'start-end'", () => {
			const range = CodePointRange.fromString("A-Z");

			expect(range.start).toBe(65); // A
			expect(range.end).toBe(90); // Z
		});

		it("should throw an error for invalid format", () => {
			expect(() => {
				CodePointRange.fromString("A");
			}).toThrow("Invalid code point range");

			expect(() => {
				CodePointRange.fromString("A-B-C");
			}).toThrow("Invalid code point range");
		});
	});
});

describe("MatchCodePointRange", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified range", () => {
			const range = new CodePointRange(65, 90); // A-Z
			const matcher = new MatchCodePointRange(range);

			expect(matcher.range).toBe(range);
		});
	});

	describe("match", () => {
		it("should match a code point in the range and advance the navigator", () => {
			const matcher = new MatchCodePointRange(
				new CodePointRange(65, 90)
			); // A-Z
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		it("should return null if the code point is not in the range", () => {
			const matcher = new MatchCodePointRange(
				new CodePointRange(65, 90)
			); // A-Z
			const nav = new MutMatchNav(new StrSlice("abc"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("should return true for code point in the range", () => {
			const matcher = new MatchCodePointRange(
				new CodePointRange(65, 90)
			); // A-Z

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(77)).toBe(true); // M
			expect(matcher.matchCodePoint(90)).toBe(true); // Z
		});

		it("should return false for code point not in the range", () => {
			const matcher = new MatchCodePointRange(
				new CodePointRange(65, 90)
			); // A-Z

			expect(matcher.matchCodePoint(64)).toBe(false); // @
			expect(matcher.matchCodePoint(91)).toBe(false); // [
		});
	});

	describe("fromString", () => {
		it("should create a matcher from a string in format 'start-end'", () => {
			const matcher =
				MatchCodePointRange.fromString("A-Z");

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(77)).toBe(true); // M
			expect(matcher.matchCodePoint(90)).toBe(true); // Z
			expect(matcher.matchCodePoint(97)).toBe(false); // a
		});
	});
});

describe("MatchCodePointRanges", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified ranges", () => {
			const ranges = [
				new CodePointRange(65, 90), // A-Z
				new CodePointRange(97, 122), // a-z
			];
			const matcher = new MatchCodePointRanges(ranges);

			expect(matcher.ranges).toBe(ranges);
		});
	});

	describe("match", () => {
		it("should match a code point in any of the ranges and advance the navigator", () => {
			const matcher = new MatchCodePointRanges([
				new CodePointRange(65, 90), // A-Z
				new CodePointRange(97, 122), // a-z
			]);

			// Test uppercase
			let nav = new MutMatchNav(new StrSlice("ABC"));
			let result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");

			// Test lowercase
			nav = new MutMatchNav(new StrSlice("abc"));
			result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("a");
		});

		it("should return null if the code point is not in any range", () => {
			const matcher = new MatchCodePointRanges([
				new CodePointRange(65, 90), // A-Z
				new CodePointRange(97, 122), // a-z
			]);
			const nav = new MutMatchNav(new StrSlice("123"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("should return true for code point in any of the ranges", () => {
			const matcher = new MatchCodePointRanges([
				new CodePointRange(65, 90), // A-Z
				new CodePointRange(97, 122), // a-z
			]);

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(97)).toBe(true); // a
		});

		it("should return false for code point not in any range", () => {
			const matcher = new MatchCodePointRanges([
				new CodePointRange(65, 90), // A-Z
				new CodePointRange(97, 122), // a-z
			]);

			expect(matcher.matchCodePoint(48)).toBe(false); // 0
		});
	});

	describe("fromStrings", () => {
		it("should create a matcher from an array of strings in format 'start-end'", () => {
			const matcher = MatchCodePointRanges.fromStrings([
				"A-Z",
				"a-z",
			]);

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(97)).toBe(true); // a
			expect(matcher.matchCodePoint(48)).toBe(false); // 0
		});
	});
});

describe("matchAnyCodePoint", () => {
	it("should match any valid code point", () => {
		// Test ASCII
		let nav = new MutMatchNav(new StrSlice("ABC"));
		let result = matchAnyCodePoint.match(nav);
		expect(result).not.toBeNull();
		expect(result?.captureIndex).toBe(1);
		expect(result?.navIndex).toBe(1);
		expect(result?.captureMatch.value).toBe("A");

		// Test emoji (surrogate pair)
		nav = new MutMatchNav(new StrSlice("😀BC"));
		result = matchAnyCodePoint.match(nav);
		expect(result).not.toBeNull();
		expect(result?.captureIndex).toBe(2); // Surrogate pair takes 2 chars
		expect(result?.navIndex).toBe(2);
		expect(result?.captureMatch.value).toBe("😀");

		// Test various Unicode ranges
		expect(matchAnyCodePoint.matchCodePoint(0x0000)).toBe(
			true
		); // NULL
		expect(matchAnyCodePoint.matchCodePoint(0x0041)).toBe(
			true
		); // A
		expect(matchAnyCodePoint.matchCodePoint(0x4e00)).toBe(
			true
		); // CJK Unified Ideograph
		expect(
			matchAnyCodePoint.matchCodePoint(0x1f600)
		).toBe(true); // 😀
		expect(
			matchAnyCodePoint.matchCodePoint(0x10ffff)
		).toBe(true); // Maximum code point
	});
});

describe("MatchNotCodePointOrPosition", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified matcher to negate", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);

			expect(matcher.matcher).toBe(innerMatcher);
		});
	});

	describe("match with MatchCodePointBase", () => {
		it("should match when inner matcher doesn't match and advance the navigator", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("XYZ"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("X");
		});

		it("should return null when inner matcher matches", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("match with MatchPositionBase", () => {
		it("should match when inner position matcher doesn't match", () => {
			// Create a mock MatchPositionBase that always returns null (doesn't match)
			class MockPositionMatcher extends MatchPositionBase {
				match(nav: MutMatchNav): MutMatchNav | null {
					return null;
				}
			}

			const innerMatcher = new MockPositionMatcher();
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(0); // Position matchers don't advance
			expect(result?.navIndex).toBe(0);
			expect(result?.captureMatch.value).toBe("");
		});

		it("should return null when inner position matcher matches", () => {
			// Create a mock MatchPositionBase that always returns the nav (matches)
			class MockPositionMatcher extends MatchPositionBase {
				match(nav: MutMatchNav): MutMatchNav | null {
					return nav;
				}
			}

			const innerMatcher = new MockPositionMatcher();
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("match with MatchPositionBase classes: MatchStartSlice and MatchEndSlice", () => {
		it("should match when start position doesn't match", () => {
			const innerMatcher = new MatchStartSlice();
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("ABC"));
			nav.moveCaptureForwardOneCodePoint();

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1); // Position matchers don't advance
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		it("should return null when start position matcher matches", () => {
			// Create a mock MatchPositionBase that always returns the nav (matches)
			const innerMatcher = new MatchStartSlice();
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});

		it("should match when end position doesn't match", () => {
			// Create a mock MatchPositionBase that always returns null (doesn't match)
			const innerMatcher = new MatchEndSlice();
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("ABC"));
			nav.moveCaptureForward(2);

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(2); // Position matchers don't advance
			expect(result?.navIndex).toBe(2);
			expect(result?.captureMatch.value).toBe("AB");
		});

		it("should return null when end position matcher matches", () => {
			// Create a mock MatchPositionBase that always returns the nav (matches)
			const innerMatcher = new MatchEndSlice();
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("ABC"));
			nav.moveCaptureForward(3);

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("should return true when inner matcher returns false", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);

			expect(matcher.matchCodePoint(66)).toBe(true); // B
		});

		it("should return false when inner matcher returns true", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePointOrPosition(
				innerMatcher
			);

			expect(matcher.matchCodePoint(65)).toBe(false); // A
		});

		it("should return false for MatchPositionBase: MatchStartSlice", () => {
			const matcher = new MatchNotCodePointOrPosition(
				new MatchStartSlice()
			);

			expect(matcher.matchCodePoint(65)).toBe(false);
		});

		it("should return false for MatchPositionBase: MatchEndSlice", () => {
			const matcher = new MatchNotCodePointOrPosition(
				new MatchEndSlice()
			);

			expect(matcher.matchCodePoint(65)).toBe(false);
		});

		it("should throw an error for invalid matcher type", () => {
			// Create a matcher that's neither MatchCodePointBase nor MatchPositionBase
			const invalidMatcher = {} as any;
			const matcher = new MatchNotCodePointOrPosition(
				invalidMatcher
			);

			expect(() => {
				matcher.matchCodePoint(65);
			}).toThrow("Invalid matcher type");
		});
	});
});
