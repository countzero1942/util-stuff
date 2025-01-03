import { Str } from "@/parser/types/type-types";
import { StrCharSlice } from "@/utils/slice";
import exp from "constants";

describe("StrCharSlice Non-Index-related methods", () => {
	describe("StrCharSlice - Trim Related Methods", () => {
		let strCharSlice: StrCharSlice;

		beforeEach(() => {
			strCharSlice = new StrCharSlice("  hello world  ");
		});

		test("should trim leading and trailing whitespace", () => {
			const result = strCharSlice.trim();
			expect(result.string).toBe("hello world");
		});

		test("should trim leading whitespace", () => {
			const result = strCharSlice.trimStart();
			expect(result.string).toBe("hello world  ");
		});

		test("should trim trailing whitespace", () => {
			const result = strCharSlice.trimEnd();
			expect(result.string).toBe("  hello world");
		});

		test("should not trim when there is no whitespace", () => {
			strCharSlice = new StrCharSlice("hello world");
			const result = strCharSlice.trim();
			expect(result.string).toBe("hello world");
		});

		test("should handle string with only whitespace", () => {
			strCharSlice = new StrCharSlice("     ");
			const result = strCharSlice.trim();
			expect(result.string).toBe("");
		});
		test("should handle empty string", () => {
			strCharSlice = new StrCharSlice("");
			const result = strCharSlice.trim();
			expect(result.string).toBe("");
		});
		test("should return same slice reference on no trim", () => {
			strCharSlice = new StrCharSlice("hello world");
			const result = strCharSlice.trim();
			expect(result).toBe(strCharSlice);
		});
		test("should trim all 16 whitespace characters", () => {
			const data = [
				" ",
				"\r",
				"\n",
				"\t",
				"\f",
				"\v",
				"\u00a0",
				"\u1680",
				"\u2000",
				"\u200a",
				"\u2028",
				"\u2029",
				"\u202f",
				"\u205f",
				"\u3000",
				"\ufeff",
			];

			const dataString = data.join("");

			strCharSlice = new StrCharSlice(dataString);
			expect(strCharSlice.length).toBe(16);
			const result = strCharSlice.trim();
			expect(result.isEmpty).toBe(true);
		});
	});

	describe("StrCharSlice - StartsWith and EndsWith Methods", () => {
		describe("startsWith string value", () => {
			let strCharSlice: StrCharSlice;

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			it("should return true: slice starts with value", () => {
				const result = strCharSlice.startsWith("hello");
				expect(result).toBe(true);
			});

			test("should return false: slice does not start with value", () => {
				const result = strCharSlice.startsWith("world");
				expect(result).toBe(false);
			});

			test("should return false: startsWith is called with an empty string", () => {
				const result = strCharSlice.startsWith("");
				expect(result).toBe(false);
			});

			test("should return false: startsWith slice is in middle of string", () => {
				strCharSlice = StrCharSlice.from("hello world", 1, -1);
				expect(strCharSlice.string).toBe("ello worl");
				const result1 = strCharSlice.startsWith("hello");
				expect(result1).toBe(false);
				const result2 = strCharSlice.startsWith("world");
				expect(result2).toBe(false);
			});
		});

		describe("startsWith string value with start index", () => {
			let strCharSlice: StrCharSlice;

			// hello world
			// 012345678901

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			it("should return true: slice starts with value at start index", () => {
				const result = strCharSlice.startsWith("world", 6);
				expect(result).toBe(true);
			});

			test("should return false: slice does not start with value at index", () => {
				const result = strCharSlice.startsWith("hello", 6);
				expect(result).toBe(false);
			});

			it("should return false: startsWith value matches in bounds but also goes beyond bounds", () => {
				const result = strCharSlice.startsWith("worldly", 6);
				expect(result).toBe(false);
			});

			test("should return false: startsWith value goes beyond slice bounds but matches source", () => {
				strCharSlice = StrCharSlice.from("hello worldly", 0, -2);
				expect(strCharSlice.string).toBe("hello world");
				expect(strCharSlice.startsWith("world", 6)).toBe(true);
				const result = strCharSlice.startsWith("worldly", 6);
				expect(result).toBe(false);
			});
		});

		describe("startsWith StrCharSlice value", () => {
			let strCharSlice: StrCharSlice;

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			it("should return true: slice starts with value", () => {
				const value = new StrCharSlice("hello");
				const result = strCharSlice.startsWith(value);
				expect(result).toBe(true);
			});

			it("should return true: slice starts with value slice that's offset", () => {
				const value = new StrCharSlice("abc hello abc", 4, 9);
				expect(value.string).toBe("hello");
				const result = strCharSlice.startsWith(value);
				expect(result).toBe(true);
			});

			test("should return false: slice does not start with value", () => {
				const value = new StrCharSlice("world");
				const result = strCharSlice.startsWith(value);
				expect(result).toBe(false);
			});

			test("should return false: slice does not start with value slice that's offset", () => {
				const value = new StrCharSlice("abc world abc", 4, 9);
				expect(value.string).toBe("world");
				const result = strCharSlice.startsWith(value);
				expect(result).toBe(false);
			});

			test("should return false: startsWith is called with an empty value", () => {
				const value1 = new StrCharSlice("");
				const value2 = StrCharSlice.empty();
				const result1 = strCharSlice.startsWith(value1);
				expect(result1).toBe(false);
				const result2 = strCharSlice.startsWith(value2);
				expect(result2).toBe(false);
			});

			test("should return false: startsWith value goes beyond slice bounds but matches source", () => {
				strCharSlice = StrCharSlice.from("hello worldly", 0, -2);
				expect(strCharSlice.string).toBe("hello world");
				expect(strCharSlice.startsWith("world", 6)).toBe(true);
				const value = new StrCharSlice("worldly");
				const result = strCharSlice.startsWith(value, 6);
				expect(result).toBe(false);
			});
		});

		describe("startsWith StrCharValue value with start index", () => {
			let strCharSlice: StrCharSlice;

			// hello world
			// 012345678901
			// 10987654321-

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			it("should return true: slice starts with value at start index", () => {
				const value = new StrCharSlice("world");
				const result = strCharSlice.startsWith(value, 6);
				expect(result).toBe(true);
			});

			test("should return false: slice does not start with value at index", () => {
				const value = new StrCharSlice("hello");
				const result = strCharSlice.startsWith(value, 6);
				expect(result).toBe(false);
			});

			it("should return false: startsWith value matches in bounds but also goes beyond bounds", () => {
				const value = new StrCharSlice("worldly");
				const result = strCharSlice.startsWith(value, 6);
				expect(result).toBe(false);
			});

			test("should return false: startsWith value goes beyond slice bounds but matches source", () => {
				const value = new StrCharSlice("worldly");
				strCharSlice = StrCharSlice.from("hello worldly", 0, -2);
				expect(strCharSlice.string).toBe("hello world");
				expect(strCharSlice.startsWith("world", 6)).toBe(true);
				const result = strCharSlice.startsWith(value, 6);
				expect(result).toBe(false);
			});
		});

		describe("startsWith StrCharValue value with negative start index", () => {
			let strCharSlice: StrCharSlice;

			// hello world
			// 012345678901
			// 10987654321-

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			it("should return true: slice starts with value at start index", () => {
				const value = new StrCharSlice("world");
				const result = strCharSlice.startsWith(value, -5);
				expect(result).toBe(true);
			});

			test("should return false: slice does not start with value at index", () => {
				const value = new StrCharSlice("hello");
				const result = strCharSlice.startsWith(value, -5);
				expect(result).toBe(false);
			});

			it("should return false: startsWith value matches in bounds but also goes beyond bounds", () => {
				const value = new StrCharSlice("worldly");
				const result = strCharSlice.startsWith(value, -5);
				expect(result).toBe(false);
			});

			test("should return false: startsWith value goes beyond slice bounds but matches source", () => {
				const value = new StrCharSlice("worldly");
				strCharSlice = StrCharSlice.from("hello worldly", 0, -2);
				expect(strCharSlice.string).toBe("hello world");
				expect(strCharSlice.startsWith("world", 6)).toBe(true);
				const result = strCharSlice.startsWith(value, -5);
				expect(result).toBe(false);
			});
		});

		describe("endsWith (note: ends with calls startWith, so no need for extensive testing)", () => {
			let strCharSlice: StrCharSlice;

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			test("should return true: slice ends with value", () => {
				const result = strCharSlice.endsWith("world");
				expect(result).toBe(true);
			});

			test("should return false: slice does not end with value", () => {
				const result = strCharSlice.endsWith("hello");
				expect(result).toBe(false);
			});

			test("should return false if endsWith is called with an empty string", () => {
				const result = strCharSlice.endsWith("");
				expect(result).toBe(false);
			});

			test("should return false: endsWith value goes beyond slice bounds but matches source", () => {
				strCharSlice = StrCharSlice.from("hello", 0, -1);
				expect(strCharSlice.string).toBe("hell");
				const result = strCharSlice.endsWith("hello");
				expect(result).toBe(false);
			});
		});

		describe("endsWith string value with start index", () => {
			let strCharSlice: StrCharSlice;

			// hello world
			// 012345678901

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			it("should return true: slice starts with value at start index", () => {
				const value = "hello";
				const result = strCharSlice.endsWith(value, value.length);
				expect(result).toBe(true);
			});

			test("should return false: slice does not start with value at index", () => {
				const value = "world";
				const result = strCharSlice.endsWith(value, value.length);
				expect(result).toBe(false);
			});

			test("should return false: startsWith value goes beyond slice bounds but matches source", () => {
				strCharSlice = StrCharSlice.from("worldly", 0, -2);
				expect(strCharSlice.string).toBe("world");
				expect(strCharSlice.startsWith("world")).toBe(true);
				const value = "worldly";
				const result = strCharSlice.endsWith(value, value.length);
				expect(result).toBe(false);
			});
		});

		describe("'hello world' startsWith and endsWith StrCharSlice value: all 4 variations", () => {
			const slice = StrCharSlice.from("hello world");
			const value1 = StrCharSlice.from("hello");
			const value2 = StrCharSlice.from("world");

			test("should return true: startsWith 'hello'", () => {
				const resulta = slice.startsWith(value1);
				expect(resulta).toBe(true);
			});

			test("should return true: startsWith 'world' at index 6", () => {
				const resultb = slice.startsWith(value2, 6);
				expect(resultb).toBe(true);
			});

			test("should return true: endsWith 'world'", () => {
				const resultc = slice.endsWith(value2);
				expect(resultc).toBe(true);
			});

			test("should return true: endsWith 'hello' at index 5", () => {
				const resultd = slice.endsWith(value1, value1.length);
				expect(resultd).toBe(true);
			});
		});
	});

	describe("StrCharSlice - Equals Method (Note: calls 'startsWith')", () => {
		describe("equals string value", () => {
			let strCharSlice: StrCharSlice;

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			test("should return true: slices are equal", () => {
				const value = "hello world";
				const result = strCharSlice.equals(value);
				expect(result).toBe(true);
			});

			test("should return false: slices are not equal", () => {
				const value = "hello";
				const result = strCharSlice.equals(value);
				expect(result).toBe(false);
			});

			test("should return true: offset slices are equal", () => {
				strCharSlice = new StrCharSlice("abc hello abc", 4, -4);
				const value = "hello";
				expect(strCharSlice.string).toBe("hello");
				const result = strCharSlice.equals(value);
				expect(result).toBe(true);
			});

			test("should return false: comparing with empty string", () => {
				const value = "";
				const result = strCharSlice.equals(value);
				expect(result).toBe(false);
			});

			test("should return true: both strings are empty", () => {
				strCharSlice = new StrCharSlice("");
				const value = "";
				const result = strCharSlice.equals(value);
				expect(result).toBe(true);
			});
		});

		describe("equals StrCharValue value", () => {
			let strCharSlice: StrCharSlice;

			beforeEach(() => {
				strCharSlice = new StrCharSlice("hello world");
			});

			test("should return true: slices are equal", () => {
				const value = new StrCharSlice("hello world");
				const result = strCharSlice.equals(value);
				expect(result).toBe(true);
			});

			test("should return false: slices are not equal", () => {
				const value = new StrCharSlice("hello");
				const result = strCharSlice.equals(value);
				expect(result).toBe(false);
			});

			test("should return true: offset slices are equal", () => {
				strCharSlice = new StrCharSlice("abc hello abc", 4, -4);
				const value = new StrCharSlice("O hello world", 2, 7);
				expect(strCharSlice.string).toBe("hello");
				expect(value.string).toBe("hello");
				const result = strCharSlice.equals(value);
				expect(result).toBe(true);
			});

			test("should return false: comparing with empty string", () => {
				const value = new StrCharSlice("");
				const result = strCharSlice.equals(value);
				expect(result).toBe(false);
			});

			test("should return true: both strings are empty", () => {
				strCharSlice = new StrCharSlice("");
				const value1 = new StrCharSlice("");
				const value2 = StrCharSlice.empty();
				const result1 = strCharSlice.equals(value1);
				expect(result1).toBe(true);
				const result2 = strCharSlice.equals(value2);
				expect(result2).toBe(true);
			});
		});
	});
});
