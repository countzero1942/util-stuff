import { log } from "console";
import { GroupMatchNav } from "./group-nav";
import chalk from "chalk";
import { TabCacher } from "@/utils/string";
import { GroupMatchNavNode } from "./group-nav-node";

// export const logGroupsRec = (rootGroup: GroupMatchNav) => {
// 	const tabCacher = TabCacher.default;

// 	for (const { group, index, indent } of rootGroup) {
// 		const indentStr = chalk.blackBright(tabCacher.getTab(indent));
// 		const indexStr =
// 			group === rootGroup ? "" : `[${chalk.cyan(index)}]: `;
// 		log(
// 			indentStr +
// 				indexStr +
// 				group.toString() +
// 				`${chalk.gray(" ── ")}` +
// 				`[${chalk.cyan(group.contentMatchNav.startIndex)}` +
// 				`..${chalk.cyan(group.contentMatchNav.captureIndex)}]`
// 		);
// 	}
// };

export function addResultToParent(
	result: GroupMatchNav,
	parentNavs: GroupMatchNav[]
): void {
	// case: unnamed group match
	if (result.groupName.isEmpty) {
		// case: unnamed leaf match: don't add to parent
		if (result.isLeaf) {
			return;
		}

		// case: unnamed branch match: add branch to parent
		parentNavs.push(result);
		return;
	}

	// case: named group match: add leaf or branch to parent
	parentNavs.push(result);
}

// export const hasUnnamedBranches = (rootGroup: GroupMatchNav) => {
// 	const hasUnnamedBranchesRec = (group: GroupMatchNav) => {
// 		// case: leaf; return false and continue search
// 		if (group.isLeaf) {
// 			return false;
// 		}

// 		// case: named branch (or unnamed root which is effectively a named branch)
// 		if (group.groupName.isNotEmpty || group === rootGroup) {
// 			// loop through branch children
// 			for (const child of group.children) {
// 				// case: consider branches only
// 				if (child.isBranch) {
// 					// case: unnamed branch: end search; otherwise continue
// 					if (hasUnnamedBranchesRec(child)) {
// 						return true;
// 					}
// 				}
// 			}
// 			// case: exhausted all branches in tree finding no unnamed branch
// 			return false;
// 		}
// 		// case: unnamed group: end search; this is the trigger point
// 		return true;
// 	};

// 	return hasUnnamedBranchesRec(rootGroup);
// };

export const removeUnnamedBranches = (
	rootGroup: GroupMatchNav
): GroupMatchNav => {
	const rebuildBranchesRec = (
		group: GroupMatchNav,
		namedAncestorChildren: GroupMatchNav[]
	): void => {
		// case: named group
		if (group.groupName.isNotEmpty || group === rootGroup) {
			// case: named branch
			if (group.isBranch) {
				// rebuild branch
				const newNamedAncestorChildren: GroupMatchNav[] = [];
				for (const child of group.children) {
					rebuildBranchesRec(child, newNamedAncestorChildren);
				}

				// add branch to parent
				const newNamedBranch = GroupMatchNav.fromBranch(
					group.wholeMatchNav,
					group.groupName,
					newNamedAncestorChildren
				);
				namedAncestorChildren.push(newNamedBranch);
			}
			// case: named leaf
			else {
				namedAncestorChildren.push(group);
			}
		}
		// case: unnamed group
		else {
			// case: unnamed branch
			if (group.isBranch) {
				// add nodes to named ancestor
				for (const child of group.children) {
					rebuildBranchesRec(child, namedAncestorChildren);
				}
			}
			// case: unnamed leaf, already pruned: never
			else {
				throw new Error("Unnamed leaf not expected");
			}
		}
	};

	const namedAncestorChildren: GroupMatchNav[] = [];
	rebuildBranchesRec(rootGroup, namedAncestorChildren);

	// return root
	return namedAncestorChildren[0];
};

export const convertGroupNavsToNodes = (
	groupRoot: GroupMatchNav
): GroupMatchNavNode => {
	const convertBranchToNodeRec = (
		group: GroupMatchNav,
		groupNode: GroupMatchNavNode
	): void => {
		for (const child of group.children) {
			if (child.isBranch) {
				const newGroupNode = GroupMatchNavNode.fromConstructableBranch(
					child.groupName,
					groupNode
				);
				convertBranchToNodeRec(child, newGroupNode);
				newGroupNode.seal(child.wholeMatchNav);
				groupNode.addChild(newGroupNode);
			} else {
				const newLeafNode = GroupMatchNavNode.fromLeaf(
					child.groupName,
					child.wholeMatchNav,
					groupNode
				);
				groupNode.addChild(newLeafNode);
			}
		}
	};

	const rootGroupNode = GroupMatchNavNode.fromConstructableBranch(
		groupRoot.groupName,
		null
	);
	convertBranchToNodeRec(groupRoot, rootGroupNode);
	rootGroupNode.seal(groupRoot.wholeMatchNav);
	return rootGroupNode;
};

export const removeUnnamedBranchesNode = (
	group: GroupMatchNavNode,
	namedAncestor: GroupMatchNavNode | null
): GroupMatchNavNode => {
	// case: named group
	if (group.isNamed) {
		// case: named branch
		if (group.isBranch) {
			// note: root group nav has a null named ancestor
			if (namedAncestor) {
				namedAncestor.addChild(group);
			}
			const newNamedAncestor =
				GroupMatchNavNode.fromConstructableBranch(
					group.groupName,
					namedAncestor
				);
			const wholeMatchNav = group.wholeMatchNav;
			for (const child of group.children) {
				removeUnnamedBranchesNode(child, newNamedAncestor);
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
				removeUnnamedBranchesNode(child, namedAncestor);
			}
			return namedAncestor;
		}
		// case: unnamed leaf
		else {
			throw new Error("Unnamed leaf not expected");
		}
	}
};
