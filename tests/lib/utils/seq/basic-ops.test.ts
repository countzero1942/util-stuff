import { ArraySeq } from "@/utils/seq";

describe("Basic Seq Operations", () => {
	describe("map()", () => {
		it("maps elements using transform function", () => {
			const seq = new ArraySeq([1, 2, 3, 4]);
			const result = seq.map(x => x * 2).toArray();
			expect(result).toEqual([2, 4, 6, 8]);
		});

		it("maps empty sequence", () => {
			const seq = new ArraySeq([]);
			const result = seq.map(x => x * 2).toArray();
			expect(result).toEqual([]);
		});
	});

	describe("imap()", () => {
		it("maps elements with index", () => {
			const seq = new ArraySeq(["a", "b", "c"]);
			const result = seq.imap((i, x) => `${i}:${x}`).toArray();
			expect(result).toEqual(["0:a", "1:b", "2:c"]);
		});
	});

	describe("filter()", () => {
		it("filters elements using predicate", () => {
			const seq = new ArraySeq([1, 2, 3, 4, 5]);
			const result = seq.filter(x => x % 2 === 0).toArray();
			expect(result).toEqual([2, 4]);
		});

		it("filters all elements", () => {
			const seq = new ArraySeq([1, 3, 5]);
			const result = seq.filter(x => x % 2 === 0).toArray();
			expect(result).toEqual([]);
		});
	});

	describe("part()", () => {
		it("partitions elements into two sequences", () => {
			const seq = new ArraySeq([1, 2, 3, 4, 5]);
			const [evens, odds] = seq.part(x => x % 2 === 0);
			expect(evens.toArray()).toEqual([2, 4]);
			expect(odds.toArray()).toEqual([1, 3, 5]);
		});
	});

	describe("partArrays()", () => {
		it("partitions elements into two arrays", () => {
			const seq = new ArraySeq([1, 2, 3, 4, 5]);
			const [evens, odds] = seq.partArrays(x => x % 2 === 0);
			expect(evens).toEqual([2, 4]);
			expect(odds).toEqual([1, 3, 5]);
		});
	});

	describe("skip()", () => {
		it("skips specified number of elements", () => {
			const seq = new ArraySeq([1, 2, 3, 4, 5]);
			const result = seq.skip(2).toArray();
			expect(result).toEqual([3, 4, 5]);
		});

		it("returns empty sequence when skipping all elements", () => {
			const seq = new ArraySeq([1, 2, 3]);
			const result = seq.skip(3).toArray();
			expect(result).toEqual([]);
		});

		it("returns empty sequence when skipping more than length", () => {
			const seq = new ArraySeq([1, 2, 3]);
			const result = seq.skip(5).toArray();
			expect(result).toEqual([]);
		});
	});

	describe("take()", () => {
		it("takes specified number of elements", () => {
			const seq = new ArraySeq([1, 2, 3, 4, 5]);
			const result = seq.take(3).toArray();
			expect(result).toEqual([1, 2, 3]);
		});

		it("takes all elements when count exceeds length", () => {
			const seq = new ArraySeq([1, 2, 3]);
			const result = seq.take(5).toArray();
			expect(result).toEqual([1, 2, 3]);
		});

		it("returns empty sequence when taking zero elements", () => {
			const seq = new ArraySeq([1, 2, 3]);
			const result = seq.take(0).toArray();
			expect(result).toEqual([]);
		});
	});

	describe("toArray()", () => {
		it("converts sequence to array", () => {
			const seq = new ArraySeq([1, 2, 3]);
			const result = seq.toArray();
			expect(result).toEqual([1, 2, 3]);
		});
	});

	describe("toObject()", () => {
		it("converts sequence of key-value pairs to object", () => {
			const seq = new ArraySeq([
				{ key: "a", value: 1 },
				{ key: "b", value: 2 },
			]);
			const result = seq.toObject();
			expect(result).toEqual({ a: 1, b: 2 });
		});

		it("skips invalid entries", () => {
			const seq = new ArraySeq([
				{ key: "a", value: 1 },
				{ notKey: "b", value: 2 },
				{ key: "c", notValue: 3 },
				{ other: "field" },
			]);
			const result = seq.toObject();
			expect(result).toEqual({ a: 1 });
		});
	});
});
