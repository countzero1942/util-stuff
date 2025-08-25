import { GroupMatchBase } from "./group-match";
import { GroupMatchNav, GroupName } from "./group-nav";
import { MutMatchNav } from "./nav";

export class GroupSplitter extends GroupMatchBase {
	#_groupName: GroupName;
	#_splitter: GroupMatchBase;
	#_endMatcher: GroupMatchBase | null;

	protected constructor(
		groupName: GroupName,
		splitter: GroupMatchBase,
		endMatcher: GroupMatchBase | null
	) {
		super(groupName);
		this.#_groupName = groupName;
		this.#_splitter = splitter;
		this.#_endMatcher = endMatcher;
	}

	public static from(
		groupName: GroupName,
		splitter: GroupMatchBase,
		endMatcher: GroupMatchBase | null
	): GroupSplitter {
		return new GroupSplitter(
			groupName,
			splitter,
			endMatcher
		);
	}

	public match(nav: MutMatchNav): GroupMatchNav | null {
		nav.assertNavIsValid();
		nav.assertNavIsNew();
		const firstNav = nav.copy();
		let fragmentNav = nav.copy();
		let isLastFragmentAdded = false;
		const savedNavs: GroupMatchNav[] = [];

		const addFragment = (
			result: GroupMatchNav | null
		) => {
			const fragmentMatch = GroupMatchNav.from(
				fragmentNav.copy(),
				GroupName.fromName(":fragment")
			);
			savedNavs.push(fragmentMatch);

			if (result) {
				if (result.groupName.isNotEmpty()) {
					savedNavs.push(result);
				}
				fragmentNav =
					result.wholeMatchNav.copyAndMoveNext(
						"MoveMatchAll"
					);
			} else {
				fragmentNav.moveNext("MoveMatchAll");
			}
		};

		while (fragmentNav.isNavIndexAtSourceEnd === false) {
			const splitResult = this.#_splitter.match(
				fragmentNav.copyAndMoveNext("MoveMatchAll")
			);
			// case: splitter matched
			if (splitResult) {
				addFragment(splitResult);
				continue;
			}

			if (this.#_endMatcher) {
				const endResult = this.#_endMatcher.match(nav);
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

		return GroupMatchNav.fromChildren(
			MutMatchNav.fromFirstAndLast(
				firstNav,
				fragmentNav
			),
			this.#_groupName,
			savedNavs
		);
	}
}
