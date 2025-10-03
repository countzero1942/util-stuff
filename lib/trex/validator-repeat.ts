import { GroupMatchBase } from "./group-match";
import { GroupMatchRepeat } from "./group-match-repeat";
import { GroupName } from "./group-name";
import { GroupValidatorResult } from "./group-validator-result";
import { MutMatchNav } from "./nav";

export abstract class GroupValidatorBase {
	constructor(public readonly targetName: GroupName) {}

	abstract validate(nav: MutMatchNav): GroupValidatorResult;
}

export class GroupRepeatValidator extends GroupValidatorBase {
	constructor(
		targetName: GroupName,
		public readonly contentMatcher: GroupMatchRepeat,
		public readonly indexer: (
			index: number,
			revIndex: number
		) => GroupMatchRepeat | null = () => null
	) {
		super(targetName);
	}

	validate(nav: MutMatchNav): GroupValidatorResult {
		const result = this.contentMatcher.match(nav, null);
		if (result === null) {
			const msg =
				`Expected ${this.contentMatcher.numberOfMatches.minNumber} ` +
				`to ${this.contentMatcher.numberOfMatches.maxNumber} matches.`;
			return GroupValidatorResult.FromError(msg);
		}

		return GroupValidatorResult.Ok;
	}
}
