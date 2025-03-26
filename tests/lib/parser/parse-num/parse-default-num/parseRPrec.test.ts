import { parseDefNumber } from "@/parser/utils/parse-num";

import { RPrec } from "@/parser/types/type-types";
import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: RPrec successful examples", () => {
	it("handles unsigned .R:Prec numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("123.4")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 123.4;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("1.234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 1.234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from(".1234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 0.1234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("0.1234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 0.1234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("1234.")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 1234.0;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles positive signed .R:Prec numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("+123.4")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 123.4;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+1.234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 1.234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+.1234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 0.1234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+0.1234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 0.1234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+1234.")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 1234.0;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles negative signed .R:Prec numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("-123.4")
			);
			const expectedType = new RPrec(4);
			const expectedValue = -123.4;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-1.234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = -1.234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-.1234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = -0.1234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-0.1234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = -0.1234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-1234.")
			);
			const expectedType = new RPrec(4);
			const expectedValue = -1234.0;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles leading and trailing zeroes .R:Prec numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("0.001234")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 0.001234;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("0.01230")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 0.0123;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("0.012300")
			);
			const expectedType = new RPrec(5);
			const expectedValue = 0.0123;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from(".012300")
			);
			const expectedType = new RPrec(5);
			const expectedValue = 0.0123;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+0.01230")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 0.0123;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-0.01230")
			);
			const expectedType = new RPrec(4);
			const expectedValue = -0.0123;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles grouped .R:Prec numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("1_234.")
			);
			const expectedType = new RPrec(4);
			const expectedValue = 1234.0;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("1_234.0")
			);
			const expectedType = new RPrec(5);
			const expectedValue = 1234.0;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("1_234_567.")
			);
			const expectedType = new RPrec(7);
			const expectedValue = 1_234_567.0;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("1_234_567.00")
			);
			const expectedType = new RPrec(9);
			const expectedValue = 1_234_567.0;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("0.001_234_567_0")
			);
			const expectedType = new RPrec(8);
			const expectedValue = 0.001234567;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+0.001_234_567_0")
			);
			const expectedType = new RPrec(8);
			const expectedValue = 0.001234567;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-0.001_234_567_0")
			);
			const expectedType = new RPrec(8);
			const expectedValue = -0.001234567;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});
});
