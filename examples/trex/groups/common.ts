import { GroupMatchBase, GroupMatchNav, MutMatchNav } from "@/trex";
import { log, divs, div, logh, loghn } from "@/utils/log";
import chalk from "chalk";

export const logGroups = (
	navString: string,
	group: GroupMatchNav | null
) => {
	if (!group) {
		log(
			`${chalk.yellow("No match for navString:")}` +
				` '${chalk.green(navString)}'`
		);
		return;
	}
	if (group.groupName.isNotEmpty()) {
		log(
			group.toString() +
				`${chalk.gray(" ── ")}` +
				`[${chalk.cyan(group.noEndMatchNav.startIndex)}` +
				`..${chalk.cyan(group.noEndMatchNav.captureIndex)}]`
		);
		divs();
	}
	group.children.forEach((child, index) => {
		log(
			`[${chalk.cyan(index)}]: ${child.toString()} ` +
				`${chalk.gray("── ")}` +
				`[${chalk.cyan(child.wholeMatchNav.startIndex)}` +
				`..${chalk.cyan(child.wholeMatchNav.captureIndex)}]`
		);
	});
};

export const logGroupsRec = (
	group: GroupMatchNav | null,
	index: number = -1,
	indent: number = 0
) => {
	if (!group) {
		return;
	}
	// const tab = "┣━━";
	const tab = " ┊ ";
	const indentStr = chalk.blackBright(tab.repeat(indent));
	const indexStr = index < 0 ? "" : `[${chalk.cyan(index)}]: `;
	// if (group.groupName.isNotEmpty()) {
	// 	log(
	// 		indentStr +
	// 			indexStr +
	// 			group.toString() +
	// 			`${chalk.gray(" ── ")}` +
	// 			`[${chalk.cyan(group.noEndMatchNav.startIndex)}` +
	// 			`..${chalk.cyan(group.noEndMatchNav.captureIndex)}]`
	// 	);
	// }
	log(
		indentStr +
			indexStr +
			group.toString() +
			`${chalk.gray(" ── ")}` +
			`[${chalk.cyan(group.noEndMatchNav.startIndex)}` +
			`..${chalk.cyan(group.noEndMatchNav.captureIndex)}]`
	);

	group.children.forEach((child, index) => {
		logGroupsRec(child, index, indent + 1);
	});
};

export const logResults = (
	successStrings: string[],
	failStrings: string[],
	matcher: GroupMatchBase
) => {
	const getNavStringView = (navString: string) => {
		return chalk.white(`'${chalk.green(navString)}'`);
	};

	logh("Success cases");

	for (const navString of successStrings) {
		const nav = MutMatchNav.fromString(navString);
		const result = matcher.match(nav);
		div();
		if (!result) {
			log(
				chalk.red(
					`>>> FAILED TO MATCH SUCCESS CASE: ${getNavStringView(navString)} <<< `
				)
			);
			continue;
		}
		log(chalk.cyan(`Nav string: ${getNavStringView(navString)}`));
		logGroupsRec(result);
	}
	div();
	logh("Fail cases");
	for (const pair of failStrings) {
		const [navString, msg] = pair.split("->");
		const nav = MutMatchNav.fromString(navString);
		const result = matcher.match(nav);
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
