import { GroupMatchBase } from "./group-match";
import { GroupMatchRepeat } from "./group-match-repeat";
import { GroupName } from "./group-name";
import { GroupValidatorError } from "./group-validator-error";
import { GroupValidatorResult } from "./group-validator-result";
import { MatchNav } from "./nav";

export abstract class GroupValidatorBase {
	constructor(public readonly targetName: GroupName) {}

	abstract validate(
		testNav: MatchNav,
		parentNav: MatchNav
	): GroupValidatorResult;
}

export class GroupRepeatValidator extends GroupValidatorBase {
	#_errorMessage: string;

	constructor(
		targetName: GroupName,
		public readonly contentMatcher: GroupMatchRepeat,
		public readonly indexer: (
			index: number,
			revIndex: number
		) => GroupMatchRepeat | null = () => null
	) {
		super(targetName);
		this.#_errorMessage =
			`Expected ${this.contentMatcher.numberOfMatches.minNumber} ` +
			`to ${this.contentMatcher.numberOfMatches.maxNumber} matches.`;
	}

	static from(
		targetName: GroupName,
		contentMatcher: GroupMatchRepeat
	): GroupRepeatValidator {
		return new GroupRepeatValidator(targetName, contentMatcher);
	}

	validate(testNav: MatchNav, parentNav: MatchNav): GroupValidatorResult {
		const result = this.contentMatcher.match(testNav.copy(), null);
		if (result instanceof GroupValidatorError) {
			return GroupValidatorResult.FromError(
				testNav,
				parentNav,
				this.#_errorMessage
			);
		}

		return GroupValidatorResult.Ok;
	}
}
