import {
	LookAheadCodePoint,
	LookBehindCodePoint,
	MatchAllMatches,
	MatchAnyMatch,
	MatchCodePointCategories,
	matchEndSlice,
	MatchNotCodePointOrPosition,
	MatchRepeatMatch,
	matchStartSlice,
	TRex,
} from "@/trex";
import { StrSlice } from "@/utils/slice";

const wordStart =
	MatchCodePointCategories.fromString("Lu Lo Ll");
const wordContent =
	MatchCodePointCategories.fromString("Lu Lo Ll Nd");

const wordContent2 = new MatchRepeatMatch(wordContent);
const wordContentNot = new MatchNotCodePointOrPosition(
	wordContent2
);
const wordStartBound = new MatchAnyMatch([
	matchStartSlice,
	new LookBehindCodePoint(
		new MatchNotCodePointOrPosition(wordStart)
	),
]);
const wordContentBound = new MatchAnyMatch([
	new LookAheadCodePoint(
		new MatchNotCodePointOrPosition(wordContent)
	),
	matchEndSlice,
]);

const matchWord = new MatchAllMatches([
	wordStartBound,
	new MatchRepeatMatch(wordContent),
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
