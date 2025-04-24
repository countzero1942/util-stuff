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
	MatchAllMatches,
	MutMatchNav,
	MatchCodePoint,
	MatchAnyString,
	LookAheadAnyString,
	TRex,
} from "@/trex";

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
	const anyStringMatcher = MatchAnyString.fromStrings([
		"abc",
		"def",
	]);
	const matcher = new LookAheadAnyString(anyStringMatcher);

	{
		const nav = new MutMatchNav(source, 0);
		const result = matcher.match(nav);
		log(`'${result?.captureMatch.value}'`);
		div();
	}

	{
		let nav: MutMatchNav | null = new MutMatchNav(
			source,
			0
		);
		nav = anyStringMatcher.match(nav);
		logobj(`'${nav?.captureMatch.value}'`);
		if (nav) {
			const result = matcher.match(nav);
			log(`'${result?.captureMatch.value}'`);
		}
		div();
	}
};
