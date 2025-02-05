import {
	AnalyzeNumberStringReport,
	TypeValuePair,
} from "@/parser/types/parse-types";
import { RPrec, ZNum } from "@/parser/types/type-types";
import {
	analyzeNumberString,
	getPrecisionCount,
	parseDefNumber,
	countDecimalPlaces,
} from "@/parser/utils/parse-num";

import { StrSlice } from "@/utils/slice";

describe("analyzeNumberString", () => {
	it("correctly analyzes a number with no special features", () => {
		const result = analyzeNumberString(
			StrSlice.all("12345")
		);
		const expected: AnalyzeNumberStringReport = {};

		expect(result).toEqual(expected);
	});

	it("detects a separator", () => {
		const result = analyzeNumberString(
			StrSlice.all("1_234_567")
		);
		expect(result.hasSeparator).toBe(true);
	});

	it("detects a decimal point", () => {
		const result = analyzeNumberString(
			StrSlice.all("123.45")
		);
		expect(result.hasDecimal).toBe(true);
	});

	it("detects a sign", () => {
		let result = analyzeNumberString(
			StrSlice.all("-123")
		);
		expect(result.hasSign).toBe(true);
		result = analyzeNumberString(StrSlice.all("+123"));
		expect(result.hasSign).toBe(true);
	});

	it("detects e notation", () => {
		const result = analyzeNumberString(
			StrSlice.all("1.23e4")
		);
		expect(result.hasENotation).toBe(true);
	});

	it("detects g notation", () => {
		const result = analyzeNumberString(
			StrSlice.all("1.23g4")
		);
		expect(result.hasGNotation).toBe(true);
	});

	it("detects breaking characters", () => {
		let result = analyzeNumberString(
			StrSlice.all("123 456")
		);
		expect(result.hasBreakingChars).toBe(true);
	});

	it("correctly analyzes a multiple signatures", () => {
		const result = analyzeNumberString(
			StrSlice.all("-1_234.56e7")
		);
		expect(result).toEqual({
			hasSeparator: true,
			hasDecimal: true,
			hasSign: true,
			hasENotation: true,
		});
	});

	it("handles custom breaking characters", () => {
		const result = analyzeNumberString(
			StrSlice.all("123:456"),
			":"
		);
		expect(result.hasBreakingChars).toBe(true);
	});
});

describe("getPrecisionCount", () => {
	it("correctly counts precision for positive numbers", () => {
		expect(getPrecisionCount("123.4")).toBe(4);
		expect(getPrecisionCount("123.456")).toBe(6);
	});

	it("correctly counts precision for negative numbers", () => {
		expect(getPrecisionCount("-123.4")).toBe(4);
		expect(getPrecisionCount("-123.456")).toBe(6);
	});

	it("correctly counts precision for leading zero numbers", () => {
		expect(getPrecisionCount("0.00123")).toBe(3);
		expect(getPrecisionCount("0.123")).toBe(3);
	});

	it("correctly counts precision for trailing zero numbers", () => {
		expect(getPrecisionCount("1.230")).toBe(4);
		expect(getPrecisionCount("1.200")).toBe(4);
	});

	it("handles numbers with no decimal point", () => {
		expect(getPrecisionCount("123")).toBe(3);
		expect(getPrecisionCount("-456")).toBe(3);
	});

	it("handles numbers in scientific notation", () => {
		expect(getPrecisionCount("1.23e-4")).toBe(3);
		expect(getPrecisionCount("1.230e5")).toBe(4);
		expect(getPrecisionCount("1.23g-4")).toBe(3);
		expect(getPrecisionCount("1.230g5")).toBe(4);
	});

	it("handles numbers with only decimal point", () => {
		expect(getPrecisionCount(".123")).toBe(3);
		expect(getPrecisionCount("-.0045")).toBe(2);
	});

	it("handles numbers with grouping", () => {
		expect(getPrecisionCount("1_234.567_8")).toBe(8);
		expect(getPrecisionCount("-1_234.0")).toBe(5);
	});

	it("handles very large precision > 15", () => {
		expect(
			getPrecisionCount(
				"1.23456789012345678901234567890"
			)
		).toBe(30);
	});
});

