import { GroupMatch, GroupMatchBase } from "./group-match";
import { GroupMatchNav, GroupName } from "./group-nav";
import { MutMatchNav } from "./nav";

export class GroupMatchAny extends GroupMatchBase {
	#_matchers: GroupMatchBase[];

	protected constructor(
		groupName: GroupName,
		matchers: GroupMatchBase[]
	) {
		super(groupName);
		this.#_matchers = matchers.slice(); // defensive copy
	}

	public static fromUnnamed(
		...matchers: GroupMatchBase[]
	): GroupMatchAny {
		return new GroupMatchAny(GroupName.empty, matchers);
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

export class GroupMatchAll extends GroupMatchBase {
	#_matchers: GroupMatchBase[];
	#_groupName: GroupName;

	protected constructor(
		groupName: GroupName,
		matchers: GroupMatchBase[]
	) {
		super(groupName);
		this.#_groupName = groupName;
		this.#_matchers = matchers.slice(); // defensive copy
	}

	public static fromUnnamed(
		...matchers: GroupMatchBase[]
	): GroupMatchAll {
		return new GroupMatchAll(GroupName.empty, matchers);
	}

	public static fromNamed(
		groupName: GroupName,
		...matchers: GroupMatchBase[]
	): GroupMatchAll {
		return new GroupMatchAll(groupName, matchers);
	}

	private static _flattenedGroupName =
		GroupName.fromName(":flattened");

	public static get flattenedGroupName(): GroupName {
		return GroupMatchAll._flattenedGroupName;
	}

	/**
	 * Creates a flattened GroupMatchAll with flattened group name.
	 *
	 * A flattened GroupMatchAll will add all child named matches to its parent's
	 * children matches.
	 *
	 * @param matchers The matchers to use.
	 * @returns A GroupMatchAll with the flattened group name.
	 */
	public static fromFlattened(
		...matchers: GroupMatchBase[]
	): GroupMatchAll {
		return new GroupMatchAll(
			GroupMatchAll._flattenedGroupName,
			matchers
		);
	}

	public isFlattened(): boolean {
		return this.#_groupName.isGroupName(
			GroupMatchAll.flattenedGroupName
		);
	}

	/**
	 * Adds a GroupMatchNav result to the savedNavs array based on the
	 * result's group name.
	 *
	 * If the result has a non-empty group name, it is added to the
	 * savedNavs array. (Match added to parent.)
	 *
	 * If the result has the flattened group name, its children are added
	 * to the savedNavs array. (Child matches added to parent's children.)
	 *
	 * If the result has an empty group name, nothing is added to the
	 * savedNavs array. (Unnamed group matches are ignored.)
	 *
	 * @param result The result to add.
	 * @param savedNavs The array to add the result to.
	 */
	public static addResultsToSavedNavs(
		result: GroupMatchNav,
		savedNavs: GroupMatchNav[]
	): void {
		// case: named group match: add potential branch
		if (result.groupName.isNotEmpty()) {
			savedNavs.push(result);
			return;
		}
		// case: flattened group match: add children to parent's children
		if (
			result.groupName.isGroupName(
				GroupMatchAll.flattenedGroupName
			)
		) {
			for (const child of result.children) {
				if (child.groupName.isNotEmpty()) {
					savedNavs.push(child);
				}
			}
			return;
		}
		// case: unnamed group match: do not include in savedNavs
		return;
	}

	public match(nav: MutMatchNav): GroupMatchNav | null {
		nav.assertNavIsValid();
		nav.assertNavIsNew();
		const firstNav = nav.copy();
		const savedNavs: GroupMatchNav[] = [];
		let curNav = nav.copy();
		const matchersLength = this.#_matchers.length;
		for (let i = 0; i < matchersLength; i++) {
			const matcher = this.#_matchers[i];
			const result = matcher.match(curNav);
			if (!result) {
				return null;
			}

			GroupMatchAll.addResultsToSavedNavs(
				result,
				savedNavs
			);

			curNav = result.wholeMatchNav
				.copy()
				.moveNext("MoveMatchAll");
		}

		return GroupMatchNav.fromChildren(
			MutMatchNav.fromFirstAndLast(firstNav, curNav),
			this.#_groupName,
			savedNavs
		);
	}
}
