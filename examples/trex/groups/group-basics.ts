import { LineInfo } from "@/parser/types/key-value";
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
} from "@/trex";
import { div, divs, logobj } from "@/utils/log";
import { log } from "console";

const logGroups = (group: GroupMatchNav | null) => {
	if (!group) {
		log("Null group nav");
		return;
	}
	if (group.groupName.isNotEmpty()) {
		log(group.toString());
		log(group.noEndMatchNav.toString());
		divs();
	}
	group.children.forEach(child => {
		log(child.toString());
	});
};

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
		MatchAll.from(
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
		if (!result) {
			log(`No match for navString: ${navString}`);
			div();
			continue;
		}
		logGroups(result);
		div();
	}
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
		if (!result) {
			log(`No match for navString: ${navString}`);
			div();
			continue;
		}
		logGroups(result);
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
		if (!result) {
			log(`No match for navString: ${navString}`);
			div();
			break;
		}
		logGroups(result);
		div();
		nav = result.wholeMatchNav.copyAndMoveNext(
			"OptMoveForward"
		);
	}
};

export const doGroupBasicsCurrentTest = () => {
	// doBasicGroupMatch();
	// doBasicSplitter();
	doSplitterWithEndMatcher();
};
