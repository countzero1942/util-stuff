import { GroupMatchBase } from "./group-match";
import { GroupMatchNav } from "./group-nav";
import { GroupName } from "./group-name";
import { MutMatchNav } from "./nav";
import { addResultToParent } from "./group-helper";
import {
	GroupRepeatValidator,
	GroupValidatorResult,
	GroupValidatorBase,
} from "./validator-repeat";

export type GroupSplitterArgs = {
	endMatcher?: GroupMatchBase;
	validator?: GroupValidatorBase;
};

export class GroupSplitter extends GroupMatchBase {
	#_groupName: GroupName;
	#_splitter: GroupMatchBase;
	#_args?: GroupSplitterArgs;

	protected constructor(
		groupName: GroupName,
		splitter: GroupMatchBase,
		args?: GroupSplitterArgs
	) {
		super(groupName);
		this.#_groupName = groupName;
		this.#_splitter = splitter;
		this.#_args = args;
	}

	static from(
		groupName: GroupName,
		splitter: GroupMatchBase,
		args?: GroupSplitterArgs
	): GroupSplitter {
		return new GroupSplitter(groupName, splitter, args);
	}

	private validate(nav: GroupMatchNav): GroupValidatorResult {
		const validator = this.#_args?.validator;
		if (validator) {
			const checkNavs: GroupMatchNav[] = nav.filter(group =>
				group.groupName.isGroupName(validator.targetName)
			);

			checkNavs.forEach(groupNav => {
				const result = validator.validate(groupNav.wholeMatchNav);
				if (result.isError) {
					return GroupValidatorResult.FromError(result.message);
				}
			});
		}
		return GroupValidatorResult.Ok();
	}

	match(
		nav: MutMatchNav,
		parent: GroupMatchNav | null
	): GroupMatchNav | null {
		nav.assertNavIsValid();
		nav.assertNavIsNew();
		const firstNav = nav.copy();
		let fragmentNav = nav.copy();
		let isLastFragmentAdded = false;
		// const savedNavs: GroupMatchNav[] = [];
		const parentNav = GroupMatchNav.fromConstructableBranch(
			this.#_groupName,
			parent
		);
		const endMatcher = this.#_args?.endMatcher;

		const addFragment = (result: GroupMatchNav | null) => {
			const fragmentMatch = GroupMatchNav.fromLeaf(
				fragmentNav,
				GroupName.fragment,
				parentNav
			);
			// savedNavs.push(fragmentMatch);
			addResultToParent(fragmentMatch, parentNav);

			if (result) {
				if (result.groupName.isNotEmpty) {
					// savedNavs.push(result);
					addResultToParent(result, parentNav);
				}
				fragmentNav =
					result.wholeMatchNav.copyAndMoveNext("OptMoveForward");
			} else {
				fragmentNav = fragmentNav.copyAndMoveNext("OptMoveForward");
			}
		};

		while (fragmentNav.isNavIndexAtSourceEnd === false) {
			const curNav = fragmentNav.copyAndMoveNext("OptMoveForward");

			const splitResult = this.#_splitter.match(curNav.copy(), parent);
			// case: splitter matched
			if (splitResult) {
				addFragment(splitResult);
				continue;
			}

			if (endMatcher) {
				const endResult = endMatcher.match(curNav.copy(), parent);
				// case: end matcher matched
				if (endResult) {
					addFragment(endResult);
					isLastFragmentAdded = true;
					break;
				}
			}

			fragmentNav.moveCaptureForwardOneCodePoint();
		} // while (fragmentNav.isNavIndexAtSourceEnd === false)

		if (isLastFragmentAdded === false) {
			addFragment(null);
		}

		// return GroupMatchNav.fromBranch(
		// 	MutMatchNav.fromFirstAndLast(firstNav, fragmentNav),
		// 	this.#_groupName,
		// 	parent,
		// 	savedNavs
		// );
		parentNav.seal(MutMatchNav.fromFirstAndLast(firstNav, fragmentNav));

		this.validate(parentNav);

		return parentNav;
	}
}
