import {
	KeyTrait,
	ParserErrHead,
} from "@/parser/types/heads";
import { TypeBase } from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";

export type AnalyzeNumberStringReport = {
	hasSeparator?: boolean;
	hasDecimal?: boolean;
	hasSign?: boolean;
	hasENotation?: boolean;
	hasGNotation?: boolean;
	hasBreakingChars?: boolean;
};

export class TypeValuePair {
	constructor(
		public readonly type: TypeBase,
		public readonly value: any,
		public readonly valueSlice:
			| StrSlice
			| undefined = undefined,
		public readonly numberStringReport:
			| AnalyzeNumberStringReport
			| undefined = undefined
	) {}

	toString(): string {
		return `${this.value} in ${this.type.toParsableString()}`;
	}

	public trim(): TypeValuePair {
		return new TypeValuePair(this.type, this.value);
	}
}

export type ParseTraitResult = {
	trait: KeyTrait | ParserErrHead;
	nextIndex: number;
};
