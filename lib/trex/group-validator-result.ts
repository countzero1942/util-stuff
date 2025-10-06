import { GroupValidatorError } from "./group-validator-error";
import { MutMatchNav } from "./nav";

export class GroupValidatorResult {
	private constructor(
		public readonly isValid: boolean,
		public readonly message: string,
		public readonly errorNav: MutMatchNav | null = null,
		public readonly parentNav: MutMatchNav | null = null
	) {}

	get isError(): boolean {
		return !this.isValid;
	}

	static #_ok: GroupValidatorResult = new GroupValidatorResult(true, "");
	static get Ok(): GroupValidatorResult {
		return GroupValidatorResult.#_ok;
	}

	static FromError(
		errorNav: MutMatchNav,
		parentNav: MutMatchNav,
		msg: string
	): GroupValidatorResult {
		return new GroupValidatorResult(
			false,
			msg,
			errorNav.copy(),
			parentNav.copy()
		);
	}

	toError(): GroupValidatorError {
		if (this.isError === false) {
			throw new Error("GroupValidatorResult.toError: not an error");
		}
		if (this.errorNav === null || this.parentNav === null) {
			throw new Error("GroupValidatorResult.toError: null navs");
		}
		return GroupValidatorError.from(
			this.errorNav,
			this.parentNav,
			this.message
		);
	}

	toString(): string {
		const prefix = this.isValid ? "Valid" : "Error";
		return `${prefix}: ${this.message}`;
	}
}
