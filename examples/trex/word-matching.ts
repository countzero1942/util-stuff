import {
	LookAheadCodePoint,
	LookBehindCodePoint,
	MatchAll,
	MatchAny,
	MatchCodePointCat,
	MatchEndSlice,
	MatchNotCodePoint,
	MatchRepeat,
	MatchStartSlice,
	TRex,
} from "@/trex";
import { StrSlice } from "@/utils/slice";

const wordStart = MatchCodePointCat.fromString("Lu Lo Ll");
const wordContent =
	MatchCodePointCat.fromString("Lu Lo Ll Nd");

const wordStartBound = new MatchAny([
	MatchStartSlice.default,
	new LookBehindCodePoint(
		new MatchNotCodePoint(wordStart)
	),
]);
const wordContentBound = new MatchAny([
	new LookAheadCodePoint(
		new MatchNotCodePoint(wordContent)
	),
	MatchEndSlice.default,
]);

const matchWord = new MatchAll([
	wordStartBound,
	new MatchRepeat(wordContent),
	wordContentBound,
]);

export const matchWords = (str: string) => {
	const tr = new TRex(matchWord);
	const results = tr.findAll(StrSlice.from(str));
	const tokens = results.getTokens();
	return tokens;
};

export const matchWordsTest = () => {
	const str = "apple pear orange 8n8 dig3t333";
	//  01234567890123456789012345678901234567890123456789012345678901234567890

	const tokens = matchWords(str);

	console.log(tokens);
};
