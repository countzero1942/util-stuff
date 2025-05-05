import { MatchCodePointAny, MatchRepeat } from "@/trex";
import {
	MatchCodePoint,
	MatchCodePointSet,
	MatchCodePointCategories,
} from "@/trex";
import { MutMatchNav } from "@/trex";

describe("MatchCodePointAny", () => {
	describe("constructor", () => {
		it("creates a matcher with the specified matchers", () => {
			const matcher = MatchCodePointAny.from(
				MatchCodePoint.fromString("a"),
				MatchCodePointSet.fromString("ab"),
				MatchCodePointCategories.fromString("Lu")
			);
		});
	});

	describe("matchCodePoint", () => {
		it("matches with single MatchCodePoint", () => {
			const matcher = MatchCodePointAny.from(
				MatchCodePoint.fromString("a")
			);
			expect(
				matcher.matchCodePoint("a".codePointAt(0)!)
			).toBe(true);
			expect(
				matcher.matchCodePoint("b".codePointAt(0)!)
			).toBe(false);
		});

		it("matches with multiple MatchCodePointBase instances", () => {
			const set = MatchCodePointSet.fromString("ab");
			const cat =
				MatchCodePointCategories.fromString("Lu");
			const matcher = MatchCodePointAny.from(
				MatchCodePoint.fromString("c"),
				set,
				cat
			);
			expect(
				matcher.matchCodePoint("a".codePointAt(0)!)
			).toBe(true); // in set
			expect(
				matcher.matchCodePoint("b".codePointAt(0)!)
			).toBe(true); // in set
			expect(
				matcher.matchCodePoint("c".codePointAt(0)!)
			).toBe(true); // direct
			// Use an uppercase letter for category
			expect(
				matcher.matchCodePoint("D".codePointAt(0)!)
			).toBe(true);
			expect(
				matcher.matchCodePoint("z".codePointAt(0)!)
			).toBe(false);
		});

		it("returns false if no matchers match", () => {
			const matcher = MatchCodePointAny.from(
				MatchCodePoint.fromString("x"),
				MatchCodePointSet.fromString("y")
			);
			expect(
				matcher.matchCodePoint("a".codePointAt(0)!)
			).toBe(false);
		});

		it("is immutable to external mutation", () => {
			const arr = [MatchCodePoint.fromString("a")];
			const matcher = MatchCodePointAny.from(...arr);
			arr[0] = MatchCodePoint.fromString("b");
			expect(
				matcher.matchCodePoint("a".codePointAt(0)!)
			).toBe(true);
			expect(
				matcher.matchCodePoint("b".codePointAt(0)!)
			).toBe(false);
		});
	});

	describe("matches with match(nav)", () => {
		it("matches with single MatchCodePoint", () => {
			const matcher = MatchCodePointAny.from(
				MatchCodePoint.fromString("a")
			);
			const nav = MutMatchNav.fromString("abc");
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(1);
			expect(result?.navIndex).toBe(1);
			expect(result?.captureMatch.value).toBe("a");
		});

		it("matches with multiple matchers", () => {
			const matcher = MatchCodePointAny.from(
				MatchCodePoint.fromString("a"),
				MatchCodePointSet.fromString("ab"),
				MatchCodePointCategories.fromString("Lu")
			);
			const nav = MutMatchNav.fromString("aBz");

			const result1 = matcher.match(nav);
			expect(result1).not.toBeNull();
			expect(result1?.captureIndex).toBe(1);
			expect(result1?.navIndex).toBe(1);
			expect(result1?.captureMatch.value).toBe("a");

			if (!result1) {
				throw new Error("Unexpected null result");
			}
			const result2 = matcher.match(result1);
			expect(result2).not.toBeNull();
			expect(result2?.captureIndex).toBe(2);
			expect(result2?.navIndex).toBe(2);
			expect(result2?.captureMatch.value).toBe("aB");

			if (!result2) {
				throw new Error("Unexpected null result");
			}
			const result3 = matcher.match(result2);
			expect(result3).toBeNull();
		});

		it("matches on the last matcher with repeat", () => {
			const matcher = MatchRepeat.from(
				MatchCodePointAny.from(
					MatchCodePoint.fromString("x"),
					MatchCodePointSet.fromString("y"),
					MatchCodePointCategories.fromString("Nd")
				)
			);
			const nav = MutMatchNav.fromString("123");
			const result = matcher.match(nav);
			expect(result).not.toBeNull();
			expect(result?.captureIndex).toBe(3);
			expect(result?.navIndex).toBe(3);
			expect(result?.captureMatch.value).toBe("123");
		});

		it("returns null if no matchers match", () => {
			const matcher = MatchCodePointAny.from(
				MatchCodePoint.fromString("x"),
				MatchCodePointSet.fromString("y"),
				MatchCodePointCategories.fromString("Nd")
			);
			const nav = MutMatchNav.fromString("abc");
			const result = matcher.match(nav);
			expect(result).toBeNull();
		});
	});
});
