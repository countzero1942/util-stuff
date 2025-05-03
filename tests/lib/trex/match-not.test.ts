import { StrSlice } from "@/utils/slice";
import {
	MutMatchNav,
	MatchNot,
	MatchAll,
	MatchAny,
	MatchOpt,
	MatchRepeat,
	GhostMatch,
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
		it("returns null and invalidates nav when MatchAll matches", () => {
			const matcher = MatchAll.from(
				MatchStartSlice.default
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchAll does not match", () => {
			const matcher = MatchAll.from(
				MatchEndSlice.default
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc");
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav); // instance identity
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy); // state unchanged
		});
	});

	describe("with MatchAny", () => {
		it("returns null when MatchAny matches", () => {
			const matcher = MatchAny.from(
				MatchStartSlice.default
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchAny does not match", () => {
			const matcher = MatchAny.from(
				MatchEndSlice.default
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc");
			const result = not.match(nav);
			expect(result).not.toBeNull();
			expect(result?.isInvalidated).toBe(false);
		});
	});

	describe("with MatchOpt", () => {
		it("returns null when MatchOpt matches", () => {
			const matcher = MatchOpt.from(
				MatchStartSlice.default
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns null always on MatchOpt, because MatchOpt always returns true", () => {
			const matcher = MatchOpt.from(
				MatchEndSlice.default
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
	});

	describe("with MatchRepeat", () => {
		it("returns null when MatchRepeat matches", () => {
			const matcher = MatchRepeat.from(
				MatchStartSlice.default,
				NumberOfMatches.exactly(1)
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchRepeat does not match", () => {
			const matcher = MatchRepeat.from(
				MatchEndSlice.default,
				NumberOfMatches.exactly(1)
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc");
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with GhostMatch", () => {
		it("returns null when GhostMatch matches", () => {
			const matcher = GhostMatch.from(
				MatchStartSlice.default
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when GhostMatch does not match", () => {
			const matcher = GhostMatch.from(
				MatchEndSlice.default
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc");
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with MatchAnyString", () => {
		it("returns null when MatchAnyString matches", () => {
			const matcher = MatchAnyString.fromStrings("abc");
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchAnyString does not match", () => {
			const matcher = MatchAnyString.fromStrings("xyz");
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc");
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with LookBehindAnyString", () => {
		it("returns nav (same instance, unmutated) when LookBehindAnyString does not match", () => {
			const matcher = LookBehindAnyString.from(
				MatchAnyString.fromStrings("a")
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("ba", 0); // position after 'b'
			nav.moveCaptureForwardOneCodePoint();
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.captureMatch.value).toBe("b");
			expect(nav.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
		it("returns null when LookBehindAnyString matches", () => {
			const matcher = LookBehindAnyString.from(
				MatchAnyString.fromStrings("b")
			);
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("ba", 0);
			nav.moveCaptureForwardOneCodePoint();
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
	});

	describe("with MatchStartSlice", () => {
		it("returns null when MatchStartSlice matches", () => {
			const matcher = MatchStartSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchStartSlice does not match", () => {
			const matcher = MatchStartSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc", 1);
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with MatchEndSlice", () => {
		it("returns null when MatchEndSlice matches", () => {
			const matcher = MatchEndSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("", 0);
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchEndSlice does not match", () => {
			const matcher = MatchEndSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc", 1);
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with MatchNotStartSlice", () => {
		it("returns null when MatchNotStartSlice matches", () => {
			const matcher = MatchNotStartSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc", 1);
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchNotStartSlice does not match", () => {
			const matcher = MatchNotStartSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc", 0);
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with MatchNotEndSlice", () => {
		it("returns null when MatchNotEndSlice matches", () => {
			const matcher = MatchNotEndSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc", 1);
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchNotEndSlice does not match", () => {
			const matcher = MatchNotEndSlice.default;
			const not = MatchNot.from(matcher);
			const nav = MutMatchNav.fromString("abc", 3);
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("errors in MatchNot constructor", () => {
		it("throws when trying to create MatchNot with MatchCodePointBase", () => {
			const matcher = MatchCodePoint.fromNumber(65);
			expect(() => MatchNot.from(matcher)).toThrow(
				"MatchNot: Invalid matcher type: MatchCodePointBase. " +
					"Use MatchNotCodePoint instead."
			);
		});
		it("throws when trying to create MatchNot with MatchNot", () => {
			const matcher = MatchNot.from(
				MatchAnyString.fromStrings("abc")
			);
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
		it("returns null if inner matcher matches", () => {
			const not = MatchNot.from(alwaysPassMatcher);
			const nav = MutMatchNav.fromString("A");
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		it("returns nav if inner matcher does not match", () => {
			const not = MatchNot.from(alwaysFailMatcher);
			const nav = MutMatchNav.fromString("A");
			const result = not.match(nav);
			expect(result).not.toBeNull();
		});
	});
});
