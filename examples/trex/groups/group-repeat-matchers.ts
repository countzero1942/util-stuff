import {
	AltFirstLastGroupMatchers,
	GroupMatch,
	GroupMatchAll,
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
import { ExamplesMenuItem, runExamplesMenu } from "@/utils/examples-menu";
import { div, log } from "@/utils/log";
import { logGroups, logGroupsRec } from "./common";
import chalk from "chalk";

const doNumberGroupRepeatMatchWithAltFirstLast = () => {
	const groupSeparatorMatcher = MatchCodePoint.fromString(",");

	const startGroupMatcher = GroupMatchOpt.from(
		GroupMatch.fromNamed(
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
		GroupMatch.fromNamed(
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

	const endGroupMatcher = GroupMatch.fromNamed(
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

const doRecursiveNumberGroupRepeatMatchWithAltFirstLast = () => {
	const groupSeparatorMatcher = GroupMatch.fromNamed(
		GroupName.fromName("group-separator"),
		MatchCodePoint.fromString(",")
	);

	const startGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			GroupName.fromName("start-group"),
			GroupMatchRepeat.from(
				GroupName.fromName("digit-group"),
				GroupMatch.fromNamed(
					GroupName.fromName("digit"),
					MatchCodePointCategories.fromString("Nd")
				),
				NumberOfMatches.between(1, 2)
			),
			groupSeparatorMatcher
		)
	);

	const contentGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			GroupName.fromName("content-group"),
			GroupMatchRepeat.from(
				GroupName.fromName("digit-group"),
				GroupMatch.fromNamed(
					GroupName.fromName("digit"),
					MatchCodePointCategories.fromString("Nd")
				),
				NumberOfMatches.exactly(3)
			),
			groupSeparatorMatcher
		)
	);

	const endGroupMatcher = GroupMatchAll.fromNamed(
		GroupName.fromName("end-group-content"),
		GroupMatchRepeat.from(
			GroupName.fromName("digit-group"),
			GroupMatch.fromNamed(
				GroupName.fromName("digit"),
				MatchCodePointCategories.fromString("Nd")
			),
			NumberOfMatches.between(1, 3)
		),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
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
		if (!result) {
			log(chalk.red("No match for navString: ") + navString);
			continue;
		}
		logGroupsRec(result);
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
	{
		func: doRecursiveNumberGroupRepeatMatchWithAltFirstLast,
		name: "Recursive Number Group Repeat Match With AltFirstLast",
		description: [
			"Do recursive number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
];

export const runGroupRepeatMatcherExamples = async () => {
	await runExamplesMenu("Group Repeat Matchers", exampleItems);
};
