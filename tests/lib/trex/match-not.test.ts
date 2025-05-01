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
import { LookBehindAnyString } from "@/trex/match-bounds";

describe("MatchNot", () => {
	const makeNav = (s: string, pos = 0) =>
		new MutMatchNav(new StrSlice(s), pos);

	describe("with MatchAll", () => {
		it("returns null and invalidates nav when MatchAll matches", () => {
			const matcher = new MatchAll([
				new MatchStartSlice(),
			]);
			const not = new MatchNot(matcher);
			const nav = makeNav("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchAll does not match", () => {
			const matcher = new MatchAll([
				new MatchEndSlice(),
			]);
			const not = new MatchNot(matcher);
			const nav = makeNav("abc");
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav); // instance identity
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy); // state unchanged
		});
	});

	describe("with MatchAny", () => {
		it("returns null when MatchAny matches", () => {
			const matcher = new MatchAny([
				new MatchStartSlice(),
			]);
			const not = new MatchNot(matcher);
			const nav = makeNav("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchAny does not match", () => {
			const matcher = new MatchAny([
				new MatchEndSlice(),
			]);
			const not = new MatchNot(matcher);
			const nav = makeNav("abc");
			const result = not.match(nav);
			expect(result).not.toBeNull();
			expect(result?.isInvalidated).toBe(false);
		});
	});

	describe("with MatchOpt", () => {
		it("returns null when MatchOpt matches", () => {
			const matcher = new MatchOpt(
				new MatchStartSlice()
			);
			const not = new MatchNot(matcher);
			const nav = makeNav("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns null always on MatchOpt, because MatchOpt always returns true", () => {
			const matcher = new MatchOpt(new MatchEndSlice());
			const not = new MatchNot(matcher);
			const nav = makeNav("abc");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
	});

	describe("with MatchRepeat", () => {
		it("returns null when MatchRepeat matches", () => {
			const matcher = new MatchRepeat(
				new MatchStartSlice(),
				NumberOfMatches.exactly(1)
			);
			const not = new MatchNot(matcher);
			const nav = makeNav("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchRepeat does not match", () => {
			const matcher = new MatchRepeat(
				new MatchEndSlice(),
				NumberOfMatches.exactly(1)
			);
			const not = new MatchNot(matcher);
			const nav = makeNav("abc");
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with GhostMatch", () => {
		it("returns null when GhostMatch matches", () => {
			const matcher = new GhostMatch(
				new MatchStartSlice()
			);
			const not = new MatchNot(matcher);
			const nav = makeNav("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when GhostMatch does not match", () => {
			const matcher = new GhostMatch(
				new MatchEndSlice()
			);
			const not = new MatchNot(matcher);
			const nav = makeNav("abc");
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with MatchAnyString", () => {
		it("returns null when MatchAnyString matches", () => {
			const matcher = MatchAnyString.fromStrings([
				"abc",
			]);
			const not = new MatchNot(matcher);
			const nav = makeNav("abc");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchAnyString does not match", () => {
			const matcher = MatchAnyString.fromStrings([
				"xyz",
			]);
			const not = new MatchNot(matcher);
			const nav = makeNav("abc");
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with LookBehindAnyString", () => {
		it("returns nav (same instance, unmutated) when LookBehindAnyString does not match", () => {
			const matcher = new LookBehindAnyString(
				MatchAnyString.fromStrings(["a"])
			);
			const not = new MatchNot(matcher);
			const nav = makeNav("ba", 0); // position after 'b'
			nav.moveCaptureForwardOneCodePoint();
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.captureMatch.value).toBe("b");
			expect(nav.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
		it("returns null when LookBehindAnyString matches", () => {
			const matcher = new LookBehindAnyString(
				MatchAnyString.fromStrings(["b"])
			);
			const not = new MatchNot(matcher);
			const nav = makeNav("ba", 0);
			nav.moveCaptureForwardOneCodePoint();
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
	});

	describe("with MatchStartSlice", () => {
		it("returns null when MatchStartSlice matches", () => {
			const matcher = new MatchStartSlice();
			const not = new MatchNot(matcher);
			const nav = makeNav("");
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchStartSlice does not match", () => {
			const matcher = new MatchStartSlice();
			const not = new MatchNot(matcher);
			const nav = makeNav("abc", 1);
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with MatchEndSlice", () => {
		it("returns null when MatchEndSlice matches", () => {
			const matcher = new MatchEndSlice();
			const not = new MatchNot(matcher);
			const nav = makeNav("", 0);
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchEndSlice does not match", () => {
			const matcher = new MatchEndSlice();
			const not = new MatchNot(matcher);
			const nav = makeNav("abc", 1);
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with MatchNotStartSlice", () => {
		it("returns null when MatchNotStartSlice matches", () => {
			const matcher = new MatchNotStartSlice();
			const not = new MatchNot(matcher);
			const nav = makeNav("abc", 1);
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchNotStartSlice does not match", () => {
			const matcher = new MatchNotStartSlice();
			const not = new MatchNot(matcher);
			const nav = makeNav("abc", 0);
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("with MatchNotEndSlice", () => {
		it("returns null when MatchNotEndSlice matches", () => {
			const matcher = new MatchNotEndSlice();
			const not = new MatchNot(matcher);
			const nav = makeNav("abc", 1);
			const result = not.match(nav);
			expect(result).toBeNull();
			expect(nav.isInvalidated).toBe(true);
		});
		it("returns nav (same instance, unmutated) when MatchNotEndSlice does not match", () => {
			const matcher = new MatchNotEndSlice();
			const not = new MatchNot(matcher);
			const nav = makeNav("abc", 3);
			const navCopy = nav.copy();
			const result = not.match(nav);
			expect(result).toBe(nav);
			expect(result?.isInvalidated).toBe(false);
			expect(nav).toMatchObject(navCopy);
		});
	});

	describe("errors in MatchNot constructor", () => {
		it("throws when trying to create MatchNot with MatchCodePointBase", () => {
			const matcher = new MatchCodePoint(65);
			expect(() => new MatchNot(matcher)).toThrow(
				"MatchNot: Invalid matcher type: MatchCodePointBase. " +
					"Use MatchNotCodePoint instead."
			);
		});
		it("throws when trying to create MatchNot with MatchNot", () => {
			const matcher = new MatchNot(
				MatchAnyString.fromStrings(["abc"])
			);
			expect(() => new MatchNot(matcher)).toThrow(
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
			const not = new MatchNot(alwaysPassMatcher);
			const nav = new MutMatchNav(new StrSlice("A"));
			const result = not.match(nav);
			expect(result).toBeNull();
		});
		it("returns nav if inner matcher does not match", () => {
			const not = new MatchNot(alwaysFailMatcher);
			const nav = new MutMatchNav(new StrSlice("A"));
			const result = not.match(nav);
			expect(result).not.toBeNull();
		});
	});
});
