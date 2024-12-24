import { StrCharSlice } from "@/utils/slice";

describe("StrCharSlice factory methods", () => {
	it("StrCharSlice.from", () => {
		expect(StrCharSlice.from("hello", 0, 5).string).toBe("hello");
		expect(StrCharSlice.from("hello", 1, 3).string).toBe("el");
		expect(StrCharSlice.from("hello", 5).string).toBe("");
		expect(StrCharSlice.from("hello", 0, 0).string).toBe("");
	});

	it("StrCharSlice.fromLength", () => {
		expect(StrCharSlice.fromLength("hello", 0, 5).string).toBe(
			"hello"
		);
		expect(StrCharSlice.fromLength("hello", 1, 2).string).toBe(
			"el"
		);
		expect(StrCharSlice.fromLength("hello", 5, 0).string).toBe("");
		expect(StrCharSlice.fromLength("hello", 0, 0).string).toBe("");
	});

	it("StrCharSlice.fromCodePointIndices", () => {
		expect(
			StrCharSlice.fromCodePointIndices("a😄b😺c👽", 0, 6).string
		).toBe("a😄b😺c👽");
		expect(
			StrCharSlice.fromCodePointIndices("a😄b😺c👽", 1).string
		).toBe("😄b😺c👽");
		expect(
			StrCharSlice.fromCodePointIndices("a😄b😺c👽", 1, 4).string
		).toBe("😄b😺");
		expect(
			StrCharSlice.fromCodePointIndices("a😄b😺c👽", 1, -1).string
		).toBe("😄b😺c");
		expect(
			StrCharSlice.fromCodePointIndices("a😄b😺c👽", -4, -2).string
		).toBe("b😺");
		expect(
			StrCharSlice.fromCodePointIndices("a😄b😺c👽", 5).string
		).toBe("👽");
		expect(
			StrCharSlice.fromCodePointIndices("a😄b😺c👽", 6).string
		).toBe("");
		expect(
			StrCharSlice.fromCodePointIndices("a😄b😺c👽", 0, 0).string
		).toBe("");
	});

	it("StrCharSlice.fromGraphemeIndices", () => {
		expect(
			StrCharSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 0, 9)
				.string
		).toBe("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦");
		expect(
			StrCharSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 1).string
		).toBe("😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦");
		expect(
			StrCharSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 1, 6)
				.string
		).toBe("😄😶‍🌫️b😺👨‍👦");
		expect(
			StrCharSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 1, -1)
				.string
		).toBe("😄😶‍🌫️b😺👨‍👦c👽");
		expect(
			StrCharSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", -6, -2)
				.string
		).toBe("b😺👨‍👦c");
		expect(
			StrCharSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 8).string
		).toBe("👩‍👩‍👦‍👦");
		expect(
			StrCharSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 9).string
		).toBe("");
		expect(
			StrCharSlice.fromGraphemeIndices("a😄😶‍🌫️b😺👨‍👦c👽👩‍👩‍👦‍👦", 0, 0)
				.string
		).toBe("");
	});

	it("StrCharSlice.all", () => {
		expect(StrCharSlice.all("hello").string).toBe("hello");
	});

	it("StrCharSlice.none", () => {
		expect(StrCharSlice.none("hello").string).toBe("");
	});

	it("StrCharSlice.empty", () => {
		expect(StrCharSlice.empty().string).toBe("");
	});
});
