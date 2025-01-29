import { Str } from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";
import exp from "constants";

describe("StrSlice Non-Index-related methods", () => {
	describe("StrSlice - Trim Related Methods + expandSlice", () => {
		let strSlice: StrSlice;

		beforeEach(() => {
			strSlice = new StrSlice("  hello world  ");
		});

		it("trims leading and trailing whitespace", () => {
			const result = strSlice.trim();
			expect(result.value).toBe("hello world");
		});

		it("trims leading whitespace", () => {
			const result = strSlice.trimStart();
			expect(result.value).toBe("hello world  ");
		});

		it("trims trailing whitespace", () => {
			const result = strSlice.trimEnd();
			expect(result.value).toBe("  hello world");
		});

		it("doesn't trim when there is no whitespace", () => {
			strSlice = new StrSlice("hello world");
			const result = strSlice.trim();
			expect(result.value).toBe("hello world");
		});

		it("handles string with only whitespace", () => {
			strSlice = new StrSlice("     ");
			const result = strSlice.trim();
			expect(result.value).toBe("");
		});
		it("handles empty string", () => {
			strSlice = new StrSlice("");
			const result = strSlice.trim();
			expect(result.value).toBe("");
		});
		it("returns same slice reference on no trim", () => {
			strSlice = new StrSlice("hello world");
			const result = strSlice.trim();
			expect(result).toBe(strSlice);
		});
		it("trims all 16 whitespace characters", () => {
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

			strSlice = new StrSlice(dataString);
			expect(strSlice.length).toBe(16);
			const result = strSlice.trim();
			expect(result.isEmpty).toBe(true);
		});

		it("handles expandSlice and edge cases", () => {
			strSlice = StrSlice.from("X .Y .Z");
			//                        0123456789012345
			const sliceA = strSlice.sliceByLength(3, 1);
			expect(sliceA.value).toBe("Y");
			const expandedA1 = sliceA.expandSlice(1);
			expect(expandedA1.value).toBe(".Y");

			const expandedA2 = sliceA.expandSlice(1, 1);
			expect(expandedA2.value).toBe(".Y ");

			const sliceB = strSlice.sliceByLength(0, 1);
			expect(sliceB.value).toBe("X");
			const expandedB1 = sliceB.expandSlice(1, 1);
			expect(expandedB1.value).toBe("X ");

			const sliceC = strSlice.sliceByLength(6, 1);
			expect(sliceC.value).toBe("Z");
			const expandedC = sliceC.expandSlice(1, 1);
			expect(expandedC.value).toBe(".Z");
		});
	});

	describe("StrSlice - StartsWith and EndsWith Methods", () => {
		describe("startsWith string value", () => {
			let strSlice: StrSlice;

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slice starts with value", () => {
				const result = strSlice.startsWith("hello");
				expect(result).toBe(true);
			});

			it("returns false: slice does not start with value", () => {
				const result = strSlice.startsWith("world");
				expect(result).toBe(false);
			});

			it("returns false: startsWith is called with an empty string", () => {
				const result = strSlice.startsWith("");
				expect(result).toBe(false);
			});

			it("returns false: startsWith slice is in middle of string", () => {
				strSlice = StrSlice.from("hello world", 1, -1);
				expect(strSlice.value).toBe("ello worl");
				const result1 = strSlice.startsWith("hello");
				expect(result1).toBe(false);
				const result2 = strSlice.startsWith("world");
				expect(result2).toBe(false);
			});
		});

		describe("startsWith string value with start index", () => {
			let strSlice: StrSlice;

			// hello world
			// 012345678901

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slice starts with value at start index", () => {
				const result = strSlice.startsWith("world", 6);
				expect(result).toBe(true);
			});

			it("returns false: slice doesn't start with value at index", () => {
				const result = strSlice.startsWith("hello", 6);
				expect(result).toBe(false);
			});

			it("returns false: startsWith value matches in bounds but also goes beyond bounds", () => {
				const result = strSlice.startsWith(
					"worldly",
					6
				);
				expect(result).toBe(false);
			});

			it("returns false: startsWith value goes beyond slice bounds but matches source", () => {
				strSlice = StrSlice.from(
					"hello worldly",
					0,
					-2
				);
				expect(strSlice.value).toBe("hello world");
				expect(strSlice.startsWith("world", 6)).toBe(
					true
				);
				const result = strSlice.startsWith(
					"worldly",
					6
				);
				expect(result).toBe(false);
			});
		});

		describe("startsWith StrSlice value", () => {
			let strSlice: StrSlice;

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slice starts with value", () => {
				const value = new StrSlice("hello");
				const result = strSlice.startsWith(value);
				expect(result).toBe(true);
			});

			it("returns true: slice starts with value slice that's offset", () => {
				const value = new StrSlice(
					"abc hello abc",
					4,
					9
				);
				expect(value.value).toBe("hello");
				const result = strSlice.startsWith(value);
				expect(result).toBe(true);
			});

			it("returns false: slice does not start with value", () => {
				const value = new StrSlice("world");
				const result = strSlice.startsWith(value);
				expect(result).toBe(false);
			});

			it("returns false: slice does not start with value slice that's offset", () => {
				const value = new StrSlice(
					"abc world abc",
					4,
					9
				);
				expect(value.value).toBe("world");
				const result = strSlice.startsWith(value);
				expect(result).toBe(false);
			});

			it("returns false: startsWith is called with an empty value", () => {
				const value1 = new StrSlice("");
				const value2 = StrSlice.empty();
				const result1 = strSlice.startsWith(value1);
				expect(result1).toBe(false);
				const result2 = strSlice.startsWith(value2);
				expect(result2).toBe(false);
			});

			it("returns false: startsWith value goes beyond slice bounds but matches source", () => {
				strSlice = StrSlice.from(
					"hello worldly",
					0,
					-2
				);
				expect(strSlice.value).toBe("hello world");
				expect(strSlice.startsWith("world", 6)).toBe(
					true
				);
				const value = new StrSlice("worldly");
				const result = strSlice.startsWith(value, 6);
				expect(result).toBe(false);
			});
		});

		describe("startsWith StrCharValue value with start index", () => {
			let strSlice: StrSlice;

			// hello world
			// 012345678901
			// 10987654321-

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slice starts with value at start index", () => {
				const value = new StrSlice("world");
				const result = strSlice.startsWith(value, 6);
				expect(result).toBe(true);
			});

			it("returns false: slice does not start with value at index", () => {
				const value = new StrSlice("hello");
				const result = strSlice.startsWith(value, 6);
				expect(result).toBe(false);
			});

			it("returns false: startsWith value matches in bounds but also goes beyond bounds", () => {
				const value = new StrSlice("worldly");
				const result = strSlice.startsWith(value, 6);
				expect(result).toBe(false);
			});

			it("returns false: startsWith value goes beyond slice bounds but matches source", () => {
				const value = new StrSlice("worldly");
				strSlice = StrSlice.from(
					"hello worldly",
					0,
					-2
				);
				expect(strSlice.value).toBe("hello world");
				expect(strSlice.startsWith("world", 6)).toBe(
					true
				);
				const result = strSlice.startsWith(value, 6);
				expect(result).toBe(false);
			});
		});

		describe("startsWith StrCharValue value with negative start index", () => {
			let strSlice: StrSlice;

			// hello world
			// 012345678901
			// 10987654321-

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slice starts with value at start index", () => {
				const value = new StrSlice("world");
				const result = strSlice.startsWith(value, -5);
				expect(result).toBe(true);
			});

			it("returns false: slice does not start with value at index", () => {
				const value = new StrSlice("hello");
				const result = strSlice.startsWith(value, -5);
				expect(result).toBe(false);
			});

			it("returns false: startsWith value matches in bounds but also goes beyond bounds", () => {
				const value = new StrSlice("worldly");
				const result = strSlice.startsWith(value, -5);
				expect(result).toBe(false);
			});

			it("returns false: startsWith value goes beyond slice bounds but matches source", () => {
				const value = new StrSlice("worldly");
				strSlice = StrSlice.from(
					"hello worldly",
					0,
					-2
				);
				expect(strSlice.value).toBe("hello world");
				expect(strSlice.startsWith("world", 6)).toBe(
					true
				);
				const result = strSlice.startsWith(value, -5);
				expect(result).toBe(false);
			});
		});

		describe("endsWith (note: ends with calls startWith, so no need for extensive iting)", () => {
			let strSlice: StrSlice;

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slice ends with value", () => {
				const result = strSlice.endsWith("world");
				expect(result).toBe(true);
			});

			it("returns false: slice does not end with value", () => {
				const result = strSlice.endsWith("hello");
				expect(result).toBe(false);
			});

			it("returns false if endsWith is called with an empty string", () => {
				const result = strSlice.endsWith("");
				expect(result).toBe(false);
			});

			it("returns false: endsWith value goes beyond slice bounds but matches source", () => {
				strSlice = StrSlice.from("hello", 0, -1);
				expect(strSlice.value).toBe("hell");
				const result = strSlice.endsWith("hello");
				expect(result).toBe(false);
			});
		});

		describe("endsWith string value with start index", () => {
			let strSlice: StrSlice;

			// hello world
			// 012345678901

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slice starts with value at start index", () => {
				const value = "hello";
				const result = strSlice.endsWith(
					value,
					value.length
				);
				expect(result).toBe(true);
			});

			it("returns false: slice does not start with value at index", () => {
				const value = "world";
				const result = strSlice.endsWith(
					value,
					value.length
				);
				expect(result).toBe(false);
			});

			it("returns false: startsWith value goes beyond slice bounds but matches source", () => {
				strSlice = StrSlice.from("worldly", 0, -2);
				expect(strSlice.value).toBe("world");
				expect(strSlice.startsWith("world")).toBe(true);
				const value = "worldly";
				const result = strSlice.endsWith(
					value,
					value.length
				);
				expect(result).toBe(false);
			});
		});

		describe("'hello world' startsWith and endsWith StrSlice value: all 4 variations", () => {
			const slice = StrSlice.from("hello world");
			const value1 = StrSlice.from("hello");
			const value2 = StrSlice.from("world");

			it("returns true: startsWith 'hello'", () => {
				const resulta = slice.startsWith(value1);
				expect(resulta).toBe(true);
			});

			it("returns true: startsWith 'world' at index 6", () => {
				const resultb = slice.startsWith(value2, 6);
				expect(resultb).toBe(true);
			});

			it("returns true: endsWith 'world'", () => {
				const resultc = slice.endsWith(value2);
				expect(resultc).toBe(true);
			});

			it("returns true: endsWith 'hello' at index 5: 'hello'.length", () => {
				const resultd = slice.endsWith(
					value1,
					value1.length
				);
				expect(resultd).toBe(true);
			});
		});
	});

	describe("StrSlice - Equals Method (Note: calls 'startsWith')", () => {
		describe("equals string value", () => {
			let strSlice: StrSlice;

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slices are equal", () => {
				const value = "hello world";
				const result = strSlice.equals(value);
				expect(result).toBe(true);
			});

			it("returns false: slices are not equal", () => {
				const value = "hello";
				const result = strSlice.equals(value);
				expect(result).toBe(false);
			});

			it("returns true: offset slices are equal", () => {
				strSlice = new StrSlice("abc hello abc", 4, -4);
				const value = "hello";
				expect(strSlice.value).toBe("hello");
				const result = strSlice.equals(value);
				expect(result).toBe(true);
			});

			it("returns false: comparing with empty string", () => {
				const value = "";
				const result = strSlice.equals(value);
				expect(result).toBe(false);
			});

			it("returns true: both strings are empty", () => {
				strSlice = new StrSlice("");
				const value = "";
				const result = strSlice.equals(value);
				expect(result).toBe(true);
			});
		});

		describe("equals StrValue value", () => {
			let strSlice: StrSlice;

			beforeEach(() => {
				strSlice = new StrSlice("hello world");
			});

			it("returns true: slices are equal", () => {
				const value = new StrSlice("hello world");
				const result = strSlice.equals(value);
				expect(result).toBe(true);
			});

			it("returns false: slices are not equal", () => {
				const value = new StrSlice("hello");
				const result = strSlice.equals(value);
				expect(result).toBe(false);
			});

			it("returns true: offset slices are equal", () => {
				strSlice = new StrSlice("abc hello abc", 4, -4);
				const value = new StrSlice(
					"O hello world",
					2,
					7
				);
				expect(strSlice.value).toBe("hello");
				expect(value.value).toBe("hello");
				const result = strSlice.equals(value);
				expect(result).toBe(true);
			});

			it("returns false: comparing with empty string", () => {
				const value = new StrSlice("");
				const result = strSlice.equals(value);
				expect(result).toBe(false);
			});

			it("returns true: both strings are empty", () => {
				strSlice = new StrSlice("");
				const value1 = new StrSlice("");
				const value2 = StrSlice.empty();
				const result1 = strSlice.equals(value1);
				expect(result1).toBe(true);
				const result2 = strSlice.equals(value2);
				expect(result2).toBe(true);
			});
		});
	});
});
