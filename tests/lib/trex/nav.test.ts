import { MatchNav } from "@/trex";
import { StrSlice } from "@/utils/slice";

// Local helper to strip ANSI color codes from strings produced by chalk or similar
// This keeps tests robust regardless of whether coloring is enabled.
const stripAnsi = (s: string): string =>
	s.replace(/\u001B\[[0-9;]*m/g, "");

describe("MutMatchNav", () => {
	// Helper function to create a nav with a given source text
	// const createNav = (source: string, start = 0) => {
	// 	return new MutMatchNav(new StrSlice(source), start);
	// };

	describe("Constructor and Basic Properties", () => {
		test("initializes with correct indices", () => {
			const nav = MatchNav.fromString("test string", 2);
			expect(nav.startIndex).toBe(2);
			expect(nav.captureIndex).toBe(2);
			expect(nav.isInvalidated).toBe(false);
		});

		test("initializes with StrSlice", () => {
			{
				const nav = MatchNav.fromNew(StrSlice.from("test string"));
				expect(nav.startIndex).toBe(0);
				expect(nav.captureIndex).toBe(0);
				expect(nav.isInvalidated).toBe(false);
			}
			{
				const nav = MatchNav.fromNew(StrSlice.from("test string"), 2);
				expect(nav.startIndex).toBe(2);
				expect(nav.captureIndex).toBe(2);
				expect(nav.isInvalidated).toBe(false);
			}
		});

		test("has zero capture length initially", () => {
			const nav = MatchNav.fromString("test string");
			expect(nav.captureLength).toBe(0);
		});

		test("correctly identifies start and end positions", () => {
			const nav = MatchNav.fromString("test");
			expect(nav.isCaptureIndexAtSourceStart).toBe(true);
			expect(nav.isCaptureIndexAtSourceEnd).toBe(false);

			const endNav = MatchNav.fromString("test", 4);
			expect(endNav.isCaptureIndexAtSourceStart).toBe(false);
			expect(endNav.isCaptureIndexAtSourceEnd).toBe(true);
		});

		test("handles empty match", () => {
			const nav = MatchNav.fromString("test");
			expect(nav.isEmptyMatch).toBe(true);
		});

		test("throws if start index is beyond end of source", () => {
			expect(() => MatchNav.fromString("test", 5)).toThrow(
				"MutMatchNav: startIndex cannot be beyond end of source"
			);
		});

		test("throws if start index is negative", () => {
			expect(() => MatchNav.fromString("test", -1)).toThrow(
				"MutMatchNav: startIndex cannot be negative"
			);
		});
	});

	describe("Movement Capture Operations", () => {
		test("moveCaptureForwardOneCodePoint advances by one code point", () => {
			const nav = MatchNav.fromString("test");
			nav.moveCaptureForwardOneCodePoint();
			expect(nav.captureIndex).toBe(1);
			expect(nav.captureLength).toBe(1);
			expect(nav.captureMatch.value).toBe("t");

			// Test with emoji (surrogate pair)
			const emojiNav = MatchNav.fromString("😊test");
			emojiNav.moveCaptureForwardOneCodePoint();
			expect(emojiNav.captureIndex).toBe(2); // Emoji takes 2 UTF-16 code units
			expect(emojiNav.captureLength).toBe(2);
			expect(emojiNav.captureMatch.value).toBe("😊");
		});

		test("throws if moveCaptureForwardOneCodePoint goes beyond end of source", () => {
			const nav = MatchNav.fromString("test", 3);
			expect(() => nav.moveCaptureForwardOneCodePoint()).not.toThrow();
			expect(() => nav.moveCaptureForwardOneCodePoint()).toThrow();

			const emojiNav = MatchNav.fromString("ab😊", 2);
			expect(() =>
				emojiNav.moveCaptureForwardOneCodePoint()
			).not.toThrow();
			expect(() => emojiNav.moveCaptureForwardOneCodePoint()).toThrow();
		});

		test("moveCaptureForward advances by specified length", () => {
			const nav = MatchNav.fromString("test string");
			nav.moveCaptureForward(4);
			expect(nav.captureIndex).toBe(4);
			expect(nav.captureLength).toBe(4);
			expect(nav.captureMatch.value).toBe("test");
		});

		test("throws if moveCaptureForward goes beyond end of source", () => {
			const nav = MatchNav.fromString("test", 4);
			expect(() => nav.moveCaptureForward(1)).toThrow();
		});

		test("throws if moveCaptureForward length is negative", () => {
			const nav = MatchNav.fromString("test");
			expect(() => nav.moveCaptureForward(-1)).toThrow();
		});

		test("moveCaptureToEnd moves to the end of source", () => {
			const nav = MatchNav.fromString("test string");
			nav.moveCaptureToSourceEnd();
			expect(nav.captureIndex).toBe(11);
			expect(nav.isCaptureIndexAtSourceEnd).toBe(true);
			expect(nav.captureLength).toBe(11);
			expect(nav.captureMatch.value).toBe("test string");
		});
	});

	describe("Movement Start Operations", () => {
		test("moveStartForwardOneCodePoint advances start by one code point", () => {
			const nav = MatchNav.fromString("test");
			nav.moveNextOneCodePoint();
			expect(nav.startIndex).toBe(1);
			expect(nav.captureIndex).toBe(1);
			expect(nav.captureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");

			// Test with emoji (surrogate pair)
			const emojiNav = MatchNav.fromString("😊test");
			emojiNav.moveNextOneCodePoint();
			expect(emojiNav.startIndex).toBe(2); // Emoji takes 2 UTF-16 code units
			expect(emojiNav.captureIndex).toBe(2);
			expect(emojiNav.captureLength).toBe(0);
			expect(emojiNav.captureMatch.value).toBe("");
		});

		test("throws if moveStartForwardOneCodePoint goes beyond end of source", () => {
			const nav = MatchNav.fromString("test", 3);
			expect(() => nav.moveNextOneCodePoint()).not.toThrow();
			expect(() => nav.moveNextOneCodePoint()).toThrow();

			const emojiNav = MatchNav.fromString("abc😊", 3);
			expect(() => emojiNav.moveNextOneCodePoint()).not.toThrow();
			expect(() => emojiNav.moveNextOneCodePoint()).toThrow();
		});

		test("moveStartToEnd moves start, nav, and capture indices to end", () => {
			const nav = MatchNav.fromString("test string");
			nav.moveNextToSourceEnd();
			expect(nav.startIndex).toBe(nav.source.length);
			expect(nav.captureIndex).toBe(nav.source.length);
			expect(nav.captureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");
		});

		test("moveStartToNav moves start, nav, and capture indices to nav", () => {
			const nav = MatchNav.fromString("test string");
			nav.moveCaptureForward(5);
			nav.moveNext();
			expect(nav.startIndex).toBe(5);
			expect(nav.captureIndex).toBe(5);
			expect(nav.captureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");
			expect(nav.peekAheadCodePoint()).toBe("s".codePointAt(0));
		});
	});

	describe("Copy and State Management", () => {
		test("copy creates a deep copy with same state", () => {
			const nav = MatchNav.fromString("abcdef");
			//                                  012345678901234567890
			nav.moveCaptureForward(3);

			const copy = nav.copy();
			expect(copy.startIndex).toBe(nav.startIndex);
			expect(copy.captureIndex).toBe(nav.captureIndex);
			expect(copy.captureMatch.value).toBe(nav.captureMatch.value);

			// Modifying copy should not affect original
			copy.moveNext();
			copy.moveCaptureForward(3);
			expect(nav.startIndex).toBe(0);
			expect(nav.captureIndex).toBe(3);
			expect(copy.startIndex).toBe(3);
			expect(copy.captureIndex).toBe(6);
			expect(nav.captureMatch.value).toBe("abc");
			expect(copy.captureMatch.value).toBe("def");
		});

		test("copyAndMoveNext creates a fresh nav at current position", () => {
			const nav = MatchNav.fromString("test string");
			nav.moveCaptureForward(4);

			const newNav = nav.copyAndMoveNext();
			expect(newNav.startIndex).toBe(4);
			expect(newNav.captureIndex).toBe(4);
			expect(newNav.captureLength).toBe(0);
		});

		test("copy then moveNext creates a fresh nav at current position", () => {
			const nav = MatchNav.fromString("test string");
			nav.moveCaptureForward(4);

			const newNav = nav.copy().moveNext();
			expect(newNav.startIndex).toBe(4);
			expect(newNav.captureIndex).toBe(4);
			expect(newNav.captureLength).toBe(0);
		});

		test("copyAndMoveNext throws when caught in infinite loop", () => {
			const nav = MatchNav.fromString("test string");
			expect(() => nav.copyAndMoveNext()).toThrow(
				"move-next infinite loop error: startIndex equals captureIndex " +
					"so it can never move forward!"
			);
		});

		test("moveNext throws when caught in infinite loop", () => {
			const nav = MatchNav.fromString("test string");
			expect(() => nav.moveNext()).toThrow(
				"move-next infinite loop error: startIndex equals captureIndex " +
					"so it can never move forward!"
			);
		});

		test("invalidate marks nav as invalid and returns null", () => {
			const nav = MatchNav.fromString("test string");
			const result = nav.invalidate();

			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
	});

	describe("Validation Methods", () => {
		test("assertValid throws on invalidated nav", () => {
			const nav = MatchNav.fromString("test");
			nav.invalidate();

			expect(() => nav.assertNavIsValid()).toThrow(
				"Illegal use of invalidated navigator"
			);
		});

		test("assertNew throws if nav has been moved producing a capture", () => {
			const nav = MatchNav.fromString("test");
			nav.moveCaptureForward(1);

			expect(() => nav.assertNavIsNew()).toThrow(
				"Navigator is not new: it contains a match"
			);
		});
	});

	describe("Peek Methods", () => {
		test("peekCodePoint returns the current code point", () => {
			const nav = MatchNav.fromString("test");
			const tCodePoint = "t".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(tCodePoint);

			nav.moveCaptureForward(1);
			const eCodePoint = "e".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(eCodePoint);
		});

		test("peekCodePoint handles surrogate pairs", () => {
			const nav = MatchNav.fromString("😊test");
			const emojiCodePoint = "😊".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(emojiCodePoint);
		});

		test("peekBehindCodePoint returns the previous code point", () => {
			const nav = MatchNav.fromString("test", 2);
			const eCodePoint = "e".codePointAt(0);
			expect(nav.peekBehindCodePoint()).toBe(eCodePoint);
		});

		test("peekBehindCodePoint handles surrogate pairs", () => {
			const nav = MatchNav.fromString("😊test", 2);
			const emojiCodePoint = "😊".codePointAt(0);
			expect(nav.peekBehindCodePoint()).toBe(emojiCodePoint);
		});

		test("peekBeforeCodePoint returns undefined at start", () => {
			const nav = MatchNav.fromString("test");
			expect(nav.peekBehindCodePoint()).toBeUndefined();
		});

		describe("peekAfterCodePoint", () => {
			test("returns the next code point", () => {
				const nav = MatchNav.fromString("test");
				nav.moveCaptureForward(1);
				const eCodePoint = "e".codePointAt(0);
				expect(nav.peekAheadCodePoint()).toBe(eCodePoint);
			});

			test("handles surrogate pairs", () => {
				const nav = MatchNav.fromString("t😊est");
				// peekAfterCodePoint returns the code point after the current code point
				// So we need to check what's after 't', which should be the emoji
				nav.moveCaptureForward(1);
				const emojiCodePoint = "😊".codePointAt(0);
				expect(nav.peekAheadCodePoint()).toBe(emojiCodePoint);
			});

			test("handles surrogate pairs", () => {
				const nav = MatchNav.fromString("😊xxx");
				// peekAfterCodePoint returns the code point after the current code point
				// So we need to check what's after 't', which should be the emoji
				const emojiCodePoint = "😊".codePointAt(0);
				expect(nav.peekAheadCodePoint()).toBe(emojiCodePoint);
			});

			test("returns undefined at end", () => {
				const nav = MatchNav.fromString("test", 4);
				expect(nav.peekAheadCodePoint()).toBeUndefined();
			});
		});

		describe("peekBeforeSliceByLength", () => {
			test("returns the correct slice", () => {
				const nav = MatchNav.fromString("test string", 4);
				// peekBeforeSliceByLength returns a slice of the specified length before the current position
				// So for position 4 ("test string") and length 3, we should get "est"
				const slice = nav.peekBehindSliceByLength(3);
				expect(slice?.value).toBe("est");
			});

			test("returns undefined if not enough characters", () => {
				const nav = MatchNav.fromString("test", 2);
				const slice = nav.peekBehindSliceByLength(3);
				expect(slice).toBeUndefined();
			});
		});

		describe("Result Extraction", () => {
			describe("accumulatedMatch", () => {
				test("returns the captured portion", () => {
					const nav = MatchNav.fromString("test string");
					nav.moveCaptureForward(4);
					const match = nav.captureMatch;
					expect(match.value).toBe("test");
				});
			});
		});

		describe("Edge Cases", () => {
			test("handles empty string", () => {
				const nav = MatchNav.fromString("");
				expect(nav.isCaptureIndexAtSourceStart).toBe(true);
				expect(nav.isCaptureIndexAtSourceEnd).toBe(true);
				expect(nav.peekCodePoint()).toBeUndefined();
			});

			test("handles Unicode surrogate pairs correctly", () => {
				// Surrogate pairs are characters that require two UTF-16 code units
				const nav = MatchNav.fromString("😊😎🚀");
				const emoji1CodePoint = "😊".codePointAt(0);
				expect(nav.peekCodePoint()).toBe(emoji1CodePoint);

				nav.moveCaptureForwardOneCodePoint();
				expect(nav.captureIndex).toBe(2);
				const emoji2CodePoint = "😎".codePointAt(0);
				expect(nav.peekCodePoint()).toBe(emoji2CodePoint);

				nav.moveCaptureForwardOneCodePoint();
				expect(nav.captureIndex).toBe(4);
				const emoji3CodePoint = "🚀".codePointAt(0);
				expect(nav.peekCodePoint()).toBe(emoji3CodePoint);
			});
		});

		describe("toString", () => {
			test("returns correct string for initial state", () => {
				const nav = MatchNav.fromString("abcdef", 2);
				expect(nav.captureMatch.value).toBe("");
				expect(stripAnsi(nav.toString())).toBe("Nav: [2..2], ''");
			});

			test("returns correct string after advancing capture and nav", () => {
				const nav = MatchNav.fromString("abcdef");
				nav.moveCaptureForward(3); // navIndex and captureIndex now 3
				expect(nav.captureMatch.value).toBe("abc");
				expect(stripAnsi(nav.toString())).toBe("Nav: [0..3], 'abc'");
			});

			test("returns correct string at end of source", () => {
				const nav = MatchNav.fromString("abc");
				nav.moveCaptureToSourceEnd();
				expect(nav.captureMatch.value).toBe("abc");
				expect(stripAnsi(nav.toString())).toBe("Nav: [0..3], 'abc'");
			});

			test("returns correct string for empty source", () => {
				const nav = MatchNav.fromString("");
				expect(stripAnsi(nav.toString())).toBe("Nav: [0..0], ''");
			});

			test("returns correct string for ghost capture at end", () => {
				const nav = MatchNav.fromString("abc, def");
				nav.moveCaptureForward(3);
				expect(nav.captureMatch.value).toBe("abc");
				expect(stripAnsi(nav.toString())).toBe("Nav: [0..3], 'abc'");
			});

			test("returns correct string for invalidated navigator", () => {
				const nav = MatchNav.fromString("test");
				nav.invalidate();
				expect(stripAnsi(nav.toString())).toBe("Nav: INVALIDATED");
			});
		});
	});
});
