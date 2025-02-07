import {
	NumberErr,
	NumberErrKind,
} from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { WNum } from "@/parser/types/type-types";
import { parseWNum } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";

/**
 * Note: parseWNum calls parseDefNumber
 * Therefore, check the tests for parseDefNumber
 * for more information.
 */
describe("parseWNum", () => {
	it("handles successful parseWNum", () => {
		const expectedType = new WNum();

		const values = [
			"0",
			"123",
			"123_456",
			"9007199254740991",
			"1e6",
		];

		const expectedValues = [
			0, 123, 123_456, 9007199254740991, 1e6,
		];

		values.forEach((value, index) => {
			const valueSlice = StrSlice.all(value);
			const result = parseWNum(valueSlice);
			const expectedValue: number =
				expectedValues[index]!;

			expect(result).toBeInstanceOf(TypeValuePair);

			if (result instanceof TypeValuePair) {
				expect(result.value).toBe(expectedValue);
				expect(result.type).toStrictEqual(expectedType);
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("produces error for signed input calling parseWNum", () => {
		const expectedType = new WNum();

		const values = [
			"-123",
			"-123_456",
			"+123",
			"+123_456",
			"-9007199254740991",
		];

		values.forEach(value => {
			const valueSlice = StrSlice.all(value);
			const result = parseWNum(valueSlice);

			if (result instanceof NumberErr) {
				const err = result;
				expect(err.kind).toBe(
					"Natural and Whole numbers can't have signs" as NumberErrKind
				);
				expect(err.numType.type).toBe(".Z");
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("produces error for not safe integer input", () => {
		const valueSlice = StrSlice.all("9007199254740992");
		const result = parseWNum(valueSlice);

		if (result instanceof NumberErr) {
			const err = result;
			expect(err.kind).toBe(
				"Not safe integer" as NumberErrKind
			);
			expect(err.numType.type).toBe(".Z");
		} else {
			expect(true).toBe(false);
		}
	});

	it("produces error for RPrec input", () => {
		const valueSlice = StrSlice.all("123.4");
		const result = parseWNum(valueSlice);

		if (result instanceof NumberErr) {
			const err = result;
			expect(err.kind).toBe(
				"Not an Integer" as NumberErrKind
			);
			expect(err.numType.type).toBe(".R");
		} else {
			expect(true).toBe(false);
		}
	});
});
