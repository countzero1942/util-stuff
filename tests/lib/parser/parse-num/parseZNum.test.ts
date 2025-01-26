import { parseDefNumber } from "@/parser/utils/parse-num";

import { ZNum } from "@/parser/types/type-types";
import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: ZNum successful examples", () => {
	it("handles unsigned integer numbers", () => {
		{
			const result = parseDefNumber(StrSlice.from("123"));
			const expectedType = new ZNum();
			const expectedValue = 123;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("0"));
			const expectedType = new ZNum();
			const expectedValue = 0;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("9007199254740991")
			); // Max safe integer
			const expectedType = new ZNum();
			const expectedValue = 9007199254740991;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles negative integer numbers", () => {
		{
			const result = parseDefNumber(StrSlice.from("-123"));
			const expectedType = new ZNum();
			const expectedValue = -123;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-9007199254740991")
			); // Negative max safe integer
			const expectedType = new ZNum();
			const expectedValue = -9007199254740991;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles grouped integer numbers", () => {
		{
			const result = parseDefNumber(StrSlice.from("1_234"));
			const expectedType = new ZNum();
			const expectedValue = 1234;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("1_000_000"));
			const expectedType = new ZNum();
			const expectedValue = 1000000;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("-1_234_567"));
			const expectedType = new ZNum();
			const expectedValue = -1234567;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});
});
