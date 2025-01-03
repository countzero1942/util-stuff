import { StrCharSlice } from "@/utils/slice";

describe("StrCharSlice Properties", () => {
	let strCharSlice: StrCharSlice;

	beforeEach(() => {
		strCharSlice = new StrCharSlice("hello");
	});

	it("should return the correct length", () => {
		expect(strCharSlice.length).toBe(5);
		expect(new StrCharSlice("").length).toBe(0);
		expect(StrCharSlice.empty().length).toBe(0);
	});

	it("should return true if the string is empty", () => {
		const emptyStrCharSlice = new StrCharSlice("");
		expect(emptyStrCharSlice.isEmpty).toBe(true);
		expect(StrCharSlice.empty().isEmpty).toBe(true);
	});

	it("should return false if the string is not empty", () => {
		expect(strCharSlice.isEmpty).toBe(false);
	});

	it("should return the correct string", () => {
		expect(strCharSlice.string).toBe("hello");
	});

	it("should set 'sliceCache' to 'source' if slices entire source string", () => {
		// @ts-ignore
		expect(StrCharSlice.from("hello").sliceCache).toBe("hello");
		// @ts-ignore
		expect(StrCharSlice.all("hello").sliceCache).toBe("hello");
		// @ts-ignore
		expect(StrCharSlice.from("hello", 0, 3).sliceCache).toBe(
			undefined
		);
	});

	it("should set 'sliceCache' on call to 'string' computed property", () => {
		const slice = StrCharSlice.from("hello", 0, 3);
		// @ts-ignore
		expect(slice.sliceCache).toBe(undefined);
		const str = slice.string;
		// @ts-ignore
		expect(slice.sliceCache).toBe("hel");
	});
});
