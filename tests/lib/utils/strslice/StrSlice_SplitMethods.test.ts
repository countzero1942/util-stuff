import { StrSlice } from "@/utils/slice";

describe("StrSlice splits methods", () => {
	describe("split", () => {
		it("splits on single character", () => {
			const slice = new StrSlice("a,b,c");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["a", "b", "c"]);
		});

		it("splits and trim on single character", () => {
			const slice = new StrSlice(" a , b , c ");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["a", "b", "c"]);
		});

		it("splits on multiple characters", () => {
			const slice = new StrSlice("a||b||c");
			const result = slice.split("||").map(s => s.value);
			expect(result).toEqual(["a", "b", "c"]);
		});

		it("splits and trim on multiple characters", () => {
			const slice = new StrSlice(" a || b || c ");
			const result = slice.split("||").map(s => s.value);
			expect(result).toEqual(["a", "b", "c"]);
		});

		it("handles empty segments", () => {
			const slice = new StrSlice("a,,c");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["a", "", "c"]);
		});

		it("handles empty string", () => {
			const slice = new StrSlice("");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual([""]);
		});

		it("handles string with no delimiters", () => {
			const slice = new StrSlice("abc");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["abc"]);
		});

		it("handles string with only delimiters", () => {
			const slice = new StrSlice(",,");
			const result = slice.split(",").map(s => s.value);
			expect(result).toEqual(["", "", ""]);
		});

		it("splits with 1 maximum splits", () => {
			const slice = new StrSlice(" a, b, c ");
			const result = slice.split(",", 1).map(s => s.value);
			expect(result).toEqual(["a", "b, c"]);
		});

		it("splits with 2 maximum splits", () => {
			const slice = new StrSlice(" a, b, c, d ");
			const result = slice.split(",", 2).map(s => s.value);
			expect(result).toEqual(["a", "b", "c, d"]);
		});
	});

	describe("edgeSplitMany", () => {
		let slice: StrSlice;

		beforeEach(() => {});

		it("splits by type characters beginning with '.'", () => {
			slice = new StrSlice(
				"A property name .X.2:6:12 %y %z.2:2 " +
					"$abc $def xyz >kg.m/s2 .Y:2 .Z %g"
			);
			const result = slice.edgeSplitMany([" ."]).map(s => s.value);
			expect(result).toEqual([
				"A property name",
				".X.2:6:12 %y %z.2:2 $abc $def xyz >kg.m/s2",
				".Y:2",
				".Z %g",
			]);
		});

		it("splits by type param chars: [' %', ' $', ' >']: multiple matches", () => {
			slice = new StrSlice(
				".X.2:6:12 %y %z.2:2 $abc $def xyz >kg.m/s2"
			);
			const matches = [" %", " $", " >"];
			const result = slice
				.edgeSplitMany(matches)
				.map(s => s.value);
			expect(result).toEqual([
				".X.2:6:12",
				"%y",
				"%z.2:2",
				"$abc",
				"$def xyz",
				">kg.m/s2",
			]);
		});

		it("handles empty string", () => {
			slice = new StrSlice("");
			const result = slice.edgeSplitMany(["."]).map(s => s.value);
			expect(result).toEqual([""]);
		});

		it("handles empty splitter: [' %', ' $', '']", () => {
			slice = new StrSlice(".X.2:6:12 %y %z.2:2 $abc $def xyz");
			const matches = [" %", " $", ""];
			const result = slice
				.edgeSplitMany(matches)
				.map(s => s.value);
			expect(result).toEqual([
				".X.2:6:12",
				"%y",
				"%z.2:2",
				"$abc",
				"$def xyz",
			]);
		});

		it("handles splitter: [' %', ' $', ' >'] with no matches", () => {
			slice = new StrSlice(
				"This is a test string with no matches"
			);
			const matches = [" %", " $", " >"];
			const result = slice
				.edgeSplitMany(matches)
				.map(s => s.value);
			expect(result).toEqual([
				"This is a test string with no matches",
			]);
		});

		it("handles slice in middle of string", () => {
			// ".X.2:6:12 %y %z.2:2 $abc $def xyz >kg.m/s2"
			//  0123456789012345678901234567890123456789012
			//                                 10987654321-
			slice = new StrSlice(
				".X.2:6:12 %y %z.2:2 $abc $def xyz >kg.m/s2",
				9,
				-9
			);
			expect(slice.value).toBe(" %y %z.2:2 $abc $def xyz");
			const matches = [" %", " $", " >"];
			const result = slice
				.edgeSplitMany(matches)
				.map(s => s.value);
			expect(result).toEqual(["%y", "%z.2:2", "$abc", "$def xyz"]);
		});

		it("handles eliminating empty entry at beginning", () => {
			//	".X.2:6:12     %y %z.2:2 $abc $def xyz >kg.m/s2",
			//  01234567890123456789012345678901234567890123456
			//                                     10987654321-
			slice = new StrSlice(
				".X.2:6:12     %y %z.2:2 $abc $def xyz >kg.m/s2",
				9,
				-9
			);
			expect(slice.value).toBe("     %y %z.2:2 $abc $def xyz");
			const matches = [" %", " $", " >"];
			const result = slice
				.edgeSplitMany(matches)
				.map(s => s.value);
			expect(result).toEqual(["%y", "%z.2:2", "$abc", "$def xyz"]);
		});

		it("handles empty slice", () => {
			//	".X.2:6:12     %y %z.2:2 $abc $def xyz >kg.m/s2",
			//  01234567890123456789012345678901234567890123456
			//                                     10987654321-
			slice = new StrSlice("");
			expect(slice.value).toBe("");
			const matches = [" %", " $", " >"];
			const result = slice
				.edgeSplitMany(matches)
				.map(s => s.value);
			expect(result).toEqual([""]);
		});

		it("handles slice of whitespace", () => {
			//	".X.2:6:12     %y %z.2:2 $abc $def xyz >kg.m/s2",
			//  01234567890123456789012345678901234567890123456
			//                                     10987654321-
			slice = new StrSlice("     ");
			expect(slice.value).toBe("     ");
			const matches = [" %", " $", " >"];
			const result = slice
				.edgeSplitMany(matches)
				.map(s => s.value);
			expect(result).toEqual([""]);
		});
	});

	describe("edgeSplitOrdered", () => {
		const matches = [".", "_", "^"];
		it("splits by type param chars: ['.', '_', '^']: 9 permutations", () => {
			const strs = [
				".X.2.6_4.3^3.4",
				".X_4.3^3.4",
				".X.2.6^3.4",
				".X.2.6_4.3",
				".X.2.6",
				".X_4.3",
				".X^3.4",
				".X",
				".X and some stuff",
			];
			const results = [
				["X", ".2.6", "_4.3", "^3.4"],
				["X", "_4.3", "^3.4"],
				["X", ".2.6", "^3.4"],
				["X", ".2.6", "_4.3"],
				["X", ".2.6"],
				["X", "_4.3"],
				["X", "^3.4"],
				["X"],
				["X and some stuff"],
			];
			for (let i = 0; i < strs.length; i++) {
				const slice = new StrSlice(strs[i]!, 1);
				const result = slice
					.edgeSplitOrdered(matches)
					.map(s => s.value) as string[];
				expect(result).toEqual(results[i]);
			}
		});
		it("handles spaces at start ignoring empty entry: ['.', '_', '^']: 9 permutations", () => {
			const strs = [
				"     .2.6_4.3^3.4",
				"     _4.3^3.4",
				"     .2.6^3.4",
				"     .2.6_4.3",
				"     .2.6",
				"     _4.3",
				"     ^3.4",
				"     X",
				"     X and some stuff",
				"     ",
			];
			const results = [
				[".2.6", "_4.3", "^3.4"],
				["_4.3", "^3.4"],
				[".2.6", "^3.4"],
				[".2.6", "_4.3"],
				[".2.6"],
				["_4.3"],
				["^3.4"],
				["X"],
				["X and some stuff"],
				[""],
			];

			for (let i = 0; i < strs.length; i++) {
				const slice = new StrSlice(strs[i]!, 1);
				const result = slice
					.edgeSplitOrdered(matches)
					.map(s => s.value) as string[];
				expect(result).toEqual(results[i]);
			}
		});

		it("handles empty string: ['.', '_', '^']: 1 permutation", () => {
			const slice = new StrSlice("");
			const result = slice
				.edgeSplitOrdered(matches)
				.map(s => s.value);
			expect(result).toEqual([""]);
		});

		it("handles string of spaces: ['.', '_', '^']: 1 permutation", () => {
			const slice = new StrSlice("      ");
			const result = slice
				.edgeSplitOrdered(matches)
				.map(s => s.value);
			expect(result).toEqual([""]);
		});

		it("handles slice in middle of str: ['.', '_', '^']: 9 permutations", () => {
			const strs = [
				".999.2.6_4.3^3.4^999",
				"_999_4.3^3.4^999",
				".999.2.6^3.4^999",
				".999.2.6_4.3^999",
				".999.2.6_999",
				"_999_4.3^999",
				"^999^3.4^999",
				".999X_999",
				".999X and some stuff_999",
			];
			const strsShouldBe = [
				".2.6_4.3^3.4",
				"_4.3^3.4",
				".2.6^3.4",
				".2.6_4.3",
				".2.6",
				"_4.3",
				"^3.4",
				"X",
				"X and some stuff",
			];
			const results = [
				[".2.6", "_4.3", "^3.4"],
				["_4.3", "^3.4"],
				[".2.6", "^3.4"],
				[".2.6", "_4.3"],
				[".2.6"],
				["_4.3"],
				["^3.4"],
				["X"],
				["X and some stuff"],
				[""],
			];

			for (let i = 0; i < strs.length; i++) {
				const slice = new StrSlice(strs[i]!, 4, -4);
				expect(slice.value).toBe(strsShouldBe[i]);
				const result = slice
					.edgeSplitOrdered(matches)
					.map(s => s.value) as string[];
				expect(result).toEqual(results[i]);
			}
		});
	});
});
