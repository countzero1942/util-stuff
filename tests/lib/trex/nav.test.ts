import { MutMatchNav } from "@/trex";
import { StrSlice } from "@/utils/slice";

describe("MutMatchNav", () => {
	// Helper function to create a nav with a given source text
	const createNav = (source: string, start = 0) => {
		return new MutMatchNav(new StrSlice(source), start);
	};

	describe("Constructor and Basic Properties", () => {
		test("should initialize with correct indices", () => {
			const nav = createNav("test string", 2);
			expect(nav.startIndex).toBe(2);
			expect(nav.navIndex).toBe(2);
			expect(nav.captureIndex).toBe(2);
			expect(nav.isInvalidated).toBe(false);
		});

		test("should have zero capture length initially", () => {
			const nav = createNav("test string");
			expect(nav.captureLength).toBe(0);
			expect(nav.ghostCaptureLength).toBe(0);
		});

		test("should correctly identify start and end positions", () => {
			const nav = createNav("test");
			expect(nav.isStartSlice).toBe(true);
			expect(nav.isEndSlice).toBe(false);

			const endNav = createNav("test", 4);
			expect(endNav.isStartSlice).toBe(false);
			expect(endNav.isEndSlice).toBe(true);
		});
	});

	describe("Movement Operations", () => {
		test("moveCaptureForwardOneCodePoint should advance by one code point", () => {
			const nav = createNav("test");
			nav.moveCaptureForwardOneCodePoint();
			expect(nav.navIndex).toBe(1);
			expect(nav.captureIndex).toBe(1);
			expect(nav.captureLength).toBe(1);
			expect(nav.ghostCaptureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("t");

			// Test with emoji (surrogate pair)
			const emojiNav = createNav("😊test");
			emojiNav.moveCaptureForwardOneCodePoint();
			expect(emojiNav.navIndex).toBe(2); // Emoji takes 2 UTF-16 code units
			expect(emojiNav.captureIndex).toBe(2);
			expect(emojiNav.captureLength).toBe(2);
			expect(emojiNav.ghostCaptureLength).toBe(0);
			expect(emojiNav.captureMatch.value).toBe("😊");
		});

		test("moveCaptureForward should advance by specified length", () => {
			const nav = createNav("test string");
			nav.moveCaptureForward(4);
			expect(nav.navIndex).toBe(4);
			expect(nav.captureIndex).toBe(4);
			expect(nav.captureLength).toBe(4);
			expect(nav.ghostCaptureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("test");
		});

		test("moveCaptureToEnd should move to the end of source", () => {
			const nav = createNav("test string");
			nav.moveCaptureToEnd();
			expect(nav.navIndex).toBe(11);
			expect(nav.captureIndex).toBe(11);
			expect(nav.isEndSlice).toBe(true);
			expect(nav.captureLength).toBe(11);
			expect(nav.ghostCaptureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("test string");
		});

		test("moveStartForward should advance start and reset other indices", () => {
			const nav = createNav("test string");
			nav.moveCaptureForward(4); // Move to position 4 first
			expect(nav.navIndex).toBe(4);
			expect(nav.captureIndex).toBe(4);
			expect(nav.captureLength).toBe(4);
			expect(nav.ghostCaptureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("test");

			nav.moveStartForward(2); // Move start forward by 2
			expect(nav.startIndex).toBe(6);
			expect(nav.navIndex).toBe(6);
			expect(nav.captureIndex).toBe(6);
			expect(nav.captureLength).toBe(0);
			expect(nav.ghostCaptureLength).toBe(0);
			expect(nav.captureMatch.value).toBe("");
		});
	});

	describe("Ghost Capture", () => {
		test("moveGhostCaptureForward should only advance nav index", () => {
			const nav = createNav("abc, def, hij");
			nav.moveCaptureForward(3);
			nav.moveGhostCaptureForward(2);
			expect(nav.navIndex).toBe(5);
			expect(nav.captureIndex).toBe(3);
			expect(nav.ghostCaptureLength).toBe(2);
			expect(nav.captureMatch.value).toBe("abc");
			expect(nav.ghostMatch.trim().value).toBe(",");
		});

		test("moveGhostCaptureForward in action ghost capturing delimiters", () => {
			const nav = createNav("abc, def, hij");
			//                     012345678901234567890
			expect(() => nav.assertFresh()).not.toThrow();
			nav.moveCaptureForward(3);
			nav.moveGhostCaptureForward(2);
			expect(nav.navIndex).toBe(5);
			expect(nav.captureIndex).toBe(3);
			expect(nav.ghostCaptureLength).toBe(2);
			expect(nav.captureMatch.value).toBe("abc");
			expect(nav.ghostMatch.trim().value).toBe(",");
			expect(() => nav.assertFresh()).toThrow();

			nav.moveStartForward(0);
			expect(() => nav.assertFresh()).not.toThrow();
			nav.moveCaptureForward(3);
			nav.moveGhostCaptureForward(2);
			expect(nav.navIndex).toBe(10);
			expect(nav.captureIndex).toBe(8);
			expect(nav.ghostCaptureLength).toBe(2);
			expect(nav.captureMatch.value).toBe("def");
			expect(nav.ghostMatch.trim().value).toBe(",");
			expect(() => nav.assertFresh()).toThrow();
		});
	});

	describe("Copy and State Management", () => {
		test("copy should create a deep copy with same state", () => {
			const nav = createNav("abc, def; hij");
			//                     012345678901234567890
			nav.moveCaptureForward(3);
			nav.moveGhostCaptureForward(2);

			const copy = nav.copy();
			expect(copy.startIndex).toBe(nav.startIndex);
			expect(copy.navIndex).toBe(nav.navIndex);
			expect(copy.captureIndex).toBe(nav.captureIndex);
			expect(copy.ghostCaptureLength).toBe(
				nav.ghostCaptureLength
			);
			expect(copy.captureMatch.value).toBe(
				nav.captureMatch.value
			);
			expect(copy.ghostMatch.value).toBe(
				nav.ghostMatch.value
			);

			// Modifying copy should not affect original
			copy.moveStartForward();
			copy.moveCaptureForward(3);
			copy.moveGhostCaptureForward(2);
			expect(nav.startIndex).toBe(0);
			expect(nav.captureIndex).toBe(3);
			expect(nav.navIndex).toBe(5);
			expect(nav.ghostCaptureLength).toBe(2);
			expect(copy.startIndex).toBe(5);
			expect(copy.captureIndex).toBe(8);
			expect(copy.navIndex).toBe(10);
			expect(copy.ghostCaptureLength).toBe(2);
			expect(nav.captureMatch.value).toBe("abc");
			expect(nav.ghostMatch.value).toBe(", ");
			expect(copy.captureMatch.value).toBe("def");
			expect(copy.ghostMatch.value).toBe("; ");
		});

		test("copyAndMoveStartToNav should create a fresh nav at current position", () => {
			const nav = createNav("test string");
			nav.moveCaptureForward(4);

			const newNav = nav.copyAndMoveStartToNav();
			expect(newNav.startIndex).toBe(4);
			expect(newNav.navIndex).toBe(4);
			expect(newNav.captureIndex).toBe(4);
			expect(newNav.captureLength).toBe(0);
		});

		test("invalidate should mark nav as invalid and return null", () => {
			const nav = createNav("test string");
			const result = nav.invalidate();

			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
	});

	describe("Validation Methods", () => {
		test("assertValid should throw on invalidated nav", () => {
			const nav = createNav("test");
			nav.invalidate();

			expect(() => nav.assertValid()).toThrow(
				"Illegal use of invalidated Nav"
			);
		});

		test("assertValid should throw on ghost capture at end", () => {
			const nav = createNav("test");
			nav.moveGhostCaptureForward(2);

			expect(() => nav.assertValid()).toThrow(
				"Nav has ghost capture at end"
			);
		});

		test("assertFresh should throw if nav has been moved producing a capture", () => {
			const nav = createNav("test");
			nav.moveCaptureForward(1);

			expect(() => nav.assertFresh()).toThrow(
				"Nav is not fresh"
			);
		});

		test("assertFresh should throw if nav has been moved producing a ghost capture", () => {
			const nav = createNav("test");
			nav.moveGhostCaptureForward(1);

			expect(() => nav.assertFresh()).toThrow(
				"Nav is not fresh"
			);
		});
	});

	describe("Peek Methods", () => {
		test("peekCodePoint should return the current code point", () => {
			const nav = createNav("test");
			const tCodePoint = "t".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(tCodePoint);

			nav.moveCaptureForward(1);
			const eCodePoint = "e".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(eCodePoint);
		});

		test("peekCodePoint should handle surrogate pairs", () => {
			const nav = createNav("😊test");
			const emojiCodePoint = "😊".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(emojiCodePoint);
		});

		test("peekBeforeCodePoint should return the previous code point", () => {
			const nav = createNav("test", 2);
			const eCodePoint = "e".codePointAt(0);
			expect(nav.peekBeforeCodePoint()).toBe(eCodePoint);
		});

		test("peekBeforeCodePoint should handle surrogate pairs", () => {
			const nav = createNav("😊test", 2);
			const emojiCodePoint = "😊".codePointAt(0);
			expect(nav.peekBeforeCodePoint()).toBe(
				emojiCodePoint
			);
		});

		test("peekBeforeCodePoint should return undefined at start", () => {
			const nav = createNav("test");
			expect(nav.peekBeforeCodePoint()).toBeUndefined();
		});

		test("peekAfterCodePoint should return the next code point", () => {
			const nav = createNav("test");
			const eCodePoint = "e".codePointAt(0);
			expect(nav.peekAfterCodePoint()).toBe(eCodePoint);
		});

		test("peekAfterCodePoint should handle surrogate pairs", () => {
			const nav = createNav("t😊est");
			// peekAfterCodePoint returns the code point after the current code point
			// So we need to check what's after 't', which should be the emoji
			const emojiCodePoint = "😊".codePointAt(0);
			expect(nav.peekAfterCodePoint()).toBe(
				emojiCodePoint
			);
		});

		test("peekAfterCodePoint should return undefined at end", () => {
			const nav = createNav("test", 4);
			expect(nav.peekAfterCodePoint()).toBeUndefined();
		});

		test("peekBeforeSliceByLength should return the correct slice", () => {
			const nav = createNav("test string", 4);
			// peekBeforeSliceByLength returns a slice of the specified length before the current position
			// So for position 4 ("test string") and length 3, we should get "est"
			const slice = nav.peekBeforeSliceByLength(3);
			expect(slice?.value).toBe("est");
		});

		test("peekBeforeSliceByLength should return undefined if not enough characters", () => {
			const nav = createNav("test", 2);
			const slice = nav.peekBeforeSliceByLength(3);
			expect(slice).toBeUndefined();
		});
	});

	describe("Result Extraction", () => {
		test("accumulatedMatch should return the captured portion", () => {
			const nav = createNav("test string");
			nav.moveCaptureForward(4);
			const match = nav.captureMatch;
			expect(match.value).toBe("test");
		});

		test("ghostMatch should return the lookahead portion", () => {
			const nav = createNav("test string");
			nav.moveCaptureForward(4);
			nav.moveGhostCaptureForward(2);
			const ghost = nav.ghostMatch;
			expect(ghost.value).toBe(" s");
		});
	});

	describe("Edge Cases", () => {
		test("should handle empty string", () => {
			const nav = createNav("");
			expect(nav.isStartSlice).toBe(true);
			expect(nav.isEndSlice).toBe(true);
			expect(nav.peekCodePoint()).toBeUndefined();
		});

		test("should handle moving beyond source bounds", () => {
			const nav = createNav("test");
			nav.moveCaptureForward(100);
			expect(nav.navIndex).toBe(100); // 0 + 100
			expect(nav.isEndSlice).toBe(false); // Since we moved beyond the end
		});

		test("should handle Unicode surrogate pairs correctly", () => {
			// Surrogate pairs are characters that require two UTF-16 code units
			const nav = createNav("😊😎🚀");
			const emoji1CodePoint = "😊".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(emoji1CodePoint);

			nav.moveCaptureForwardOneCodePoint();
			expect(nav.navIndex).toBe(2);
			const emoji2CodePoint = "😎".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(emoji2CodePoint);

			nav.moveCaptureForwardOneCodePoint();
			expect(nav.navIndex).toBe(4);
			const emoji3CodePoint = "🚀".codePointAt(0);
			expect(nav.peekCodePoint()).toBe(emoji3CodePoint);
		});
	});
});
