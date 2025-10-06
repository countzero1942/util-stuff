import { GroupValidatorError } from "./group-validator-error";
import { MatchNav } from "./nav";

export class GroupValidatorResult {
	private constructor(
		public readonly isValid: boolean,
		public readonly message: string,
		public readonly errorNav: MatchNav | null = null,
		public readonly parentNav: MatchNav | null = null
	) {}

	get isError(): boolean {
		return !this.isValid;
	}

	static #_ok: GroupValidatorResult = new GroupValidatorResult(true, "");
	static get Ok(): GroupValidatorResult {
		return GroupValidatorResult.#_ok;
	}

	static FromError(
		errorNav: MatchNav,
		parentNav: MatchNav,
		msg: string
	): GroupValidatorResult {
		return new GroupValidatorResult(false, msg, errorNav, parentNav);
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
