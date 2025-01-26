import { NumSeq, NumberFilterSeq } from "@/utils/seq";

describe("Numeric Sequences", () => {
	describe("NumSeq", () => {
		it("generates sequence from min to max", () => {
			const seq = new NumSeq(1, 5);
			expect(seq.toArray()).toEqual([1, 2, 3, 4, 5]);
		});

		it("generates sequence with custom increment", () => {
			const seq = new NumSeq(0, 6, 2);
			expect(seq.toArray()).toEqual([0, 2, 4, 6]);
		});

		it("handles empty range", () => {
			const seq = new NumSeq(5, 1);
			const result = seq.toArray();
			expect(result).toEqual([5, 4, 3, 2, 1]); // Counts down from 5 to 1
		});

		describe("factory methods", () => {
			it("creates sequence using from()", () => {
				const seq = NumSeq.from(1, 5, 2);
				expect(seq.toArray()).toEqual([1, 3, 5]);
			});

			it("creates sequence using range()", () => {
				const seq = NumSeq.range(0, 5);
				expect(seq.toArray()).toEqual([0, 1, 2, 3, 4]);
			});

			it("creates sequence using count()", () => {
				const seq = NumSeq.count(3);
				expect(seq.toArray()).toEqual([1, 2, 3]);
			});

			it("creates sequence using loop()", () => {
				const seq = NumSeq.loop(4);
				expect(seq.toArray()).toEqual([0, 1, 2, 3]);
			});
		});
	});

	describe("NumberFilterSeq", () => {
		it("filters numbers based on predicate", () => {
			const seq = new NumberFilterSeq(1, 10, x => x % 2 === 0);
			expect(seq.toArray()).toEqual([2, 4, 6, 8, 10]);
		});

		it("handles empty range", () => {
			const seq = new NumberFilterSeq(10, 1, x => x % 2 === 0);
			expect(seq.toArray()).toEqual([]);
		});

		it("handles no matches", () => {
			const seq = new NumberFilterSeq(1, 5, x => x > 10);
			expect(seq.toArray()).toEqual([]);
		});
	});
});
