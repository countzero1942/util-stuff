import { CodePointPrefixIndex } from "../../../lib/trex/prefix-index";
import { StrSlice } from "../../../lib/utils/slice";

describe("CodePointPrefixIndex", () => {
	// Type definitions for our tests
	type TestItem = {
		key: string;
		value: number;
	};

	// Helper function to create a key extractor
	const keyExtractor = (item: TestItem) => item.key;
	const stringKeyExtractor = (str: string) => str;

	describe("Constructor and Basic Properties", () => {
		test("initializes empty with no elements", () => {
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					[],
					keyExtractor
				);
			expect(index.size).toBe(0);
			expect(index.getAllElements()).toEqual([]);
			expect(index.getAllCodePoints()).toEqual([]);
		});

		test("initializes with provided elements", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "banana", value: 2 },
				{ key: "cherry", value: 3 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			expect(index.size).toBe(3);
			expect(index.getAllElements()).toHaveLength(3);
			expect(index.getAllElements()).toEqual(
				expect.arrayContaining(items)
			);
		});

		test("handles empty strings in constructor", () => {
			const items = [
				{ key: "", value: 1 },
				{ key: "valid", value: 2 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			expect(index.size).toBe(1);
			expect(index.getAllElements()).toEqual([items[1]]);
		});
	});

	describe("Query Methods TElement (TestItem)", () => {
		test("getElementsByCodePoint: returns elements with matching first code point", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "avocado", value: 2 },
				{ key: "banana", value: 3 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			const aCodePoint = "a".codePointAt(0)!;
			const results =
				index.getElementsByCodePoint(aCodePoint);

			expect(results).toHaveLength(2);
			expect(results).toEqual(
				expect.arrayContaining([items[0], items[1]])
			);
		});

		test("getElementsByCodePoint: returns empty array for non-existent code point", () => {
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					[{ key: "apple", value: 1 }],
					keyExtractor
				);

			const zCodePoint = "z".codePointAt(0)!;
			const results =
				index.getElementsByCodePoint(zCodePoint);

			expect(results).toEqual([]);
		});

		test("getElementsByString: returns elements with matching first code point", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "avocado", value: 2 },
				{ key: "banana", value: 3 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			const results = index.getElementsByString("a");

			expect(results).toHaveLength(2);
			expect(results).toEqual(
				expect.arrayContaining([items[0], items[1]])
			);
		});

		test("getElementsByString: handles empty strings", () => {
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					[{ key: "apple", value: 1 }],
					keyExtractor
				);

			const results = index.getElementsByString("");

			expect(results).toEqual([]);
		});

		test("getElementsBySlice: returns elements with matching first code point", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "avocado", value: 2 },
				{ key: "banana", value: 3 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			const slice = new StrSlice("a");
			const results = index.getElementsBySlice(slice);

			expect(results).toHaveLength(2);
			expect(results).toEqual(
				expect.arrayContaining([items[0], items[1]])
			);
		});

		test("getElementsBySlice: handles empty slice", () => {
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					[{ key: "apple", value: 1 }],
					keyExtractor
				);

			const results = index.getElementsBySlice(
				new StrSlice("")
			);

			expect(results).toEqual([]);
		});

		test("getAllCodePoints: returns all unique first code points", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "avocado", value: 2 },
				{ key: "banana", value: 3 },
				{ key: "cherry", value: 4 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			const codePoints = index.getAllCodePoints();

			expect(codePoints).toHaveLength(3);
			expect(codePoints).toContain("a".codePointAt(0));
			expect(codePoints).toContain("b".codePointAt(0));
			expect(codePoints).toContain("c".codePointAt(0));
		});

		test("getAllKeyLengths: returns sorted unique key lengths", () => {
			const items = [
				{ key: "a", value: 1 },
				{ key: "abc", value: 2 },
				{ key: "abcde", value: 3 },
				{ key: "xyz", value: 4 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			const lengths = index.getAllKeyLengths();

			expect(lengths).toEqual([1, 3, 5]);
		});

		test("hasCodePoint: returns true for existing code point", () => {
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					[{ key: "apple", value: 1 }],
					keyExtractor
				);

			expect(
				index.hasCodePoint("a".codePointAt(0)!)
			).toBe(true);
		});

		test("hasCodePoint: returns false for non-existent code point", () => {
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					[{ key: "apple", value: 1 }],
					keyExtractor
				);

			expect(
				index.hasCodePoint("z".codePointAt(0)!)
			).toBe(false);
		});
	});

	describe("Query Methods string", () => {
		test("hasString: returns true for exact string match", () => {
			const index = CodePointPrefixIndex.fromStrings([
				"apple",
				"banana",
			]);

			expect(index.hasString("apple")).toBe(true);
		});

		test("hasString: returns false for partial string match", () => {
			const index = CodePointPrefixIndex.fromStrings([
				"apple",
				"banana",
			]);

			expect(index.hasString("app")).toBe(false);
		});

		test("hasSlice: returns true for exact slice match", () => {
			const index = CodePointPrefixIndex.fromStrings([
				"apple",
				"banana",
			]);

			expect(index.hasSlice(new StrSlice("apple"))).toBe(
				true
			);
		});

		test("hasSlice: returns false for partial slice match", () => {
			const index = CodePointPrefixIndex.fromStrings([
				"apple",
				"banana",
			]);

			expect(index.hasSlice(new StrSlice("app"))).toBe(
				false
			);
		});
	});

	describe("Edge Cases and Unicode Handling", () => {
		test("handles Unicode surrogate pairs correctly", () => {
			const items = [
				{ key: "😊happy", value: 1 },
				{ key: "😎cool", value: 2 },
				{ key: "normal", value: 3 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			const emojiCodePoint = "😊".codePointAt(0)!;
			const results =
				index.getElementsByCodePoint(emojiCodePoint);

			expect(results).toHaveLength(1);
			expect(results[0]).toEqual(items[0]);
		});

		test("handles case sensitivity", () => {
			const items = [
				{ key: "Apple", value: 1 },
				{ key: "apple", value: 2 },
			];
			const index =
				CodePointPrefixIndex.fromElements<TestItem>(
					items,
					keyExtractor
				);

			const upperACodePoint = "A".codePointAt(0)!;
			const lowerACodePoint = "a".codePointAt(0)!;

			expect(upperACodePoint).not.toBe(lowerACodePoint);
			expect(
				index.getElementsByCodePoint(upperACodePoint)
			).toHaveLength(1);
			expect(
				index.getElementsByCodePoint(lowerACodePoint)
			).toHaveLength(1);
		});

		describe("Caching Behavior", () => {
			test("caches getAllKeyLengths: returns sorted unique key lengths", () => {
				const items = [
					{ key: "a", value: 1 },
					{ key: "abc", value: 2 },
				];
				const index =
					CodePointPrefixIndex.fromElements<TestItem>(
						items,
						keyExtractor
					);

				// @ts-ignore
				index._allKeyLengths = undefined;

				const result1 = index.getAllKeyLengths();
				expect(result1).toEqual([1, 3]);

				// @ts-ignore
				expect(index._allKeyLengths).toEqual([1, 3]);

				const result2 = index.getAllKeyLengths();
				expect(result2).toEqual([1, 3]);

				expect(result1).toBe(result2);
			});

			test("caches size: returns number of elements", () => {
				const items = [
					{ key: "a", value: 1 },
					{ key: "abc", value: 2 },
				];
				const index =
					CodePointPrefixIndex.fromElements<TestItem>(
						items,
						keyExtractor
					);

				// @ts-ignore
				index._size = undefined;

				const result1 = index.size;
				expect(result1).toBe(2);

				// @ts-ignore
				expect(index._size).toBe(2);

				const result2 = index.size;
				expect(result2).toBe(2);
			});
		});
	});
});
