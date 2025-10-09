import { MatchNav } from "./nav";
import { GroupName } from "./group-name";
import chalk from "chalk";
import { parentPort } from "worker_threads";
import { GroupMatchBase } from "./group-match";
import { removeUnnamedBranches } from "./group-helper";
import {
	filterNav,
	hasUnnamedBranchesNav,
	type GroupNavLike,
} from "./group-nav-like";

/**
 * A group navigation node that contains a contiguous match
 * and potential child group matches.
 *
 * Group navigation nodes are created by group matchers.
 * They are used to split a match into parts, which can be named
 * or unnamed. Only named parts are added to the navigation tree.
 * Unnamed parts are skipped over.
 *
 * GroupMatch and GroupMatchAny produce a unit group match.
 *
 * GroupMatchAll and GroupMatchRepeat produce children of
 * named group matches. (The children can contain children producing
 * a navigation tree. A flattened GroupMatchAll will add all named
 * children to its parent's children.)
 *
 * @param groupName The name of the group.
 * @param wholeMatchNav The whole contiguous match.
 * @param children The child group matches.
 */
export class GroupMatchNav implements GroupNavLike<GroupMatchNav> {
	private static _defaultChildren: GroupMatchNav[] = [];

	protected _children: GroupMatchNav[];
	protected _wholeMatchNav: MatchNav;

	protected constructor(
		public readonly groupName: GroupName,
		wholeMatchNav: MatchNav,
		children: GroupMatchNav[]
	) {
		this._wholeMatchNav = wholeMatchNav;
		this._children = children;
	}

	static fromLeaf(
		wholeMatchNav: MatchNav,
		groupName: GroupName
	): GroupMatchNav {
		return new GroupMatchNav(
			groupName,
			wholeMatchNav,
			GroupMatchNav._defaultChildren
		);
	}

	static fromBranch(
		wholeMatchNav: MatchNav,
		groupName: GroupName,
		children: readonly GroupMatchNav[]
	): GroupMatchNav {
		return new GroupMatchNav(
			groupName,
			wholeMatchNav,
			children as GroupMatchNav[]
		);
	}

	// get hasUnnamedBranches(): boolean {
	// 	return hasUnnamedBranches(this);
	// }
	get hasUnnamedBranches(): boolean {
		return hasUnnamedBranchesNav<GroupMatchNav>(this);
	}

	prune(): GroupMatchNav {
		return this.hasUnnamedBranches ? removeUnnamedBranches(this) : this;
	}

	filter(fn: (group: GroupMatchNav) => boolean): GroupMatchNav[] {
		return filterNav<GroupMatchNav>(this, fn);
	}

	private static *genRec(args: {
		group: GroupMatchNav;
		index: number;
		indent: number;
	}): Generator<{ group: GroupMatchNav; index: number; indent: number }> {
		yield args;
		let index = 0;
		for (const child of args.group.children) {
			yield* GroupMatchNav.genRec({
				group: child,
				index,
				indent: args.indent + 1,
			});
			index++;
		}
	}

	*[Symbol.iterator](): Generator<{
		group: GroupMatchNav;
		index: number;
		indent: number;
	}> {
		yield* GroupMatchNav.genRec({
			group: this,
			index: 0,
			indent: 0,
		});
	}

	get isLeaf(): boolean {
		return this._children.length === 0;
	}

	get isBranch(): boolean {
		return this._children.length > 0;
	}

	get children(): readonly GroupMatchNav[] {
		return this._children;
	}

	get wholeMatchNav(): MatchNav {
		return this._wholeMatchNav;
	}

	/**
	 * Returns whole match nav without the `:end` group match nav.
	 * If there is no `:end` group match nav, returns the whole match nav.
	 *
	 * When using `GroupSplitter`, the `:end` group match nav is used to
	 * collect a delimiter. And so it is not desirable to be included in the content.
	 *
	 * @returns The content match nav.
	 */
	get contentMatchNav(): MatchNav {
		const length = this._children.length;
		if (length >= 1) {
			const potentialEnd = this._children[length - 1];
			if (potentialEnd.groupName.isGroupName(GroupName.end)) {
				return this._wholeMatchNav.shrinkCapture(
					potentialEnd._wholeMatchNav.captureLength
				);
			}
		}
		return this._wholeMatchNav;
	}

	toString(): string {
		const groupName = this.groupName.isSecret
			? chalk.gray(this.groupName.toString())
			: chalk.blueBright(this.groupName.toString());

		return (
			`${chalk.magentaBright("GroupNav: ")}` +
			`${"<" + groupName + ">"} ` +
			`'${chalk.green(this.contentMatchNav.captureMatch.value)}' ` +
			`+[${chalk.cyan(this._children.length)}]`
		);
	}
}
