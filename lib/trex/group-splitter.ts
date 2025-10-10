import { GroupMatchBase } from "./group-match";
import { GroupMatchNav } from "./group-nav";
import { GroupName } from "./group-name";
import { MatchNav } from "./nav";
import { addResultToParent } from "./group-helper";
import { GroupValidatorBase } from "./validator-repeat";
import { GroupValidatorResult } from "./group-validator-result";
import { GroupValidatorError } from "./group-validator-error";
import { log } from "console";

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

			for (const checkNav of checkNavs) {
				const result = validator.validate(
					checkNav.wholeMatchNav,
					nav.wholeMatchNav
				);
				if (result.isError) {
					return result;
				}
			}
		}
		return GroupValidatorResult.Ok;
	}

	match(nav: MatchNav): GroupMatchNav | GroupValidatorError {
		nav.assertNavIsNew();
		const firstNav = nav;
		let fragmentNav = nav;
		let isLastFragmentAdded = false;
		const savedNavs: GroupMatchNav[] = [];

		const endMatcher = this.#_args?.endMatcher;

		const addFragment = (result: GroupMatchNav | null) => {
			const fragmentMatch = GroupMatchNav.fromLeaf(
				fragmentNav,
				GroupName.fragment
			);
			addResultToParent(fragmentMatch, savedNavs);

			if (result instanceof GroupMatchNav) {
				if (result.groupName.isNotEmpty) {
					addResultToParent(result, savedNavs);
				}
				fragmentNav = result.wholeMatchNav.moveNext("OptMoveForward");
			} else {
				fragmentNav = fragmentNav.moveNext("OptMoveForward");
			}
		};

		while (fragmentNav.isCaptureIndexAtSourceEnd === false) {
			const curNav = fragmentNav.moveNext("OptMoveForward");

			const splitResult = this.#_splitter.match(curNav);
			// case: splitter matched
			if (splitResult instanceof GroupMatchNav) {
				addFragment(splitResult);
				continue;
			}

			if (endMatcher) {
				const endResult = endMatcher.match(curNav);
				// case: end matcher matched
				if (endResult instanceof GroupMatchNav) {
					addFragment(endResult);
					isLastFragmentAdded = true;
					break;
				}
			}

			fragmentNav = fragmentNav.moveCaptureForwardOneCodePoint();
		} // while (fragmentNav.isNavIndexAtSourceEnd === false)

		if (isLastFragmentAdded === false) {
			addFragment(null);
		}

		const parentNav = GroupMatchNav.fromBranch(
			MatchNav.fromFirstAndLast(firstNav, fragmentNav),
			this.#_groupName,
			savedNavs
		);

		const validationResult = this.validate(parentNav);

		if (validationResult.isValid) {
			log(
				`>>> Validation passed for ${parentNav.wholeMatchNav.captureMatch.value}`
			);
		} else {
			const error = validationResult.toError();
			log(`>>> Validation failed: ${error.message}`);
			log(`>>> '${error.parentNav.captureMatch.value}'`);
			log(`>>> '${error.errorNav.captureMatch.value}'`);
		}

		return parentNav;
	}
}
