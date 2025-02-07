import {
	NumberErr,
	NumberErrKind,
} from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { NNum } from "@/parser/types/type-types";
import { parseNNum } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";

/**
 * Note: parseWNum calls parseDefNumber
 * Therefore, check the tests for parseDefNumber
 * for more information.
 */
describe("parseNNum", () => {
	it("handles successful parseNNum", () => {
		const expectedType = new NNum();

		const values = [
			"1",
			"123",
			"123_456",
			"9007199254740991",
			"1e6",
		];

		const expectedValues = [
			1, 123, 123_456, 9007199254740991, 1e6,
		];

		values.forEach((value, index) => {
			const valueSlice = StrSlice.all(value);
			const result = parseNNum(valueSlice);
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

	it("produces error for signed input calling parseNNum", () => {
		const expectedType = new NNum();

		const values = [
			"-123",
			"-123_456",
			"+123",
			"+123_456",
			"-9007199254740991",
		];

		values.forEach(value => {
			const valueSlice = StrSlice.all(value);
			const result = parseNNum(valueSlice);

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

	it("produces error on 0 input", () => {
		const valueSlice = StrSlice.all("0");
		const result = parseNNum(valueSlice);

		if (result instanceof NumberErr) {
			const err = result;
			expect(err.kind).toBe(
				"Not a Natural number" as NumberErrKind
			);
			expect(err.numType.type).toBe(".W");
		} else {
			expect(true).toBe(false);
		}
	});

	it("produces error for not safe integer input", () => {
		const valueSlice = StrSlice.all("9007199254740992");
		const result = parseNNum(valueSlice);

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
		const result = parseNNum(valueSlice);

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
