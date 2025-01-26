import { parseDefNumber } from "@/parser/utils/parse-num";

import { RPrec } from "@/parser/types/type-types";
import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: RPrec e Exponent successful examples", () => {
	it("handles unsigned .R:Prec exponent numbers", () => {
		{
			const result = parseDefNumber(StrSlice.from("1234.5e100"));
			const expectedType = new RPrec(5);
			const expectedValue = 1.2345e103;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("1234.e100"));
			const expectedType = new RPrec(4);
			const expectedValue = 1.234e103;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from(".1234e100"));
			const expectedType = new RPrec(4);
			const expectedValue = 1.234e99;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles positive signed .R:Prec exponent numbers", () => {
		{
			const result = parseDefNumber(StrSlice.from("+1234.5e+100"));
			const expectedType = new RPrec(5);
			const expectedValue = 1.2345e103;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("+1234.e+100"));
			const expectedType = new RPrec(4);
			const expectedValue = 1.234e103;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("+.1234e+100"));
			const expectedType = new RPrec(4);
			const expectedValue = 1.234e99;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles negative signed .R:Prec numbers exponent", () => {
		{
			const result = parseDefNumber(StrSlice.from("-1234.5e-100"));
			const expectedType = new RPrec(5);
			const expectedValue = -1234.5e-100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-1234.e-100"));
			const expectedType = new RPrec(4);
			const expectedValue = -1234.0e-100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("-.1234e-100"));
			const expectedType = new RPrec(4);
			const expectedValue = -0.1234e-100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-.1234e+100"));
			const expectedType = new RPrec(4);
			const expectedValue = -0.1234e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles leading and trailing zeroes .R:Prec exponent numbers", () => {
		{
			const result = parseDefNumber(StrSlice.from("0.001234e100"));
			const expectedType = new RPrec(4);
			const expectedValue = 0.001234e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("0.01230e-100"));
			const expectedType = new RPrec(4);
			const expectedValue = 0.0123e-100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("0.012300e100"));
			const expectedType = new RPrec(5);
			const expectedValue = 0.0123e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("-.012300e100"));
			const expectedType = new RPrec(5);
			const expectedValue = -0.0123e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+0.01230e-100")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 0.0123e-100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(StrSlice.from("-0.01230e100"));
			const expectedType = new RPrec(4);
			const expectedValue = -0.0123e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles grouped .R:Prec exponent numbers", () => {
		{
			const result = parseDefNumber(StrSlice.from("1_234.e100"));
			const expectedType = new RPrec(4);
			const expectedValue = 1234.0e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("1_234.0e-100"));
			const expectedType = new RPrec(5);
			const expectedValue = 1234.0e-100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-1_234_567.e100")
			);
			const expectedType = new RPrec(7);
			const expectedValue = -1_234_567.0e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("1_234_567.00e100")
			);
			const expectedType = new RPrec(9);
			const expectedValue = 1_234_567.0e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-0.001_234_567_0e100")
			);
			const expectedType = new RPrec(8);
			const expectedValue = -0.001234567e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-0.001_234_567_0e-100")
			);
			const expectedType = new RPrec(8);
			const expectedValue = -0.001234567e-100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+0.001_234_567_0e-100")
			);
			const expectedType = new RPrec(8);
			const expectedValue = 0.001234567e-100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-0.001_234_567_0e100")
			);
			const expectedType = new RPrec(8);
			const expectedValue = -0.001234567e100;
			if (result instanceof TypeValuePair) {
				expect(result.valueType).toStrictEqual(expectedType);
				expect(result.value).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});
});
