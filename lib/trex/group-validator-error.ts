export class GroupValidatorError {
	constructor(public readonly message: string) {}
	static #_genericError: GroupValidatorError = new GroupValidatorError(
		"Unexpected"
	);
	static get GenericError(): GroupValidatorError {
		return GroupValidatorError.#_genericError;
	}

	toString(): string {
		return `Error: '${this.message}'`;
	}
}
