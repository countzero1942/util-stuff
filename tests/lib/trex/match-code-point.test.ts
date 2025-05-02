import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import {
	MatchPositionBase,
	MatchStartSlice,
	MatchEndSlice,
	MatchCodePoint,
	MatchCodePointLambda,
	MatchCodePointSet,
	MatchCodePointCat,
	allUnicodeCategories,
	CodePointRange,
	MatchCodePointRange,
	MatchCodePointRanges,
	MatchNotCodePoint,
	MatchRepeat,
	matchUnicodeWhiteSpace,
} from "@/trex";
import { CodePointSeq } from "@/utils/seq";

describe("MatchCodePoint", () => {
	describe("factory constructor", () => {
		it("creates a matcher with the specified code point by number", () => {
			const codePoint = 65; // 'A'
			const matcher =
				MatchCodePoint.fromNumber(codePoint);
			expect(matcher.matchValue).toBe(codePoint);
		});

		it("creates a matcher with the specified code point by string", () => {
			const codePoint = 65; // 'A'
			const matcher = MatchCodePoint.fromString("A");
			expect(matcher.matchValue).toBe(codePoint);
		});
	});

	describe("match", () => {
		it("matches a single code point and advances the navigator", () => {
			const matcher = MatchCodePoint.fromNumber(65); // 'A'
			const nav = MutMatchNav.from(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		it("returns null if the code point does not match", () => {
			const matcher = MatchCodePoint.fromNumber(65); // 'A'
			const nav = MutMatchNav.from(new StrSlice("XYZ"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});

		it("handles surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const codePoint = 0x1f600;
			const matcher =
				MatchCodePoint.fromNumber(codePoint);
			const nav = MutMatchNav.from(new StrSlice("😀BC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(2); // Surrogate pair takes 2 chars
			expect(result?.navIndex).toBe(2);
			expect(result?.captureMatch.value).toBe("😀");
		});
	});

	describe("matchCodePoint", () => {
		it("returns true for matching code point", () => {
			const matcher = MatchCodePoint.fromNumber(65); // 'A'
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		it("returns false for non-matching code point", () => {
			const matcher = MatchCodePoint.fromNumber(65); // 'A'
			expect(matcher.matchCodePoint(66)).toBe(false);
		});
	});
});

describe("MatchCodePointLambda", () => {
	describe("constructor", () => {
		it("creates a matcher with the specified lambda function", () => {
			const lambda = (cp: number) =>
				cp >= 65 && cp <= 90;
			const matcher = MatchCodePointLambda.from(lambda);
			expect(matcher.lambda).toBe(lambda);
		});
	});

	describe("match", () => {
		it("matches a code point that satisfies the lambda and advances the navigator", () => {
			const matcher = MatchCodePointLambda.from(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			const nav = MutMatchNav.from(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		it("returns null if the code point does not satisfy the lambda", () => {
			const matcher = MatchCodePointLambda.from(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			const nav = MutMatchNav.from(new StrSlice("abc"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("returns true for code point satisfying the lambda", () => {
			const matcher = MatchCodePointLambda.from(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		it("returns false for code point not satisfying the lambda", () => {
			const matcher = MatchCodePointLambda.from(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			expect(matcher.matchCodePoint(97)).toBe(false);
		});
	});
});

describe("MatchCodePointSet", () => {
	describe("constructor", () => {
		it("creates a matcher with the specified code point set", () => {
			const codePointSet = {
				65: true,
				66: true,
				67: true,
			}; // A, B, C
			const matcher =
				MatchCodePointSet.fromString("ABC");
			expect(matcher.codePointSet).toStrictEqual(
				codePointSet
			);
		});
	});

	describe("match", () => {
		it("matches a code point in the set and advances the navigator", () => {
			const matcher =
				MatchCodePointSet.fromString("ABC");
			const nav = MutMatchNav.from(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		it("handles surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const matcher =
				MatchCodePointSet.fromString("A😀C");

			const nav = MutMatchNav.from(new StrSlice("😀BC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(2);
			expect(result?.navIndex).toBe(2);
			expect(result?.captureMatch.value).toBe("😀");
		});

		it("returns null if the code point is not in the set", () => {
			const matcher =
				MatchCodePointSet.fromString("ABC");
			const nav = MutMatchNav.from(new StrSlice("XYZ"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("returns true for code point in the set", () => {
			const matcher = MatchCodePointSet.fromArgs("ABC");
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		it("returns false for code point not in the set", () => {
			const matcher = MatchCodePointSet.fromArgs("ABC");
			expect(matcher.matchCodePoint(68)).toBe(false);
		});
	});

	describe("fromString", () => {
		it("creates a matcher from a string of characters", () => {
			const matcher = MatchCodePointSet.fromArgs("ABC");

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(66)).toBe(true); // B
			expect(matcher.matchCodePoint(67)).toBe(true); // C
			expect(matcher.matchCodePoint(68)).toBe(false); // D
		});

		it("handles surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const matcher = MatchCodePointSet.fromArgs("A😀C");

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(0x1f600)).toBe(true); // 😀
			expect(matcher.matchCodePoint(67)).toBe(true); // C
		});
	});

	describe("fromArray", () => {
		it("creates a matcher from an array of code points", () => {
			const matcher = MatchCodePointSet.fromNumbers(
				65,
				66,
				67
			); // A, B, C

			expect(matcher.matchCodePoint(65)).toBe(true);
			expect(matcher.matchCodePoint(66)).toBe(true);
			expect(matcher.matchCodePoint(67)).toBe(true);
			expect(matcher.matchCodePoint(68)).toBe(false);
			expect(matcher.length).toBe(3);
		});
	});

	describe("fromArgs", () => {
		it("creates a matcher from an array of CodePointRange, string, and MatchCodePointSet", () => {
			const matchSet = MatchCodePointSet.fromArgs(
				CodePointRange.fromString("a-z"),
				CodePointRange.fromString("0-9"),
				"!@#$%^&*()_+",
				"😀",
				matchUnicodeWhiteSpace
			);

			const matcher = new MatchRepeat(matchSet);

			const nav = new MutMatchNav(
				StrSlice.from("abz 129\t!@#\r\n😀ABC")
			);
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe(
				"abz 129\t!@#\r\n😀"
			);
		});

		it("includes every code point added to the set 'fromArgs'", () => {
			let checkCount = 0;

			const range1: string = "a-z";
			const range2: string = "0-9";
			const str1: string = "!@#$%^&*()_+";
			const str2: string = "😀";

			const matchSet = MatchCodePointSet.fromArgs(
				CodePointRange.fromString(range1),
				CodePointRange.fromString(range2),
				str1,
				str2,
				matchUnicodeWhiteSpace
			);

			const rangeToString = (range: string) => {
				const codePointRange =
					CodePointRange.fromString(range);
				return codePointRange.toFullString();
			};

			const checkString = (str: string) => {
				const seq = new CodePointSeq(str);
				seq.codePoints().forEach(codePoint => {
					checkCount++;
					const isMatch =
						matchSet.matchCodePoint(codePoint);
					const isInSet =
						matchSet.codePointSet[codePoint];
					expect(isMatch).toBe(true);
					expect(isInSet).toBe(true);
				});
			};

			const checkRangeStr = (range: string) => {
				checkString(rangeToString(range));
			};

			checkRangeStr(range1);
			checkRangeStr(range2);
			checkString(str1);
			checkString(str2);

			for (const codePointStr in matchUnicodeWhiteSpace.codePointSet) {
				checkCount++;
				const codePoint = Number(codePointStr);
				const isMatch =
					matchSet.matchCodePoint(codePoint);
				const isInSet =
					matchSet.codePointSet[codePoint];
				expect(isMatch).toBe(true);
				expect(isInSet).toBe(true);
			}

			expect(checkCount).toBe(matchSet.length);
		});

		it("throws an error on wrong type input", () => {
			expect(() => {
				MatchCodePointSet.fromArgs({} as any);
			}).toThrow();
		});
	});
});

describe("allUnicodeCategories", () => {
	it("contains all Unicode general categories", () => {
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
		it("creates a matcher with the specified categories", () => {
			const categories = { Lu: true, Ll: true }; // Uppercase and lowercase letters
			const matcher = new MatchCodePointCat(categories);
			expect(matcher.categories).toBe(categories);
		});
	});

	describe("match", () => {
		it("matches a code point in the specified categories and advances the navigator", () => {
			const matcher = new MatchCodePointCat({
				Lu: true,
			}); // Uppercase letters
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("A");
		});

		it("returns null if the code point is not in the specified categories", () => {
			const matcher = new MatchCodePointCat({
				Ll: true,
			}); // Lowercase letters
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("returns true for code point in the specified categories", () => {
			const matcher = new MatchCodePointCat({
				Lu: true,
			}); // Uppercase letters
			expect(matcher.matchCodePoint(65)).toBe(true); // 'A'
		});

		it("returns false for code point not in the specified categories", () => {
			const matcher = new MatchCodePointCat({
				Ll: true,
			}); // Lowercase letters
			expect(matcher.matchCodePoint(65)).toBe(false); // 'A'
		});
	});

	describe("fromString", () => {
		it("creates a matcher from a space-separated string of categories", () => {
			const matcher =
				MatchCodePointCat.fromString("Lu Ll");

			expect(matcher.matchCodePoint(65)).toBe(true); // 'A' (Lu)
			expect(matcher.matchCodePoint(97)).toBe(true); // 'a' (Ll)
			expect(matcher.matchCodePoint(48)).toBe(false); // '0' (Nd)
		});

		it("throws an error for invalid category", () => {
			expect(() => {
				MatchCodePointCat.fromString(
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
		it("creates a range with the specified start and end", () => {
			const range = new CodePointRange(65, 90); // A-Z

			expect(range.start).toBe(65);
			expect(range.end).toBe(90);
		});

		it("throws an error if start > end", () => {
			expect(() => {
				new CodePointRange(90, 65);
			}).toThrow(
				"Invalid code point range: start > end"
			);
		});

		it("throws an error if start is not a valid code point", () => {
			expect(() => {
				new CodePointRange(-1, 90);
			}).toThrow(
				"Invalid code point range: start is not a valid code point"
			);
		});

		it("throws an error if end is not a valid code point", () => {
			expect(() => {
				new CodePointRange(65, 0x110000);
			}).toThrow(
				"Invalid code point range: end is not a valid code point"
			);
		});
	});

	describe("contains", () => {
		it("returns true for code point within range", () => {
			const range = new CodePointRange(65, 90); // A-Z

			expect(range.contains(65)).toBe(true); // A
			expect(range.contains(77)).toBe(true); // M
			expect(range.contains(90)).toBe(true); // Z
		});

		it("returns false for code point outside range", () => {
			const range = new CodePointRange(65, 90); // A-Z

			expect(range.contains(64)).toBe(false); // @
			expect(range.contains(91)).toBe(false); // [
		});
	});

	describe("fromString", () => {
		it("creates a range from a string in format 'start-end'", () => {
			const range = CodePointRange.fromString("A-Z");

			expect(range.start).toBe(65); // A
			expect(range.end).toBe(90); // Z
		});

		it("throws an error for invalid format", () => {
			expect(() => {
				CodePointRange.fromString("A");
			}).toThrow("Invalid code point range");

			expect(() => {
				CodePointRange.fromString("A-B-C");
			}).toThrow("Invalid code point range");
		});
	});

	describe("to string methods", () => {
		it("returns string representation of range", () => {
			const range = new CodePointRange(65, 90); // A-Z
			expect(range.toString()).toBe("A-Z");
		});

		it("returns string representation of range", () => {
			const range = new CodePointRange(65, 90); // A-Z
			expect(range.toFullString()).toBe(
				"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			);
		});

		it("returns string representation of range", () => {
			const range = CodePointRange.fromString("A-Z"); // A-Z
			expect(range.toString()).toBe("A-Z");
		});

		it("returns string representation of range", () => {
			const range = CodePointRange.fromString("A-Z"); // A-Z
			expect(range.toFullString()).toBe(
				"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			);
		});
	});
});

describe("MatchCodePointRange", () => {
	describe("constructor", () => {
		it("creates a matcher with the specified range", () => {
			const range = new CodePointRange(65, 90); // A-Z
			const matcher = new MatchCodePointRange(range);

			expect(matcher.range).toBe(range);
		});
	});

	describe("match", () => {
		it("matches a code point in the range and advances the navigator", () => {
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

		it("returns null if the code point is not in the range", () => {
			const matcher = new MatchCodePointRange(
				new CodePointRange(65, 90)
			); // A-Z
			const nav = new MutMatchNav(new StrSlice("abc"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("returns true for code point in the range", () => {
			const matcher = new MatchCodePointRange(
				new CodePointRange(65, 90)
			); // A-Z

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(77)).toBe(true); // M
			expect(matcher.matchCodePoint(90)).toBe(true); // Z
		});

		it("returns false for code point not in the range", () => {
			const matcher = new MatchCodePointRange(
				new CodePointRange(65, 90)
			); // A-Z

			expect(matcher.matchCodePoint(64)).toBe(false); // @
			expect(matcher.matchCodePoint(91)).toBe(false); // [
		});
	});

	describe("fromString", () => {
		it("creates a matcher from a string in format 'start-end'", () => {
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
		it("creates a matcher with the specified ranges", () => {
			const ranges = [
				new CodePointRange(65, 90), // A-Z
				new CodePointRange(97, 122), // a-z
			];
			const matcher = new MatchCodePointRanges(ranges);

			expect(matcher.ranges).toBe(ranges);
		});
	});

	describe("match", () => {
		it("matches a code point in any of the ranges and advances the navigator", () => {
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

		it("returns null if the code point is not in any range", () => {
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
		it("returns true for code point in any of the ranges", () => {
			const matcher = new MatchCodePointRanges([
				new CodePointRange(65, 90), // A-Z
				new CodePointRange(97, 122), // a-z
			]);

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(97)).toBe(true); // a
		});

		it("returns false for code point not in any range", () => {
			const matcher = new MatchCodePointRanges([
				new CodePointRange(65, 90), // A-Z
				new CodePointRange(97, 122), // a-z
			]);

			expect(matcher.matchCodePoint(48)).toBe(false); // 0
		});
	});

	describe("fromStrings", () => {
		it("creates a matcher from an array of strings in format 'start-end'", () => {
			const matcher = MatchCodePointRanges.fromStrings(
				"A-Z",
				"a-z"
			);

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(97)).toBe(true); // a
			expect(matcher.matchCodePoint(48)).toBe(false); // 0
		});
	});
});

// describe("matchAnyCodePoint", () => {
// 	it("should match any valid code point", () => {
// 		// Test ASCII
// 		let nav = new MutMatchNav(new StrSlice("ABC"));
// 		let result = matchAnyCodePoint.match(nav);
// 		expect(result).not.toBeNull();
// 		expect(result?.captureIndex).toBe(1);
// 		expect(result?.navIndex).toBe(1);
// 		expect(result?.captureMatch.value).toBe("A");

// 		// Test emoji (surrogate pair)
// 		nav = new MutMatchNav(new StrSlice("😀BC"));
// 		result = matchAnyCodePoint.match(nav);
// 		expect(result).not.toBeNull();
// 		expect(result?.captureIndex).toBe(2); // Surrogate pair takes 2 chars
// 		expect(result?.navIndex).toBe(2);
// 		expect(result?.captureMatch.value).toBe("😀");

// 		// Test various Unicode ranges
// 		expect(matchAnyCodePoint.matchCodePoint(0x0000)).toBe(
// 			true
// 		); // NULL
// 		expect(matchAnyCodePoint.matchCodePoint(0x0041)).toBe(
// 			true
// 		); // A
// 		expect(matchAnyCodePoint.matchCodePoint(0x4e00)).toBe(
// 			true
// 		); // CJK Unified Ideograph
// 		expect(
// 			matchAnyCodePoint.matchCodePoint(0x1f600)
// 		).toBe(true); // 😀
// 		expect(
// 			matchAnyCodePoint.matchCodePoint(0x10ffff)
// 		).toBe(true); // Maximum code point
// 	});
// });

describe("MatchNotCodePoint", () => {
	describe("constructor", () => {
		it("should create a matcher with the specified matcher to negate", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePoint(
				innerMatcher
			);

			expect(matcher.matcher).toBe(innerMatcher);
		});
	});

	describe("match with MatchCodePointBase", () => {
		it("should match when inner matcher doesn't match and advance the navigator", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePoint(
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
			const matcher = new MatchNotCodePoint(
				innerMatcher
			);
			const nav = new MutMatchNav(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		it("should return true when inner matcher returns false", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePoint(
				innerMatcher
			);

			expect(matcher.matchCodePoint(66)).toBe(true); // B
		});

		it("should return false when inner matcher returns true", () => {
			const innerMatcher = new MatchCodePoint(65); // A
			const matcher = new MatchNotCodePoint(
				innerMatcher
			);

			expect(matcher.matchCodePoint(65)).toBe(false); // A
		});
	});

	describe("MatchNotCodePoint ctor errors", () => {
		it("should throw an error for invalid matcher type", () => {
			const invalidMatcher = {} as any;

			expect(() => {
				new MatchNotCodePoint(invalidMatcher);
			}).toThrow(
				"Invalid matcher type. Must be instance of MatchCodePointBase"
			);
		});

		it("should throw an error for recursion", () => {
			const innerMatcher = new MatchNotCodePoint(
				new MatchCodePoint(65) // A
			);

			expect(() => {
				new MatchNotCodePoint(innerMatcher);
			}).toThrow(
				"MatchNotCodePoint: Invalid matcher type: MatchNotCodePoint. " +
					"Recursion not supported."
			);
		});
	});
});
