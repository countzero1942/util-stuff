import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import {
	Token,
	NavToken,
	FindToken,
	FindNavToken,
	FindAllResult,
	TRex,
} from "@/trex/trex";
import { MatchAnyString } from "@/trex/match-any-string";
import {
	MatchCodePoint,
	MatchNotCodePoint,
} from "@/trex/match-code-point";
import {
	GhostMatch,
	LookAheadCodePoint,
	LookBehindCodePoint,
	MatchAll,
	MatchAny,
	MatchCodePointAny,
	MatchEndSlice,
	MatchRepeat,
	MatchStartSlice,
	matchUnicodeLetter,
	matchUnicodeSpace,
	NumberOfMatches,
} from "@/trex";
import exp from "constants";

describe("Token", () => {
	test("stores category, kind, and value", () => {
		const value = StrSlice.from("test");
		const token = new Token("category", "kind", value);

		expect(token.category).toBe("category");
		expect(token.kind).toBe("kind");
		expect(token.matchValue).toBe(value);
	});

	test("formats toString correctly", () => {
		const value = StrSlice.from("test");
		const token = new Token("category", "kind", value);

		expect(token.toString()).toBe("category:kind 'test'");
	});
});

describe("NavToken", () => {
	test("stores category, kind, and matchNav", () => {
		const matchNav = MutMatchNav.fromString("test");
		matchNav.moveCaptureForward(4); // Capture the whole string

		const token = new NavToken(
			"category",
			"kind",
			matchNav
		);

		expect(token.category).toBe("category");
		expect(token.kind).toBe("kind");
		expect(token.matchNav.captureMatch.value).toBe(
			"test"
		);
		expect(token.matchNav.ghostMatch.value).toBe("");
		expect(token.matchNav).toBe(matchNav);
	});

	test("formats toString correctly", () => {
		const matchNav = MutMatchNav.fromString("test");
		matchNav.moveCaptureForward(4); // Capture the whole string

		const token = new NavToken(
			":category",
			":kind",
			matchNav
		);
		expect(token.toString()).toBe(
			":category:kind 'test'"
		);
	});
});

describe("FindToken and FindNavToken", () => {
	test("FindToken extends Token with correct type parameters", () => {
		const value = StrSlice.from("test");
		const token = new FindToken(":find", ":match", value);

		expect(token).toBeInstanceOf(Token);
		expect(token.category).toBe(":find");
		expect(token.kind).toBe(":match");
		expect(token.matchValue).toBe(value);
	});

	test("FindNavToken extends NavToken with correct type parameters", () => {
		const matchNav = MutMatchNav.fromString("test");
		matchNav.moveCaptureForward(4); // Capture the whole string

		const token = new FindNavToken(
			":find",
			":match",
			matchNav
		);

		expect(token).toBeInstanceOf(NavToken);
		expect(token.category).toBe(":find");
		expect(token.kind).toBe(":match");
		expect(token.matchNav).toBe(matchNav);
	});
});

describe("FindAllResult", () => {
	test("getNavTokens returns correct tokens", () => {
		// Create a sample FindResult with a fragment and a match
		const source = StrSlice.from("abc xxx def");

		const fragmentNav = MutMatchNav.from(source, 0);
		fragmentNav.moveCaptureForward(4); // Capture "abc "

		const matchNav = MutMatchNav.from(source, 4);
		matchNav.moveCaptureForward(3); // Capture "xxx"

		const findResult = {
			fragmentNav,
			matchNav,
		};

		const findAllResult = new FindAllResult([findResult]);
		const navTokens = findAllResult.getNavTokens();

		expect(navTokens).toHaveLength(2);
		expect(navTokens[0]).toBeInstanceOf(FindNavToken);
		expect(navTokens[0].category).toBe(":find");
		expect(navTokens[0].kind).toBe(":fragment");
		expect(navTokens[0].matchNav.captureMatch.value).toBe(
			"abc "
		);

		expect(navTokens[1]).toBeInstanceOf(FindNavToken);
		expect(navTokens[1].category).toBe(":find");
		expect(navTokens[1].kind).toBe(":match");
		expect(navTokens[1].matchNav.captureMatch.value).toBe(
			"xxx"
		);
	});

	test("getNavTokens skips empty fragments", () => {
		// Create a sample FindResult with an empty fragment and a match
		const source = StrSlice.from("xxx def");

		const fragmentNav = MutMatchNav.from(source);
		fragmentNav.moveCaptureForward(0); // Empty capture

		const matchNav = MutMatchNav.from(source);
		matchNav.moveCaptureForward(3); // Capture "xxx"

		const findResult = {
			fragmentNav,
			matchNav,
		};

		const findAllResult = new FindAllResult([findResult]);
		const navTokens = findAllResult.getNavTokens();

		expect(navTokens).toHaveLength(1);
		expect(navTokens[0].kind).toBe(":match");
	});

	test("getNavTokens handles null matchNav", () => {
		// Create a sample FindResult with a fragment but no match
		const source = StrSlice.from("abc def");

		const fragmentNav = MutMatchNav.from(source, 0);
		fragmentNav.moveCaptureForward(7); // Capture the whole string

		const findResult = {
			fragmentNav,
			matchNav: null,
		};

		const findAllResult = new FindAllResult([findResult]);
		const navTokens = findAllResult.getNavTokens();

		expect(navTokens).toHaveLength(1);
		expect(navTokens[0].kind).toBe(":fragment");
		expect(navTokens[0].matchNav.captureMatch.value).toBe(
			"abc def"
		);
	});

	test("getTokens converts NavTokens to Tokens", () => {
		// Create a sample FindResult with a fragment and a match
		const source = StrSlice.from("abc xxx def");

		const fragmentNav = MutMatchNav.from(source, 0);
		fragmentNav.moveCaptureForward(4); // Capture "abc "

		const matchNav = MutMatchNav.from(source, 4);
		matchNav.moveCaptureForward(3); // Capture "xxx"

		const findResult = {
			fragmentNav,
			matchNav,
		};

		const findAllResult = new FindAllResult([findResult]);
		const tokens = findAllResult.getTokens();

		expect(tokens).toHaveLength(2);
		expect(tokens[0]).toBeInstanceOf(FindToken);
		expect(tokens[0].category).toBe(":find");
		expect(tokens[0].kind).toBe(":fragment");
		expect(tokens[0].matchValue.value).toBe("abc ");

		expect(tokens[1]).toBeInstanceOf(FindToken);
		expect(tokens[1].category).toBe(":find");
		expect(tokens[1].kind).toBe(":match");
		expect(tokens[1].matchValue.value).toBe("xxx");
	});
});

