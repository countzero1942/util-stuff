import { StrSlice } from "@/utils/slice";

describe("StrSlice Index related methods A", () => {
	describe("StrSlice.slice", () => {
		it("tests all permutations of 'slice' against expected string value", () => {
			const slice = StrSlice.from(
				":::hello worldly:",
				3,
				-3
			);

			let sliceOf: StrSlice;
			let shouldBe: string;

			sliceOf = slice.slice();
			shouldBe = "hello world";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(0, 0);
			shouldBe = "";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(0, 5);
			shouldBe = "hello";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(5, 0);
			shouldBe = "hello";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(-13, 5);
			shouldBe = "hello";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(6, 11);
			shouldBe = "world";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(6, 12);
			shouldBe = "world";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(2, 4);
			shouldBe = "ll";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(-9, -7);
			shouldBe = "ll";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.slice(-7, -9);
			shouldBe = "ll";
			expect(sliceOf.equals(shouldBe)).toBe(true);

			// :::hello worldly:
			//    012345678901
			//    10987654321-
			// 012345678901234567
			//
		});
	});

	describe("StrSlice.sliceOf", () => {
		it("tests all permutations of sliceOf value against manual slice", () => {
			const slice = StrSlice.from(
				":::hello worldly:",
				3,
				-3
			);
			let sliceOf: StrSlice;
			let shouldBe: StrSlice;

			sliceOf = slice.sliceOf("world");
			shouldBe = slice.slice(6, 11);
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.sliceOf("hello");
			shouldBe = slice.slice(0, 5);
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.sliceOf(":");
			shouldBe = slice.slice(0, 0);
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.sliceOf("worldly");
			shouldBe = slice.slice(0, 0);
			expect(sliceOf.equals(shouldBe)).toBe(true);

			sliceOf = slice.sliceOf("");
			shouldBe = slice.slice(0, 0);
			expect(sliceOf.equals(shouldBe)).toBe(true);

			// :::hello worldly:
			//    012345678901
			// 012345678901234567
			//       10987654321-
		});
	});

	describe("StrSlice.indexOf", () => {
		describe("Test slice of entire string", () => {
			it("finds index of value if it exists or -1", () => {
				const slice = StrSlice.from("hello world");
				expect(slice.indexOf("world")).toBe(6);
				expect(slice.indexOf("o")).toBe(4);
				expect(slice.indexOf("x")).toBe(-1);
				expect(slice.indexOf("")).toBe(-1);
				// hello world
				// 01234567890
				// 10987654321-
			});

			it("finds index of value (or -1) with a start index", () => {
				const slice = StrSlice.from("hello world");
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

			it("finds index of value (or -1) with a negative start index", () => {
				const slice = StrSlice.from("hello world");
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
			it("finds index of value if it exists or -1", () => {
				const slice = StrSlice.from(
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

			it("finds index of value (or -1) with start index", () => {
				const slice = StrSlice.from(
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
				"finds index of value (or -1) " +
					"negative start index",
				() => {
					const slice = StrSlice.from(
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

			it("returns -1 for value that goes beyond slice", () => {
				const slice = StrSlice.from("abc def", 0, 6);
				expect(slice.value).toBe("abc de");
				expect(slice.indexOf("def")).toBe(-1);
				// abc def
				// 01234567
			});
		});
	});

	describe("StrSlice.lastIndexOf", () => {
		describe("Test slice of entire string", () => {
			it("finds index of value if it exists or -1", () => {
				const slice = StrSlice.from("hello world");
				expect(slice.lastIndexOf("world")).toBe(6);
				expect(slice.lastIndexOf("o")).toBe(7);
				expect(slice.lastIndexOf("x")).toBe(-1);
				expect(slice.lastIndexOf("")).toBe(-1);
				// hello world
				// 01234567890
				// 10987654321-
			});

			it("finds index of value (or -1) with a start index", () => {
				const slice = StrSlice.from("hello world");
				expect(slice.lastIndexOf("world", 11)).toBe(6);
				expect(slice.lastIndexOf("world", 10)).toBe(-1);
				expect(slice.lastIndexOf("hello", 5)).toBe(0);
				expect(slice.lastIndexOf("world", 4)).toBe(-1);
				expect(slice.lastIndexOf("o", 8)).toBe(7);
				expect(slice.lastIndexOf("o", 5)).toBe(4);
				expect(slice.lastIndexOf("d", 11)).toBe(10);
				expect(slice.lastIndexOf("d", 10)).toBe(-1);
				// hello world
				// 01234567890
				// 10987654321-
			});

			it("finds index of value (or -1) with a negative start index", () => {
				const slice = StrSlice.from("hello world");
				expect(slice.lastIndexOf("worl", -1)).toBe(6);
				expect(slice.lastIndexOf("worl", -2)).toBe(-1);
				expect(slice.lastIndexOf("hello", -6)).toBe(0);
				expect(slice.lastIndexOf("hello", -7)).toBe(-1);
				expect(slice.lastIndexOf("o", -6)).toBe(4);
				expect(slice.lastIndexOf("o", -3)).toBe(7);
				expect(slice.lastIndexOf("l", -1)).toBe(9);
				// hello world
				// 01234567890
				// 10987654321-
			});
		});

		describe("Test slice of middle of a string", () => {
			it("finds index of value if it exists or -1", () => {
				const slice = StrSlice.from(
					"abc hello world abc",
					4,
					15
				);
				expect(slice.lastIndexOf("world")).toBe(6);
				expect(slice.lastIndexOf("o")).toBe(7);
				expect(slice.lastIndexOf("x")).toBe(-1);
				expect(slice.lastIndexOf("")).toBe(-1);
				// abc hello world abc
				//     012345678901
				//     10987654321-
				// 01234567890123456789
			});

			it("finds index of value (or -1) with start index", () => {
				const slice = StrSlice.from(
					"abc hello world abc",
					4,
					15
				);
				expect(slice.lastIndexOf("world", 11)).toBe(6);
				expect(slice.lastIndexOf("world", 10)).toBe(-1);
				expect(slice.lastIndexOf("hello", 5)).toBe(0);
				expect(slice.lastIndexOf("world", 4)).toBe(-1);
				expect(slice.lastIndexOf("o", 8)).toBe(7);
				expect(slice.lastIndexOf("o", 5)).toBe(4);
				expect(slice.lastIndexOf("d", 11)).toBe(10);
				expect(slice.lastIndexOf("d", 10)).toBe(-1);
				// abc hello world abc
				//     012345678901
				//     10987654321
				// 01234567890123456789
			});

			it(
				"finds index of value (or -1) " +
					"negative start index",
				() => {
					const slice = StrSlice.from(
						"abc hello world abc",
						4,
						15
					);
					expect(slice.lastIndexOf("worl", -1)).toBe(
						6
					);
					expect(slice.lastIndexOf("worl", -2)).toBe(
						-1
					);
					expect(slice.lastIndexOf("hello", -6)).toBe(
						0
					);
					expect(slice.lastIndexOf("hello", -7)).toBe(
						-1
					);
					expect(slice.lastIndexOf("o", -3)).toBe(7);
					expect(slice.lastIndexOf("o", -6)).toBe(4);
					expect(slice.lastIndexOf("l", -1)).toBe(9);
					// abc hello world abc
					//     012345678901
					//     10987654321-
					// 01234567890123456789
				}
			);

			it("returns -1 for value that goes beyond slice", () => {
				const slice = StrSlice.from("abc def", 0, 6);
				expect(slice.value).toBe("abc de");
				expect(slice.lastIndexOf("def")).toBe(-1);
				// abc def
				// 01234567
			});
		});
	});

	describe("StrSlice.countOccurencesOf", () => {
		it("counts occurences of value in slice", () => {
			const slice1 = StrSlice.from("hello world");
			expect(slice1.countOccurencesOf("world")).toBe(1);
			expect(slice1.countOccurencesOf("o")).toBe(2);
			expect(slice1.countOccurencesOf("x")).toBe(0);
			expect(slice1.countOccurencesOf("")).toBe(0);
			// hello world
			// 01234567890
			// 10987654321-
		});
		it(
			"counts occurences of value " +
				"in slice with start index",
			() => {
				const slice1 = StrSlice.from("hello world");
				expect(
					slice1.countOccurencesOf("world", 6)
				).toBe(1);
				expect(
					slice1.countOccurencesOf("world", 7)
				).toBe(0);
				expect(slice1.countOccurencesOf("o", 4)).toBe(
					2
				);
				expect(slice1.countOccurencesOf("o", 7)).toBe(
					1
				);
				expect(slice1.countOccurencesOf("o", 8)).toBe(
					0
				);
				// hello world
				// 01234567890
				// 10987654321-
			}
		);
		it(
			"counts occurences of value " +
				"in slice with neg start index",
			() => {
				const slice1 = StrSlice.from("hello world");
				expect(
					slice1.countOccurencesOf("world", -5)
				).toBe(1);
				expect(
					slice1.countOccurencesOf("world", -4)
				).toBe(0);
				expect(slice1.countOccurencesOf("o", -7)).toBe(
					2
				);
				expect(slice1.countOccurencesOf("o", -4)).toBe(
					1
				);
				expect(slice1.countOccurencesOf("o", -3)).toBe(
					0
				);
				// hello world
				// 01234567890
				// 10987654321-
			}
		);
	});
});
