import { parseDefNumber } from "@/parser/utils/parse-num";

import { ZNum } from "@/parser/types/type-types";
import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: ZNum with exponent successful examples", () => {
	it("handles unsigned integer numbers with positive exponents", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("123e2")
			);
			const expectedType = new ZNum();
			const expectedValue = 12300;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("1e3")
			);
			const expectedType = new ZNum();
			const expectedValue = 1000;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("5e0")
			);
			const expectedType = new ZNum();
			const expectedValue = 5;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles negative integer numbers with positive exponents", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("-123e2")
			);
			const expectedType = new ZNum();
			const expectedValue = -12300;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-1e3")
			);
			const expectedType = new ZNum();
			const expectedValue = -1000;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles grouped integer numbers with exponents", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("1_234e2")
			);
			const expectedType = new ZNum();
			const expectedValue = 123400;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-1_000e3")
			);
			const expectedType = new ZNum();
			const expectedValue = -1000000;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});
});
