import { StrSlice } from "@/utils/slice";
import { GroupValidatorError } from "./group-validator-error";
import { MatchNav } from "./nav";

export class GroupValidatorResult {
	private constructor(
		public readonly isValid: boolean,
		public readonly message: string,
		public readonly errorView: StrSlice | null = null,
		public readonly parentView: StrSlice | null = null
	) {}

	get isError(): boolean {
		return !this.isValid;
	}

	static #_ok: GroupValidatorResult = new GroupValidatorResult(true, "");
	static get Ok(): GroupValidatorResult {
		return GroupValidatorResult.#_ok;
	}

	static FromError(
		errorView: StrSlice,
		parentView: StrSlice,
		msg: string
	): GroupValidatorResult {
		return new GroupValidatorResult(false, msg, errorView, parentView);
	}

	toError(): GroupValidatorError {
		if (this.isError === false) {
			throw new Error("GroupValidatorResult.toError: not an error");
		}
		if (this.errorView === null || this.parentView === null) {
			throw new Error("GroupValidatorResult.toError: null navs");
		}
		return GroupValidatorError.from(
			this.errorView,
			this.parentView,
			this.message
		);
	}

	toString(): string {
		const prefix = this.isValid ? "Valid" : "Error";
		return `${prefix}: ${this.message}`;
	}
}
