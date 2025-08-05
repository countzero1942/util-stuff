import { MutMatchNav } from "./nav";

export class GroupName {
	public constructor(
		public readonly name: string,
		public readonly category: string | undefined
	) {}

	public static fromName(name: string): GroupName {
		return new GroupName(name, undefined);
	}

	public static fromNameAndCategory(
		name: string,
		category: string
	): GroupName {
		return new GroupName(name, category);
	}

	public static get empty(): GroupName {
		return new GroupName("", undefined);
	}

	public isEmpty(): boolean {
		return (
			this.name === "" && this.category === undefined
		);
	}
}

export class GroupMatchNav {
	protected constructor(
		public readonly groupName: GroupName,
		public readonly nav: MutMatchNav
	) {}

	public static from(
		nav: MutMatchNav,
		groupName: GroupName
	): GroupMatchNav {
		return new GroupMatchNav(groupName, nav);
	}

	public copy(): GroupMatchNav {
		return new GroupMatchNav(
			this.groupName,
			this.nav.copy()
		);
	}
}

export class GroupMatchNavList {
	#_navs: GroupMatchNav[];
	#_groupName: GroupName;

	private constructor(
		groupName: GroupName,
		navs: GroupMatchNav[]
	) {
		this.#_groupName = groupName;
		this.#_navs = navs.slice(); // defensive copy
	}

	public static fromUnnamed(
		navs: GroupMatchNav[]
	): GroupMatchNavList {
		return new GroupMatchNavList(GroupName.empty, navs);
	}

	public static fromNamed(
		groupName: GroupName,
		navs: GroupMatchNav[]
	): GroupMatchNavList {
		return new GroupMatchNavList(groupName, navs);
	}

	public get navs(): readonly GroupMatchNav[] {
		return this.#_navs;
	}

	public get groupName(): GroupName {
		return this.#_groupName;
	}
}
