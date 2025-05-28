import {
	LookAheadCodePoint,
	LookBehindCodePoint,
	MatchAll,
	MatchAny,
	MatchCodePointCategories,
	MatchEndSlice,
	MatchNotCodePoint,
	MatchRepeat,
	MatchStartSlice,
	TRex,
} from "@/trex";
import { StrSlice } from "@/utils/slice";

const wordStart =
	MatchCodePointCategories.fromString("Lu Lo Ll");
const wordContent =
	MatchCodePointCategories.fromString("Lu Lo Ll Nd");

const wordStartBound = MatchAny.from(
	MatchStartSlice.default,
	LookBehindCodePoint.from(
		MatchNotCodePoint.from(wordStart)
	)
);
const wordContentBound = MatchAny.from(
	LookAheadCodePoint.from(
		MatchNotCodePoint.from(wordContent)
	),
	MatchEndSlice.default
);

const matchWord = MatchAll.from(
	wordStartBound,
	MatchRepeat.from(wordContent),
	wordContentBound
);

export const matchWords = (str: string) => {
	const tr = new TRex(matchWord);
	const results = tr.findAll(StrSlice.from(str));
	const tokens = results.getNavTokens();
	return tokens;
};

export const matchWordsTest = () => {
	const str = "apple pear orange 8n8 dig3t333";
	//  01234567890123456789012345678901234567890123456789012345678901234567890

	const tokens = matchWords(str);

	for (const token of tokens) {
		console.log(token.toStringWithGhostMatch());
	}
};
