import { TabCacher } from "@/utils/string";
import { GroupName } from "./group-name";
import { MatchNav } from "./nav";
import chalk from "chalk";
import { log } from "@/utils/log";

/**
 * Minimal common shape for navigation trees used by generic utilities.
 *
 * Note: TypeScript uses structural typing, so classes do not need to explicitly
 * `implements` this interface as long as they have these members.
 */
export interface GroupNavLike<T> {
	/** Name/metadata of the group; secret names
	 * ("@...") are treated as unnamed.
	 */
	groupName: GroupName;
	/** Whole contiguous match for the node; not required by all utilities,
	 * but part of the common shape.
	 */
	wholeMatchNav: MatchNav;
	/** Homogeneous children (same concrete type as the
	 * parent in practice).
	 */
	children: readonly T[];
	/**
	 * Whether the node is a leaf (has no children).
	 */
	isLeaf: boolean;
	/**
	 * Whether the node is a branch (has one or more children).
	 */
	isBranch: boolean;

	[Symbol.iterator](): Generator<{
		group: T;
		index: number;
		indent: number;
	}>;
}

export function logGroupsRecNav<T extends GroupNavLike<T>>(rootGroup: T) {
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
				`[${chalk.cyan(group.wholeMatchNav.startIndex)}` +
				`..${chalk.cyan(group.wholeMatchNav.captureIndex)}]`
		);
	}
}

/**
 * Depth-first, pre-order traversal applying a callback to each node.
 * Mirrors the semantics of GroupMatchNav.forEach.
 */
export function forEachNav<T extends GroupNavLike<T>>(
	root: T,
	fn: (group: T, index: number, indent: number) => void
): void {
	const forEachRec = (node: T, index: number, indent: number) => {
		fn(node, index, indent);
		node.children.forEach((child, childIndex) => {
			forEachRec(child as T, childIndex, indent + 1);
		});
	};
	forEachRec(root, 0, 0);
}

/**
 * Collects nodes that satisfy a predicate. Mirrors GroupMatchNav.filter.
 */
export function filterNav<T extends GroupNavLike<T>>(
	root: T,
	pred: (group: T) => boolean
): T[] {
	const out: T[] = [];
	forEachNav(root, g => {
		if (pred(g)) out.push(g);
	});
	return out;
}

/**
 * Generic version of hasUnnamedBranches.
 * Semantics align with the existing GroupMatchNav-based implementation:
 * - Leaves return false.
 * - Root is treated as effectively named regardless of its name.
 * - Only recurses into branches.
 * - Returns true if any non-root branch has a GroupName that is not empty (i.e., isEmpty || isSecret) per GroupName semantics.
 */
export function hasUnnamedBranchesNav<T extends GroupNavLike<T>>(
	root: T
): boolean {
	// const isBranch = (node: T) => node.children.length > 0;

	const hasUnnamedBranchesRec = (node: T): boolean => {
		// Leaves cannot be unnamed branches
		if (node.isLeaf) return false;

		// Named branch (or unnamed root treated as named)
		if (node.groupName.isNotEmpty || node === root) {
			for (const child of node.children as readonly T[]) {
				if (child.isBranch && hasUnnamedBranchesRec(child)) {
					return true;
				}
			}
			return false;
		}

		// Unnamed non-root branch: trigger point
		return true;
	};

	return hasUnnamedBranchesRec(root);
}
