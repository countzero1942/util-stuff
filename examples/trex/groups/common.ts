import { GroupMatchNav } from "@/trex";
import { log, divs } from "@/utils/log";
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