describe("typeValuePair", () => {
	it("returns all members of TypeValuePair from parseDefNumber", () => {
		{
			const valueSlice = StrSlice.all("123");
			const typeValuePairOrErr =
				parseDefNumber(valueSlice);
			if (typeValuePairOrErr instanceof TypeValuePair) {
				const typeValuePair = typeValuePairOrErr;
				expect(typeValuePair.value).toBe(123);
				expect(typeValuePair.type).toBeInstanceOf(ZNum);
				expect(typeValuePair.valueSlice).toEqual(
					valueSlice
				);
				expect(
					typeValuePair.numberStringReport
				).toEqual({});
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const valueSlice = StrSlice.all("-1_234.e100");
			const typeValuePairOrErr =
				parseDefNumber(valueSlice);
			if (typeValuePairOrErr instanceof TypeValuePair) {
				const typeValuePair = typeValuePairOrErr;
				expect(typeValuePair.value).toBe(-1234e100);
				expect(typeValuePair.type).toBeInstanceOf(
					RPrec
				);
				expect(typeValuePair.valueSlice).toEqual(
					valueSlice
				);
				expect(
					typeValuePair.numberStringReport
				).toEqual({
					hasSeparator: true,
					hasDecimal: true,
					hasSign: true,
					hasENotation: true,
				});
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const valueSlice = StrSlice.all("-1_234.g100");
			const typeValuePairOrErr =
				parseDefNumber(valueSlice);
			if (typeValuePairOrErr instanceof TypeValuePair) {
				const typeValuePair = typeValuePairOrErr;
				expect(typeValuePair.value).toBe(-1234e100);
				expect(typeValuePair.type).toBeInstanceOf(
					RPrec
				);
				expect(typeValuePair.valueSlice).toEqual(
					valueSlice
				);
				expect(
					typeValuePair.numberStringReport
				).toEqual({
					hasSeparator: true,
					hasDecimal: true,
					hasSign: true,
					hasGNotation: true,
				});
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it(
		"returns a TypeValuePair with 'valueSlice' and 'report'" +
			" trimmed (via parseDefNumber)",
		() => {
			{
				const valueSlice = StrSlice.all("123");
				const typeValuePairOrErr =
					parseDefNumber(valueSlice);
				if (
					typeValuePairOrErr instanceof TypeValuePair
				) {
					const typeValuePair =
						typeValuePairOrErr.trim();
					expect(typeValuePair.value).toBe(123);
					expect(typeValuePair.type).toBeInstanceOf(
						ZNum
					);
					expect(typeValuePair.valueSlice).toBe(
						undefined
					);
					expect(
						typeValuePair.numberStringReport
					).toEqual(undefined);
				} else {
					expect(true).toBe(false);
				}
			}
			{
				const valueSlice = StrSlice.all("-1_234.e100");
				const typeValuePairOrErr =
					parseDefNumber(valueSlice);
				if (
					typeValuePairOrErr instanceof TypeValuePair
				) {
					const typeValuePair =
						typeValuePairOrErr.trim();
					expect(typeValuePair.value).toBe(-1234e100);
					expect(typeValuePair.type).toBeInstanceOf(
						RPrec
					);
					expect(typeValuePair.valueSlice).toBe(
						undefined
					);
					expect(
						typeValuePair.numberStringReport
					).toBe(undefined);
				} else {
					expect(true).toBe(false);
				}
			}
			{
				const valueSlice = StrSlice.all("-1_234.g100");
				const typeValuePairOrErr =
					parseDefNumber(valueSlice);
				if (
					typeValuePairOrErr instanceof TypeValuePair
				) {
					const typeValuePair =
						typeValuePairOrErr.trim();
					expect(typeValuePair.value).toBe(-1234e100);
					expect(typeValuePair.type).toBeInstanceOf(
						RPrec
					);
					expect(typeValuePair.valueSlice).toBe(
						undefined
					);
					expect(
						typeValuePair.numberStringReport
					).toBe(undefined);
				} else {
					expect(true).toBe(false);
				}
			}
		}
	);

	// describe("countDigits", () => {
	// 	test.each([
	// 		['123', 3],
	// 		['0.123', 3],
	// 		['123.45', 5],
	// 		['-123', 3],
	// 		['+123', 3],
	// 		['1,234', 4], // Ignores commas
	// 		['12_34', 4], // Ignores underscores
	// 		['1.2e3', 1], // Counts significant digits in scientific notation
	// 		['0', 1],
	// 		['000123', 3], // Leading zeros don't count
	// 	])('returns correct count for %s', (input, expected) => {
	// 		expect(countDigits(input)).toBe(expected);
	// 	});

	// 	test('throws for non-numeric characters', () => {
	// 		expect(() => countDigits('12a3')).toThrow(InvalidNumberFormatError);
	// 	});
	// });
});

describe("countDecimalPlaces", () => {
	describe("it handles unsigned numbers", () => {
		test.each([
			["123", 0],
			["123.45", 2],
			["123.4500", 4],
			["0.0000001", 7],
			[".1234", 4],
			["123.", 0],
		])(
			"returns correct count for %s",
			(input, expected) => {
				expect(
					countDecimalPlaces(StrSlice.all(input))
				).toBe(expected);
			}
		);
	});

	it("handles grouped numbers", () => {
		expect(
			countDecimalPlaces(StrSlice.all("123_456.789_01"))
		).toBe(5);
		expect(
			countDecimalPlaces(StrSlice.all("123_456.789_000"))
		).toBe(6);
	});

	it("handles signed numbers", () => {
		expect(
			countDecimalPlaces(StrSlice.all("-123_456.789_01"))
		).toBe(5);
		expect(
			countDecimalPlaces(
				StrSlice.all("+123_456.789_000")
			)
		).toBe(6);
	});

	it("returns -1 for invalid scientific notation", () => {
		expect(
			countDecimalPlaces(StrSlice.all("1.2e3.4"))
		).toBe(-1);
	});
	it("returns -1 for invalid decimal places", () => {
		expect(
			countDecimalPlaces(StrSlice.all("1.23.4"))
		).toBe(-1);
	});
});
