import { GroupMatchBase } from "./group-match";
import { GroupMatchNav } from "./group-nav";
import { GroupName } from "./group-name";
import { MutMatchNav } from "./nav";
import { addResultToParent } from "./group-helper";
import { GroupValidatorError } from "./group-validator-error";

export class GroupMatchAny extends GroupMatchBase {
	#_matchers: GroupMatchBase[];

	protected constructor(
		groupName: GroupName,
		matchers: GroupMatchBase[]
	) {
		super(groupName);
		this.#_matchers = matchers.slice(); // defensive copy
	}

	public static fromMatchers(
		...matchers: GroupMatchBase[]
	): GroupMatchAny {
		return new GroupMatchAny(GroupName.empty, matchers);
	}

	public match(
		nav: MutMatchNav,
		parent: GroupMatchNav | null
	): GroupMatchNav | GroupValidatorError {
		nav.assertNavIsValid();
		for (const matcher of this.#_matchers) {
			const result = matcher.match(nav.copy(), parent);
			if (result instanceof GroupMatchNav) {
				return result;
			}
		}
		return GroupValidatorError.GenericError;
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

	public match(
		nav: MutMatchNav,
		parent: GroupMatchNav | null
	): GroupMatchNav | GroupValidatorError {
		nav.assertNavIsValid();
		nav.assertNavIsNew();
		const firstNav = nav.copy();
		// const savedNavs: GroupMatchNav[] = [];
		const parentNav = GroupMatchNav.fromConstructableBranch(
			this.#_groupName,
			parent
		);

		let curNav = nav.copy();
		const matchersLength = this.#_matchers.length;
		for (let i = 0; i < matchersLength; i++) {
			const matcher = this.#_matchers[i];
			const result = matcher.match(curNav, parentNav);
			if (result instanceof GroupValidatorError) {
				return result;
			}

			addResultToParent(result, parentNav);
			curNav = result.wholeMatchNav.copy().moveNext("OptMoveForward");
		}

		// return GroupMatchNav.fromBranch(
		// 	MutMatchNav.fromFirstAndLast(firstNav, curNav),
		// 	this.#_groupName,
		// 	savedNavs
		// );

		parentNav.seal(MutMatchNav.fromFirstAndLast(firstNav, curNav));
		return parentNav;
	}
}

export class GroupMatchOpt extends GroupMatchBase {
	private constructor(
		groupName: GroupName,
		public readonly matcher: GroupMatchBase
	) {
		super(groupName);
	}

	public static from(matcher: GroupMatchBase): GroupMatchOpt {
		return new GroupMatchOpt(GroupName.empty, matcher);
	}

	public match(
		nav: MutMatchNav,
		parent: GroupMatchNav | null
	): GroupMatchNav | GroupValidatorError {
		nav.assertNavIsValid();
		const savedNav = nav.copy();
		const result = this.matcher.match(nav, parent);
		if (result instanceof GroupMatchNav) {
			return result;
		}
		return GroupMatchNav.fromLeaf(savedNav, GroupName.empty, parent);
	}
}
