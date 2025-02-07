import {
	NumberErr,
	NumberErrKind,
} from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { RPrec, ZNum } from "@/parser/types/type-types";
import { parseZNum } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";

/**
 * Note: parseZNum calls parseDefNumber
 * Therefore, check the tests for parseDefNumber
 * for more information.
 */
describe("parseZNum", () => {
	it("handles successful parseZNum", () => {
		const expectedType = new ZNum();

		const values = [
			"0",
			"123",
			"123_456",
			"-123",
			"-123_456",
			"+123",
			"+123_456",
			"9007199254740991",
			"-9007199254740991",
			"1e6",
			"-1e6",
		];

		const expectedValues = [
			0, 123, 123_456, -123, -123_456, 123, 123_456,
			9007199254740991, -9007199254740991, 1e6, -1e6,
		];

		values.forEach((value, index) => {
			const valueSlice = StrSlice.all(value);
			const result = parseZNum(valueSlice);
			const expectedValue: number =
				expectedValues[index]!;

			if (result instanceof TypeValuePair) {
				expect(result.value).toBe(expectedValue);
				expect(result.type).toStrictEqual(expectedType);
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("produces error for not safe integer input", () => {
		const valueSlice = StrSlice.all("9007199254740992");
		const result = parseZNum(valueSlice);

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
		const result = parseZNum(valueSlice);

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
