import {
	StrSeq,
	StrGraphemeSeq,
	CodePointSeq,
} from "@/utils/seq";

describe("String Sequences", () => {
	describe("StrSeq", () => {
		it("iterates over basic ASCII characters", () => {
			const seq = new StrSeq("hello");
			expect(seq.toArray().map(x => x.element)).toEqual([
				"h",
				"e",
				"l",
				"l",
				"o",
			]);
		});

		it("handles surrogate pairs", () => {
			const seq = new StrSeq("👋🌍");
			const result = seq.toArray();
			const expectFull = [
				{
					charIndex: 0,
					element: "👋",
					elementIndex: 0,
				},
				{
					charIndex: 2,
					element: "🌍",
					elementIndex: 1,
				},
			];

			expect(result.map(x => x.element)).toEqual([
				"👋",
				"🌍",
			]);
			expect(result).toStrictEqual(expectFull);
		});

		it("calculates element count correctly", () => {
			const seq = new StrSeq("hi👋");
			expect(seq.count()).toBe(3); // 'h', 'i', '👋'
		});

		describe("slicing", () => {
			it("slices with positive indices", () => {
				const seq = new StrSeq("hello");
				expect(seq.slice(1, 4)).toBe("ell");
			});

			it("slices with negative indices", () => {
				const seq = new StrSeq("hello");
				expect(seq.slice(-3, -1)).toBe("ll");
			});

			it("slices with surrogate pairs", () => {
				const seq = new StrSeq("hi👋bye");
				expect(seq.slice(2, 3)).toBe("👋");
			});
		});

		describe("range operations", () => {
			it("gets range with explicit bounds", () => {
				const seq = new StrSeq("hello");
				const range = seq.getRange(1, 4);
				expect(range.startIncl).toBe(1);
				expect(range.endExcl).toBe(4);
			});

			it("gets range with default bounds", () => {
				const seq = new StrSeq("hello");
				const range = seq.getRange();
				expect(range.startIncl).toBe(0);
				expect(range.endExcl).toBe(5);
			});
		});

		it("creates sequence using from()", () => {
			const seq = StrSeq.from("test");
			expect(seq.toArray().map(x => x.element)).toEqual([
				"t",
				"e",
				"s",
				"t",
			]);
		});
	});

	describe("StrGraphemeSeq", () => {
		it("iterates over basic ASCII characters", () => {
			const seq = new StrGraphemeSeq("hello");
			expect(seq.toArray().map(x => x.element)).toEqual([
				"h",
				"e",
				"l",
				"l",
				"o",
			]);
		});

		it("handles surrogate pairs", () => {
			const seq = new StrGraphemeSeq("👋🌍");
			expect(seq.toArray().map(x => x.element)).toEqual([
				"👋",
				"🌍",
			]);
		});

		it("handles complex grapheme clusters", () => {
			// Family emoji (multiple codepoints that form one grapheme)
			const seq = new StrGraphemeSeq("👨‍👩‍👧");
			expect(seq.toArray().map(x => x.element)).toEqual([
				"👨‍👩‍👧",
			]);
		});

		it("handles combining characters", () => {
			const seq = new StrGraphemeSeq("e\u0301"); // é (e + combining acute accent)
			expect(seq.toArray().map(x => x.element)).toEqual([
				"e\u0301",
			]);
		});

		describe("slicing", () => {
			it("slices with grapheme clusters", () => {
				const seq = new StrGraphemeSeq("hi👨‍👩‍👧bye");
				expect(seq.slice(2, 3)).toBe("👨‍👩‍👧");
			});
		});

		it("creates sequence using from()", () => {
			const seq = StrGraphemeSeq.from("e\u0301");
			expect(seq.toArray().map(x => x.element)).toEqual([
				"e\u0301",
			]);
		});
	});

	describe("CodePointSeq", () => {
		it("iterates over code points correctly", () => {
			const seq = new CodePointSeq("👨‍👩‍👧");
			const expected = [
				"👨",
				"\u200D",
				"👩",
				"\u200D",
				"👧",
			].map(x => x.codePointAt(0));
			expect(seq.toArray().map(x => x.element)).toEqual(
				expected
			);
		});

		it("handles mixed chars and surrogate pairs", () => {
			const seq = new CodePointSeq("🚀hello🌟");
			const expected = [
				"🚀",
				"h",
				"e",
				"l",
				"l",
				"o",
				"🌟",
			].map(x => x.codePointAt(0));
			expect(seq.toArray().map(x => x.element)).toEqual(
				expected
			);
		});

		it("handles surrogate pairs", () => {
			const seq = new CodePointSeq("🚀🌟");
			const expected = ["🚀", "🌟"].map(x =>
				x.codePointAt(0)
			);
			expect(seq.toArray().map(x => x.element)).toEqual(
				expected
			);
		});

		it("calculates element count correctly", () => {
			const seq = new CodePointSeq("hi👨‍👩‍👧");
			expect(seq.count()).toBe(7); // 'h', 'i', '👨', '‍', '👩', '‍', '👧'
		});
	});
});
