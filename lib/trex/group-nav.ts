import { MutMatchNav } from "./nav";

export class GroupName {
	private constructor(
		public readonly name: string,
		public readonly category: string | undefined
	) {}

	public static fromName(name: string): GroupName {
		if (name === "") {
			throw new Error("'name' cannot be empty");
		}
		return new GroupName(name, undefined);
	}

	public static fromNameAndCategory(
		name: string,
		category: string
	): GroupName {
		if (name === "") {
			throw new Error("'name' cannot be empty");
		}
		if (category === "") {
			throw new Error("'category' cannot be empty");
		}
		return new GroupName(name, category);
	}

	private static _empty: GroupName = new GroupName(
		"",
		undefined
	);
	public static get empty(): GroupName {
		return GroupName._empty;
	}

	public isEmpty(): boolean {
		return this.name === "";
	}

	public isNotEmpty(): boolean {
		return this.name !== "";
	}

	public is(
		name: string,
		category: string | undefined = undefined
	): boolean {
		return (
			this.name === name && this.category === category
		);
	}

	public isGroupName(groupName: GroupName): boolean {
		return (
			this === groupName ||
			(this.name === groupName.name &&
				this.category === groupName.category)
		);
	}

	public toString(): string {
		return `${this.name}${this.category ? ":" + this.category : ""}`;
	}
}

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
	private static _defaultChildren: readonly GroupMatchNav[] =
		[];

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
		return new GroupMatchNav(
			groupName,
			wholeMatchNav,
			children
		);
	}

	// public copy(): GroupMatchNav {
	// 	return new GroupMatchNav(
	// 		this.groupName,
	// 		this.nav.copy()
	// 	);
	// }

	public toString(): string {
		return `${this.groupName.toString()} ${this.wholeMatchNav.toString()} [${this.children.length}]`;
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
