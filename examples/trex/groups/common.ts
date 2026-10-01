import {
	convertGroupNavsToNodes,
	GroupMatchBase,
	GroupMatchNav,
	GroupNavLike,
	GroupValidatorError,
	logGroupsRecNav,
	MatchNav,
} from "@/trex";
import { log, div, logh, ddiv } from "@/utils/log";
import chalk from "chalk";

type LogResultsOptions = {
	showPrunedTree: boolean;
	autoPrune: boolean;
};

const getNavStringView = (navString: string) => {
	return chalk.white(`'${chalk.green(navString)}'`);
};

export const logNavString = (navString: string) => {
	log(chalk.cyan(`Nav string: ${getNavStringView(navString)}`));
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
	const logHasUnnamedBranchesView = (group: GroupMatchNav) => {
		const b = group.hasUnnamedBranches;
		const bView = b ? chalk.yellow("true") : chalk.green("false");
		log(chalk.cyan(`Has unnamed branches: ${bView}`));
	};

	const doSuccessCases = (bypass: boolean = false) => {
		if (bypass) {
			return;
		}

		logh("Success cases");

		for (const navString of successStrings) {
			const nav = MatchNav.fromString(navString);
			const result = matcher.match(nav);
			log();
			ddiv();
			if (result instanceof GroupValidatorError) {
				log(
					chalk.red(
						`>>> FAILED TO MATCH SUCCESS CASE: ${getNavStringView(navString)} <<< `
					)
				);
				continue;
			}
			logNavString(navString);
			const modResult = options.autoPrune ? result.prune() : result;
			logGroupsRecNav(modResult);
			div();
			logHasUnnamedBranchesView(modResult);
			if (options.autoPrune) {
				log(
					chalk.cyan(
						`Auto-prune Result: was tree rebuilt?: ${chalk.green(
							modResult !== result
						)}`
					)
				);
			}
			div();
			if (options.showPrunedTree) {
				logNavString(navString);
				const prunedResult = result.prune();
				logGroupsRecNav(prunedResult);
				div();
				logHasUnnamedBranchesView(prunedResult);
				log(
					chalk.cyan(
						`Prune Result: was tree rebuilt?: ${chalk.green(
							prunedResult !== result
						)}`
					)
				);
				div();
			}
		}
	};

	const doFailCases = (bypass: boolean = false) => {
		if (bypass || failStrings.length === 0) {
			return;
		}
		logh("Fail cases");

		for (const pair of failStrings) {
			const [navString, msg] = pair.split("->");
			const nav = MatchNav.fromString(navString);
			const result = matcher.match(nav);
			div();
			if (result instanceof GroupMatchNav) {
				log(
					chalk.red(
						`>>> MATCHED FAIL CASE: ${getNavStringView(navString)} <<< `
					)
				);
				logGroupsRecNav(result);
				continue;
			}
			const msgView = msg ? `-> ${chalk.yellow(msg)}` : "";
			log(
				chalk.cyan(
					`Failed to match: ${getNavStringView(navString)} ${msgView}`
				)
			);
			log(chalk.yellow(`>>>  parent: '${result.parentView.value}'`));
			log(
				chalk.yellow(
					`>>>   error: '${result.errorView.getErrorString()}'`
				)
			);
			log(chalk.yellow(`>>> message: '${result.message}'`));
		}
		log();
	};

	doSuccessCases(true);
	doFailCases(false);
};

export const logNodeResults = (
	successStrings: string[],
	matcher: GroupMatchBase,
	options: LogResultsOptions = {
		showPrunedTree: false,
		autoPrune: false,
	}
) => {
	function logHasUnnamedBranchesView<T extends GroupNavLike<T>>(
		group: T
	) {
		const b = group.hasUnnamedBranches;
		const bView = b ? chalk.yellow("true") : chalk.green("false");
		log(chalk.cyan(`Has unnamed branches: ${bView}`));
	}

	logh("Success cases");

	for (const navString of successStrings) {
		const nav = MatchNav.fromString(navString);
		const result = matcher.match(nav);
		log();
		ddiv();
		if (result instanceof GroupValidatorError) {
			log(
				chalk.red(
					`>>> FAILED TO MATCH SUCCESS CASE: ${getNavStringView(navString)} <<< `
				)
			);
			continue;
		}
		logNavString(navString);
		const modResult = options.autoPrune ? result.prune() : result;
		const nodeResult = convertGroupNavsToNodes(modResult);
		logGroupsRecNav(nodeResult);
		div();
		logHasUnnamedBranchesView(nodeResult);
		if (options.autoPrune) {
			log(
				chalk.cyan(
					`Auto-prune Result: was tree rebuilt?: ${chalk.green(
						modResult !== result
					)}`
				)
			);
		}
		div();
		// if (options.showPrunedTree) {
		// 	logNavString(navString);
		// 	const prunedResult = result.prune();
		// 	logGroupsRecNav(prunedResult);
		// 	div();
		// 	logHasUnnamedBranchesView(prunedResult);
		// 	log(
		// 		chalk.cyan(
		// 			`Prune Result: was tree rebuilt?: ${chalk.green(
		// 				prunedResult !== result
		// 			)}`
		// 		)
		// 	);
		// 	div();
		// }
	}
};
