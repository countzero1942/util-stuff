import { MatchNav } from "@/trex";
import { StrSlice } from "@/utils/slice";

// Helper to strip ANSI color codes from chalk so string assertions are stable
const stripAnsi = (s: string): string => s.replace(/\u001B\[[0-9;]*m/g, "");

describe("MatchNav (immutable)", () => {
	// -----------------------------
	// Constructors and properties
	// -----------------------------
	describe("Constructors and Basic Properties", () => {
		test("fromString: initializes with correct indices", () => {
			const nav = MatchNav.fromString("test string", 2);
			expect(nav.startIndex).toBe(2);
			expect(nav.captureIndex).toBe(2);
			expect(nav.isEmptyMatch).toBe(true);
		});

		test("fromNew: initializes with StrSlice at [0..0]", () => {
			const nav = MatchNav.fromNew(StrSlice.from("abc"));
			expect(nav.startIndex).toBe(0);
			expect(nav.captureIndex).toBe(0);
			expect(nav.captureLength).toBe(0);
		});

		test("fromStart: respects provided start index", () => {
			const nav = MatchNav.fromStart(StrSlice.from("abcd"), 3);
			expect(nav.startIndex).toBe(3);
			expect(nav.captureIndex).toBe(3);
		});

		test("fromCapture: sets start and capture independently", () => {
			const nav = MatchNav.fromCapture(StrSlice.from("abcdef"), 2, 5);
			expect(nav.startIndex).toBe(2);
			expect(nav.captureIndex).toBe(5);
			expect(nav.captureMatch.value).toBe("cde");
		});

		test("fromFirstAndLast: composes from same source", () => {
			const src = StrSlice.from("abcdef");
			const first = MatchNav.fromStart(src, 1);
			const last = MatchNav.fromCapture(src, 1, 4);
			const combined = MatchNav.fromFirstAndLast(first, last);
			expect(combined.startIndex).toBe(1);
			expect(combined.captureIndex).toBe(4);
			expect(combined.captureMatch.value).toBe("bcd");
		});

		test("fromFirstAndLast: throws on mismatched sources", () => {
			const first = MatchNav.fromStart(StrSlice.from("abc"), 0);
			const last = MatchNav.fromCapture(StrSlice.from("xyz"), 0, 1);
			expect(() => MatchNav.fromFirstAndLast(first, last)).toThrow(
				"MatchNav.fromFirstAndLast: sources do not match"
			);
		});

		test("empty: is a reusable empty navigator", () => {
			const empty = MatchNav.empty;
			expect(empty.source.length).toBe(0);
			expect(empty.startIndex).toBe(0);
			expect(empty.captureIndex).toBe(0);
			expect(empty.isEmptyMatch).toBe(true);
			expect(stripAnsi(empty.toString())).toBe("Nav: [0..0], ''");
		});

		test("captureLength: is zero initially", () => {
			const nav = MatchNav.fromString("test");
			expect(nav.captureLength).toBe(0);
		});

		test("position flags: start and end detection", () => {
			const startNav = MatchNav.fromString("test");
			expect(startNav.isCaptureIndexAtSourceStart).toBe(true);
			expect(startNav.isCaptureIndexAtSourceEnd).toBe(false);

			const endNav = MatchNav.fromString("test", 4);
			expect(endNav.isCaptureIndexAtSourceStart).toBe(false);
			expect(endNav.isCaptureIndexAtSourceEnd).toBe(true);
		});

		test("fromString: throws if start index beyond end", () => {
			expect(() => MatchNav.fromString("test", 5)).toThrow(
				"MatchNav: startIndex cannot be beyond end of source"
			);
		});

		test("fromString: throws if start index is negative", () => {
			expect(() => MatchNav.fromString("test", -1)).toThrow(
				"MatchNav: startIndex cannot be negative"
			);
		});
	});

	// -----------------------------
	// Movement: capture index
	// -----------------------------
	describe("Movement - Capture Operations", () => {
		test("moveCaptureForwardOneCodePoint: advances by one code point (ASCII)", () => {
			const nav0 = MatchNav.fromString("test");
			const nav1 = nav0.moveCaptureForwardOneCodePoint();
			expect(nav0.captureIndex).toBe(0); // original unchanged
			expect(nav1.captureIndex).toBe(1);
			expect(nav1.captureLength).toBe(1);
			expect(nav1.captureMatch.value).toBe("t");
		});

		test("moveCaptureForwardOneCodePoint: advances by one emoji (surrogate pair)", () => {
			const nav0 = MatchNav.fromString("😊test");
			const nav1 = nav0.moveCaptureForwardOneCodePoint();
			expect(nav1.captureIndex).toBe(2); // emoji is 2 UTF-16 code units
			expect(nav1.captureLength).toBe(2);
			expect(nav1.captureMatch.value).toBe("😊");
		});

		test("moveCaptureForwardOneCodePoint: throws beyond end of source", () => {
			const nav0 = MatchNav.fromString("test", 3);
			const nav1 = nav0.moveCaptureForwardOneCodePoint(); // ok (to 4)
			expect(() => nav1.moveCaptureForwardOneCodePoint()).toThrow(
				"moveCaptureForwardOneCodePoint: beyond end of source"
			);

			const navE0 = MatchNav.fromString("ab😊", 2);
			const navE1 = navE0.moveCaptureForwardOneCodePoint(); // ok (to 4)
			expect(() => navE1.moveCaptureForwardOneCodePoint()).toThrow(
				"moveCaptureForwardOneCodePoint: beyond end of source"
			);
		});

		test("moveCaptureForward: advances by specified length", () => {
			const nav0 = MatchNav.fromString("test string");
			const nav1 = nav0.moveCaptureForward(4);
			expect(nav1.captureIndex).toBe(4);
			expect(nav1.captureLength).toBe(4);
			expect(nav1.captureMatch.value).toBe("test");
		});

		test("moveCaptureForward: throws if beyond end", () => {
			const nav = MatchNav.fromString("test", 4);
			expect(() => nav.moveCaptureForward(1)).toThrow(
				"moveCaptureForward: capture index beyond end of source"
			);
		});

		test("moveCaptureForward: throws if length is negative", () => {
			const nav = MatchNav.fromString("test");
			expect(() => nav.moveCaptureForward(-1)).toThrow(
				"moveCaptureForward: length cannot be negative"
			);
		});

		test("moveCaptureToSourceEnd: moves capture to end", () => {
			const nav0 = MatchNav.fromString("test string");
			const nav1 = nav0.moveCaptureToSourceEnd();
			expect(nav1.captureIndex).toBe(11);
			expect(nav1.isCaptureIndexAtSourceEnd).toBe(true);
			expect(nav1.captureLength).toBe(11);
			expect(nav1.captureMatch.value).toBe("test string");
		});
	});

	// -----------------------------
	// Movement: start & commit
	// -----------------------------
	describe("Movement - Start Operations", () => {
		test("moveNextOneCodePoint: advances start and capture by one", () => {
			const nav0 = MatchNav.fromString("test");
			const nav1 = nav0.moveNextOneCodePoint();
			expect(nav1.startIndex).toBe(1);
			expect(nav1.captureIndex).toBe(1);
			expect(nav1.captureLength).toBe(0);
			expect(nav1.captureMatch.value).toBe("");

			const e0 = MatchNav.fromString("😊test");
			const e1 = e0.moveNextOneCodePoint();
			expect(e1.startIndex).toBe(2); // emoji is 2 UTF-16 code units
			expect(e1.captureIndex).toBe(2);
			expect(e1.captureLength).toBe(0);
			expect(e1.captureMatch.value).toBe("");
		});

		test("moveNextOneCodePoint: throws beyond end of source", () => {
			const nav0 = MatchNav.fromString("test", 3);
			const nav1 = nav0.moveNextOneCodePoint(); // ok to 4
			expect(() => nav1.moveNextOneCodePoint()).toThrow(
				"moveNextOneCodePoint: beyond end of source"
			);

			const e0 = MatchNav.fromString("abc😊", 3);
			const e1 = e0.moveNextOneCodePoint(); // ok to 5
			expect(() => e1.moveNextOneCodePoint()).toThrow(
				"moveNextOneCodePoint: beyond end of source"
			);
		});

		test("moveNextToSourceEnd: moves start and capture to end", () => {
			const nav0 = MatchNav.fromString("test string");
			const nav1 = nav0.moveNextToSourceEnd();
			expect(nav1.startIndex).toBe(nav1.source.length);
			expect(nav1.captureIndex).toBe(nav1.source.length);
			expect(nav1.captureLength).toBe(0);
			expect(nav1.captureMatch.value).toBe("");
		});

		test("moveNext (MustMoveForward): commits capture and resets length to 0", () => {
			const nav0 = MatchNav.fromString("test string");
			const nav1 = nav0.moveCaptureForward(5);
			const nav2 = nav1.moveNext();
			expect(nav2.startIndex).toBe(5);
			expect(nav2.captureIndex).toBe(5);
			expect(nav2.captureLength).toBe(0);
			expect(nav2.peekAheadCodePoint()).toBe("s".codePointAt(0));
		});

		test("moveNext (MustMoveForward): throws when start equals capture", () => {
			const nav = MatchNav.fromString("test");
			expect(() => nav.moveNext()).toThrow(
				"move-next infinite loop error: startIndex equals captureIndex so it can never move forward!"
			);
		});

		test("moveNext (OptMoveForward): allows zero-length move and returns new instance", () => {
			const nav0 = MatchNav.fromString("xyz");
			const nav1 = nav0.moveNext("OptMoveForward");
			expect(nav1.startIndex).toBe(0);
			expect(nav1.captureIndex).toBe(0);
			expect(nav1).not.toBe(nav0); // returns a new instance even if unchanged
		});
	});

	// -----------------------------
	// Movement: shrink capture
	// -----------------------------
	describe("Movement - shrinkCapture", () => {
		test("shrinkCapture: reduces capture by length", () => {
			const nav0 = MatchNav.fromString("abcdef").moveCaptureForward(5); // [0..5] => abcde
			const nav1 = nav0.shrinkCapture(2);
			expect(nav1.captureIndex).toBe(3);
			expect(nav1.captureMatch.value).toBe("abc");
		});

		test("shrinkCapture: throws when length is negative", () => {
			const nav = MatchNav.fromString("abc").moveCaptureForward(2);
			expect(() => nav.shrinkCapture(-1)).toThrow(
				"MatchNav.shrinkCapture: length cannot be negative"
			);
		});

		test("shrinkCapture: throws when result would be before start", () => {
			const nav = MatchNav.fromString("abc").moveCaptureForward(1); // [0..1]
			expect(() => nav.shrinkCapture(2)).toThrow(
				"MatchNav.shrinkCapture: capture index cannot be less than start index"
			);
		});
	});

	// -----------------------------
	// State checks and validation
	// -----------------------------
	describe("Validation Methods", () => {
		test("assertNavIsNew: throws if capture exists", () => {
			const nav = MatchNav.fromString("test").moveCaptureForward(1);
			expect(() => nav.assertNavIsNew()).toThrow(
				"Navigator is not new: it contains a capture"
			);
		});

		test("assertIsMovable: MustMoveForward passes when capture > start", () => {
			const nav = MatchNav.fromString("abcd").moveCaptureForward(2);
			expect(() => nav.assertIsMovable("MustMoveForward")).not.toThrow();
		});

		test("assertIsMovable: MustMoveForward throws when start == capture", () => {
			const nav = MatchNav.fromString("abcd");
			expect(() => nav.assertIsMovable("MustMoveForward")).toThrow(
				"move-next infinite loop error: startIndex equals captureIndex so it can never move forward!"
			);
		});

		test("assertIsMovable: OptMoveForward never throws", () => {
			const nav = MatchNav.fromString("abcd");
			expect(() => nav.assertIsMovable("OptMoveForward")).not.toThrow();
		});

		test("assertIsMovable: throws on invalid mode string (type cast)", () => {
			const nav = MatchNav.fromString("abcd");
			// Force invalid value via cast to any to reach the default case
			expect(() => (nav as any).assertIsMovable("InvalidMode" as any)).toThrow(
				"MatchNav.assertIsMovable: Invalid move mode: InvalidMode"
			);
		});
	});

	// -----------------------------
	// Peek methods
	// -----------------------------
	describe("Peek Methods", () => {
		test("peekCodePoint: returns current code point", () => {
			const nav0 = MatchNav.fromString("test");
			expect(nav0.peekCodePoint()).toBe("t".codePointAt(0));
			const nav1 = nav0.moveCaptureForward(1);
			expect(nav1.peekCodePoint()).toBe("e".codePointAt(0));
		});

		test("peekCodePoint: handles surrogate pairs", () => {
			const nav = MatchNav.fromString("😊test");
			expect(nav.peekCodePoint()).toBe("😊".codePointAt(0));
		});

		test("peekBehindCodePoint: returns previous code point", () => {
			const nav = MatchNav.fromString("test", 2);
			expect(nav.peekBehindCodePoint()).toBe("e".codePointAt(0));
		});

		test("peekBehindCodePoint: handles surrogate pairs", () => {
			const nav = MatchNav.fromString("😊test", 2);
			expect(nav.peekBehindCodePoint()).toBe("😊".codePointAt(0));
		});

		test("peekBehindCodePoint: returns undefined at start", () => {
			const nav = MatchNav.fromString("test");
			expect(nav.peekBehindCodePoint()).toBeUndefined();
		});

		describe("peekAheadCodePoint", () => {
			test("peekAheadCodePoint: returns the next code point (by advancing first)", () => {
				const nav1 = MatchNav.fromString("test").moveCaptureForward(1);
				expect(nav1.peekAheadCodePoint()).toBe("e".codePointAt(0));
			});

			test("peekAheadCodePoint: handles surrogate pairs after ASCII", () => {
				const nav1 = MatchNav.fromString("t😊est").moveCaptureForward(1);
				expect(nav1.peekAheadCodePoint()).toBe("😊".codePointAt(0));
			});

			test("peekAheadCodePoint: handles surrogate pairs at start", () => {
				const nav = MatchNav.fromString("😊xxx");
				expect(nav.peekAheadCodePoint()).toBe("😊".codePointAt(0));
			});

			test("peekAheadCodePoint: returns undefined at end", () => {
				const nav = MatchNav.fromString("test", 4);
				expect(nav.peekAheadCodePoint()).toBeUndefined();
			});
		});

		describe("peekBehindSliceByLength", () => {
			test("peekBehindSliceByLength: returns the correct slice", () => {
				const nav = MatchNav.fromString("test string", 4);
				const slice = nav.peekBehindSliceByLength(3);
				expect(slice?.value).toBe("est");
			});

			test("peekBehindSliceByLength: returns undefined if not enough characters", () => {
				const nav = MatchNav.fromString("test", 2);
				const slice = nav.peekBehindSliceByLength(3);
				expect(slice).toBeUndefined();
			});
		});
	});

	// -----------------------------
	// Result extraction and edge cases
	// -----------------------------
	describe("Result Extraction", () => {
		test("captureMatch: returns the captured portion", () => {
			const nav = MatchNav.fromString("test string").moveCaptureForward(4);
			expect(nav.captureMatch.value).toBe("test");
		});
	});

	describe("Edge Cases", () => {
		test("handles empty source string", () => {
			const nav = MatchNav.fromString("");
			expect(nav.isCaptureIndexAtSourceStart).toBe(true);
			expect(nav.isCaptureIndexAtSourceEnd).toBe(true);
			expect(nav.peekCodePoint()).toBeUndefined();
		});

		test("handles multiple emoji movement correctly", () => {
			const nav0 = MatchNav.fromString("😊😎🚀");
			expect(nav0.peekCodePoint()).toBe("😊".codePointAt(0));
			const nav1 = nav0.moveCaptureForwardOneCodePoint();
			expect(nav1.captureIndex).toBe(2);
			expect(nav1.peekCodePoint()).toBe("😎".codePointAt(0));
			const nav2 = nav1.moveCaptureForwardOneCodePoint();
			expect(nav2.captureIndex).toBe(4);
			expect(nav2.peekCodePoint()).toBe("🚀".codePointAt(0));
		});
	});

	// -----------------------------
	// toString output
	// -----------------------------
	describe("toString", () => {
		test("toString: initial state", () => {
			const nav = MatchNav.fromString("abcdef", 2);
			expect(nav.captureMatch.value).toBe("");
			expect(stripAnsi(nav.toString())).toBe("Nav: [2..2], ''");
		});

		test("toString: after advancing capture", () => {
			const nav = MatchNav.fromString("abcdef").moveCaptureForward(3);
			expect(nav.captureMatch.value).toBe("abc");
			expect(stripAnsi(nav.toString())).toBe("Nav: [0..3], 'abc'");
		});

		test("toString: at end of source", () => {
			const nav = MatchNav.fromString("abc").moveCaptureToSourceEnd();
			expect(nav.captureMatch.value).toBe("abc");
			expect(stripAnsi(nav.toString())).toBe("Nav: [0..3], 'abc'");
		});

		test("toString: empty source", () => {
			const nav = MatchNav.fromString("");
			expect(stripAnsi(nav.toString())).toBe("Nav: [0..0], ''");
		});
	});
});
