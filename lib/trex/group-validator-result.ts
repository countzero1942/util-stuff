import { GroupValidatorError } from "./group-validator-error";

export class GroupValidatorResult {
	private constructor(
		public readonly isValid: boolean,
		public readonly message: string
	) {}

	get isError(): boolean {
		return !this.isValid;
	}

	static #_ok: GroupValidatorResult = new GroupValidatorResult(true, "");
	static get Ok(): GroupValidatorResult {
		return GroupValidatorResult.#_ok;
	}

	static FromError(msg: string): GroupValidatorResult {
		return new GroupValidatorResult(false, msg);
	}

	toError(): GroupValidatorError {
		return new GroupValidatorError(this.message);
	}

	toString(): string {
		const prefix = this.isValid ? "Valid" : "Error";
		return `${prefix}: ${this.message}`;
	}
}
