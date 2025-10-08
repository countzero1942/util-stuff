import { log } from "console";
import { GroupMatchNav } from "./group-nav";
import chalk from "chalk";
import { TabCacher } from "@/utils/string";
import { GroupMatchNavNode } from "./group-nav-ex";

export const logGroupsRec = (rootGroup: GroupMatchNav) => {
	const tabCacher = TabCacher.default;

	for (const { group, index, indent } of rootGroup) {
		const indentStr = chalk.blackBright(tabCacher.getTab(indent));
		const indexStr =
			group === rootGroup ? "" : `[${chalk.cyan(index)}]: `;
		log(
			indentStr +
				indexStr +
				group.toString() +
				`${chalk.gray(" ── ")}` +
				`[${chalk.cyan(group.contentMatchNav.startIndex)}` +
				`..${chalk.cyan(group.contentMatchNav.captureIndex)}]`
		);
	}
};

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

		// case: unnamed branch match: add children to parent
		// Note: upshuffling method not used
		// for (const child of result.children) {
		// 	if (child.groupName.isNotEmpty()) {
		// 		parent.addChild(child);
		// 	}
		// }

		// case: unnamed branch match: add branch to parent
		parentNavs.push(result);
		return;
	}

	// case: named group match: add leaf or branch to parent
	parentNavs.push(result);
}

export function addResultToParentOld(
	result: GroupMatchNavNode,
	parent: GroupMatchNavNode
): void {
	// case: unnamed group match
	if (result.groupName.isEmpty) {
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

export const hasUnnamedBranches = (rootGroup: GroupMatchNav) => {
	const hasUnnamedBranchesRec = (group: GroupMatchNav) => {
		if (
			group.isBranch &&
			(group.groupName.isNotEmpty || group === rootGroup)
		) {
			for (const child of group.children) {
				if (child.isBranch) {
					const b = hasUnnamedBranchesRec(child);
					if (b) {
						return true;
					}
				}
			}
			return false;
		}
		return true;
	};

	return hasUnnamedBranchesRec(rootGroup);
};

// export const removeUnnamedBranches = (
// 	rootGroup: GroupMatchNav
// ): GroupMatchNav => {
// 	const removeUnnamedBranchesRec = (
// 		group: GroupMatchNav,
// 		namedAncestorChildren: GroupMatchNav[] | null
// 	) => {
// 		// case: named group
// 		if (group.groupName.isNotEmpty || group === rootGroup) {
// 			// case: named branch
// 			if (group.isBranch) {
// 				// note: root group nav has a null named ancestor
// 				if (namedAncestorChildren) {
// 					// namedAncestor.addChild(group);
// 					namedAncestorChildren.push(group);
// 				}
// 				const newNamedAncestorChildren: GroupMatchNav[] = [];
// 				// const wholeMatchNav = group.wholeMatchNav;
// 				for (const child of group.children) {
// 					removeUnnamedBranchesRec(child, newNamedAncestorChildren);
// 				}
// 				// newNamedAncestor.seal(wholeMatchNav);
// 				// return newNamedAncestor;
// 				return GroupMatchNav.fromBranch(
// 					group.wholeMatchNav,
// 					group.groupName,
// 					newNamedAncestorChildren
// 				);
// 			} else {
// 				// case: named leaf
// 				if (!namedAncestorChildren) {
// 					throw new Error("Named ancestor not found");
// 				}
// 				// namedAncestor.addChild(group);
// 				// return namedAncestor;
// 			}
// 		}
// 		// case: unnamed group
// 		else {
// 			if (!namedAncestor) {
// 				throw new Error("Named ancestor not found");
// 			}
// 			// case: unnamed branch
// 			if (group.isBranch) {
// 				for (const child of group.children) {
// 					removeUnnamedBranches(child, namedAncestor);
// 				}
// 				return namedAncestor;
// 			}
// 			// case: unnamed leaf
// 			else {
// 				throw new Error("Unnamed leaf not expected");
// 			}
// 		}
// 	};

// 	return removeUnnamedBranchesRec(rootGroup, null);
// };

/**
 * Alternative implementation that rebuilds a GroupMatchNav tree while
 * pruning all unnamed (and secret-named) branches. The root is treated as
 * effectively named even if its name is empty/secret to preserve the tree root.
 *
 * Rules:
 * - Named branch: rebuilt with only named descendants (flattening through unnamed branches).
 * - Named leaf: kept as-is.
 * - Unnamed branch: not kept; its named descendants (branches/leaves) are lifted up
 *   into the nearest named ancestor's children (flattened).
 * - Unnamed leaf: pruned.
 */
export const removeUnnamedBranchesAlt = (
	rootGroup: GroupMatchNav
): GroupMatchNav => {
	function isEffectivelyNamed(group: GroupMatchNav): boolean {
		// Treat the root as named even if its GroupName is empty/secret
		return group.groupName.isNotEmpty || group === rootGroup;
	}

	// Collects named results into targetChildren, flattening through unnamed branches
	function collectInto(
		group: GroupMatchNav,
		targetChildren: GroupMatchNav[]
	): void {
		if (isEffectivelyNamed(group)) {
			if (group.isBranch) {
				const rebuilt = rebuildNamedBranch(group);
				targetChildren.push(rebuilt);
			} else {
				// named leaf
				targetChildren.push(
					GroupMatchNav.fromLeaf(group.wholeMatchNav, group.groupName)
				);
			}
		} else {
			// unnamed group
			if (group.isBranch) {
				for (const child of group.children) {
					collectInto(child, targetChildren);
				}
			} else {
				// unnamed leaf: prune
			}
		}
	}

	function rebuildNamedBranch(namedGroup: GroupMatchNav): GroupMatchNav {
		const rebuiltChildren: GroupMatchNav[] = [];
		for (const child of namedGroup.children) {
			collectInto(child, rebuiltChildren);
		}
		if (rebuiltChildren.length === 0) {
			return GroupMatchNav.fromLeaf(
				namedGroup.wholeMatchNav,
				namedGroup.groupName
			);
		}
		return GroupMatchNav.fromBranch(
			namedGroup.wholeMatchNav,
			namedGroup.groupName,
			rebuiltChildren
		);
	}

	// Rebuild root
	if (isEffectivelyNamed(rootGroup)) {
		if (rootGroup.isBranch) {
			const newChildren: GroupMatchNav[] = [];
			for (const child of rootGroup.children) {
				collectInto(child, newChildren);
			}
			if (newChildren.length === 0) {
				return GroupMatchNav.fromLeaf(
					rootGroup.wholeMatchNav,
					rootGroup.groupName
				);
			}
			return GroupMatchNav.fromBranch(
				rootGroup.wholeMatchNav,
				rootGroup.groupName,
				newChildren
			);
		}
		return GroupMatchNav.fromLeaf(
			rootGroup.wholeMatchNav,
			rootGroup.groupName
		);
	}

	// Root unnamed but treated as effectively named: lift named descendants
	const newChildren: GroupMatchNav[] = [];
	for (const child of rootGroup.children) {
		collectInto(child, newChildren);
	}
	return GroupMatchNav.fromBranch(
		rootGroup.wholeMatchNav,
		rootGroup.groupName,
		newChildren
	);
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
