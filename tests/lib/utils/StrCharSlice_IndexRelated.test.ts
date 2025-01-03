import { StrCharSlice } from "@/utils/slice";

describe("StrCharSlice Index related methods", () => {
	describe("StrCharSlice.indexOf", () => {
		describe("Test slice of entire string", () => {
			it("should find index of value if it exists or -1", () => {
				const slice = StrCharSlice.from("hello world");
				expect(slice.indexOf("world")).toBe(6);
				expect(slice.indexOf("o")).toBe(4);
				expect(slice.indexOf("x")).toBe(-1);
				expect(slice.indexOf("")).toBe(-1);
				// hello world
				// 01234567890
				// 10987654321-
			});

			it("should find index of value (or -1) with a start index", () => {
				const slice = StrCharSlice.from("hello world");
				expect(slice.indexOf("world", 5)).toBe(6);
				expect(slice.indexOf("world", 6)).toBe(6);
				expect(slice.indexOf("world", 7)).toBe(-1);
				expect(slice.indexOf("world", 11)).toBe(-1);
				expect(slice.indexOf("o", 4)).toBe(4);
				expect(slice.indexOf("o", 5)).toBe(7);
				expect(slice.indexOf("d", 10)).toBe(10);
				expect(slice.indexOf("d", 11)).toBe(-1);
				// hello world
				// 01234567890
				// 10987654321-
			});

			it("should find index of value (or -1) with a negative start index", () => {
				const slice = StrCharSlice.from("hello world");
				expect(slice.indexOf("world", -6)).toBe(6);
				expect(slice.indexOf("world", -5)).toBe(6);
				expect(slice.indexOf("world", -4)).toBe(-1);
				expect(slice.indexOf("world", -12)).toBe(6);
				expect(slice.indexOf("o", -7)).toBe(4);
				expect(slice.indexOf("o", -6)).toBe(7);
				expect(slice.indexOf("d", -1)).toBe(10);
				// hello world
				// 01234567890
				// 10987654321-
			});
		});

		describe("Test slice of middle of a string", () => {
			it("should find index of value if it exists or -1", () => {
				const slice = StrCharSlice.from(
					"abc hello world abc",
					4,
					15
				);
				expect(slice.indexOf("world")).toBe(6);
				expect(slice.indexOf("o")).toBe(4);
				expect(slice.indexOf("x")).toBe(-1);
				expect(slice.indexOf("")).toBe(-1);
				// abc hello world abc
				//     012345678901
				//     10987654321
				// 01234567890123456789
			});

			it("should find index of value (or -1) with start index", () => {
				const slice = StrCharSlice.from(
					"abc hello world abc",
					4,
					15
				);
				expect(slice.indexOf("world", 5)).toBe(6);
				expect(slice.indexOf("world", 6)).toBe(6);
				expect(slice.indexOf("world", 7)).toBe(-1);
				expect(slice.indexOf("world", 11)).toBe(-1);
				expect(slice.indexOf("o", 4)).toBe(4);
				expect(slice.indexOf("o", 5)).toBe(7);
				expect(slice.indexOf("d", 10)).toBe(10);
				expect(slice.indexOf("d", 11)).toBe(-1);
				// abc hello world abc
				//     012345678901
				//     10987654321
				// 01234567890123456789
			});

			it(
				"should find index of value (or -1) " +
					"negative start index",
				() => {
					const slice = StrCharSlice.from(
						"abc hello world abc",
						4,
						15
					);
					expect(slice.indexOf("world", -6)).toBe(6);
					expect(slice.indexOf("world", -5)).toBe(6);
					expect(slice.indexOf("world", -4)).toBe(-1);
					expect(slice.indexOf("world", -12)).toBe(6);
					expect(slice.indexOf("o", -7)).toBe(4);
					expect(slice.indexOf("o", -6)).toBe(7);
					expect(slice.indexOf("d", -1)).toBe(10);
					// abc hello world abc
					//     012345678901
					//     10987654321
					// 01234567890123456789
				}
			);

			it("should return -1 for value that goes beyond slice", () => {
				const slice = StrCharSlice.from("abc def", 0, 6);
				expect(slice.string).toBe("abc de");
				expect(slice.indexOf("def")).toBe(-1);
				// abc def
				// 01234567
			});
		});
	});
	describe("StrCharSlice.lastIndexOf", () => {
		it("should return index of value if it exists or -1", () => {
			const slice1 = StrCharSlice.from("hello world");
			expect(slice1.lastIndexOf("world")).toBe(6);
			expect(slice1.lastIndexOf("o")).toBe(7);
			expect(slice1.lastIndexOf("x")).toBe(-1);
			expect(slice1.lastIndexOf("")).toBe(-1);
			// hello world
			// 01234567890
			// 10987654321-
		});
		it("should return index of value (or -1) with start index", () => {
			const slice1 = StrCharSlice.from("hello world");
			expect(slice1.lastIndexOf("hello", 5)).toBe(0);
			expect(slice1.lastIndexOf("hello", 4)).toBe(-1);
			expect(slice1.lastIndexOf("o", 7)).toBe(4);
			// hello world
			// 01234567890
			// 10987654321-
		});
		it("should return index of value (or -1) with neg start index", () => {
			const slice1 = StrCharSlice.from("hello world");
			expect(slice1.lastIndexOf("hello", -6)).toBe(0);
			expect(slice1.lastIndexOf("hello", -7)).toBe(-1);
			expect(slice1.lastIndexOf("o", -4)).toBe(4);
			// hello world
			// 01234567890
			// 10987654321-
		});
		it("should not find index of value that goes beyond slice", () => {
			const slice3 = StrCharSlice.from("abc def", 0, 6);
			expect(slice3.string).toBe("abc de");
			expect(slice3.lastIndexOf("def")).toBe(-1);
			// abc def
			// 01234567
			// 7654321-
		});
	});
	describe("StrCharSlice.countOccurencesOf", () => {
		it("should count occurences of value in slice", () => {
			const slice1 = StrCharSlice.from("hello world");
			expect(slice1.countOccurencesOf("world")).toBe(1);
			expect(slice1.countOccurencesOf("o")).toBe(2);
			expect(slice1.countOccurencesOf("x")).toBe(0);
			expect(slice1.countOccurencesOf("")).toBe(0);
			// hello world
			// 01234567890
			// 10987654321-
		});
		it(
			"should count occurences of value " +
				"in slice with start index",
			() => {
				const slice1 = StrCharSlice.from("hello world");
				expect(slice1.countOccurencesOf("world", 6)).toBe(1);
				expect(slice1.countOccurencesOf("world", 7)).toBe(0);
				expect(slice1.countOccurencesOf("o", 4)).toBe(2);
				expect(slice1.countOccurencesOf("o", 7)).toBe(1);
				expect(slice1.countOccurencesOf("o", 8)).toBe(0);
				// hello world
				// 01234567890
				// 10987654321-
			}
		);
		it(
			"should count occurences of value " +
				"in slice with neg start index",
			() => {
				const slice1 = StrCharSlice.from("hello world");
				expect(slice1.countOccurencesOf("world", -5)).toBe(1);
				expect(slice1.countOccurencesOf("world", -4)).toBe(0);
				expect(slice1.countOccurencesOf("o", -7)).toBe(2);
				expect(slice1.countOccurencesOf("o", -4)).toBe(1);
				expect(slice1.countOccurencesOf("o", -3)).toBe(0);
				// hello world
				// 01234567890
				// 10987654321-
			}
		);
	});
});
