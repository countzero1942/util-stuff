import { cleanLineOfMultipleSpaces } from "../../../lib/utils/string";

describe("cleanLineOfMultipleSpaces", () => {
	it("should return the original string if no multiple spaces are found", () => {
		expect(cleanLineOfMultipleSpaces("abc def")).toBe("abc def");
	});

	it("should remove multiple spaces in the middle of a string", () => {
		expect(cleanLineOfMultipleSpaces("abc   def")).toBe("abc def");
	});

	it("should remove multiple spaces at the start of a string", () => {
		expect(cleanLineOfMultipleSpaces("   abc def")).toBe("abc def");
	});

	it("should remove multiple spaces at the end of a string", () => {
		expect(cleanLineOfMultipleSpaces("abc def   ")).toBe("abc def");
	});
});
