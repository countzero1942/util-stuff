import { KeyTrait, ParserErr } from "@/parser/types/heads";
import { TypeBase } from "@/parser/types/type-types";

export type AnalyzeNumberString = {
	hasSeparator: boolean;
	hasDecimal: boolean;
	hasSign: boolean;
	hasENotation: boolean;
	hasGNotation: boolean;
	hasBreakingChars: boolean;
};

export class TypeValuePair {
	constructor(
		public readonly valueType: TypeBase,
		public readonly value: any
	) {}
}

export type ParseTraitResult = {
	trait: KeyTrait | ParserErr;
	nextIndex: number;
};
