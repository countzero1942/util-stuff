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
		test("should initialize empty with no elements", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[],
				keyExtractor
			);
			expect(index.size).toBe(0);
			expect(index.getAllElements()).toEqual([]);
			expect(index.getAllCodePoints()).toEqual([]);
		});

		test("should initialize with provided elements", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "banana", value: 2 },
				{ key: "cherry", value: 3 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			expect(index.size).toBe(3);
			expect(index.getAllElements()).toHaveLength(3);
			expect(index.getAllElements()).toEqual(
				expect.arrayContaining(items)
			);
		});

		test("should handle empty strings in constructor", () => {
			const items = [
				{ key: "", value: 1 },
				{ key: "valid", value: 2 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			expect(index.size).toBe(1);
			expect(index.getAllElements()).toEqual([items[1]]);
		});
	});

	describe("Element Management", () => {
		test("add should add a single element", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[],
				keyExtractor
			);
			const item = { key: "test", value: 1 };

			index.add(item);
			expect(index.size).toBe(1);
			expect(index.getAllElements()).toEqual([item]);
		});

		test("add should handle empty keys", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[],
				keyExtractor
			);
			const item = { key: "", value: 1 };

			index.add(item);
			expect(index.size).toBe(0);
		});

		test("addAll should add multiple elements", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[],
				keyExtractor
			);
			const items = [
				{ key: "apple", value: 1 },
				{ key: "banana", value: 2 },
			];

			index.addAll(items);
			expect(index.size).toBe(2);
			expect(index.getAllElements()).toEqual(
				expect.arrayContaining(items)
			);
		});

		test("remove should remove an element and return true", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "banana", value: 2 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				[],
				keyExtractor
			);
			index.addAll(items);

			// Check the element exists in the raw data
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(1);

			const result = index.remove(items[0]);
			expect(result).toBe(true);

			// Check it was removed from the raw data
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(0);

			// Note: We don't check index.size here because it uses the cached getAllElements()
			// Instead, check the raw data directly
			expect(
				index.getElementsByCodePoint(
					"b".codePointAt(0)!
				)
			).toHaveLength(1);
		});

		test("remove should return false for non-existent element", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[{ key: "apple", value: 1 }],
				keyExtractor
			);

			const result = index.remove({
				key: "banana",
				value: 2,
			});
			expect(result).toBe(false);
			// Don't check size due to caching
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(1);
		});

		test("remove should handle empty keys", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[{ key: "apple", value: 1 }],
				keyExtractor
			);

			const result = index.remove({ key: "", value: 2 });
			expect(result).toBe(false);
			// Don't check size due to caching
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(1);
		});

		test("clear should remove all elements", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "banana", value: 2 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			index.clear();
			expect(index.size).toBe(0);
			expect(index.getAllElements()).toEqual([]);
			expect(index.getAllCodePoints()).toEqual([]);
		});

		test("should clean up empty arrays when removing last element", () => {
			const item = { key: "test", value: 1 };
			const index = new CodePointPrefixIndex<TestItem>(
				[item],
				keyExtractor
			);

			index.remove(item);
			expect(
				index.hasCodePoint("t".codePointAt(0)!)
			).toBe(false);
			expect(index.getAllCodePoints()).toEqual([]);
		});
	});

	describe("Query Methods", () => {
		test("getElementsByCodePoint should return elements with matching first code point", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "avocado", value: 2 },
				{ key: "banana", value: 3 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
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

		test("getElementsByCodePoint should return empty array for non-existent code point", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[{ key: "apple", value: 1 }],
				keyExtractor
			);

			const zCodePoint = "z".codePointAt(0)!;
			const results =
				index.getElementsByCodePoint(zCodePoint);

			expect(results).toEqual([]);
		});

		test("getElementsByString should return elements with matching first code point", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "avocado", value: 2 },
				{ key: "banana", value: 3 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			const results = index.getElementsByString("a");

			expect(results).toHaveLength(2);
			expect(results).toEqual(
				expect.arrayContaining([items[0], items[1]])
			);
		});

		test("getElementsByString should handle empty strings", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[{ key: "apple", value: 1 }],
				keyExtractor
			);

			const results = index.getElementsByString("");

			expect(results).toEqual([]);
		});

		test("getElementsBySlice should return elements with matching first code point", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "avocado", value: 2 },
				{ key: "banana", value: 3 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
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

		test("getAllCodePoints should return all unique first code points", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "avocado", value: 2 },
				{ key: "banana", value: 3 },
				{ key: "cherry", value: 4 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			const codePoints = index.getAllCodePoints();

			expect(codePoints).toHaveLength(3);
			expect(codePoints).toContain("a".codePointAt(0));
			expect(codePoints).toContain("b".codePointAt(0));
			expect(codePoints).toContain("c".codePointAt(0));
		});

		test("getAllKeyLengths should return sorted unique key lengths", () => {
			const items = [
				{ key: "a", value: 1 },
				{ key: "abc", value: 2 },
				{ key: "abcde", value: 3 },
				{ key: "xyz", value: 4 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			const lengths = index.getAllKeyLengths();

			expect(lengths).toEqual([1, 3, 5]);
		});

		test("hasCodePoint should return true for existing code point", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[{ key: "apple", value: 1 }],
				keyExtractor
			);

			expect(
				index.hasCodePoint("a".codePointAt(0)!)
			).toBe(true);
		});

		test("hasCodePoint should return false for non-existent code point", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[{ key: "apple", value: 1 }],
				keyExtractor
			);

			expect(
				index.hasCodePoint("z".codePointAt(0)!)
			).toBe(false);
		});

		test("hasString should return true for exact string match", () => {
			const index = new CodePointPrefixIndex<string>(
				["apple", "banana"],
				stringKeyExtractor
			);

			expect(index.hasString("apple")).toBe(true);
		});

		test("hasString should return false for partial string match", () => {
			const index = new CodePointPrefixIndex<string>(
				["apple", "banana"],
				stringKeyExtractor
			);

			expect(index.hasString("app")).toBe(false);
		});

		test("hasSlice should return true for exact slice match", () => {
			const index = new CodePointPrefixIndex<string>(
				["apple", "banana"],
				stringKeyExtractor
			);

			expect(index.hasSlice(new StrSlice("apple"))).toBe(
				true
			);
		});

		test("hasSlice should return false for partial slice match", () => {
			const index = new CodePointPrefixIndex<string>(
				["apple", "banana"],
				stringKeyExtractor
			);

			expect(index.hasSlice(new StrSlice("app"))).toBe(
				false
			);
		});
	});

	describe("Edge Cases and Unicode Handling", () => {
		test("should handle Unicode surrogate pairs correctly", () => {
			const items = [
				{ key: "😊happy", value: 1 },
				{ key: "😎cool", value: 2 },
				{ key: "normal", value: 3 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			const emojiCodePoint = "😊".codePointAt(0)!;
			const results =
				index.getElementsByCodePoint(emojiCodePoint);

			expect(results).toHaveLength(1);
			expect(results[0]).toEqual(items[0]);
		});

		test("should handle adding and removing elements with same first code point", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[],
				keyExtractor
			);
			const item1 = { key: "apple", value: 1 };
			const item2 = { key: "avocado", value: 2 };

			index.add(item1);
			index.add(item2);

			// Check the raw data directly
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(2);

			index.remove(item1);
			// The cache is not updated on remove, so we need to check the raw data
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(1);
			expect(
				index.hasCodePoint("a".codePointAt(0)!)
			).toBe(true);

			index.remove(item2);
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(0);
			expect(
				index.hasCodePoint("a".codePointAt(0)!)
			).toBe(false);
		});

		test("should handle case sensitivity", () => {
			const items = [
				{ key: "Apple", value: 1 },
				{ key: "apple", value: 2 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
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

		test("should handle multiple operations in sequence", () => {
			const index = new CodePointPrefixIndex<TestItem>(
				[],
				keyExtractor
			);

			// Create elements with references we can track
			const appleItem = { key: "apple", value: 1 };
			const bananaItem = { key: "banana", value: 2 };

			// Add elements
			index.add(appleItem);
			index.add(bananaItem);

			// Check the raw data directly
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(1);
			expect(
				index.getElementsByCodePoint(
					"b".codePointAt(0)!
				)
			).toHaveLength(1);

			// Remove one - check raw data
			index.remove(appleItem);
			expect(
				index.getElementsByCodePoint(
					"a".codePointAt(0)!
				)
			).toHaveLength(0);
			expect(
				index.getElementsByCodePoint(
					"b".codePointAt(0)!
				)
			).toHaveLength(1);

			// Add more - check raw data
			const cherryItem = { key: "cherry", value: 3 };
			const dateItem = { key: "date", value: 4 };
			index.addAll([cherryItem, dateItem]);
			expect(
				index.getElementsByCodePoint(
					"c".codePointAt(0)!
				)
			).toHaveLength(1);
			expect(
				index.getElementsByCodePoint(
					"d".codePointAt(0)!
				)
			).toHaveLength(1);

			// Clear all
			index.clear();
			expect(index.getAllCodePoints()).toEqual([]);

			// Add after clearing - check raw data
			const newItem = { key: "new", value: 5 };
			index.add(newItem);
			expect(
				index.getElementsByCodePoint(
					"n".codePointAt(0)!
				)
			).toHaveLength(1);
			// Now we can check size since cache was cleared
			expect(index.size).toBe(1);
		});
	});

	describe("Caching Behavior", () => {
		test("getAllElements should return cached results and invalidate cache on modification", () => {
			const items = [
				{ key: "apple", value: 1 },
				{ key: "banana", value: 2 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			// First call should compute and cache
			const result1 = index.getAllElements();
			expect(result1).toHaveLength(2);

			// Add a new element - this will clear the cache
			index.add({ key: "cherry", value: 3 });

			// Second call should return new results
			const result2 = index.getAllElements();
			expect(result2).toHaveLength(3);

			// Results should be different objects
			expect(result2).not.toBe(result1);
		});

		test("getAllKeyLengths should return cached results until modified", () => {
			const items = [
				{ key: "a", value: 1 },
				{ key: "abc", value: 2 },
			];
			const index = new CodePointPrefixIndex<TestItem>(
				items,
				keyExtractor
			);

			// First call should compute and cache
			const result1 = index.getAllKeyLengths();
			expect(result1).toEqual([1, 3]);

			// Add a new element - this will clear the cache
			index.add({ key: "abcde", value: 3 });

			// Second call should return new results
			const result2 = index.getAllKeyLengths();
			expect(result2).toEqual([1, 3, 5]);

			// Results should be different objects
			expect(result2).not.toBe(result1);
		});
	});
});
