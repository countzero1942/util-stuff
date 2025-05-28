import {
	log,
	logh,
	div,
	loggn,
	ddivl,
	logn,
	divl,
	ddivln,
	loghn,
	logagn,
	logag,
	logobj,
	logg,
	ddiv,
} from "@/utils/log";

import { StrSlice } from "@/utils/slice";

import {
	CodePointRange,
	GhostMatch,
	MatchAll,
	MutMatchNav,
	MatchCodePoint,
	MatchAnyString,
	LookAheadAnyString,
	TRex,
	MatchAny,
	LookAheadCodePoint,
	LookBehindCodePoint,
	MatchEndSlice,
	MatchStartSlice,
	matchUnicodeSpace,
	matchUnicodeLetter,
	MatchCodePointCategories,
	matchUnicodeLetterOrDigit,
	MatchNotCodePoint,
	MatchRepeat,
	MatchCodePointSet,
	matchUnicodeWhiteSpace,
} from "@/trex";
import { CodePointSeq } from "@/utils/seq";

// const s1 = "a😀";
// log(`0x${s1.charCodeAt(0).toString(16)}`);
// log(`0x${s1.charCodeAt(1).toString(16)}`);
// log(`0x${s1.charCodeAt(2).toString(16)}`);

// div();

// const s2 = "a😀";
// log(`0x${s2.codePointAt(0)?.toString(16)}`);
// log(`0x${s2.codePointAt(1)?.toString(16)}`);
// log(`0x${s2.codePointAt(2)?.toString(16)}`);

// div();

// const seq = new StrSeq("hello");
// // seq.foreach(x => log(x));
// // div();
// // seq.foreach(x => log(x));

// const arr1 = Array.from(seq.gen());
// logobj(arr1);
// // div();
// // const arr2 = seq.toArray();
// // logobj(arr2);

// const createLetterMatcher = (
// 	letter: string
// ): MatchCodePoint => {
// 	return new MatchCodePoint(letter.codePointAt(0)!);
// };

// const matcherA = createLetterMatcher("A");
// const matcherB = createLetterMatcher("B");
// const matcherComma = createLetterMatcher(",");
// const ghostComma = new GhostMatch(matcherComma);

// // First match A and B normally, then match comma as ghost at the end
// const sequence = new MatchAllMatches([
// 	matcherA,
// 	matcherB,
// 	ghostComma,
// ]);

// const nav = new MutMatchNav(new StrSlice("AB,C"));
// const result = sequence.match(nav);
// if (result) {
// 	div();
// 	log(`source: ${nav.source.value}`);
// 	log(`start: ${result.startIndex}`);
// 	log(`navIndex: ${result.navIndex}`);
// 	log(`captureIndex: ${result.captureIndex}`);
// 	log(`capture: '${result.captureMatch.value}'`);
// 	log(`ghost capture: '${result.ghostMatch.value}'`);
// } else {
// 	log("No match");
// }

// const str =
// 	"abc def xxx hij yyy lmn opq xxx yyz xxx yyy mmm cba xxxyyy yyyxxx yyy";
// //  01234567890123456789012345678901234567890123456789012345678901234567890

// const matcher = MatchAnyString.fromStrings(["xxx", "yyy"]);

// const wordMatcher = new MatchWord(matcher);

// const trex = new TRex(wordMatcher);

// const result = trex.findAll(StrSlice.from(str));

// logobj(result);

// div();

// log(str);
// log(
// 	"01234567890123456789012345678901234567890123456789012345678901234567890"
// );

// div();
// result.getNavTokens().forEach(token => {
// 	log(token.toString());
// });

// div();

// result.getTokens().forEach(token => {
// 	log(token.toString());
// });

// div();

export const doTRexStuff = () => {
	const source = StrSlice.from("abcdef");
	const anyStringMatcher = MatchAnyString.fromStrings(
		"abc",
		"def"
	);
	const matcher = LookAheadAnyString.from(
		anyStringMatcher
	);

	{
		const nav = MutMatchNav.from(source);
		const result = matcher.match(nav);
		log(`'${result?.captureMatch.value}'`);
		div();
	}

	{
		let nav: MutMatchNav | null =
			MutMatchNav.from(source);
		nav = anyStringMatcher.match(nav);
		logobj(`'${nav?.captureMatch.value}'`);
		if (nav) {
			const result = matcher.match(nav);
			log(`'${result?.captureMatch.value}'`);
		}
		div();
	}
};

export const codePointSetArgs = () => {
	const matchSet = MatchCodePointSet.fromArgs(
		CodePointRange.fromString("a-z"),
		CodePointRange.fromString("0-9"),
		"!@#$%^&*()_+",
		"😀"
	);

	const matcher = new MatchRepeat(matchSet);

	const nav = MutMatchNav.fromString("abc123!@#😀ABC");
	const result = matcher.match(nav);
	logobj(result);
	div();
	log(`source: '${nav.source.value}'`);
	log(`result: '${result?.captureMatch.value}'`);
};

