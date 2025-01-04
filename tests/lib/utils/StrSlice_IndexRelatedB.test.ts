import { StrSeqElement } from "@/utils/seq";
import { StrSlice } from "@/utils/slice";

describe("StrSlice Index related methods A", () => {
	describe("StrSlice.indexOfMany", () => {
		it("returns [-1,-1] when no match found", () => {
			const slice = new StrSlice("hello world");
			expect(slice.indexOfMany(["x", "y", "z"])).toEqual([-1, -1]);
		});

		it("returns first match with its array index", () => {
			const slice = new StrSlice("hello world");
			expect(slice.indexOfMany(["x", "o", "z"])).toEqual([4, 1]);
		});

		it("handles empty array", () => {
			const slice = new StrSlice("hello world");
			expect(slice.indexOfMany([])).toEqual([-1, -1]);
		});

		it("handles empty string in matching array", () => {
			const slice = new StrSlice("hello world");
			expect(slice.indexOfMany([""])).toEqual([-1, -1]);
			expect(slice.indexOfMany(["x", "", "y"])).toEqual([-1, -1]);
		});

		it("finds earliest occurrence when multiple matches exist", () => {
			const slice = new StrSlice("hello world");
			expect(slice.indexOfMany(["w", "l", "o"])).toEqual([2, 1]);
		});
		it("handles matching in middle of string", () => {
			// "hello world"
			//  012345678901
			const slice1 = new StrSlice("hello world", 4, 9);
			expect(slice1.value).toBe("o wor");
			expect(slice1.indexOfMany(["w", "l"])).toEqual([2, 0]);
			expect(slice1.indexOfMany(["l"])).toEqual([-1, -1]);
		});

		it("works with empty string", () => {
			const slice = new StrSlice("");
			expect(slice.indexOfMany(["a", "b"])).toEqual([-1, -1]);
		});
	});

	describe("StrSlice.indexesOfOrdered: to match ['.', '_', '^']", () => {
		let orderedMatches = [".", "_", "^"];

		beforeEach(() => {
			orderedMatches = [".", "_", "^"];
		});

		it("returns [1, 5, 9] from 'X.2.6_4.3^3.4': ignores extra '.' chars", () => {
			const slice = StrSlice.from("X.2.6_4.3^3.4");
			//                           012345678901234567890
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				1, 5, 9,
			]);
		});

		it("returns [1, -1, 5] from 'X.2.6^3.4': ignores extra '.' chars", () => {
			const slice = StrSlice.from("X.2.6^3.4");
			//                           012345678901234567890
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				1, -1, 5,
			]);
		});

		it("returns [1, 5, -1] from 'X.2.6_4.3': ignores extra '.' chars", () => {
			const slice = StrSlice.from("X.2.6_4.3");
			//                           012345678901234567890
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				1, 5, -1,
			]);
		});

		it("returns [-1, 1, 5] from 'X_4.3^3.4': ignores extra '.' chars with no leading '.' char", () => {
			const slice = StrSlice.from("X_4.3^3.4");
			//                           012345678901234567890
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				-1, 1, 5,
			]);
		});

		it("returns [-1, 1, -1] from 'X_4.3': ignores extra '.' chars with no leading '.' char", () => {
			const slice = StrSlice.from("X_4.3");
			//                           012345678901234567890
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				-1, 1, -1,
			]);
		});

		it("returns [-1, -1, 1] from 'X^3.4': ignores extra '.' chars with no leading '.' char", () => {
			const slice = StrSlice.from("X^3.4");
			//                           012345678901234567890
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				-1, -1, 1,
			]);
		});

		it("handles empty match: match ['.', '', '^'] returns [1, -1, 5] from 'X.2.6^3.4'", () => {
			orderedMatches = [".", "", "^"];
			const slice = StrSlice.from("X.2.6^3.4");
			//                           012345678901234567890
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				1, -1, 5,
			]);
		});

		it("works with unicode characters, codepoints and grapheme clusters", () => {
			// 😀😺👨‍👦
			const indexes: readonly StrSeqElement[] = [
				{ element: "a", elementIndex: 0, charIndex: 0 },
				{ element: "😄", elementIndex: 1, charIndex: 1 },
				{ element: "😄", elementIndex: 2, charIndex: 3 },
				{ element: "b", elementIndex: 3, charIndex: 5 },
				{ element: "😺", elementIndex: 4, charIndex: 6 },
				{ element: "😺", elementIndex: 5, charIndex: 8 },
				{ element: "😄", elementIndex: 6, charIndex: 10 },
				{ element: "c", elementIndex: 7, charIndex: 12 },
				{ element: "👨‍👦", elementIndex: 8, charIndex: 13 },
				{ element: "😺", elementIndex: 9, charIndex: 18 },
				{ element: "👨‍👦", elementIndex: 10, charIndex: 20 },
				{ element: "😄", elementIndex: 11, charIndex: 25 },
				{ element: "👨‍👦", elementIndex: 12, charIndex: 27 },
			];

			orderedMatches = ["😄", "😺", "👨‍👦"];
			const slice = StrSlice.from("a😄😄b😺😺😄c👨‍👦😺👨‍👦😄👨‍👦");
			const matches: readonly number[] = [
				indexes[1]!.charIndex,
				indexes[4]!.charIndex,
				indexes[8]!.charIndex,
			];
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				1, 6, 13,
			]);
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				indexes[1]!.charIndex,
				indexes[4]!.charIndex,
				indexes[8]!.charIndex,
			]);
		});

		// it("handles overlapping patterns", () => {
		// 	const slice = StrSlice.from("aaa");
		// 	expect(slice.indexesOfOrdered("aa")).toEqual([0, 1]);
		// });

		it("works with empty search string", () => {
			const slice = StrSlice.from("test");
			expect(slice.indexesOfOrdered([""])).toEqual([-1]);
		});

		// it("handles partial slices correctly", () => {
		// 	const slice = StrSlice.from("hello world", 2, 8);
		// 	expect(slice.indexesOfOrdered("o")).toEqual([2, 4]);
		// });

		it("handles slice in middle of string", () => {
			const slice = StrSlice.from("A.26.X.2.6_4.3^3.4", 5, -4);
			//                           0123456789012345678
			//                           876543210987654321
			expect(slice.value).toEqual("X.2.6_4.3");
			expect(slice.indexesOfOrdered(orderedMatches)).toEqual([
				1, 5, -1,
			]);
		});
	});
});
