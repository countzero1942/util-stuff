import {
	NumberErr,
	NumberErrKind,
} from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import {
	NNum,
	RFixed,
	RNumBase,
	RPrec,
	WNum,
	ZNum,
} from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";

describe("RNumBase parseNum", () => {
	it("handles RNumBase parseNum success cases", () => {
		const type = new RNumBase();
		const valueStrings = [
			"123.4",
			"123.4e100",
			"-123.4",
			"-123.4e-100",
			"0.1234",
			"0.1234e-100",
			"1.000",
		];
		const expectedValues = [
			123.4, 123.4e100, -123.4, -123.4e-100, 0.1234,
			0.1234e-100, 1.0,
		];

		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(TypeValuePair);
			if (result instanceof TypeValuePair) {
				expect(result.value).toBe(
					expectedValues[index]
				);
				expect(result.type).toStrictEqual(new RPrec(4));
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("handles RNumBase parseNum error", () => {
		const type = new RNumBase();
		const valueStrings = [
			"123.4e",
			"+-1_234.5",
			"+1_2a4.567_89",
			"-01_234.567_89",
			"+1_23_4.567_89",
			"+1_234_5e7.8e+100",
			"1_234_567.8e+308",
			"1_234_567.8e-309",
		];
		const expectedErrors: NumberErrKind[] = [
			"Invalid form",
			"Invalid form",
			"Invalid chars",
			"Invalid leading zero",
			"Invalid grouping",
			"Invalid exponent",
			"Power > max",
			"Power < min",
		];
		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(NumberErr);
			if (result instanceof NumberErr) {
				expect(result.kind).toBe(expectedErrors[index]);
			} else {
				expect(true).toBe(false);
			}
		});
	});
});

describe("RPrec parseNum", () => {
	it("handles RPrec parseNum success cases", () => {
		const type = new RPrec();
		const valueStrings = [
			"123.4",
			"123.4e100",
			"-123.4",
			"-123.4e-100",
			"0.1234",
			"0.1234e-100",
			"1.000",
		];
		const expectedValues = [
			123.4, 123.4e100, -123.4, -123.4e-100, 0.1234,
			0.1234e-100, 1.0,
		];

		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(TypeValuePair);
			if (result instanceof TypeValuePair) {
				expect(result.value).toBe(
					expectedValues[index]
				);
				expect(result.type).toStrictEqual(new RPrec(4));
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("handles RPrec parseNum error", () => {
		const type = new RPrec();
		const valueStrings = [
			"123.4e",
			"+-1_234.5",
			"+1_2a4.567_89",
			"-01_234.567_89",
			"+1_23_4.567_89",
			"+1_234_5e7.8e+100",
			"1_234_567.8e+308",
			"1_234_567.8e-309",
		];
		const expectedErrors: NumberErrKind[] = [
			"Invalid form",
			"Invalid form",
			"Invalid chars",
			"Invalid leading zero",
			"Invalid grouping",
			"Invalid exponent",
			"Power > max",
			"Power < min",
		];
		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(NumberErr);
			if (result instanceof NumberErr) {
				expect(result.kind).toBe(expectedErrors[index]);
			} else {
				expect(true).toBe(false);
			}
		});
	});
});

describe("RFixed parseNum", () => {
	it("handles RFixed parseNum success cases", () => {
		const type = new RFixed(2);
		const valueStrings = [
			"123.40",
			"+123.40",
			"-123.45",
			"0.12",
			"1.00",
			"1_234.56",
		];
		const expectedValues = [
			123.4, 123.4, -123.45, 0.12, 1.0, 1234.56,
		];

		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(TypeValuePair);
			if (result instanceof TypeValuePair) {
				expect(result.value).toBe(
					expectedValues[index]
				);
				expect(result.type).toStrictEqual(
					new RFixed(2)
				);
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("handles RFixed parseNum error", () => {
		const type = new RFixed(2);
		const valueStrings = [
			"+-123.45",
			"1234",
			"123.4e100",
			"123.456",
			"12345678901234.56",
			"1_234_56.78",
		];
		const expectedErrors: NumberErrKind[] = [
			"Invalid form",
			"Not a Real fixed-place number",
			"Fixed-place can't have exponent",
			"Wrong number of fixed-place digits",
			"Fixed-place number digit count > max safe precision",
			"Invalid grouping",
		];
		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(NumberErr);
			if (result instanceof NumberErr) {
				expect(result.kind).toBe(expectedErrors[index]);
			} else {
				expect(true).toBe(false);
			}
		});
	});
});

describe("ZNum parseNum", () => {
	it("handles ZNum parseNum success cases", () => {
		const type = new ZNum();
		const valueStrings = [
			"123",
			"-123",
			"0",
			"1",
			"+123_456_789",
			"9007199254740991",
			"123e2",
			"5e0",
			"-123e2",
		];
		const expectedValues = [
			123, -123, 0, 1, 123_456_789, 9007199254740991,
			123e2, 5, -12300,
		];

		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(TypeValuePair);
			if (result instanceof TypeValuePair) {
				expect(result.value).toBe(
					expectedValues[index]
				);
				expect(result.type).toStrictEqual(type);
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("handles ZNum parseNum error", () => {
		const type = new ZNum();
		const valueStrings = [
			"+-123",
			"0123",
			"1_23_4",
			"9007199254740992",
			"12a3",
			"1234.",
			"1234e-10",
		];
		const expectedErrors: NumberErrKind[] = [
			"Invalid form",
			"Invalid leading zero",
			"Invalid grouping",
			"Not safe integer",
			"Invalid chars",
			"Not an Integer",
			"Power must produce integer",
		];
		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(NumberErr);
			if (result instanceof NumberErr) {
				expect(result.kind).toBe(expectedErrors[index]);
			} else {
				expect(true).toBe(false);
			}
		});
	});
});

describe("WNum parseNum", () => {
	it("handles WNum parseNum success cases", () => {
		const type = new WNum();
		const valueStrings = [
			"123",
			"0",
			"1",
			"123_456_789",
			"9007199254740991",
			"123e2",
			"5e0",
		];
		const expectedValues = [
			123, 0, 1, 123_456_789, 9007199254740991, 123e2, 5,
		];

		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(TypeValuePair);
			if (result instanceof TypeValuePair) {
				expect(result.value).toBe(
					expectedValues[index]
				);
				expect(result.type).toStrictEqual(type);
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("handles WNum parseNum error", () => {
		const type = new WNum();
		const valueStrings = [
			"+-123",
			"0123",
			"1_23_4",
			"9007199254740992",
			"12a3",
			"1234.",
			"1234e-10",
			"-1234",
		];
		const expectedErrors: NumberErrKind[] = [
			"Invalid form",
			"Invalid leading zero",
			"Invalid grouping",
			"Not safe integer",
			"Invalid chars",
			"Not an Integer",
			"Power must produce integer",
			"Natural and Whole numbers can't have signs",
		];
		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(NumberErr);
			if (result instanceof NumberErr) {
				expect(result.kind).toBe(expectedErrors[index]);
			} else {
				expect(true).toBe(false);
			}
		});
	});
});

describe("NNum parseNum", () => {
	it("handles NNum parseNum success cases", () => {
		const type = new NNum();
		const valueStrings = [
			"123",
			"1",
			"123_456_789",
			"9007199254740991",
			"123e2",
			"5e0",
		];
		const expectedValues = [
			123, 1, 123_456_789, 9007199254740991, 123e2, 5,
		];

		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(TypeValuePair);
			if (result instanceof TypeValuePair) {
				expect(result.value).toBe(
					expectedValues[index]
				);
				expect(result.type).toStrictEqual(type);
			} else {
				expect(true).toBe(false);
			}
		});
	});

	it("handles NNum parseNum error", () => {
		const type = new NNum();
		const valueStrings = [
			"+-123",
			"0123",
			"1_23_4",
			"9007199254740992",
			"12a3",
			"1234.",
			"1234e-10",
			"-1234",
			"0",
		];
		const expectedErrors: NumberErrKind[] = [
			"Invalid form",
			"Invalid leading zero",
			"Invalid grouping",
			"Not safe integer",
			"Invalid chars",
			"Not an Integer",
			"Power must produce integer",
			"Natural and Whole numbers can't have signs",
			"Not a Natural number",
		];
		valueStrings.forEach((value, index) => {
			const result = type.parseNum(new StrSlice(value));
			expect(result).toBeInstanceOf(NumberErr);
			if (result instanceof NumberErr) {
				expect(result.kind).toBe(expectedErrors[index]);
			} else {
				expect(true).toBe(false);
			}
		});
	});
});