export const codePointSetArgsTestExaustiveCheck = () => {
	let checkCount = 0;

	const range1: string = "a-z";
	const range2: string = "0-9";
	const str1: string = "!@#$%^&*()_+";
	const str2: string = "😀";

	const matchSet = MatchCodePointSet.fromArgs(
		CodePointRange.fromString(range1),
		CodePointRange.fromString(range2),
		str1,
		str2,
		matchUnicodeWhiteSpace
	);

	const rangeToString = (range: string) => {
		const codePointRange =
			CodePointRange.fromString(range);
		return codePointRange.toExpandedString();
	};

	const logResult = (
		codePoint: number,
		isMatch: boolean,
		isInSet: boolean
	) => {
		const codePointStr =
			codePoint >= 0x20
				? String.fromCodePoint(codePoint)
				: " ";
		log(
			`codePoint: '${codePointStr}' 0x${codePoint.toString(16)}, ` +
				`isMatch: ${isMatch}, isInSet: ${isInSet}`
		);
	};

	const checkString = (str: string, name: string) => {
		logh(name);
		const seq = new CodePointSeq(str);
		seq.codePoints().forEach(codePoint => {
			checkCount++;
			const isMatch = matchSet.matchCodePoint(codePoint);
			const isInSet = matchSet.matchCodePoint(codePoint);
			logResult(codePoint, isMatch, isInSet);
		});
	};

	const checkRangeStr = (range: string, name: string) => {
		checkString(rangeToString(range), name);
	};

	checkRangeStr(range1, "range1");
	checkRangeStr(range2, "range2");
	checkString(str1, "str1");
	checkString(str2, "str2");

	logh("matchUnicodeWhiteSpace");
	for (const codePoint of matchUnicodeWhiteSpace) {
		checkCount++;
		const isMatch = matchSet.matchCodePoint(codePoint);
		const isInSet = matchSet.matchCodePoint(codePoint);
		logResult(codePoint, isMatch, isInSet);
	}

	logh("checkCount");
	log(
		`checkCount: ${checkCount}, setCount: ${matchSet.size}`
	);
	log();
};

export const specificWordMatchTestWithGhostMatch = () => {
	const str =
		"xxx abc def xxx hij yyy lmn opq xxx yyz xxx yyy mmm cba xxxyyy yyyxxx yyy";
	const source = StrSlice.from(str);

	const matcher = MatchAnyString.fromStrings("xxx", "yyy");
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
	const tokens = result.getNavTokens();

	logh("Word Match Test With Ghost Match");

	tokens.forEach(token => {
		log(token.toStringWithGhostMatch());
	});

	div();
};

export const specificWordMatchTestWithLookAhead = () => {
	let str =
		"xxx abc def xxx hij yyy lmn opq xxx yyz xxx yyy mmm cba xxxyyy yyyxxx yyy";

	// str = " abc yyy def ";

	const source = StrSlice.from(str);

	const matcher = MatchAnyString.fromStrings("xxx", "yyy");
	const wordMatcher = MatchAll.from(
		MatchAny.from(
			MatchStartSlice.default,
			LookBehindCodePoint.from(matchUnicodeSpace)
		),
		matcher,
		MatchAny.from(
			LookAheadCodePoint.from(matchUnicodeSpace),
			MatchEndSlice.default
		)
	);
	const trex = new TRex(wordMatcher);

	const result = trex.findAll(source);
	const tokens = result.getNavTokens();

	logh("Word Match Test With Look Ahead");

	tokens.forEach(token => {
		log(token.toStringWithGhostMatch());
	});

	div();
};

export const extractWordsWithGhostMatch = () => {
	let str =
		"xxx, abc 'def xxx hij' yyy {lmn opq xxx} yyz xxx. Yyy mmm cba; xxxyyy -- yyyxxx yyy";

	// str = " abc yyy def ";

	const source = StrSlice.from(str);

	const startCodePoint = matchUnicodeLetter;
	const contentCodePoint = matchUnicodeLetterOrDigit;

	const contentMatcher = new MatchRepeat(contentCodePoint);

	const wordMatcher = MatchAll.from(
		MatchAny.from(
			MatchStartSlice.default,
			LookBehindCodePoint.from(
				MatchNotCodePoint.from(startCodePoint)
			)
		),
		contentMatcher,
		MatchAny.from(
			GhostMatch.from(
				MatchRepeat.from(
					MatchNotCodePoint.from(contentCodePoint)
				)
			),
			MatchEndSlice.default
		)
	);

	const trex = new TRex(wordMatcher);

	const result = trex.findAll(source);
	const tokens = result.getNavTokens();

	logh("Extract Words With Ghost Match");

	tokens.forEach(token => {
		log(token.toStringWithGhostMatch());
	});

	div();
};
