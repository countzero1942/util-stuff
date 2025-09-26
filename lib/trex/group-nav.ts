import { MutMatchNav } from "./nav";
import { GroupName } from "./group-name";
import chalk from "chalk";
import { parentPort } from "worker_threads";
import { GroupMatchBase } from "./group-match";

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
		this.#_children = children;
		this.#_isConstructed = isConstructed;
		this.#_wholeMatchNav = wholeMatchNav;
		this.#_parent = parent;
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
		// child.#_parent = this;
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
			if (current.groupName.isNotEmpty()) {
				return current;
			}
			if (current.#_parent === null) {
				return current;
			}
			current = current.#_parent;
		}
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
		return (
			`${chalk.magentaBright("GroupNav: ")}` +
			`${"<" + chalk.blueBright(this.groupName.toString()) + ">"} ` +
			`'${chalk.green(this.#_wholeMatchNav.captureMatch.value)}' ` +
			`+[${chalk.cyan(this.#_children.length)}]`
		);
	}
}
