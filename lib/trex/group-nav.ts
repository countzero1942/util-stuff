import { MutMatchNav } from "./nav";
import { GroupName } from "./group-name";
import chalk from "chalk";

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
	private static _defaultChildren: readonly GroupMatchNav[] = [];

	protected constructor(
		public readonly groupName: GroupName,
		public readonly wholeMatchNav: MutMatchNav,
		public readonly children: readonly GroupMatchNav[] = GroupMatchNav._defaultChildren
	) {}

	public static from(
		wholeMatchNav: MutMatchNav,
		groupName: GroupName
	): GroupMatchNav {
		return new GroupMatchNav(groupName, wholeMatchNav);
	}

	public static fromChildren(
		wholeMatchNav: MutMatchNav,
		groupName: GroupName,
		children: readonly GroupMatchNav[]
	): GroupMatchNav {
		return new GroupMatchNav(groupName, wholeMatchNav, children);
	}

	public get isLeaf(): boolean {
		return this.children.length === 0;
	}

	public get isBranch(): boolean {
		return this.children.length > 0;
	}

	public get noEndMatchNav(): MutMatchNav {
		const length = this.children.length;
		if (length >= 1) {
			const potentialEnd = this.children[length - 1];
			if (potentialEnd.groupName.isGroupName(GroupName.end)) {
				return this.wholeMatchNav.copyAndShrinkCapture(
					potentialEnd.wholeMatchNav.captureLength
				);
			}
		}
		return this.wholeMatchNav;
	}

	// public copy(): GroupMatchNav {
	// 	return new GroupMatchNav(
	// 		this.groupName,
	// 		this.nav.copy()
	// 	);
	// }

	public toString(): string {
		return (
			`${chalk.magentaBright("GroupNav: ")}` +
			`${"<" + chalk.blueBright(this.groupName.toString()) + ">"} ` +
			`'${chalk.green(this.wholeMatchNav.captureMatch.value)}' ` +
			`+[${chalk.cyan(this.children.length)}]`
		);
	}
}

// export class GroupMatchNavList {
// 	#_navs: GroupMatchNav[];
// 	#_groupName: GroupName;
// 	#_wholeNav: MutMatchNav;

// 	private constructor(
// 		groupName: GroupName,
// 		navs: GroupMatchNav[],
// 		wholeMatchNav: MutMatchNav
// 	) {
// 		this.#_groupName = groupName;
// 		this.#_navs = navs.slice(); // defensive copy
// 		if (wholeMatchNav.isInvalidated) {
// 			throw new Error(
// 				"GroupMatchNavList.constructor: wholeMatchNav is invalidated"
// 			);
// 		}
// 		this.#_wholeNav = wholeMatchNav;
// 	}

// 	public static fromUnnamed(
// 		navs: GroupMatchNav[],
// 		wholeMatchNav: MutMatchNav
// 	): GroupMatchNavList {
// 		return new GroupMatchNavList(
// 			GroupName.empty,
// 			navs,
// 			wholeMatchNav
// 		);
// 	}

// 	public static fromNamed(
// 		groupName: GroupName,
// 		navs: GroupMatchNav[],
// 		wholeMatchNav: MutMatchNav
// 	): GroupMatchNavList {
// 		return new GroupMatchNavList(
// 			groupName,
// 			navs,
// 			wholeMatchNav
// 		);
// 	}

// 	public get navs(): readonly GroupMatchNav[] {
// 		return this.#_navs;
// 	}

// 	public get groupName(): GroupName {
// 		return this.#_groupName;
// 	}

// 	public get wholeMatchNav(): MutMatchNav {
// 		return this.#_wholeNav;
// 	}
// }
