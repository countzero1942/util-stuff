import {
	GroupMatchBase,
	GroupMatchNav,
	hasUnnamedBranches,
	logGroupsRec,
	MutMatchNav,
	removeUnnamedBranches,
} from "@/trex";
import { log, div, logh, ddiv } from "@/utils/log";
import chalk from "chalk";

type LogResultsOptions = {
	showPrunedTree: boolean;
	autoPrune: boolean;
};

export const logResults = (
	successStrings: string[],
	failStrings: string[],
	matcher: GroupMatchBase,
	options: LogResultsOptions = {
		showPrunedTree: false,
		autoPrune: false,
	}
) => {
	const getNavStringView = (navString: string) => {
		return chalk.white(`'${chalk.green(navString)}'`);
	};

	const logHasUnnamedBranchesView = (group: GroupMatchNav) => {
		const b = hasUnnamedBranches(group);
		const bView = b ? chalk.yellow("true") : chalk.green("false");
		log(chalk.cyan(`Has unnamed branches: ${bView}`));
	};

	logh("Success cases");

	for (const navString of successStrings) {
		const nav = MutMatchNav.fromString(navString);
		const result = matcher.match(nav, null);
		log();
		ddiv();
		if (!result) {
			log(
				chalk.red(
					`>>> FAILED TO MATCH SUCCESS CASE: ${getNavStringView(navString)} <<< `
				)
			);
			continue;
		}
		log(chalk.cyan(`Nav string: ${getNavStringView(navString)}`));
		const modResult = options.autoPrune ? result.prune() : result;
		logGroupsRec(modResult);
		div();
		logHasUnnamedBranchesView(modResult);
		div();
		if (options.showPrunedTree) {
			log(chalk.cyan(`Nav string: ${getNavStringView(navString)}`));
			const prunedResult = result.prune();
			logGroupsRec(prunedResult);
			div();
			logHasUnnamedBranchesView(prunedResult);
			div();
		}
	}
	logh("Fail cases");
	for (const pair of failStrings) {
		const [navString, msg] = pair.split("->");
		const nav = MutMatchNav.fromString(navString);
		const result = matcher.match(nav, null);
		div();
		if (result) {
			log(
				chalk.red(
					`>>> MATCHED FAIL CASE: ${getNavStringView(navString)} <<< `
				)
			);
			logGroupsRec(result);
			continue;
		}
		const msgView = msg ? `-> ${chalk.yellow(msg)}` : "";
		log(
			chalk.cyan(
				`Failed to match: ${getNavStringView(navString)} ${msgView}`
			)
		);
	}
	log();
};
