import { StrSlice } from "@/utils/slice";
import { isLoneSurrogate } from "@/utils/string";

describe("StrSlice new/untested instance methods", () => {
	describe("countOccurencesOf", () => {
		it("counts substrings", () => {
			const slice = new StrSlice("banana bandana");
			expect(slice.countOccurencesOf("ana")).toBe(2);
			expect(slice.countOccurencesOf("ba")).toBe(2);
			expect(slice.countOccurencesOf("x")).toBe(0);
		});
	});

	describe("expandSlice", () => {
		it("expands in both directions", () => {
			const slice = new StrSlice("abcdef", 2, 4); // 'cd'
			const expanded = slice.expandSlice(2, 2); // should be 'abcdef'
			expect(expanded.value).toBe("abcdef");
		});
		it("expands in both directions, but not beyond bounds", () => {
			const slice = new StrSlice("abcdef", 2, 4); // 'cd'
			const expanded = slice.expandSlice(3, 3); // should be 'abcdef'
			expect(expanded.value).toBe("abcdef");
		});
	});

	describe("getErrorString", () => {
		it("returns error indicator", () => {
			const slice = new StrSlice("abcdef", 2, 4); // 'cd'
			// Should return something like '--^^--' or similar error marker
			const errStr = slice.getErrorString();
			expect(typeof errStr).toBe("string");
			expect(errStr).toBe("  ^^");
			expect(errStr.length).toBe(4);
		});
	});

	describe("toString", () => {
		it("returns string value", () => {
			const slice = new StrSlice("test");
			expect(slice.toString()).toBe("test");
		});
	});

	describe("sliceByLength", () => {
		it("returns correct slice", () => {
			const slice = new StrSlice("abcdef", 2, 6); // 'cdef'
			const sub = slice.sliceByLength(1, 3); // 'def'
			expect(sub.value).toBe("def");
		});
	});

	describe("sliceOf", () => {
		it("returns slice for substring", () => {
			const slice = new StrSlice("abcdef");
			const sub = slice.sliceOf("cd");
			expect(sub.value).toBe("cd");
		});
	});

	describe("charCodeAt", () => {
		it("returns code for char", () => {
			const slice = new StrSlice("abc");
			expect(slice.charCodeAt(1)).toBe(
				"b".charCodeAt(0)
			);
		});
	});

	describe("codePointAt", () => {
		it("returns code point for char", () => {
			const slice = new StrSlice("a💩c");
			expect(slice.codePointAt(1)).toBe(
				"💩".codePointAt(0)
			);
			expect(slice.codePointAt(3)).toBe(
				"c".codePointAt(0)
			);
			expect(slice.codePointAt(10)).toBe(undefined);
		});

		it("returns undefined on lone surrogate", () => {
			const slice = new StrSlice("a💩").slice(0, 2);
			expect(slice.charCodeAt(0)).toBe(
				"a".charCodeAt(0)
			);
			expect(slice.charCodeAt(1)).toBe(0xd83d);
			expect(isLoneSurrogate(slice.charCodeAt(1))).toBe(
				true
			);
			expect(slice.codePointAt(0)).toBe(
				"a".codePointAt(0)
			);
			expect(slice.codePointAt(1)).toBe(undefined);
		});
	});
});
