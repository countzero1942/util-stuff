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
} from "@/trex";
import { div, logobj } from "@/utils/log";
import { log } from "console";

const logGroups = (group: GroupMatchNav | null) => {
	if (!group) {
		log("Null group nav");
		return;
	}
	if (group.groupName.isNotEmpty()) {
		log(group.toString());
	}
	group.children.forEach(child => {
		log(child.toString());
	});
};

export const doBasicGroupMatch = () => {
	const nav = MutMatchNav.fromString("1234.5678");
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

export const doGroupBasicsCurrentTest = () => {
	doBasicGroupMatch();
};
