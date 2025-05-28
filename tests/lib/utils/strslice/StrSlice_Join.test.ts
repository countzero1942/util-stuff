import { StrSlice } from "@/utils/slice";

describe("StrSlice_Join", () => {
	const getStrs = (strsCount: number = 10) => {
		const orgStrs = [
			"abc",
			"def",
			"ghi",
			"jkl",
			"mno",
			"pqr",
			"xyz",
		];
		let strs: string[] = [];
		for (let i = 0; i < strsCount; i++) {
			strs.push(...orgStrs);
		}
		return strs;
	};

	test("Joins a big array under the cached buffer limit", () => {
		const strs = getStrs(100);
		const slices = strs.map(str => new StrSlice(str));
		const joined = StrSlice.join(slices, ", ");
		expect(joined).toBe(strs.join(", "));
	});

	test("Joins a big array over the cached buffer limit", () => {
		const strs = getStrs(200);
		const slices = strs.map(str => new StrSlice(str));
		const joined = StrSlice.join(slices, ", ");
		expect(joined).toBe(strs.join(", "));
	});

	test("Handles empty array", () => {
		const slices: StrSlice[] = [];
		const joined = StrSlice.join(slices, ", ");
		expect(joined).toBe("");
	});

	test("Handles empty separator", () => {
		const strs = getStrs(10);
		const slices = strs.map(str => new StrSlice(str));
		const joined = StrSlice.join(slices, "");
		expect(joined).toBe(strs.join(""));
	});

	test("Handles empty separator: default", () => {
		const strs = getStrs(10);
		const slices = strs.map(str => new StrSlice(str));
		const joined = StrSlice.join(slices);
		expect(joined).toBe(strs.join(""));
	});
});
