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
import { MatchAnyString } from "@/trex/match-string";
import { MatchWord } from "@/trex/match-bounds";
import { MatchCodePoint } from "@/trex/match-code-point";

describe("Token", () => {
	test("should store category, kind, and value", () => {
		const value = StrSlice.from("test");
		const token = new Token("category", "kind", value);

		expect(token.category).toBe("category");
		expect(token.kind).toBe("kind");
		expect(token.matchValue).toBe(value);
	});

	test("should format toString correctly", () => {
		const value = StrSlice.from("test");
		const token = new Token("category", "kind", value);

		expect(token.toString()).toBe("category:kind 'test'");
	});
});

describe("NavToken", () => {
	test("should store category, kind, and matchNav", () => {
		const source = StrSlice.from("test");
		const matchNav = new MutMatchNav(source);
		matchNav.moveCaptureForward(4); // Capture the whole string

		const token = new NavToken(
			"category",
			"kind",
			matchNav
		);

		expect(token.category).toBe("category");
		expect(token.kind).toBe("kind");
		expect(token.matchNav).toBe(matchNav);
	});

	test("should format toString correctly", () => {
		const source = StrSlice.from("test");
		const matchNav = new MutMatchNav(source);
		matchNav.moveCaptureForward(4); // Capture the whole string

		const token = new NavToken(
			"category",
			"kind",
			matchNav
		);

		expect(token.toString()).toBe("category:kind 'test'");
	});
});

describe("FindToken and FindNavToken", () => {
	test("FindToken should extend Token with correct type parameters", () => {
		const value = StrSlice.from("test");
		const token = new FindToken(":find", ":match", value);

		expect(token).toBeInstanceOf(Token);
		expect(token.category).toBe(":find");
		expect(token.kind).toBe(":match");
		expect(token.matchValue).toBe(value);
	});

	test("FindNavToken should extend NavToken with correct type parameters", () => {
		const source = StrSlice.from("test");
		const matchNav = new MutMatchNav(source);
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
	test("getNavTokens should return correct tokens", () => {
		// Create a sample FindResult with a fragment and a match
		const source = StrSlice.from("abc xxx def");

		const fragmentNav = new MutMatchNav(source, 0);
		fragmentNav.moveCaptureForward(4); // Capture "abc "

		const matchNav = new MutMatchNav(source, 4);
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

	test("getNavTokens should skip empty fragments", () => {
		// Create a sample FindResult with an empty fragment and a match
		const source = StrSlice.from("xxx def");

		const fragmentNav = new MutMatchNav(source, 0);
		fragmentNav.moveCaptureForward(0); // Empty capture

		const matchNav = new MutMatchNav(source, 0);
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

	test("getNavTokens should handle null matchNav", () => {
		// Create a sample FindResult with a fragment but no match
		const source = StrSlice.from("abc def");

		const fragmentNav = new MutMatchNav(source, 0);
		fragmentNav.moveCaptureForward(7); // Capture the whole string

		const findResult = {
			fragmentNav,
			matchNav: null,
		};

		const findAllResult = new FindAllResult([findResult]);
		const navTokens = findAllResult.getNavTokens();

		expect(navTokens).toHaveLength(1);
		expect(navTokens[0].kind).toBe(":fragment");
	});

	test("getTokens should convert NavTokens to Tokens", () => {
		// Create a sample FindResult with a fragment and a match
		const source = StrSlice.from("abc xxx def");

		const fragmentNav = new MutMatchNav(source, 0);
		fragmentNav.moveCaptureForward(4); // Capture "abc "

		const matchNav = new MutMatchNav(source, 4);
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
		test("should find a match in the source string", () => {
			const source = StrSlice.from("abc xxx def");
			const matcher = MatchAnyString.fromStrings([
				"xxx",
			]);
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

		test("should return null matchNav when no match is found", () => {
			const source = StrSlice.from("abc def");
			const matcher = MatchAnyString.fromStrings([
				"xxx",
			]);
			const trex = new TRex(matcher);

			const result = trex.find(source);

			expect(result.matchNav).toBeNull();
			expect(result.fragmentNav.captureMatch.value).toBe(
				"abc def"
			);
		});

		test("should find a match starting from a specific position", () => {
			const source = StrSlice.from("xxx abc xxx def");
			const matcher = MatchAnyString.fromStrings([
				"xxx",
			]);
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

		test("should handle surrogate pairs correctly", () => {
			const source = StrSlice.from("abc 😀 def");
			const matcher = new MatchCodePoint(
				"😀".codePointAt(0)!
			);
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
		test("should find all matches in the source string", () => {
			const source = StrSlice.from(
				"abc xxx def xxx ghi"
			);
			const matcher = MatchAnyString.fromStrings([
				"xxx",
			]);
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

		test("should handle case with no matches", () => {
			const source = StrSlice.from("abc def ghi");
			const matcher = MatchAnyString.fromStrings([
				"xxx",
			]);
			const trex = new TRex(matcher);

			const result = trex.findAll(source);
			const tokens = result.getTokens();

			expect(tokens).toHaveLength(1);
			expect(tokens[0].kind).toBe(":fragment");
			expect(tokens[0].matchValue.value).toBe(
				"abc def ghi"
			);
		});

		test("should throw error on empty match", () => {
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
		test("should find words with MatchWord and MatchAnyString", () => {
			const str =
				"abc def xxx hij yyy lmn opq xxx yyz xxx yyy mmm cba xxxyyy yyyxxx yyy";
			const source = StrSlice.from(str);

			const matcher = MatchAnyString.fromStrings([
				"xxx",
				"yyy",
			]);
			const wordMatcher = new MatchWord(matcher);
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
	});
});
