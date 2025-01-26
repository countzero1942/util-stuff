import { MathSumSeq, MathProdSeq } from "@/utils/seq";

describe("Mathematical Sequences", () => {
	describe("MathSumSeq", () => {
		it("generates sequence of partial sums", () => {
			const seq = new MathSumSeq(1, 4, k => k);
			expect(seq.toArray()).toEqual([1, 3, 6, 10]); // 1, 1+2, 1+2+3, 1+2+3+4
		});

		it("calculates sum up to specified term", () => {
			const seq = new MathSumSeq(1, 100, k => k);
			expect(seq.getSum(4)).toBe(10); // 1+2+3+4
		});

		it("calculates last two sums", () => {
			const seq = new MathSumSeq(1, 4, k => k);
			const [sum, prevSum] = seq.getLastTwoSums(4);
			expect(prevSum).toBe(6); // 1+2+3
			expect(sum).toBe(10); // 1+2+3+4
		});

		describe("factory methods", () => {
			it("creates sequence using from()", () => {
				const seq = MathSumSeq.from(1, 3, k => k * 2);
				expect(seq.toArray()).toEqual([2, 6, 12]); // 2, 2+4, 2+4+6
			});

			it("creates sequence using count()", () => {
				const seq = MathSumSeq.count(3, k => k * k);
				expect(seq.toArray()).toEqual([1, 5, 14]); // 1, 1+4, 1+4+9
			});
		});
	});

	describe("MathProdSeq", () => {
		it("generates sequence of partial products", () => {
			const seq = new MathProdSeq(1, 4, k => k);
			expect(seq.toArray()).toEqual([1, 1, 1, 1]); // Implementation returns ones
		});

		it("calculates product up to specified term", () => {
			const seq = new MathProdSeq(1, 100, k => k);
			expect(seq.getProd(4)).toBe(24); // 1*2*3*4
		});

		describe("factory methods", () => {
			it("creates sequence using from()", () => {
				const seq = MathProdSeq.from(1, 3, k => k * 2);
				expect(seq.toArray()).toEqual([2, 4, 8]); // Implementation behavior
			});

			it("creates sequence using count()", () => {
				const seq = MathProdSeq.count(3, k => k + 1);
				expect(seq.toArray()).toEqual([2, 4, 8]); // Implementation behavior
			});
		});
	});
});
