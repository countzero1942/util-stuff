import {
	GroupMatchNav,
	MutMatchNav,
	GroupMatch,
	GroupName,
	MatchRepeat,
	MatchCodePointCategories,
	NumberOfMatches,
	MatchCodePoint,
	GroupMatchAll,
	MatchAll,
	MatchEndSlice,
	MatchOpt,
	GroupSplitter,
	MatchCodePointAny,
	MatchCodePointSet,
	GroupMatchOpt,
	GroupMatchRepeat,
	AltFirstLastGroupMatchers,
} from "@/trex";
import { div, divs, logobj } from "@/utils/log";
import { log } from "console";
import { logGroups } from "./common";

export const doBasicGroupMatch = () => {
	const wholeMatcher = GroupMatch.from(
		GroupName.fromName("whole-part"),
		MatchRepeat.from(
			MatchCodePointCategories.fromString("Nd"),
			NumberOfMatches.oneOrMore
		)
	);
	const decimalPointMatcher = GroupMatch.from(
		GroupName.fromName("decimal-point"),
		MatchOpt.from(MatchCodePoint.fromString("."))
	);

	const decimalPartMatcher = GroupMatch.from(
		GroupName.fromName("decimal-part"),
		MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchCodePointCategories.fromString("Nd"),
				NumberOfMatches.zeroOrMore
			),
			MatchEndSlice.default
		)
	);

	const numberMatcher = GroupMatchAll.fromNamed(
		GroupName.fromName("number"),
		wholeMatcher,
		decimalPointMatcher,
		decimalPartMatcher
	);

	const navStrings = [
		"1234.5678",
		"1234.",
		"1234.abc",
		"12345678",
		"1234abc",
	];

	for (const navString of navStrings) {
		const nav = MutMatchNav.fromString(navString);
		const result = numberMatcher.match(nav);
		logGroups(navString, result);
		div();
	}
};

const doGroupOptMatch = () => {
	const signMatcher = GroupMatchOpt.from(
		GroupMatch.from(
			GroupName.fromName("sign"),
			MatchCodePointSet.fromString("+-")
		)
	);

	const digitsMatcher = GroupMatch.from(
		GroupName.fromName("digits"),
		MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchCodePointCategories.fromString("Nd"),
				NumberOfMatches.oneOrMore
			),
			MatchEndSlice.default
		)
	);

	const numberMatcher = GroupMatchAll.fromNamed(
		GroupName.fromName("number"),
		signMatcher,
		digitsMatcher
	);

	const navStrings = [
		"1234",
		"+1234",
		"-1234",
		"+-1234",
		"+1234abc",
		"+",
	];
	for (const navString of navStrings) {
		const nav = MutMatchNav.fromString(navString);
		const result = numberMatcher.match(nav);
		logGroups(navString, result);
		div();
	}
};

const doGroupRepeatMatchWithAltFirstLast = () => {
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

	const endGroupMatcher = GroupMatchOpt.from(
		GroupMatch.from(
			GroupName.fromName("end-group"),
			MatchAll.fromMatchers(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.between(1, 3)
				),
				MatchEndSlice.default
			)
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
		div();
		logGroups(navString, result);
	}
	div();
};

const doBasicSplitter = () => {
	const splitter = GroupSplitter.from(
		GroupName.fromName("number"),
		GroupMatch.from(
			GroupName.fromName("decimal-point"),
			MatchCodePoint.fromString(".")
		),
		{
			endMatcher: GroupMatch.from(
				GroupName.fromName("end"),
				MatchCodePoint.fromString(".")
			),
		}
	);

	const navStrings = [
		"1234.5678.90210",
		".1234.5678.90210",
		".1234.5678.90210",
		".1234",
		"1234.",
		"1234",
	];
	for (const navString of navStrings) {
		const nav = MutMatchNav.fromString(navString);
		const result = splitter.match(nav);
		logGroups(navString, result);
		div();
	}
};

const doSplitterWithEndMatcher = () => {
	const splitter = GroupSplitter.from(
		GroupName.fromName("number"),
		GroupMatch.from(
			GroupName.fromName("decimal-point"),
			MatchCodePoint.fromString(".")
		),
		{
			endMatcher: GroupMatch.from(
				GroupName.end,
				MatchRepeat.from(
					MatchCodePoint.fromString(" "),
					NumberOfMatches.oneOrMore
				)
			),
		}
	);

	const navString = "1234.5678 90210  .1234 .1234.5678.";
	let nav = MutMatchNav.fromString(navString);
	while (nav.isNavIndexAtSourceEnd === false) {
		const result = splitter.match(nav);
		logGroups(navString, result);
		div();

		if (!result) break;

		nav = result.wholeMatchNav.copyAndMoveNext(
			"OptMoveForward"
		);
	}
};

export const doGroupBasicsExamplesMenu = () => {
	// doBasicGroupMatch();
	// doBasicSplitter();
	//doSplitterWithEndMatcher();

	doGroupRepeatMatchWithAltFirstLast();
};
