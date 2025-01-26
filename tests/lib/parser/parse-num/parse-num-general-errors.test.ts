import { TypeValuePair } from "@/parser/types/parse-types";
import { NoNum } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: general error examples", () => {
	it("handles 'Invalid number input' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("123 456."));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid number input");
				expect(result.numType).toStrictEqual(new NoNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("123:456"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid number input");
				expect(result.numType).toStrictEqual(new NoNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("123,456.0"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid number input");
				expect(result.numType).toStrictEqual(new NoNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("123;456.0"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid number input");
				expect(result.numType).toStrictEqual(new NoNum());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("123^456.0"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid number input");
				expect(result.numType).toStrictEqual(new NoNum());
			}
		}
	});
});
