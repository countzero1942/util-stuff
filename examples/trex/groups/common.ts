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
	const tab = " ┊ ";
	const indentStr = chalk.blackBright(tab.repeat(indent));
	const indexStr = index < 0 ? "" : `[${chalk.cyan(index)}]: `;
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

export const removeUnnamedBranches = (
	group: GroupMatchNav,
	namedAncestor: GroupMatchNav | null
): GroupMatchNav => {
	// case: named group
	if (group.isNamed) {
		// case: named branch
		if (group.isBranch) {
			// note: root group nav has a null named ancestor
			if (namedAncestor) {
				namedAncestor.addChild(group);
			}
			const newNamedAncestor = GroupMatchNav.fromConstructableBranch(
				group.groupName,
				namedAncestor
			);
			const wholeMatchNav = group.wholeMatchNav;
			for (const child of group.children) {
				removeUnnamedBranches(child, newNamedAncestor);
			}
			newNamedAncestor.seal(wholeMatchNav);
			return newNamedAncestor;
		} else {
			// case: named leaf
			if (!namedAncestor) {
				throw new Error("Named ancestor not found");
			}
			namedAncestor.addChild(group);
			return namedAncestor;
		}
	}
	// case: unnamed group
	else {
		if (!namedAncestor) {
			throw new Error("Named ancestor not found");
		}
		// case: unnamed branch
		if (group.isBranch) {
			for (const child of group.children) {
				removeUnnamedBranches(child, namedAncestor);
			}
			return namedAncestor;
		}
		// case: unnamed leaf
		else {
			throw new Error("Unnamed leaf not expected");
		}
	}
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
		const result = matcher.match(nav, null);
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
		div();
		log(chalk.cyan(`Nav string: ${getNavStringView(navString)}`));
		logGroupsRec(removeUnnamedBranches(result, null));
	}
	div();
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
