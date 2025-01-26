import { ArraySeq, ZipSeq, AccumSeq, Seq } from "@/utils/seq";

describe("Zip and Accumulation Sequences", () => {
	describe("ZipSeq", () => {
		it("zips multiple sequences together", () => {
			const seq1 = new ArraySeq([1, 2, 3]);
			const seq2 = new ArraySeq(["a", "b", "c"]);
			const seq3 = new ArraySeq([true, false, true]);

			const zipSeq = new ZipSeq<
				
				{ num: number; char: string; bool: boolean }
			>([seq1, seq2, seq3] as const, (num, char, bool) => ({
				num,
				char,
				bool,
			}));

			const result = zipSeq.toArray();
			expect(result).toEqual([
				{ num: 1, char: "a", bool: true },
				{ num: 2, char: "b", bool: false },
				{ num: 3, char: "c", bool: true },
			]);
		});

		it("stops at shortest sequence", () => {
			const seq1 = new ArraySeq([1, 2, 3, 4]);
			const seq2 = new ArraySeq<string>(["a", "b"]);

			const zipSeq = new ZipSeq<
				
				{ num: number; char: string }
			>([seq1, seq2] as const, (num, char) => ({ num, char }));

			const result = zipSeq.toArray();
			expect(result).toEqual([
				{ num: 1, char: "a" },
				{ num: 2, char: "b" },
			]);
		});

		it("handles empty sequences", () => {
			const seq1 = new ArraySeq([1, 2, 3]);
			const seq2 = new ArraySeq<string>([]);

			const zipSeq = new ZipSeq<
				
				{ num: number; char: string }
			>([seq1, seq2] as const, (num, char) => ({ num, char }));

			const result = zipSeq.toArray();
			expect(result).toEqual([]);
		});
	});

	describe("AccumSeq", () => {
		it("accumulates values using function", () => {
			const seq = new ArraySeq([1, 2, 3, 4]);
			const accumSeq = new AccumSeq(
				seq,
				0,
				(acc, value) => acc + value
			);

			expect(accumSeq.toArray()).toEqual([1, 3, 6, 10]);
		});

		it("accumulates with non-zero start value", () => {
			const seq = new ArraySeq([1, 2, 3]);
			const accumSeq = new AccumSeq(
				seq,
				10,
				(acc, value) => acc + value
			);

			expect(accumSeq.toArray()).toEqual([11, 13, 16]);
		});

		it("handles empty sequence", () => {
			const seq = new ArraySeq([]);
			const accumSeq = new AccumSeq(
				seq,
				0,
				(acc, value) => acc + value
			);

			expect(accumSeq.toArray()).toEqual([]);
		});

		it("accumulates with custom operation", () => {
			const seq = new ArraySeq([2, 3, 4]);
			const accumSeq = new AccumSeq(
				seq,
				1,
				(acc, value) => acc * value
			);

			expect(accumSeq.toArray()).toEqual([2, 6, 24]);
		});
	});
});
