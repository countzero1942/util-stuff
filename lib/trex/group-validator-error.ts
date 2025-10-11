import { StrSlice } from "@/utils/slice";
import { MatchNav } from "./nav";

export class GroupValidatorError {
	private constructor(
		public readonly errorView: StrSlice,
		public readonly parentView: StrSlice,
		public readonly message: string
	) {}

	static from(
		errorView: StrSlice,
		parentView: StrSlice,
		message: string = "Unexpected"
	): GroupValidatorError {
		return new GroupValidatorError(errorView, parentView, message);
	}

	static fromDefault(errorView: StrSlice): GroupValidatorError {
		return GroupValidatorError.from(errorView, errorView, "Unexpected");
	}

	static #_empty: GroupValidatorError = new GroupValidatorError(
		StrSlice.empty,
		StrSlice.empty,
		"Unexpected"
	);
	static get empty(): GroupValidatorError {
		return GroupValidatorError.#_empty;
	}

	toString(): string {
		return `Error: '${this.message}'`;
	}
}
