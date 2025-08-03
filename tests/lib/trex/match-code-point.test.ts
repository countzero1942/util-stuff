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
	MatchNotCodePoint,
	MatchRepeat,
	matchUnicodeWhiteSpace,
} from "@/trex";
import { CodePointSeq } from "@/utils/seq";

describe("MatchCodePoint", () => {
	describe("factory constructor", () => {
		test("creates a matcher with the specified code point by number", () => {
			const codePoint = 65; // 'A'
			const matcher =
				MatchCodePoint.fromNumber(codePoint);
			expect(matcher.matchValue).toBe(codePoint);
		});

		test("creates a matcher with the specified code point by string", () => {
			const codePoint = 65; // 'A'
			const matcher = MatchCodePoint.fromString("A");
			expect(matcher.matchValue).toBe(codePoint);
		});

		test("throws errors on invalid code points", () => {
			expect(() => {
				MatchCodePoint.fromNumber(-1);
			}).toThrow(
				"MatchCodePoint.fromNumber: Invalid code point: -1"
			);
			expect(() => {
				MatchCodePoint.fromNumber(0x110001);
			}).toThrow(
				"MatchCodePoint.fromNumber: Invalid code point: 0x110001"
			);
			expect(() => {
				MatchCodePoint.fromNumber(0xd800);
			}).toThrow(
				"MatchCodePoint.fromNumber: Invalid code point: 0xD800"
			);
			expect(() => {
				MatchCodePoint.fromNumber(0xdfff);
			}).toThrow(
				"MatchCodePoint.fromNumber: Invalid code point: 0xDFFF"
			);
		});

		test("throws errors on invalid string input", () => {
			expect(() => {
				MatchCodePoint.fromString("invalid");
			}).toThrow(
				"MatchCodePoint.fromString: Invalid code point string: 'invalid'"
			);
			expect(() => {
				MatchCodePoint.fromString("");
			}).toThrow(
				"MatchCodePoint.fromString: Invalid code point string: ''"
			);
		});
	});

	describe("match", () => {
		test("matches a single code point and advances the navigator", () => {
			const matcher = MatchCodePoint.fromNumber(65); // 'A'
			const nav = MutMatchNav.from(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		test("returns null if the code point does not match", () => {
			const matcher = MatchCodePoint.fromNumber(65); // 'A'
			const nav = MutMatchNav.from(new StrSlice("XYZ"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});

		test("handles surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const codePoint = 0x1f600;
			const matcher =
				MatchCodePoint.fromNumber(codePoint);
			const nav = MutMatchNav.from(new StrSlice("😀BC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(2); // Surrogate pair takes 2 chars
			expect(result?.captureMatch.value).toBe("😀");
		});
	});

	describe("matchCodePoint", () => {
		test("returns true for matching code point", () => {
			const matcher = MatchCodePoint.fromNumber(65); // 'A'
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		test("returns false for non-matching code point", () => {
			const matcher = MatchCodePoint.fromNumber(65); // 'A'
			expect(matcher.matchCodePoint(66)).toBe(false);
		});
	});
});

describe("MatchCodePointLambda", () => {
	describe("constructor", () => {
		test("creates a matcher with the specified lambda function", () => {
			const lambda = (cp: number) =>
				cp >= 65 && cp <= 90;
			const matcher = MatchCodePointLambda.from(lambda);
			expect(matcher.lambda).toBe(lambda);
		});
	});

	describe("match", () => {
		test("matches a code point that satisfies the lambda and advances the navigator", () => {
			const matcher = MatchCodePointLambda.from(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			const nav = MutMatchNav.from(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		test("returns null if the code point does not satisfy the lambda", () => {
			const matcher = MatchCodePointLambda.from(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			const nav = MutMatchNav.from(new StrSlice("abc"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		test("returns true for code point satisfying the lambda", () => {
			const matcher = MatchCodePointLambda.from(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		test("returns false for code point not satisfying the lambda", () => {
			const matcher = MatchCodePointLambda.from(
				cp => cp >= 65 && cp <= 90
			); // A-Z
			expect(matcher.matchCodePoint(97)).toBe(false);
		});
	});
});

describe("MatchCodePointSet", () => {
	describe("constructor", () => {
		test("creates a matcher that matches specified code point set", () => {
			const codePointSet = new Set([65, 66, 67]); // A, B, C
			const matcher =
				MatchCodePointSet.fromString("ABC");
			expect(Array.from(matcher)).toEqual(
				Array.from(codePointSet)
			);
		});

		test("throws error if code point set is empty", () => {
			expect(() => {
				MatchCodePointSet.fromSet(new Set());
			}).toThrow(
				"MatchCodePointSet: empty code point set"
			);
		});
	});

	describe("match", () => {
		test("matches a code point in the set and advances the navigator", () => {
			const matcher =
				MatchCodePointSet.fromString("ABC");
			const nav = MutMatchNav.from(new StrSlice("ABC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		test("handles surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const matcher =
				MatchCodePointSet.fromString("A😀C");

			const nav = MutMatchNav.from(new StrSlice("😀BC"));

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(2);
			expect(result?.captureMatch.value).toBe("😀");
		});

		test("returns null if the code point is not in the set", () => {
			const matcher =
				MatchCodePointSet.fromString("ABC");
			const nav = MutMatchNav.from(new StrSlice("XYZ"));

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		test("returns true for code point in the set", () => {
			const matcher = MatchCodePointSet.fromArgs("ABC");
			expect(matcher.matchCodePoint(65)).toBe(true);
		});

		test("returns false for code point not in the set", () => {
			const matcher = MatchCodePointSet.fromArgs("ABC");
			expect(matcher.matchCodePoint(68)).toBe(false);
		});
	});

	describe("fromString", () => {
		test("creates a matcher from a string of characters", () => {
			const matcher = MatchCodePointSet.fromArgs("ABC");

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(66)).toBe(true); // B
			expect(matcher.matchCodePoint(67)).toBe(true); // C
			expect(matcher.matchCodePoint(68)).toBe(false); // D
		});

		test("handles surrogate pairs correctly", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const matcher = MatchCodePointSet.fromArgs("A😀C");

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(0x1f600)).toBe(true); // 😀
			expect(matcher.matchCodePoint(67)).toBe(true); // C
		});

		test("handles repeating code points", () => {
			// Emoji '😀' (U+1F600) is represented as surrogate pair '\uD83D\uDE00'
			const matcher =
				MatchCodePointSet.fromArgs("AA😀😀CC");

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(0x1f600)).toBe(true); // 😀
			expect(matcher.matchCodePoint(67)).toBe(true); // C
			expect(matcher.size).toBe(3);
		});

		test("exhaustively checks for all entries in the set", () => {
			const str = "abz 129\t!@#\r\n😀ABC";
			const count = new CodePointSeq(str).count();
			const matcher = MatchCodePointSet.fromString(str);
			expect(matcher.size).toBe(count);
		});

		test("throws error on empty code points string", () => {
			expect(() => {
				MatchCodePointSet.fromString("");
			}).toThrow(
				"MatchCodePointSet.fromString: empty code points string"
			);
		});
	});

	describe("fromNumbers", () => {
		test("creates a matcher from an array of code points", () => {
			const matcher = MatchCodePointSet.fromNumbers(
				65,
				66,
				67
			); // A, B, C

			expect(matcher.matchCodePoint(65)).toBe(true);
			expect(matcher.matchCodePoint(66)).toBe(true);
			expect(matcher.matchCodePoint(67)).toBe(true);
			expect(matcher.matchCodePoint(68)).toBe(false);
			expect(matcher.size).toBe(3);
			expect(Array.from(matcher)).toEqual([65, 66, 67]);
		});

		test("handles duplicate code points in matcher from an array of code points", () => {
			const matcher = MatchCodePointSet.fromNumbers(
				65,
				66,
				67,
				65,
				66,
				67
			); // A, B, C

			expect(matcher.matchCodePoint(65)).toBe(true);
			expect(matcher.matchCodePoint(66)).toBe(true);
			expect(matcher.matchCodePoint(67)).toBe(true);
			expect(matcher.matchCodePoint(68)).toBe(false);
			expect(matcher.size).toBe(3);
			expect(Array.from(matcher)).toEqual([65, 66, 67]);
		});

		test("exhaustively checks for all entries in the set", () => {
			const numArray = [
				0x20, 0x0d, 0x0a, 0x09, 0x0c, 0x0b, 0xa0,
				0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004,
				0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a,
				0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff,
			];
			const matcher = MatchCodePointSet.fromNumbers(
				...numArray
			);
			for (const num of numArray) {
				expect(matcher.matchCodePoint(num)).toBe(true);
			}
			expect(matcher.size).toBe(numArray.length);
		});

		test("throws error on empty code points array", () => {
			expect(() => {
				MatchCodePointSet.fromNumbers();
			}).toThrow(
				"MatchCodePointSet.fromNumbers: empty code points array"
			);
		});

		test("throws error on invalid code point", () => {
			expect(() => {
				MatchCodePointSet.fromNumbers(-1);
			}).toThrow(
				"MatchCodePointSet.fromNumbers: Invalid code point: -1"
			);
		});
	});

	describe("fromArgs", () => {
		test("creates a matcher from an array of CodePointRange, string, and MatchCodePointSet", () => {
			const matchSet = MatchCodePointSet.fromArgs(
				CodePointRange.fromString("a-z"),
				CodePointRange.fromString("0-9"),
				"!@#$%^&*()_+",
				"😀",
				matchUnicodeWhiteSpace
			);

			const matcher = new MatchRepeat(matchSet);

			const nav = MutMatchNav.fromString(
				"abz 129\t!@#\r\n😀ABC"
			);
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe(
				"abz 129\t!@#\r\n😀"
			);
		});

		test("creates a matcher from an array of CodePointRanges, string, and MatchCodePointSet", () => {
			const ranges = MatchCodePointRanges.fromStrings(
				"a-z",
				"0-9"
			);

			const matchSet = MatchCodePointSet.fromArgs(
				...ranges.ranges,
				"!@#$%^&*()_+",
				"😀",
				matchUnicodeWhiteSpace
			);

			const matcher = new MatchRepeat(matchSet);

			const nav = MutMatchNav.fromString(
				"abz 129\t!@#\r\n😀ABC"
			);
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe(
				"abz 129\t!@#\r\n😀"
			);
		});

		test("exhaustively checks for all code points added to the set 'fromArgs'", () => {
			let checkCount = 0;

			const range1: string = "a-z";
			const range2: string = "0-9";
			const str1: string = "!@#$%^&*()_+";
			const str2: string = "😀";

			const rangeMatcher2 =
				MatchCodePointRange.fromString(range2);
			const matchSet = MatchCodePointSet.fromArgs(
				CodePointRange.fromString(range1),
				rangeMatcher2.range,
				str1,
				str2,
				matchUnicodeWhiteSpace
			);

			const rangeToString = (range: string) => {
				const codePointRange =
					CodePointRange.fromString(range);
				return codePointRange.toExpandedString();
			};

			const checkString = (str: string) => {
				const seq = new CodePointSeq(str);
				seq.codePoints().forEach(codePoint => {
					checkCount++;
					const isMatch =
						matchSet.matchCodePoint(codePoint);
					const isInSet = matchSet.has(codePoint);
					expect(isMatch).toBe(true);
					expect(isInSet).toBe(true);
				});
			};

			const checkRangeStr = (range: string) => {
				checkString(rangeToString(range));
			};

			const checkSet = (set: MatchCodePointSet) => {
				for (const codePoint of set) {
					checkCount++;
					const isMatch =
						set.matchCodePoint(codePoint);
					const isInSet = set.has(codePoint);
					expect(isMatch).toBe(true);
					expect(isInSet).toBe(true);
				}
			};

			checkRangeStr(range1);
			checkRangeStr(range2);
			checkString(str1);
			checkString(str2);
			checkSet(matchUnicodeWhiteSpace);

			expect(checkCount).toBe(matchSet.size);
		});

		test("handles duplicate entries added to the set 'fromArgs'", () => {
			let checkCount = 0;

			const range1: string = "a-z";
			const range2: string = "0-9";
			const str1: string = "!@#$%^&*()_+";
			const str2: string = "😀";

			const matchSet = MatchCodePointSet.fromArgs(
				CodePointRange.fromString(range1),
				CodePointRange.fromString(range1),
				CodePointRange.fromString(range2),
				CodePointRange.fromString(range2),
				str1,
				str1,
				str2,
				str2,
				matchUnicodeWhiteSpace,
				matchUnicodeWhiteSpace
			);

			const rangeToString = (range: string) => {
				const codePointRange =
					CodePointRange.fromString(range);
				return codePointRange.toExpandedString();
			};

			const checkString = (str: string) => {
				const seq = new CodePointSeq(str);
				seq.codePoints().forEach(codePoint => {
					checkCount++;
					const isMatch =
						matchSet.matchCodePoint(codePoint);
					const isInSet = matchSet.has(codePoint);
					expect(isMatch).toBe(true);
					expect(isInSet).toBe(true);
				});
			};

			const checkRangeStr = (range: string) => {
				checkString(rangeToString(range));
			};

			const checkSet = (set: MatchCodePointSet) => {
				for (const codePoint of set) {
					checkCount++;
					const isMatch =
						set.matchCodePoint(codePoint);
					const isInSet = set.has(codePoint);
					expect(isMatch).toBe(true);
					expect(isInSet).toBe(true);
				}
			};

			checkRangeStr(range1);
			checkRangeStr(range2);
			checkString(str1);
			checkString(str2);
			checkSet(matchUnicodeWhiteSpace);

			expect(checkCount).toBe(matchSet.size);
		});

		test("throws an error on wrong type input", () => {
			expect(() => {
				MatchCodePointSet.fromArgs({} as any);
			}).toThrow();
		});

		test("throws on empty string", () => {
			expect(() => {
				MatchCodePointSet.fromArgs("");
			}).toThrow(
				"MatchCodePointSet.fromArgs: empty code points string"
			);
		});
	});
});

describe("allUnicodeCategories", () => {
	test("contains all Unicode general categories", () => {
		expect(allUnicodeCategories).toBeInstanceOf(Object);

		// Check for some common categories
		expect(allUnicodeCategories.has("Lu")).toBe(true); // Uppercase Letter
		expect(allUnicodeCategories.has("Ll")).toBe(true); // Lowercase Letter
		expect(allUnicodeCategories.has("Nd")).toBe(true); // Decimal Number
		expect(allUnicodeCategories.has("Zs")).toBe(true); // Space Separator
		expect(allUnicodeCategories.has("Cn")).toBe(true); // Unassigned

		// Check total number of categories (should be 30)
		expect(allUnicodeCategories.size).toBe(30);
	});
});

describe("MatchCodePointCategories", () => {
	describe("constructor", () => {
		test("creates a matcher with the specified categories", () => {
			const categories = new Set(["Lu", "Ll"]); // Uppercase and lowercase letters
			const matcher =
				MatchCodePointCategories.fromString("Lu Ll");
			expect(Array.from(matcher)).toEqual(
				Array.from(categories)
			);
		});

		test("handles duplicate entries", () => {
			const categories = new Set(["Lu", "Ll"]); // Uppercase and lowercase letters
			const matcher =
				MatchCodePointCategories.fromString(
					"Lu Lu Ll Ll"
				);
			expect(Array.from(matcher)).toEqual(
				Array.from(categories)
			);
		});
	});

	describe("match", () => {
		test("matches a code point in the specified categories and advances the navigator", () => {
			const matcher =
				MatchCodePointCategories.fromString("Lu"); // Uppercase letters
			const nav = MutMatchNav.fromString("ABC");

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureMatch.value).toBe("A");
		});

		test("returns null if the code point is not in the specified categories", () => {
			const matcher =
				MatchCodePointCategories.fromString("Ll"); // Lowercase letters
			const nav = MutMatchNav.fromString("ABC");

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		test("returns true for code point in the specified categories", () => {
			const matcher =
				MatchCodePointCategories.fromString("Lu"); // Uppercase letters
			expect(matcher.matchCodePoint(65)).toBe(true); // 'A'
		});

		test("returns false for code point not in the specified categories", () => {
			const matcher =
				MatchCodePointCategories.fromString("Ll"); // Lowercase letters
			expect(matcher.matchCodePoint(65)).toBe(false); // 'A'
		});
	});

	describe("fromString", () => {
		test("creates a matcher from a space-separated string of categories", () => {
			const matcher =
				MatchCodePointCategories.fromString("Lu Ll");

			expect(matcher.matchCodePoint(65)).toBe(true); // 'A' (Lu)
			expect(matcher.matchCodePoint(97)).toBe(true); // 'a' (Ll)
			expect(matcher.matchCodePoint(48)).toBe(false); // '0' (Nd)
		});

		test("throws an error for invalid category", () => {
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
		test("creates a range with the specified start and end", () => {
			const range = CodePointRange.fromNumbers(65, 90); // A-Z

			expect(range.start).toBe(65);
			expect(range.end).toBe(90);
		});

		test("throws an error if start > end", () => {
			expect(() => {
				CodePointRange.fromNumbers(90, 65);
			}).toThrow(
				"Invalid code point range: start > end (0x5A > 0x41)"
			);
		});

		test("throws an error if start is not a valid code point", () => {
			expect(() => {
				CodePointRange.fromNumbers(-1, 90);
			}).toThrow(
				"Invalid code point range: start is invalid (-1)"
			);
		});

		test("throws an error if end is not a valid code point", () => {
			expect(() => {
				CodePointRange.fromNumbers(65, 0x110001);
			}).toThrow(
				"Invalid code point range: end is invalid (0x110001)"
			);
		});
	});

	describe("contains", () => {
		test("returns true for code point within range", () => {
			const range = CodePointRange.fromNumbers(65, 90); // A-Z

			expect(range.contains(65)).toBe(true); // A
			expect(range.contains(77)).toBe(true); // M
			expect(range.contains(90)).toBe(true); // Z
		});

		test("returns false for code point outside range", () => {
			const range = CodePointRange.fromNumbers(65, 90); // A-Z

			expect(range.contains(64)).toBe(false); // @
			expect(range.contains(91)).toBe(false); // [
		});
	});

	describe("fromString", () => {
		test("creates a range from a string in format 'start-end'", () => {
			const range = CodePointRange.fromString("A-Z");

			expect(range.start).toBe(65); // A
			expect(range.end).toBe(90); // Z
		});

		test("throws an error for invalid format", () => {
			expect(() => {
				CodePointRange.fromString("A");
			}).toThrow("Invalid code point range");

			expect(() => {
				CodePointRange.fromString("A-B-C");
			}).toThrow("Invalid code point range");
		});
	});

	describe("to string methods", () => {
		test("returns string representation of range", () => {
			const range = CodePointRange.fromNumbers(65, 90); // A-Z
			expect(range.toString()).toBe("A-Z");
		});

		test("returns string representation of range", () => {
			const range = CodePointRange.fromNumbers(65, 90); // A-Z
			expect(range.toExpandedString()).toBe(
				"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			);
		});

		test("returns string representation of range", () => {
			const range = CodePointRange.fromString("A-Z"); // A-Z
			expect(range.toString()).toBe("A-Z");
		});

		test("returns string representation of range", () => {
			const range = CodePointRange.fromString("A-Z"); // A-Z
			expect(range.toExpandedString()).toBe(
				"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			);
		});
	});
});

describe("MatchCodePointRange", () => {
	describe("constructor", () => {
		test("creates a matcher with the specified range", () => {
			const range = CodePointRange.fromNumbers(65, 90); // A-Z
			const matcher =
				MatchCodePointRange.fromRange(range);

			expect(matcher.range).toBe(range);
		});

		test("throws error on invalid range", () => {
			expect(() => {
				MatchCodePointRange.fromRange(
					CodePointRange.fromNumbers(-1, 90)
				);
			}).toThrow(
				"Invalid code point range: start is invalid (-1)"
			);
		});
	});

	describe("match", () => {
		test("matches a code point in the range and advances the navigator", () => {
			const matcher = MatchCodePointRange.fromRange(
				CodePointRange.fromNumbers(65, 90)
			); // A-Z
			const nav = MutMatchNav.fromString("ABC");

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");
		});

		test("returns null if the code point is not in the range", () => {
			const matcher = MatchCodePointRange.fromRange(
				CodePointRange.fromNumbers(65, 90)
			); // A-Z
			const nav = MutMatchNav.fromString("abc");

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		test("returns true for code point in the range", () => {
			const matcher = MatchCodePointRange.fromRange(
				CodePointRange.fromNumbers(65, 90)
			); // A-Z

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(77)).toBe(true); // M
			expect(matcher.matchCodePoint(90)).toBe(true); // Z
		});

		test("returns false for code point not in the range", () => {
			const matcher = MatchCodePointRange.fromRange(
				CodePointRange.fromNumbers(65, 90)
			); // A-Z

			expect(matcher.matchCodePoint(64)).toBe(false); // @
			expect(matcher.matchCodePoint(91)).toBe(false); // [
		});
	});

	describe("fromString", () => {
		test("creates a matcher from a string in format 'start-end'", () => {
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
		test("creates a matcher with the specified ranges", () => {
			const ranges = [
				CodePointRange.fromNumbers(65, 90), // A-Z
				CodePointRange.fromNumbers(97, 122), // a-z
			];
			const matcher = MatchCodePointRanges.fromRanges(
				...ranges
			);

			expect(matcher.ranges).toStrictEqual(ranges);
		});

		test("throws error on empty ranges array", () => {
			expect(() => {
				MatchCodePointRanges.fromRanges();
			}).toThrow(
				"MatchCodePointRanges: empty ranges array"
			);
		});
	});

	describe("match", () => {
		test("matches a code point in any of the ranges and advances the navigator", () => {
			const matcher = MatchCodePointRanges.fromRanges(
				CodePointRange.fromNumbers(65, 90), // A-Z
				CodePointRange.fromNumbers(97, 122) // a-z
			);

			// Test uppercase
			let nav = MutMatchNav.fromString("ABC");
			let result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("A");

			// Test lowercase
			nav = MutMatchNav.fromString("abc");
			result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("a");
		});

		test("returns null if the code point is not in any range", () => {
			const matcher = MatchCodePointRanges.fromRanges(
				CodePointRange.fromNumbers(65, 90), // A-Z
				CodePointRange.fromNumbers(97, 122) // a-z
			);
			const nav = MutMatchNav.fromString("123");

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		test("returns true for code point in any of the ranges", () => {
			const matcher = MatchCodePointRanges.fromRanges(
				CodePointRange.fromNumbers(65, 90), // A-Z
				CodePointRange.fromNumbers(97, 122) // a-z
			);

			expect(matcher.matchCodePoint(65)).toBe(true); // A
			expect(matcher.matchCodePoint(97)).toBe(true); // a
		});

		test("returns false for code point not in any range", () => {
			const matcher = MatchCodePointRanges.fromRanges(
				CodePointRange.fromNumbers(65, 90), // A-Z
				CodePointRange.fromNumbers(97, 122) // a-z
			);

			expect(matcher.matchCodePoint(48)).toBe(false); // 0
		});
	});

	describe("fromStrings", () => {
		test("creates a matcher from an array of strings in format 'start-end'", () => {
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

describe("MatchNotCodePoint", () => {
	describe("constructor", () => {
		test("should create a matcher with the specified matcher to negate", () => {
			const innerMatcher = MatchCodePoint.fromNumber(65); // A
			const matcher =
				MatchNotCodePoint.from(innerMatcher);

			expect(matcher.matcher).toBe(innerMatcher);
		});
	});

	describe("match with MatchCodePointBase", () => {
		test("should match when inner matcher doesn't match and advance the navigator", () => {
			const innerMatcher = MatchCodePoint.fromNumber(65); // A
			const matcher =
				MatchNotCodePoint.from(innerMatcher);
			const nav = MutMatchNav.fromString("XYZ");

			const result = matcher.match(nav);

			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("X");
		});

		test("should return null when inner matcher matches", () => {
			const innerMatcher = MatchCodePoint.fromNumber(65); // A
			const matcher =
				MatchNotCodePoint.from(innerMatcher);
			const nav = MutMatchNav.fromString("ABC");

			const result = matcher.match(nav);

			expect(result).toBeNull();
		});
	});

	describe("matchCodePoint", () => {
		test("should return true when inner matcher returns false", () => {
			const innerMatcher = MatchCodePoint.fromNumber(65); // A
			const matcher =
				MatchNotCodePoint.from(innerMatcher);

			expect(matcher.matchCodePoint(66)).toBe(true); // B
		});

		test("should return false when inner matcher returns true", () => {
			const innerMatcher = MatchCodePoint.fromNumber(65); // A
			const matcher =
				MatchNotCodePoint.from(innerMatcher);

			expect(matcher.matchCodePoint(65)).toBe(false); // A
		});
	});

	describe("MatchNotCodePoint ctor errors", () => {
		test("should throw an error for invalid matcher type", () => {
			const invalidMatcher = {} as any;

			expect(() => {
				MatchNotCodePoint.from(invalidMatcher);
			}).toThrow(
				"Invalid matcher type. Must be instance of MatchCodePointBase"
			);
		});

		test("should throw an error for recursion", () => {
			const innerMatcher = MatchNotCodePoint.from(
				MatchCodePoint.fromNumber(65) // A
			);

			expect(() => {
				MatchNotCodePoint.from(innerMatcher);
			}).toThrow(
				"MatchNotCodePoint: Invalid matcher type: MatchNotCodePoint. " +
					"Recursion not supported."
			);
		});
	});
});
