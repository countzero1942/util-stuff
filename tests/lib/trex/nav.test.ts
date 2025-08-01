import { MutMatchNav } from "@/trex";
import { StrSlice } from "@/utils/slice";

describe("MutMatchNav", () => {
	// Helper function to create a nav with a given source text
	// const createNav = (source: string, start = 0) => {
	// 	return new MutMatchNav(new StrSlice(source), start);
	// };

	describe("Constructor and Basic Properties", () => {
		test("initializes with correct indices", () => {
			const nav = MutMatchNav.fromString(
				"test string",
				2
			);
			expect(nav.startIndex).toBe(2);
			expect(nav.navIndex).toBe(2);
			expect(nav.captureIndex).toBe(2);
			expect(nav.isInvalidated).toBe(false);
		});

		test("initializes with StrSlice", () => {
			{
				const nav = MutMatchNav.from(
					StrSlice.from("test string")
				);
				expect(nav.startIndex).toBe(0);
				expect(nav.navIndex).toBe(0);
				expect(nav.captureIndex).toBe(0);
				expect(nav.isInvalidated).toBe(false);
			}
			{
				const nav = MutMatchNav.from(
					StrSlice.from("test string"),
					2
				);
				expect(nav.startIndex).toBe(2);
				expect(nav.navIndex).toBe(2);
				expect(nav.captureIndex).toBe(2);
				expect(nav.isInvalidated).toBe(false);
			}
		});

		test("has zero capture length initially", () => {
			const nav = MutMatchNav.fromString("test string");
			expect(nav.captureLength).toBe(0);
		});

		test("correctly identifies start and end positions", () => {
			const nav = MutMatchNav.fromString("test");
			expect(nav.isNavIndexAtSourceStart).toBe(true);
			expect(nav.isNavIndexAtSourceEnd).toBe(false);

			const endNav = MutMatchNav.fromString("test", 4);
			expect(endNav.isNavIndexAtSourceStart).toBe(false);
			expect(endNav.isNavIndexAtSourceEnd).toBe(true);
		});

		test("handles empty match", () => {
			const nav = MutMatchNav.fromString("test");
			expect(nav.isEmptyMatch).toBe(true);
		});

		test("throws if start index is beyond end of source", () => {
			expect(() =>
				MutMatchNav.fromString("test", 5)
			).toThrow(
				"MutMatchNav: startIndex cannot be beyond end of source"
			);
		});

		test("throws if start index is negative", () => {
			expect(() =>
				MutMatchNav.fromString("test", -1)
			).toThrow(
				"MutMatchNav: startIndex cannot be negative"
			);
		});
	});

	describe("Movement Capture Operations", () => {
		test("moveCaptureForwardOneCodePoint advances by one code point", () => {
			const nav = MutMatchNav.fromString("test");
			nav.moveCaptureForwardOneCodePoint();
			expect(nav.navIndex).toBe(1);
			expect(nav.captureIndex).toBe(1);
			expect(nav.captureLength).toBe(1);
			expect(nav.captureMatch.value).toBe("t");

			// Test with emoji (surrogate pair)
			const emojiNav = MutMatchNav.fromString("😊test");
			emojiNav.moveCaptureForwardOneCodePoint();
			expect(emojiNav.navIndex).toBe(2); // Emoji takes 2 UTF-16 code units
			expect(emojiNav.captureIndex).toBe(2);
			expect(emojiNav.captureLength).toBe(2);
			expect(emojiNav.captureMatch.value).toBe("😊");
		});

		test("throws if moveCaptureForwardOneCodePoint goes beyond end of source", () => {
			const nav = MutMatchNav.fromString("test", 3);
			expect(() =>
				nav.moveCaptureForwardOneCodePoint()
			).not.toThrow();
			expect(() =>
				nav.moveCaptureForwardOneCodePoint()
			).toThrow();

			const emojiNav = MutMatchNav.fromString("ab😊", 2);
			expect(() =>
				emojiNav.moveCaptureForwardOneCodePoint()
			).not.toThrow();
			expect(() =>
				emojiNav.moveCaptureForwardOneCodePoint()
			).toThrow();
		});

		test("moveCaptureForward advances by specified length", () => {
			const nav = MutMatchNav.fromString("test string");
			nav.moveCaptureForward(4);
			expect(nav.navIndex).toBe(4);
			expect(nav.captureIndex).toBe(4);
			expect(nav.captureLength).toBe(4);
			expect(nav.captureMatch.value).toBe("test");
		});

		test("throws if moveCaptureForward goes beyond end of source", () => {
			const nav = MutMatchNav.fromString("test", 4);
			expect(() => nav.moveCaptureForward(1)).toThrow();
		});

		test("moveCaptureToEnd moves to the end of source", () => {
			const nav = MutMatchNav.fromString("test string");
			nav.moveCaptureToSourceEnd();
			expect(nav.navIndex).toBe(11);
			expect(nav.captureIndex).toBe(11);
			expect(nav.isNavIndexAtSourceEnd).toBe(true);
			expect(nav.captureLength).toBe(11);
			expect(nav.captureMatch.value).toBe("test string");
		});
	});

	describe("Movement Start Operations", () => {
		test("moveStartForward advances start, nav and capture indices", () => {
			const nav = MutMatchNav.fromString("test string");
			nav.moveStartIndexForward(4); // Move to position 4 first
			expect(nav.navIndex).toBe(4);
			expect(nav.captureIndex).toBe(4);
			expect(nav.captureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");

			nav.moveStartIndexForward(2); // Move start forward by 2
			expect(nav.startIndex).toBe(6);
			expect(nav.navIndex).toBe(6);
			expect(nav.captureIndex).toBe(6);
			expect(nav.captureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");
		});

		test("throws if moveStartForward goes beyond end of source", () => {
			const nav = MutMatchNav.fromString("test", 4);
			expect(() =>
				nav.moveStartIndexForward(1)
			).toThrow();
		});

		test("moveStartForwardOneCodePoint advances start by one code point", () => {
			const nav = MutMatchNav.fromString("test");
			nav.moveStartIndexForwardOneCodePoint();
			expect(nav.startIndex).toBe(1);
			expect(nav.navIndex).toBe(1);
			expect(nav.captureIndex).toBe(1);
			expect(nav.captureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");

			// Test with emoji (surrogate pair)
			const emojiNav = MutMatchNav.fromString("😊test");
			emojiNav.moveStartIndexForwardOneCodePoint();
			expect(emojiNav.startIndex).toBe(2); // Emoji takes 2 UTF-16 code units
			expect(emojiNav.navIndex).toBe(2);
			expect(emojiNav.captureIndex).toBe(2);
			expect(emojiNav.captureLength).toBe(0);
			expect(emojiNav.captureMatch.value).toBe("");
		});

		test("throws if moveStartForwardOneCodePoint goes beyond end of source", () => {
			const nav = MutMatchNav.fromString("test", 3);
			expect(() =>
				nav.moveStartIndexForwardOneCodePoint()
			).not.toThrow();
			expect(() =>
				nav.moveStartIndexForwardOneCodePoint()
			).toThrow();

			const emojiNav = MutMatchNav.fromString(
				"abc😊",
				3
			);
			expect(() =>
				emojiNav.moveStartIndexForwardOneCodePoint()
			).not.toThrow();
			expect(() =>
				emojiNav.moveStartIndexForwardOneCodePoint()
			).toThrow();
		});

		test("moveStartToEnd moves start, nav, and capture indices to end", () => {
			const nav = MutMatchNav.fromString("test string");
			nav.moveStartIndexToSourceEnd();
			expect(nav.startIndex).toBe(nav.source.length);
			expect(nav.navIndex).toBe(nav.source.length);
			expect(nav.captureIndex).toBe(nav.source.length);
			expect(nav.captureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");
		});

		test("moveStartToNav moves start, nav, and capture indices to nav", () => {
			const nav = MutMatchNav.fromString("test string");
			nav.moveCaptureForward(5);
			nav.moveStartIndexToNavIndex();
			expect(nav.startIndex).toBe(5);
			expect(nav.navIndex).toBe(5);
			expect(nav.captureIndex).toBe(5);
			expect(nav.captureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");
			expect(nav.peekAheadCodePoint()).toBe(
				"s".codePointAt(0)
			);
		});
	});

	describe("Copy and State Management", () => {
		test("copy creates a deep copy with same state", () => {
			const nav =
				MutMatchNav.fromString("abc, def; hij");
			//                     012345678901234567890
			nav.moveCaptureForward(3);

			const copy = nav.copy();
			expect(copy.startIndex).toBe(nav.startIndex);
			expect(copy.navIndex).toBe(nav.navIndex);
			expect(copy.captureIndex).toBe(nav.captureIndex);
			expect(copy.captureMatch.value).toBe(
				nav.captureMatch.value
			);

			// Modifying copy should not affect original
			copy.moveStartIndexForward(5);
			copy.moveCaptureForward(3);
			expect(nav.startIndex).toBe(0);
			expect(nav.captureIndex).toBe(3);
			expect(nav.navIndex).toBe(3);
			expect(copy.startIndex).toBe(5);
			expect(copy.captureIndex).toBe(8);
			expect(copy.navIndex).toBe(8);
			expect(nav.captureMatch.value).toBe("abc");
			expect(copy.captureMatch.value).toBe("def");
		});

		test("copyAndMoveStartToNav creates a fresh nav at current position", () => {
			const nav = MutMatchNav.fromString("test string");
			nav.moveCaptureForward(4);

			const newNav = nav
				.copy()
				.moveStartIndexToNavIndex();
			expect(newNav.startIndex).toBe(4);
			expect(newNav.navIndex).toBe(4);
			expect(newNav.captureIndex).toBe(4);
			expect(newNav.captureLength).toBe(0);
		});

		test("copyAndMoveStartToIndex creates a fresh nav at current position", () => {
			const nav = MutMatchNav.fromString("test string");
			const newNav = nav.copy().moveStartIndexToIndex(5);
			expect(newNav.startIndex).toBe(5);
			expect(newNav.navIndex).toBe(5);
			expect(newNav.captureIndex).toBe(5);
			expect(newNav.captureLength).toBe(0);
			expect(newNav.captureMatch.value).toBe("");
			expect(newNav.peekAheadCodePoint()).toBe(
				"s".codePointAt(0)
			);
		});

		test("throws if copyAndMoveStartToIndex goes beyond end of source", () => {
			const nav = MutMatchNav.fromString("test");
			expect(() =>
				nav.copy().moveStartIndexToIndex(5)
			).toThrow();
		});

		test("invalidate marks nav as invalid and returns null", () => {
			const nav = MutMatchNav.fromString("test string");
			const result = nav.invalidate();

			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
	});

	describe("Validation Methods", () => {
		test("assertValid throws on invalidated nav", () => {
			const nav = MutMatchNav.fromString("test");
			nav.invalidate();

			expect(() => nav.assertNavIsValid()).toThrow(
				"Illegal use of invalidated navigator"
			);
		});

		test("assertNew throws if nav has been moved producing a capture", () => {
			const nav = MutMatchNav.fromString("test");
			nav.moveCaptureForward(1);

			expect(() => nav.assertNavIsNew()).toThrow(
				"Navigator is not new: it contains a match"
			);
		});
	});

	describe("Peek Methods", () => {
		test("peekCodePoint returns the current code point", () => {
			const nav = MutMatchNav.fromString("test");
			const tCodePoint = "t".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(tCodePoint);

			nav.moveCaptureForward(1);
			const eCodePoint = "e".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(eCodePoint);
		});

		test("peekCodePoint handles surrogate pairs", () => {
			const nav = MutMatchNav.fromString("😊test");
			const emojiCodePoint = "😊".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(emojiCodePoint);
		});

		test("peekBehindCodePoint returns the previous code point", () => {
			const nav = MutMatchNav.fromString("test", 2);
			const eCodePoint = "e".codePointAt(0);
			expect(nav.peekBehindCodePoint()).toBe(eCodePoint);
		});

		test("peekBehindCodePoint handles surrogate pairs", () => {
			const nav = MutMatchNav.fromString("😊test", 2);
			const emojiCodePoint = "😊".codePointAt(0);
			expect(nav.peekBehindCodePoint()).toBe(
				emojiCodePoint
			);
		});

		test("peekBeforeCodePoint returns undefined at start", () => {
			const nav = MutMatchNav.fromString("test");
			expect(nav.peekBehindCodePoint()).toBeUndefined();
		});

		describe("peekAfterCodePoint", () => {
			test("returns the next code point", () => {
				const nav = MutMatchNav.fromString("test");
				nav.moveCaptureForward(1);
				const eCodePoint = "e".codePointAt(0);
				expect(nav.peekAheadCodePoint()).toBe(
					eCodePoint
				);
			});

			test("handles surrogate pairs", () => {
				const nav = MutMatchNav.fromString("t😊est");
				// peekAfterCodePoint returns the code point after the current code point
				// So we need to check what's after 't', which should be the emoji
				nav.moveCaptureForward(1);
				const emojiCodePoint = "😊".codePointAt(0);
				expect(nav.peekAheadCodePoint()).toBe(
					emojiCodePoint
				);
			});

			test("handles surrogate pairs", () => {
				const nav = MutMatchNav.fromString("😊xxx");
				// peekAfterCodePoint returns the code point after the current code point
				// So we need to check what's after 't', which should be the emoji
				const emojiCodePoint = "😊".codePointAt(0);
				expect(nav.peekAheadCodePoint()).toBe(
					emojiCodePoint
				);
			});

			test("returns undefined at end", () => {
				const nav = MutMatchNav.fromString("test", 4);
				expect(
					nav.peekAheadCodePoint()
				).toBeUndefined();
			});
		});

		describe("peekBeforeSliceByLength", () => {
			test("returns the correct slice", () => {
				const nav = MutMatchNav.fromString(
					"test string",
					4
				);
				// peekBeforeSliceByLength returns a slice of the specified length before the current position
				// So for position 4 ("test string") and length 3, we should get "est"
				const slice = nav.peekBehindSliceByLength(3);
				expect(slice?.value).toBe("est");
			});

			test("returns undefined if not enough characters", () => {
				const nav = MutMatchNav.fromString("test", 2);
				const slice = nav.peekBehindSliceByLength(3);
				expect(slice).toBeUndefined();
			});
		});

		describe("Result Extraction", () => {
			describe("accumulatedMatch", () => {
				test("returns the captured portion", () => {
					const nav =
						MutMatchNav.fromString("test string");
					nav.moveCaptureForward(4);
					const match = nav.captureMatch;
					expect(match.value).toBe("test");
				});
			});
		});

		describe("Edge Cases", () => {
			test("handles empty string", () => {
				const nav = MutMatchNav.fromString("");
				expect(nav.isNavIndexAtSourceStart).toBe(true);
				expect(nav.isNavIndexAtSourceEnd).toBe(true);
				expect(nav.peekCodePoint()).toBeUndefined();
			});

			test("handles Unicode surrogate pairs correctly", () => {
				// Surrogate pairs are characters that require two UTF-16 code units
				const nav = MutMatchNav.fromString("😊😎🚀");
				const emoji1CodePoint = "😊".codePointAt(0);
				expect(nav.peekCodePoint()).toBe(
					emoji1CodePoint
				);

				nav.moveCaptureForwardOneCodePoint();
				expect(nav.navIndex).toBe(2);
				const emoji2CodePoint = "😎".codePointAt(0);
				expect(nav.peekCodePoint()).toBe(
					emoji2CodePoint
				);

				nav.moveCaptureForwardOneCodePoint();
				expect(nav.navIndex).toBe(4);
				const emoji3CodePoint = "🚀".codePointAt(0);
				expect(nav.peekCodePoint()).toBe(
					emoji3CodePoint
				);
			});
		});

		describe("toString", () => {
			test("returns correct string for initial state", () => {
				const nav = MutMatchNav.fromString("abcdef", 2);
				expect(nav.captureMatch.value).toBe("");
				expect(nav.toString()).toBe(
					"Nav: [2..2..2], length: 6"
				);
			});

			test("returns correct string after advancing capture and nav", () => {
				const nav = MutMatchNav.fromString("abcdef");
				nav.moveCaptureForward(3); // navIndex and captureIndex now 3
				expect(nav.captureMatch.value).toBe("abc");
				expect(nav.toString()).toBe(
					"Nav: [0..3..3], length: 6"
				);
			});

			test("returns correct string after moving capture then start forward", () => {
				const nav = MutMatchNav.fromString("abcdef");
				nav.moveCaptureForward(2);
				nav.moveStartIndexForward(2); // startIndex, navIndex, captureIndex now 4
				expect(nav.captureMatch.value).toBe("");
				expect(nav.toString()).toBe(
					"Nav: [4..4], length: 6"
				);
			});

			test("returns correct string at end of source", () => {
				const nav = MutMatchNav.fromString("abc");
				nav.moveCaptureToSourceEnd();
				expect(nav.captureMatch.value).toBe("abc");
				expect(nav.toString()).toBe(
					"Nav: [0..3], length: 3"
				);
			});

			test("returns correct string for empty source", () => {
				const nav = MutMatchNav.fromString("");
				expect(nav.toString()).toBe(
					"Nav: [0..0], length: 0"
				);
			});

			test("returns correct string for ghost capture at end", () => {
				const nav = MutMatchNav.fromString("abc, def");
				nav.moveCaptureForward(3);
				expect(nav.captureMatch.value).toBe("abc");
				expect(nav.toString()).toBe(
					"Nav: [0..3], length: 8"
				);
			});

			test("returns correct string for invalidated navigator", () => {
				const nav = MutMatchNav.fromString("test");
				nav.invalidate();
				expect(nav.toString()).toBe("Nav: INVALIDATED");
			});
		});
	});
});
