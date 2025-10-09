import { GroupMatchBase } from "./group-match";
import { GroupMatchNav } from "./group-nav";
import { GroupName } from "./group-name";
import { MatchNav } from "./nav";
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

	public match(nav: MatchNav): GroupMatchNav | GroupValidatorError {
		for (const matcher of this.#_matchers) {
			const result = matcher.match(nav);
			if (result instanceof GroupMatchNav) {
				return result;
			}
		}
		return GroupValidatorError.from(nav, nav, "Unexpected");
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

	public match(nav: MatchNav): GroupMatchNav | GroupValidatorError {
		nav.assertNavIsNew();
		const firstNav = nav;
		const savedNavs: GroupMatchNav[] = [];
		// const parentNav = GroupMatchNav.fromConstructableBranch(
		// 	this.#_groupName,
		// 	parent
		// );

		let curNav = nav;
		const matchersLength = this.#_matchers.length;
		for (let i = 0; i < matchersLength; i++) {
			const matcher = this.#_matchers[i];
			const result = matcher.match(curNav);
			if (result instanceof GroupValidatorError) {
				return result;
			}

			addResultToParent(result, savedNavs);
			curNav = result.wholeMatchNav.moveNext("OptMoveForward");
		}

		const whole = MatchNav.fromFirstAndLast(firstNav, curNav);
		if (savedNavs.length === 0) {
			return GroupMatchNav.fromLeaf(whole, this.#_groupName);
		}
		return GroupMatchNav.fromBranch(whole, this.#_groupName, savedNavs);

		// parentNav.seal(MatchNav.fromFirstAndLast(firstNav, curNav));
		// return parentNav;
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

	public match(nav: MatchNav): GroupMatchNav | GroupValidatorError {
		nav.assertNavIsNew();
		const result = this.matcher.match(nav);
		if (result instanceof GroupMatchNav) {
			return result;
		}
		return GroupMatchNav.fromLeaf(nav, GroupName.empty);
	}
}
