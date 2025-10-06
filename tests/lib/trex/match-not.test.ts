import { StrSlice } from "@/utils/slice";
import {
	MatchNav,
	MatchNot,
	MatchAll,
	MatchAny,
	MatchOpt,
	MatchRepeat,
	MatchAnyString,
	MatchStartSlice,
	MatchEndSlice,
	MatchNotStartSlice,
	MatchNotEndSlice,
	MatchCodePointBase,
	MatchCodePoint,
	NumberOfMatches,
} from "@/trex";
import { LookBehindAnyString } from "@/trex/match-looking";

describe("MatchNot", () => {
	// const makeNav = (s: string, pos = 0) =>
	// 	new MutMatchNav(new StrSlice(s), pos);

	describe("with MatchAll", () => {
		test("returns null and invalidates nav when MatchAll matches", () => {
			const matcher = MatchAll.fromMatchers(MatchStartSlice.default);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav (same instance, unmutated) when MatchAll does not match", () => {
			const matcher = MatchAll.fromMatchers(MatchEndSlice.default);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc");
			const result = not.match(nav);
			expect(result).toBe(nav); // instance identity
		});
	});

	describe("with MatchAny", () => {
		test("returns null when MatchAny matches", () => {
			const matcher = MatchAny.fromMatchers(MatchStartSlice.default);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav (same instance, unmutated) when MatchAny does not match", () => {
			const matcher = MatchAny.fromMatchers(MatchEndSlice.default);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc");
			const result = not.match(nav);
			expect(result).not.toBeNull();
		});
	});

	describe("with MatchOpt", () => {
		test("returns null when MatchOpt matches", () => {
			const matcher = MatchOpt.from(MatchStartSlice.default);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns null always on MatchOpt, because MatchOpt always returns true", () => {
			const matcher = MatchOpt.from(MatchEndSlice.default);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
	});

	describe("with MatchRepeat", () => {
		test("returns null when MatchRepeat matches", () => {
			const matcher = MatchRepeat.from(
				MatchAnyString.fromStrings("a"),
				NumberOfMatches.exactly(2)
			);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("aa");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav (same instance, unmutated) when MatchRepeat does not match", () => {
			const matcher = MatchRepeat.from(
				MatchAnyString.fromStrings("a"),
				NumberOfMatches.exactly(2)
			);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("ab");
			const result = not.match(nav);
			expect(result).toBe(nav);
		});
	});

	describe("with MatchAnyString", () => {
		test("returns null when MatchAnyString matches", () => {
			const matcher = MatchAnyString.fromStrings("abc");
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav (same instance, unmutated) when MatchAnyString does not match", () => {
			const matcher = MatchAnyString.fromStrings("xyz");
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc");
			const result = not.match(nav);
			expect(result).toBe(nav);
		});
	});

	describe("with LookBehindAnyString", () => {
		test("returns nav (same instance, unmutated) when LookBehindAnyString does not match", () => {
			const matcher = LookBehindAnyString.from(
				MatchAnyString.fromStrings("a")
			);
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("ba", 0); // position after 'b'
			nav.moveCaptureForwardOneCodePoint();
			const result = not.match(nav);
			expect(result).toBe(nav);
		});
		test("returns null when LookBehindAnyString matches", () => {
			const matcher = LookBehindAnyString.from(
				MatchAnyString.fromStrings("b")
			);
			const not = MatchNot.from(matcher);
			let nav = MatchNav.fromString("ba", 0);
			nav = nav.moveCaptureForwardOneCodePoint();
			const result = not.match(nav);
			expect(result).toBeNull();
		});
	});

	describe("with MatchStartSlice", () => {
		test("returns null when MatchStartSlice matches", () => {
			const matcher = MatchStartSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav (same instance, unmutated) when MatchStartSlice does not match", () => {
			const matcher = MatchStartSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc", 1);
			const result = not.match(nav);
			expect(result).toBe(nav);
		});
	});

	describe("with MatchEndSlice", () => {
		test("returns null when MatchEndSlice matches", () => {
			const matcher = MatchEndSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("", 0);
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav (same instance, unmutated) when MatchEndSlice does not match", () => {
			const matcher = MatchEndSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc", 1);
			const result = not.match(nav);
			expect(result).toBe(nav);
		});
	});

	describe("with MatchNotStartSlice", () => {
		test("returns null when MatchNotStartSlice matches", () => {
			const matcher = MatchNotStartSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc", 1);
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav (same instance, unmutated) when MatchNotStartSlice does not match", () => {
			const matcher = MatchNotStartSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc", 0);
			const result = not.match(nav);
			expect(result).toBe(nav);
		});
	});

	describe("with MatchNotEndSlice", () => {
		test("returns null when MatchNotEndSlice matches", () => {
			const matcher = MatchNotEndSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc", 1);
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav (same instance, unmutated) when MatchNotEndSlice does not match", () => {
			const matcher = MatchNotEndSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MatchNav.fromString("abc", 3);
			const result = not.match(nav);
			expect(result).toBe(nav);
		});
	});

	describe("errors in MatchNot constructor", () => {
		test("throws when trying to create MatchNot with MatchCodePointBase", () => {
			const matcher = MatchCodePoint.fromNumber(65);
			expect(() => MatchNot.from(matcher)).toThrow(
				"MatchNot: Invalid matcher type: MatchCodePointBase. " +
					"Use MatchNotCodePoint instead."
			);
		});
		test("throws when trying to create MatchNot with MatchNot", () => {
			const matcher = MatchNot.from(MatchAnyString.fromStrings("abc"));
			expect(() => MatchNot.from(matcher)).toThrow(
				"MatchNot: Invalid matcher type: MatchNot. " +
					"Recursion not supported."
			);
		});
	});

	describe("MatchNot (smoke test)", () => {
		// Use MatchAll that always fails or always passes
		const alwaysFailMatcher = {
			match: () => null,
		} as any;
		const alwaysPassMatcher = {
			match: (nav: any) => nav,
		} as any;
		test("returns null if inner matcher matches", () => {
			const not = MatchNot.from(alwaysPassMatcher);
			const nav = MatchNav.fromString("A");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		test("returns nav if inner matcher does not match", () => {
			const not = MatchNot.from(alwaysFailMatcher);
			const nav = MatchNav.fromString("A");
			const result = not.match(nav);
			expect(result).not.toBeNull();
		});
	});
});
