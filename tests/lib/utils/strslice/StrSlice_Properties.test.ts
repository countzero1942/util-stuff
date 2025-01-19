import { StrSlice } from "@/utils/slice";

describe("StrSlice Properties and slice method", () => {
	let strSlice: StrSlice;

	beforeEach(() => {
		strSlice = new StrSlice("hello");
	});

	it("returns the correct slice length", () => {
		expect(strSlice.length).toBe(5);
		expect(new StrSlice("").length).toBe(0);
		expect(StrSlice.empty().length).toBe(0);
	});

	it("returns true if the slice is empty", () => {
		const emptyStrSlice = new StrSlice("");
		expect(emptyStrSlice.isEmpty).toBe(true);
		expect(StrSlice.empty().isEmpty).toBe(true);
	});

	it("returns false if the slice is not empty", () => {
		expect(strSlice.isEmpty).toBe(false);
	});

	it("returns the correct slice value from full source string", () => {
		expect(strSlice.value).toBe("hello");
	});

	it("returns the correct slice value from partial source string", () => {
		strSlice = new StrSlice("hello", 1, -1);
		expect(strSlice.value).toBe("ell");
	});

	it("sets 'sliceCache' to 'source' if slices entire source string", () => {
		// @ts-ignore
		expect(StrSlice.from("hello").sliceCache).toBe("hello");
		// @ts-ignore
		expect(StrSlice.all("hello").sliceCache).toBe("hello");
		// @ts-ignore
		expect(StrSlice.from("hello", 0, 3).sliceCache).toBe(undefined);
	});

	it("sets 'sliceCache' on call to 'value' computed property", () => {
		const slice = StrSlice.from("hello", 0, 3);
		// @ts-ignore
		expect(slice.sliceCache).toBe(undefined);
		const str = slice.value;
		// @ts-ignore
		expect(slice.sliceCache).toBe("hel");
	});
	it("sets 'sliceCache' on call to 'toString' method", () => {
		const slice = StrSlice.from("hello", 0, 3);
		// @ts-ignore
		expect(slice.sliceCache).toBe(undefined);
		const str = slice.toString();
		// @ts-ignore
		expect(slice.sliceCache).toBe("hel");
	});
});
