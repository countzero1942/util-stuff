import { div, log } from "@/utils/log";
import { logNavString } from "./common";
import {
	GroupSplitter,
	GroupName,
	GroupMatch,
	MatchCodePoint,
	MutMatchNav,
	logGroupsRec,
} from "@/trex";
import chalk from "chalk";
import { ExamplesMenuItem, runExamplesMenu } from "@/utils/examples-menu";

const doBasicSplitter = () => {
	const splitter = GroupSplitter.from(
		GroupName.fromName("number"),
		GroupMatch.fromNamed(
			GroupName.fromName("decimal-point"),
			MatchCodePoint.fromString(".")
		),
		{
			endMatcher: GroupMatch.fromNamed(
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
		const result = splitter.match(nav, null);
		logNavString(navString);
		if (!result) {
			log(chalk.red(`Failed to match: ${navString}`));
			continue;
		}
		logGroupsRec(result);
		div();
	}
};

const exampleItems: ExamplesMenuItem[] = [
	{
		func: doBasicSplitter,
		name: "Basic Splitter",
		description: ["Period separated numbers."],
	},
];

export const runGroupSplitterExamples = async () => {
	await runExamplesMenu("Group Splitter Examples", exampleItems);
};
