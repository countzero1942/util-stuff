import { parseDefNumber } from "@/parser/utils/parse-num";

import { RPrec } from "@/parser/types/type-types";
import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: RPrec g Exponent successful examples", () => {
	it("handles unsigned .R:Prec g exponent numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("1234.5g100")
			);
			const expectedType = new RPrec(5, true);
			const expectedValue = 1.2345e103;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("1234.g100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = 1.234e103;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from(".1234g100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = 1.234e99;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles positive signed .R:Prec g exponent numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("+1234.5g+100")
			);
			const expectedType = new RPrec(5, true);
			const expectedValue = 1.2345e103;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("+1234.g+100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = 1.234e103;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+.1234g+100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = 1.234e99;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles negative signed .R:Prec numbers g exponent", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("-1234.5g-100")
			);
			const expectedType = new RPrec(5, true);
			const expectedValue = -1234.5e-100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-1234.g-100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = -1234.0e-100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-.1234g-100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = -0.1234e-100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-.1234g+100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = -0.1234e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles leading and trailing zeroes .R:Prec g exponent numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("0.001234g100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = 0.001234e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("0.01230g-100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = 0.0123e-100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("0.012300g100")
			);
			const expectedType = new RPrec(5, true);
			const expectedValue = 0.0123e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-.012300g100")
			);
			const expectedType = new RPrec(5, true);
			const expectedValue = -0.0123e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+0.01230g-100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = 0.0123e-100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("-0.01230g100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = -0.0123e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles grouped .R:Prec g exponent numbers", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("1_234.g100")
			);
			const expectedType = new RPrec(4, true);
			const expectedValue = 1234.0e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("1_234.0g-100")
			);
			const expectedType = new RPrec(5, true);
			const expectedValue = 1234.0e-100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-1_234_567.g100")
			);
			const expectedType = new RPrec(7, true);
			const expectedValue = -1_234_567.0e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("1_234_567.00g100")
			);
			const expectedType = new RPrec(9, true);
			const expectedValue = 1_234_567.0e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-0.001_234_567_0g100")
			);
			const expectedType = new RPrec(8, true);
			const expectedValue = -0.001234567e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-0.001_234_567_0g-100")
			);
			const expectedType = new RPrec(8, true);
			const expectedValue = -0.001234567e-100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}

		{
			const result = parseDefNumber(
				StrSlice.from("+0.001_234_567_0g-100")
			);
			const expectedType = new RPrec(8, true);
			const expectedValue = 0.001234567e-100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-0.001_234_567_0g100")
			);
			const expectedType = new RPrec(8, true);
			const expectedValue = -0.001234567e100;
			if (result instanceof TypeValuePair) {
				expect(result.type).toStrictEqual(expectedType);
				expect(result.typeValue).toBe(expectedValue);
			} else {
				expect(true).toBe(false);
			}
		}
	});
});
