import { MatchNav } from "./nav";

export class GroupValidatorError {
	private constructor(
		public readonly errorNav: MatchNav,
		public readonly parentNav: MatchNav,
		public readonly message: string
	) {}

	static from(
		errorNav: MatchNav,
		parentNav: MatchNav,
		message: string = "Unexpected"
	): GroupValidatorError {
		return new GroupValidatorError(errorNav, parentNav, message);
	}

	static fromDefault(errorNav: MatchNav): GroupValidatorError {
		return GroupValidatorError.from(errorNav, errorNav, "Unexpected");
	}

	static #_empty: GroupValidatorError = new GroupValidatorError(
		MatchNav.fromString(""),
		MatchNav.fromString(""),
		"Unexpected"
	);
	static get empty(): GroupValidatorError {
		return GroupValidatorError.#_empty;
	}

	toString(): string {
		return `Error: '${this.message}'`;
	}
}
