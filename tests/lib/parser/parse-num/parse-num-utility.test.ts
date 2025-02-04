import {
	AnalyzeNumberStringReport,
	TypeValuePair,
} from "@/parser/types/parse-types";
import { RPrec, ZNum } from "@/parser/types/type-types";
import {
	analyzeNumberString,
	getPrecisionCount,
	parseDefNumber,
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
});
