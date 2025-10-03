import { div, log } from "@/utils/log";
import { logNavString, logResults } from "./common";
import {
	GroupSplitter,
	GroupName,
	GroupMatch,
	MatchCodePoint,
	MutMatchNav,
	logGroupsRec,
	MatchRepeat,
	NumberOfMatches,
} from "@/trex";
import chalk from "chalk";
import { ExamplesMenuItem, runExamplesMenu } from "@/utils/examples-menu";
import { numberGroupSuccessStrings } from "./common-data";

const decimalSplitter = GroupMatch.fromNamed(
	GroupName.fromName("decimal-point"),
	MatchCodePoint.fromString(".")
);

const commaSplitter = GroupMatch.fromNamed(
	GroupName.fromName("comma"),
	MatchCodePoint.fromString(",")
);

const doBasicSplitter = () => {
	const splitter = GroupSplitter.from(
		GroupName.fromName("number"),
		decimalSplitter,
		{
			endMatcher: GroupMatch.fromNamed(
				GroupName.fromName("end"),
				MatchCodePoint.fromString(".")
			),
		}
	);

	const successNavStrings = [
		"1234.5678.90210",
		".1234.5678.90210",
		".1234.5678.90210",
		".1234",
		"1234.",
		"1234",
	];

	logResults(successNavStrings, [], splitter, {
		showPrunedTree: false,
		autoPrune: false,
	});
};

const doFunkyNumberSplitter = () => {
	const splitter = GroupSplitter.from(
		GroupName.fromName("number"),
		commaSplitter
	);

	logResults(numberGroupSuccessStrings, [], splitter, {
		showPrunedTree: false,
		autoPrune: false,
	});
};

const doSplitterWithEndMatcher = () => {
	const splitter = GroupSplitter.from(
		GroupName.fromName("number"),
		GroupMatch.fromNamed(
			GroupName.fromName("decimal-point"),
			MatchCodePoint.fromString(".")
		),
		{
			endMatcher: GroupMatch.fromNamed(
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
		const result = splitter.match(nav, null);
		logNavString(navString);
		if (!result) {
			log(chalk.red(`Failed to match: ${navString}`));
			break;
		}
		logGroupsRec(result);
		div();

		nav = result.wholeMatchNav.copyAndMoveNext("OptMoveForward");
	}
};

const exampleItems: ExamplesMenuItem[] = [
	{
		func: doBasicSplitter,
		name: "Basic Splitter",
		description: ["Period separated numbers."],
	},
	{
		func: doSplitterWithEndMatcher,
		name: "Splitter with End Matcher",
		description: ["Period separated numbers with end matcher."],
	},
	{
		func: doFunkyNumberSplitter,
		name: "Funky Number Splitter",
		description: ["Comma separated numbers."],
	},
];

export const runGroupSplitterExamples = async () => {
	await runExamplesMenu("Group Splitter Examples", exampleItems);
};
