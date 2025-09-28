import { MutMatchNav } from "./nav";
import { GroupName } from "./group-name";
import chalk from "chalk";
import { parentPort } from "worker_threads";
import { GroupMatchBase } from "./group-match";
import { removeUnnamedBranches } from "./group-helper";

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
export class GroupMatchNav {
	private static _defaultChildren: GroupMatchNav[] = [];

	#_children: GroupMatchNav[];
	#_isConstructed: boolean;
	#_wholeMatchNav: MutMatchNav;
	#_parent: GroupMatchNav | null = null;

	protected constructor(
		public readonly groupName: GroupName,
		wholeMatchNav: MutMatchNav,
		parent: GroupMatchNav | null,
		children: GroupMatchNav[],
		isConstructed: boolean
	) {
		this.#_wholeMatchNav = wholeMatchNav;
		this.#_parent = parent;
		this.#_children = children;
		this.#_isConstructed = isConstructed;
	}

	static fromLeaf(
		wholeMatchNav: MutMatchNav,
		groupName: GroupName,
		parent: GroupMatchNav | null
	): GroupMatchNav {
		return new GroupMatchNav(
			groupName,
			wholeMatchNav,
			parent,
			GroupMatchNav._defaultChildren,
			true
		);
	}

	static fromBranch(
		wholeMatchNav: MutMatchNav,
		groupName: GroupName,
		parent: GroupMatchNav | null,
		children: readonly GroupMatchNav[]
	): GroupMatchNav {
		return new GroupMatchNav(
			groupName,
			wholeMatchNav,
			parent,
			children as GroupMatchNav[],
			true
		);
	}

	static fromConstructableBranch(
		groupName: GroupName,
		parent: GroupMatchNav | null
	) {
		return new GroupMatchNav(
			groupName,
			MutMatchNav.fromString(""),
			parent,
			[],
			false
		);
	}

	addChild(child: GroupMatchNav) {
		if (this.#_isConstructed) {
			throw new Error(
				"Cannot add children to a constructed group match nav"
			);
		}
		child.#_parent = this;
		this.#_children.push(child);
	}

	seal(wholeMatchNav: MutMatchNav) {
		if (this.#_isConstructed) {
			throw new Error("Cannot seal a constructed group match nav");
		}
		this.#_wholeMatchNav = wholeMatchNav;
		this.#_isConstructed = true;
	}

	getFirstNamedAncestor(): GroupMatchNav {
		let current: GroupMatchNav = this;
		while (true) {
			if (current.groupName.isNotEmpty) {
				return current;
			}
			if (current.#_parent === null) {
				return current;
			}
			current = current.#_parent;
		}
	}

	prune(): GroupMatchNav {
		return removeUnnamedBranches(this, null);
	}

	forEach(
		fn: (group: GroupMatchNav, index: number, indent: number) => void
	) {
		const enumerateGroupsRec = (
			group: GroupMatchNav,
			groupIndex: number,
			indent: number
		) => {
			fn(group, groupIndex, indent);
			group.children.forEach((child, childIndex) => {
				enumerateGroupsRec(child, childIndex, indent + 1);
			});
		};

		enumerateGroupsRec(this, 0, 0);
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
		return this.#_children.length === 0;
	}

	get isBranch(): boolean {
		return this.#_children.length > 0;
	}

	get children(): readonly GroupMatchNav[] {
		return this.#_children;
	}

	get parent(): GroupMatchNav | null {
		return this.#_parent;
	}

	get isRoot(): boolean {
		return this.#_parent === null;
	}

	get isNamed(): boolean {
		// Note: the root group nav may or may not be named
		// but it is always included in the navigation tree
		// so even if unnamed it is considered to be named
		return this.#_parent === null || this.groupName.isNotEmpty;
	}

	get wholeMatchNav(): MutMatchNav {
		return this.#_wholeMatchNav;
	}

	get noEndMatchNav(): MutMatchNav {
		const length = this.#_children.length;
		if (length >= 1) {
			const potentialEnd = this.#_children[length - 1];
			if (potentialEnd.groupName.isGroupName(GroupName.end)) {
				return this.#_wholeMatchNav.copyAndShrinkCapture(
					potentialEnd.#_wholeMatchNav.captureLength
				);
			}
		}
		return this.#_wholeMatchNav;
	}

	toString(): string {
		const parentName =
			this.#_parent === null
				? chalk.blueBright(":null")
				: this.#_parent.groupName.isSecret
					? chalk.gray(this.#_parent.groupName.toString())
					: chalk.cyan(this.#_parent.groupName.toString());

		const groupName = this.groupName.isSecret
			? chalk.gray(this.groupName.toString())
			: chalk.blueBright(this.groupName.toString());

		return (
			`${chalk.magentaBright("GroupNav: ")}` +
			`${"<" + groupName + ">"} ` +
			`'${chalk.green(this.#_wholeMatchNav.captureMatch.value)}' ` +
			`+[${chalk.cyan(this.#_children.length)}] ` +
			`<${parentName}>`
		);
	}
}
