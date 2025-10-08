import { GroupMatchNav } from "./group-nav";

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