describe("TRex", () => {
	describe("find", () => {
		test("finds a match in the source string", () => {
			const source = StrSlice.from("abc xxx def");
			const matcher = MatchAnyString.fromStrings("xxx");
			const trex = new TRex(matcher);

			const result = trex.find(source);

			expect(result.matchNav).not.toBeNull();
			expect(result.matchNav?.captureMatch.value).toBe(
				"xxx"
			);
			expect(result.fragmentNav.captureMatch.value).toBe(
				"abc "
			);
		});

		test("returns null matchNav when no match is found", () => {
			const source = StrSlice.from("abc def");
			const matcher = MatchAnyString.fromStrings("xxx");
			const trex = new TRex(matcher);

			const result = trex.find(source);

			expect(result.matchNav).toBeNull();
			expect(result.fragmentNav.captureMatch.value).toBe(
				"abc def"
			);
		});

		test("finds a match starting from a specific position", () => {
			const source = StrSlice.from("xxx abc xxx def");
			const matcher = MatchAnyString.fromStrings("xxx");
			const trex = new TRex(matcher);

			const result = trex.find(source, 4); // Start after the first "xxx"

			expect(result.matchNav).not.toBeNull();
			expect(result.matchNav?.captureMatch.value).toBe(
				"xxx"
			);
			expect(result.fragmentNav.captureMatch.value).toBe(
				"abc "
			);
		});

		test("handles surrogate pairs correctly", () => {
			const source = StrSlice.from("abc 😀 def");
			const matcher = MatchCodePoint.fromString("😀");
			const trex = new TRex(matcher);

			const result = trex.find(source);

			expect(result.matchNav).not.toBeNull();
			expect(result.matchNav?.captureMatch.value).toBe(
				"😀"
			);
			expect(result.fragmentNav.captureMatch.value).toBe(
				"abc "
			);
		});
	});

	describe("findAll", () => {
		test("finds all matches in the source string", () => {
			const source = StrSlice.from(
				"abc xxx def xxx ghi"
			);
			const matcher = MatchAnyString.fromStrings("xxx");
			const trex = new TRex(matcher);

			const result = trex.findAll(source);
			const tokens = result.getTokens();

			expect(tokens).toHaveLength(5);
			expect(tokens[0].kind).toBe(":fragment");
			expect(tokens[0].matchValue.value).toBe("abc ");
			expect(tokens[1].kind).toBe(":match");
			expect(tokens[1].matchValue.value).toBe("xxx");
			expect(tokens[2].kind).toBe(":fragment");
			expect(tokens[2].matchValue.value).toBe(" def ");
			expect(tokens[3].kind).toBe(":match");
			expect(tokens[3].matchValue.value).toBe("xxx");
			expect(tokens[4].kind).toBe(":fragment");
			expect(tokens[4].matchValue.value).toBe(" ghi");
		});

		test("handles case with no matches", () => {
			const source = StrSlice.from("abc def ghi");
			const matcher = MatchAnyString.fromStrings("xxx");
			const trex = new TRex(matcher);

			const result = trex.findAll(source);
			const tokens = result.getTokens();

			expect(tokens).toHaveLength(1);
			expect(tokens[0].kind).toBe(":fragment");
			expect(tokens[0].matchValue.value).toBe(
				"abc def ghi"
			);
		});

		test("throws error on empty match", () => {
			const source = StrSlice.from("abc def ghi");
			// Create a matcher that produces an empty match
			const emptyMatcher = {
				match: (nav: MutMatchNav) => {
					nav.assertValid();
					return nav; // Return without moving capture forward
				},
			};
			const trex = new TRex(emptyMatcher);

			expect(() => trex.findAll(source)).toThrow(
				"Empty match found"
			);
		});

		// Test case from app/index.ts
		test("finds words with MatchWord and MatchAnyString", () => {
			const str =
				"abc def xxx hij yyy lmn opq xxx yyz xxx yyy mmm cba xxxyyy yyyxxx yyy";
			const source = StrSlice.from(str);

			const matcher = MatchAnyString.fromStrings(
				"xxx",
				"yyy"
			);
			const wordMatcher = MatchAll.from(
				MatchAny.from(
					MatchStartSlice.default,
					LookBehindCodePoint.from(matchUnicodeSpace)
				),
				matcher,
				MatchAny.from(
					GhostMatch.from(matchUnicodeSpace),
					MatchEndSlice.default
				)
			);
			const trex = new TRex(wordMatcher);

			const result = trex.findAll(source);
			const tokens = result.getTokens();

			// Expected matches: "xxx", "yyy", "xxx", "xxx", "yyy", "yyy"
			// (Note: "xxxyyy" and "yyyxxx" are not matched as words because they don't have word boundaries)

			// Check for correct number of tokens (fragments + matches)
			expect(
				tokens.filter(t => t.kind === ":match")
			).toHaveLength(6);

			// Check specific matches
			const matches = tokens
				.filter(t => t.kind === ":match")
				.map(t => t.matchValue.value);
			expect(matches).toEqual([
				"xxx",
				"yyy",
				"xxx",
				"xxx",
				"yyy",
				"yyy",
			]);

			// Check that the fragments are correct
			const fragments = tokens
				.filter(t => t.kind === ":fragment")
				.map(t => t.matchValue.value);
			expect(fragments[0]).toBe("abc def ");
			expect(fragments[1]).toBe("hij ");
			expect(fragments[2]).toBe("lmn opq ");
			expect(fragments[3]).toBe("yyz ");
			expect(fragments[4]).toBe(
				"mmm cba xxxyyy yyyxxx "
			);
		});

		test("finds words with ghost match + toString() and toStringWithGhostMatch()", () => {
			const source = StrSlice.from("abc,  def, ghi,jkl");
			const matcher = MatchAll.from(
				MatchAny.from(
					MatchStartSlice.default,
					LookBehindCodePoint.from(
						MatchCodePointAny.from(
							matchUnicodeSpace,
							MatchCodePoint.fromString(",")
						)
					)
				),
				MatchRepeat.from(matchUnicodeLetter),
				MatchAny.from(
					GhostMatch.from(
						MatchAll.from(
							MatchAnyString.fromStrings(","),
							MatchRepeat.from(
								matchUnicodeSpace,
								NumberOfMatches.zeroOrMore
							)
						)
					),
					MatchEndSlice.default
				)
			);
			const trex = new TRex(matcher);

			const result = trex.findAll(source);
			const navTokens = result.getNavTokens();
			expect(navTokens).toHaveLength(4);

			expect(
				navTokens[0].matchNav.captureMatch.value
			).toBe("abc");
			expect(
				navTokens[0].matchNav.ghostMatch.value
			).toBe(",  ");
			expect(navTokens[0].toString()).toBe(
				":find:match 'abc'"
			);
			expect(navTokens[0].toStringWithGhostMatch()).toBe(
				":find:match 'abc' + ',  '"
			);

			expect(
				navTokens[1].matchNav.captureMatch.value
			).toBe("def");
			expect(
				navTokens[1].matchNav.ghostMatch.value
			).toBe(", ");
			expect(navTokens[1].toString()).toBe(
				":find:match 'def'"
			);
			expect(navTokens[1].toStringWithGhostMatch()).toBe(
				":find:match 'def' + ', '"
			);

			expect(
				navTokens[2].matchNav.captureMatch.value
			).toBe("ghi");
			expect(
				navTokens[2].matchNav.ghostMatch.value
			).toBe(",");
			expect(navTokens[2].toString()).toBe(
				":find:match 'ghi'"
			);
			expect(navTokens[2].toStringWithGhostMatch()).toBe(
				":find:match 'ghi' + ','"
			);

			expect(
				navTokens[3].matchNav.captureMatch.value
			).toBe("jkl");
			expect(
				navTokens[3].matchNav.ghostMatch.value
			).toBe("");
			expect(navTokens[3].toString()).toBe(
				":find:match 'jkl'"
			);
			expect(navTokens[3].toStringWithGhostMatch()).toBe(
				":find:match 'jkl' + ''"
			);
		});
	});
});
