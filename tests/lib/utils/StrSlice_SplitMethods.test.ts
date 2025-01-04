import { StrSlice } from "@/utils/slice";

describe("StrSlice splits methods", () => {
	describe("split", () => {
		it("splits on single character", () => {
			const slice = new StrSlice("a,b,c");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["a", "b", "c"]);
		});

		it("splits and trim on single character", () => {
			const slice = new StrSlice(" a , b , c ");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["a", "b", "c"]);
		});

		it("splits on multiple characters", () => {
			const slice = new StrSlice("a||b||c");
			const result = slice.split("||").map(s => s.value);
			expect(result).toEqual(["a", "b", "c"]);
		});

		it("splits and trim on multiple characters", () => {
			const slice = new StrSlice(" a || b || c ");
			const result = slice.split("||").map(s => s.value);
			expect(result).toEqual(["a", "b", "c"]);
		});

		it("handles empty segments", () => {
			const slice = new StrSlice("a,,c");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["a", "", "c"]);
		});

		it("handles empty string", () => {
			const slice = new StrSlice("");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual([""]);
		});

		it("handles string with no delimiters", () => {
			const slice = new StrSlice("abc");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["abc"]);
		});

		it("handles string with only delimiters", () => {
			const slice = new StrSlice(",,");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["", "", ""]);
		});

		it("splits with 1 maximum splits", () => {
			const slice = new StrSlice(" a, b, c ");
			const result = slice.split(",", 1).map(s => s.value);
			expect(result).toEqual(["a", "b, c"]);
		});

		it("splits with 2 maximum splits", () => {
			const slice = new StrSlice(" a, b, c, d ");
			const result = slice.split(",", 2).map(s => s.value);
			expect(result).toEqual(["a", "b", "c, d"]);
		});
	});
});
