import {
	AltFirstLastGroupMatchers,
	GroupMatch,
	GroupMatchOpt,
	GroupMatchRepeat,
	GroupName,
	MatchAll,
	MatchCodePoint,
	MatchCodePointCategories,
	MatchEndSlice,
	MatchRepeat,
	MutMatchNav,
	NumberOfMatches,
} from "@/trex";
import {
	ExamplesMenuItem,
	runExamplesMenu,
} from "@/utils/examples-menu";
import { div } from "@/utils/log";
import { logGroups } from "./common";

const doNumberGroupRepeatMatchWithAltFirstLast = () => {
	const groupSeparatorMatcher =
		MatchCodePoint.fromString(",");

	const startGroupMatcher = GroupMatchOpt.from(
		GroupMatch.from(
			GroupName.fromName("start-group"),
			MatchAll.fromMatchers(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.between(1, 2)
				),
				groupSeparatorMatcher
			)
		)
	);

	const contentGroupMatcher = GroupMatchOpt.from(
		GroupMatch.from(
			GroupName.fromName("content-group"),
			MatchAll.fromMatchers(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.exactly(3)
				),
				groupSeparatorMatcher
			)
		)
	);

	const endGroupMatcher = GroupMatch.from(
		GroupName.fromName("end-group"),
		MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchCodePointCategories.fromString("Nd"),
				NumberOfMatches.between(1, 3)
			),
			MatchEndSlice.default
		)
	);

	const numberMatcher = GroupMatchRepeat.from(
		GroupName.fromName("number"),
		contentGroupMatcher,
		NumberOfMatches.between(1, 4),
		AltFirstLastGroupMatchers.fromBoth(
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
		"123",
		"12",
		"1",
		"1234",
		"123,567,890,321,123",
		"1,567,890,321,123",
		"123,567,890,321,3",
		"1,567,890,321,3",
		"1,",
		"123,12,",
		"123,123,",
		"1234,123",
	];

	for (const navString of navStrings) {
		const nav = MutMatchNav.fromString(navString);
		const result = numberMatcher.match(nav);
		div();
		logGroups(navString, result);
	}
	div();
};

const exampleItems: ExamplesMenuItem[] = [
	{
		func: doNumberGroupRepeatMatchWithAltFirstLast,
		name: "Number Group Repeat Match With AltFirstLast",
		description: [
			"Do number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
];

export const runGroupRepeatMatcherExamples = async () => {
	await runExamplesMenu(
		"Group Repeat Matchers",
		exampleItems
	);
};
