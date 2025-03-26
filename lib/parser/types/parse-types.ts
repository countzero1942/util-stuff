import { TypeBase } from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";
import {
	ParserErrNode,
	KeyTraitNode,
} from "@/parser/types/key-value";

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
		public readonly typeValue: any,
		public readonly valueSlice:
			| StrSlice
			| undefined = undefined,
		public readonly numberStringReport:
			| AnalyzeNumberStringReport
			| undefined = undefined
	) {}

	toString(): string {
		const valueStr =
			this.typeValue instanceof StrSlice
				? this.typeValue.value
				: this.typeValue;
		return `${valueStr} in ${this.type.toParsableString()}`;
	}

	public trim(): TypeValuePair {
		return new TypeValuePair(this.type, this.typeValue);
	}
}

export type ParseTraitResult = {
	trait: KeyTraitNode | ParserErrNode;
	nextIndex: number;
};
