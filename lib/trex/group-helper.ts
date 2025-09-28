import { log } from "console";
import { GroupMatchNav } from "./group-nav";
import chalk from "chalk";
import { TabCacher } from "@/utils/string";

export const logGroupsRec = (rootGroup: GroupMatchNav) => {
	const tabCacher = TabCacher.default;

	for (const { group, index, indent } of rootGroup) {
		const indentStr = chalk.blackBright(tabCacher.getTab(indent));
		const indexStr = group.isRoot ? "" : `[${chalk.cyan(index)}]: `;
		log(
			indentStr +
				indexStr +
				group.toString() +
				`${chalk.gray(" ── ")}` +
				`[${chalk.cyan(group.noEndMatchNav.startIndex)}` +
				`..${chalk.cyan(group.noEndMatchNav.captureIndex)}]`
		);
	}
};

export function addResultToParent(
	result: GroupMatchNav,
	parent: GroupMatchNav
): void {
	// case: unnamed group match
	if (result.groupName.isEmpty()) {
		// case: unnamed leaf match: don't add to parent
		if (result.isLeaf) {
			return;
		}

		// case: unnamed branch match: add children to parent
		// Note: upshuffling method not used
		// for (const child of result.children) {
		// 	if (child.groupName.isNotEmpty()) {
		// 		parent.addChild(child);
		// 	}
		// }

		// case: unnamed branch match: add branch to parent
		parent.addChild(result);
		return;
	}

	// case: named group match: add leaf or branch to parent
	parent.addChild(result);
}

export const hasUnnamedBranches = (group: GroupMatchNav) => {
	if (group.isNamed) {
		for (const child of group.children) {
			if (child.isBranch) {
				const b = hasUnnamedBranches(child);
				if (b) {
					return true;
				}
			}
		}
		return false;
	}
	return true;
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
