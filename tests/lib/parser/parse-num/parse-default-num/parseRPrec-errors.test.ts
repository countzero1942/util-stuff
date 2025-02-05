import { NumberErr, NumberErrKind } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { NoNum, RPrec } from "@/parser/types/type-types";
import { parseDefNumber } from "@/parser/utils/parse-num";
import { StrSlice } from "@/utils/slice";

describe("parseDefNumber: RPrec error examples", () => {
	it("handles 'Invalid form' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("+-1_234.5"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("+1_234..5"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-1_234..5"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-1_234.5678."));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid form");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
	});

	it("handles 'Invalid chars' errors", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("+1_2a4.567_89")
			);
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid chars");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("-1_234.567_z9")
			);
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid chars");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("+1234.56z89"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid chars");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
	});

	it("handles 'Invalid leading zero' errors", () => {
		{
			const result = parseDefNumber(
				StrSlice.from("-01_234.567_89")
			);
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid leading zero");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("+0_234.567_89")
			);
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid leading zero");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-01234.56789"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid leading zero");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
	});

	it("handles 'Invalid grouping' errors", () => {
		{
			const result = parseDefNumber(StrSlice.from("+1_234.56789"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("+1234.567_89"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("+1_23_4.567_89")
			);
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(StrSlice.from("-_234.567_89"));
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("+1_234.567_890_")
			);
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
		{
			const result = parseDefNumber(
				StrSlice.from("+0.123_45_6789")
			);
			if (result instanceof TypeValuePair) {
				expect(true).toBe(false);
			} else {
				expect(result.kind).toBe("Invalid grouping");
				expect(result.numType).toStrictEqual(new RPrec());
			}
		}
	});
});
