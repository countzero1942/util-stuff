import { Range } from "@/utils/seq";

describe("Range", () => {
	it("constructs with start and end indices", () => {
		const range = new Range(1, 5);
		expect(range.startIncl).toBe(1);
		expect(range.endExcl).toBe(5);
	});

	it("calculates length correctly", () => {
		const range = new Range(2, 7);
		expect(range.length()).toBe(5);
	});

	it("creates range from start and end using from()", () => {
		const range = Range.from(3, 8);
		expect(range.startIncl).toBe(3);
		expect(range.endExcl).toBe(8);
		expect(range.length()).toBe(5);
	});

	it("creates range from start and length using fromLength()", () => {
		const range = Range.fromLength(2, 4);
		expect(range.startIncl).toBe(2);
		expect(range.endExcl).toBe(6);
		expect(range.length()).toBe(4);
	});

	it("creates empty range using empty()", () => {
		const range = Range.empty();
		expect(range.startIncl).toBe(0);
		expect(range.endExcl).toBe(0);
		expect(range.length()).toBe(0);
	});
});
