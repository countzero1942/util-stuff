import { MutMatchNav } from "./nav";

export class GroupValidatorError {
	private constructor(
		public readonly errorNav: MutMatchNav,
		public readonly parentNav: MutMatchNav,
		public readonly message: string
	) {}

	static from(
		errorNav: MutMatchNav,
		parentNav: MutMatchNav,
		message: string = "Unexpected"
	): GroupValidatorError {
		return new GroupValidatorError(
			errorNav.copy(),
			parentNav.copy(),
			message
		);
	}

	static fromDefault(errorNav: MutMatchNav): GroupValidatorError {
		return GroupValidatorError.from(
			errorNav.copy(),
			errorNav.copy(),
			"Unexpected"
		);
	}

	static #_empty: GroupValidatorError = new GroupValidatorError(
		MutMatchNav.fromString(""),
		MutMatchNav.fromString(""),
		"Unexpected"
	);
	static get empty(): GroupValidatorError {
		return GroupValidatorError.#_empty;
	}

	toString(): string {
		return `Error: '${this.message}'`;
	}
}
