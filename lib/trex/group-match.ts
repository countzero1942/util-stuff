import { GroupMatchNav } from "./group-nav";
import { MatchBase } from "./match-base";
import { MutMatchNav } from "./nav";
import { GroupName } from "./group-name";

export abstract class GroupMatchBase {
	protected constructor(public readonly groupName: GroupName) {}

	public abstract match(nav: MutMatchNav): GroupMatchNav | null;
}

export class GroupMatch extends GroupMatchBase {
	private constructor(
		public readonly groupName: GroupName,
		public readonly matcher: MatchBase
	) {
		super(groupName);
	}

	public static fromNamed(
		groupName: GroupName,
		matcher: MatchBase
	): GroupMatch {
		return new GroupMatch(groupName, matcher);
	}

	public static fromUnnamed(matcher: MatchBase): GroupMatch {
		return new GroupMatch(GroupName.empty, matcher);
	}

	public match(nav: MutMatchNav): GroupMatchNav | null {
		nav.assertNavIsValid();
		const result = this.matcher.match(nav);
		if (result) {
			return GroupMatchNav.from(result, this.groupName);
		}
		return null;
	}
}
