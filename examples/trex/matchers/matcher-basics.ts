import {
	AltFirstLastGroupMatchers,
	AltFirstLastMatchers,
	GroupMatch,
	GroupName,
	MatchAll,
	MatchCodePoint,
	MatchCodePointCategories,
	MatchEndSlice,
	MatchOpt,
	MatchRepeat,
	MutMatchNav,
	NumberOfMatches,
} from "@/trex";
import { div } from "@/utils/log";
import { log } from "console";

export const doRepeatMatcherTestWithAltFirstAltLast =
	() => {
		const groupSeparatorMatcher =
			MatchCodePoint.fromString(",");

		const startGroupMatcher = MatchOpt.from(
			MatchAll.from(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.between(1, 2)
				),
				groupSeparatorMatcher
			)
		);

		const contentGroupMatcher = MatchOpt.from(
			MatchAll.from(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.exactly(3)
				),
				groupSeparatorMatcher
			)
		);

		const endGroupMatcher = MatchAll.from(
			MatchRepeat.from(
				MatchCodePointCategories.fromString("Nd"),
				NumberOfMatches.between(1, 3)
			),
			MatchEndSlice.default
		);

		const numberMatcher = MatchRepeat.from(
			contentGroupMatcher,
			NumberOfMatches.between(1, 4),
			AltFirstLastMatchers.fromBoth(
				startGroupMatcher,
				endGroupMatcher
			)
		);

		const navStrings = [
			"123,12",
			"12,567",
			"1,567",
			"1,567,8",
			"1,567,89",
			"1,567,890",
			"123,567,890",
			"123,567,890,321",
			"1,567,890,321",
			"1,567,890,3",
			"123,567,890,321,123",
			"1,567,890,321,123",
			"123,567,890,321,3",
			"1,567,890,321,3",
			"123",
			"12",
			"1",
			"1234",
		];

		for (const navString of navStrings) {
			const nav = MutMatchNav.fromString(navString);
			const result = numberMatcher.match(nav);
			if (!result) {
				log(`No match for navString: '${navString}'`);
				div();
				continue;
			}
			log(
				`navString: '${navString}' |  ` +
					`result.captureMatch.value: '${result.captureMatch.value}'`
			);
			div();
		}
	};

export const doRepeatMatcherTestWithAltFirst = () => {};

export const doRepeatMatcherTestWithAltLast = () => {};

export const doMatcherBasicsCurrentTest = () => {
	doRepeatMatcherTestWithAltFirstAltLast();
};
