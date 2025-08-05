import { GroupMatch } from "./group-match";
import {
	GroupMatchNav,
	GroupMatchNavList,
	GroupName,
} from "./group-nav";
import { MutMatchNav } from "./nav";

export class GroupMatchAny {
	#_matchers: GroupMatch[];

	private constructor(matchers: GroupMatch[]) {
		this.#_matchers = matchers.slice(); // defensive copy
	}

	public static from(
		matchers: GroupMatch[]
	): GroupMatchAny {
		return new GroupMatchAny(matchers);
	}

	public match(nav: MutMatchNav): GroupMatchNav | null {
		nav.assertNavIsValid();
		for (const matcher of this.#_matchers) {
			const result = matcher.match(nav.copy());
			if (result) {
				return result;
			}
		}
		return null;
	}
}

export class GroupMatchAll {
	#_matchers: GroupMatch[];
	#_groupName: GroupName;

	private constructor(
		groupName: GroupName,
		matchers: GroupMatch[]
	) {
		this.#_groupName = groupName;
		this.#_matchers = matchers.slice(); // defensive copy
	}

	public static fromUnnamed(
		matchers: GroupMatch[]
	): GroupMatchAll {
		return new GroupMatchAll(GroupName.empty, matchers);
	}

	public static fromNamed(
		groupName: GroupName,
		matchers: GroupMatch[]
	): GroupMatchAll {
		return new GroupMatchAll(groupName, matchers);
	}

	public match(
		nav: MutMatchNav
	): GroupMatchNavList | null {
		nav.assertNavIsValid();
		nav.assertNavIsNew();
		const orgNav = nav.copy();
		const savedNavs: GroupMatchNav[] = [];
		let curNav = nav.copy();
		const matchersLength = this.#_matchers.length;
		for (let i = 0; i < matchersLength; i++) {
			const matcher = this.#_matchers[i];
			const result = matcher.match(curNav);
			if (!result) {
				return null;
			}
			savedNavs.push(result);
			curNav = result.nav.copy();
		}
		return GroupMatchNavList.fromNamed(
			this.#_groupName,
			savedNavs
		);
	}
}
