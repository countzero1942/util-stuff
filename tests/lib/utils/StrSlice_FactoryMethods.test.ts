import { StrSlice } from "@/utils/slice";

describe("StrSlice factory methods", () => {
	it("returns via StrSlice.from: with and without startIncl and endExcl", () => {
		expect(StrSlice.from("hello").value).toBe("hello");
		expect(StrSlice.from("hello", 0).value).toBe("hello");
		expect(StrSlice.from("hello", 0, 5).value).toBe("hello");
		expect(StrSlice.from("hello", 1, 3).value).toBe("el");
		expect(StrSlice.from("hello", 5).value).toBe("");
		expect(StrSlice.from("hello", 0, 0).value).toBe("");
	});

	it("returns via StrSlice.fromLength: with startIncl and length", () => {
		expect(StrSlice.fromLength("hello", 0, 5).value).toBe("hello");
		expect(StrSlice.fromLength("hello", 1, 2).value).toBe("el");
		expect(StrSlice.fromLength("hello", 5, 0).value).toBe("");
		expect(StrSlice.fromLength("hello", 0, 0).value).toBe("");
	});

	it("returns via StrSlice.fromCodePointIndices", () => {
		expect(
			StrSlice.fromCodePointIndices("a😄b😺c👽", 0, 6).value
		).toBe("a😄b😺c👽");
		expect(
			StrSlice.fromCodePointIndices("a😄b😺c👽", 1).value
		).toBe("😄b😺c👽");
		expect(
			StrSlice.fromCodePointIndices("a😄b😺c👽", 1, 4).value
		).toBe("😄b😺");
		expect(
			StrSlice.fromCodePointIndices("a😄b😺c👽", 1, -1).value
		).toBe("😄b😺c");
		expect(
			StrSlice.fromCodePointIndices("a😄b😺c👽", -4, -2).value
		).toBe("b😺");
		expect(
			StrSlice.fromCodePointIndices("a😄b😺c👽", 5).value
		).toBe("👽");
		expect(
			StrSlice.fromCodePointIndices("a😄b😺c👽", 6).value
		).toBe("");
		expect(
			StrSlice.fromCodePointIndices("a😄b😺c👽", 0, 0).value
		).toBe("");
	});

	it("returns via StrSlice.fromGraphemeIndices", () => {
		expect(
			StrSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 0, 9).value
		).toBe("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦");
		expect(
			StrSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 1).value
		).toBe("😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦");
		expect(
			StrSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 1, 6).value
		).toBe("😄😶‍🌫️b😺👨‍👦");
		expect(
			StrSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 1, -1).value
		).toBe("😄😶‍🌫️b😺👨‍👦c👽");
		expect(
			StrSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", -6, -2).value
		).toBe("b😺👨‍👦c");
		expect(
			StrSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 8).value
		).toBe("👩‍👩‍👦‍👦");
		expect(
			StrSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 9).value
		).toBe("");
		expect(
			StrSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 0, 0).value
		).toBe("");
	});

	it("returns via StrSlice.all", () => {
		expect(StrSlice.all("hello").value).toBe("hello");
	});

	it("returns via StrSlice.none", () => {
		expect(StrSlice.none("hello").value).toBe("");
	});

	it("returns via StrSlice.empty", () => {
		expect(StrSlice.empty().value).toBe("");
	});

	it("sets 'sliceCache' to 'source' if slices entire source string", () => {
		// @ts-ignore
		expect(StrSlice.from("hello").sliceCache).toBe("hello");
		// @ts-ignore
		expect(StrSlice.from("hello", 0, 3).sliceCache).toBe(undefined);
	});
});
