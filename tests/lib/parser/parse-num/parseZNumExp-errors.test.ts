import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { ZNum } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: ZNum exponent error examples", () => {
	it("handles 'Invalid form' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("+-123e10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("++123e10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Invalid exponent' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("123ee10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid exponent");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("1e23e4"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid exponent");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Invalid chars' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("12a3e10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid chars");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-12x3e10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid chars");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Invalid leading zero' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("0123e10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid leading zero");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-01234e10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid leading zero");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Invalid grouping' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("1_23_4e10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("_1234e10"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Power > max' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("123e1000")); // Exceeds MAX_POWER
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Power > max");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Power must produce integer' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("123e-1")); // Negative exponent
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Power must produce integer");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Not safe integer' errors", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("9007199254740991e1")
			); // MAX_SAFE_INTEGER * 10
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Not safe integer");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-9007199254740991e1")
			); // -MAX_SAFE_INTEGER * 10
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Not safe integer");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles decimal numbers as RPrec type", () => {
		{
			const result = parseDefNumber(StrSlice.from("123.456e10"));
			if (result instanceof TypeValuePair) {
				expect(result.valueType).not.toStrictEqual(new ZNum());
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-123.0e10"));
			if (result instanceof TypeValuePair) {
				expect(result.valueType).not.toStrictEqual(new ZNum());
			} else {
				expect(true).toBe(false);
			}
		}
	});
});
