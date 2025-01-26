import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { ZNum } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: ZNum error examples", () => {
	it("handles 'Invalid form' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("+-123"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("++123"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("--123"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("123$"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("123$"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Invalid leading zero' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("0123"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid leading zero");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-01234"));
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
			const result = parseDefNumber(StrSlice.from("1_23_4"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("_1234"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("1234_"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});

	it("handles 'Not safe integer' errors", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("9007199254740992")
			); // MAX_SAFE_INTEGER + 1
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Not safe integer");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-9007199254740992")
			); // -MAX_SAFE_INTEGER - 1
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
			const result = parseDefNumber(StrSlice.from("123.456"));
			if (result instanceof TypeValuePair) {
				expect(result.valueType).not.toStrictEqual(new ZNum());
			} else {
				expect(true).toBe(false);
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-123.0"));
			if (result instanceof TypeValuePair) {
				expect(result.valueType).not.toStrictEqual(new ZNum());
			} else {
				expect(true).toBe(false);
			}
		}
	});

	it("handles 'Invalid chars' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("12a3"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid chars");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-12x3"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid chars");
				expect(result.numType).toStrictEqual(new ZNum());
			}
		}
	});
});
