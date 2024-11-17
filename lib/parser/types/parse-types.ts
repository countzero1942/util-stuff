import { ParserErr } from "@/parser/types/err-types";
import { KeyTrait } from "@/parser/types/head";
import { TypeBase } from "@/parser/types/type-types";

export type AnalyzeNumberString = {
	hasSeparator: boolean;
	hasDecimal: boolean;
	hasSign: boolean;
	hasENotation: boolean;
	hasGNotation: boolean;
	hasBreakingChars: boolean;
};

export type TypeValuePair<T> = {
	type: "TypeValuePair";
	valueType: TypeBase;
	value: T;
};

export type ParseTraitResult = {
	trait: KeyTrait | ParserErr;
	nextIndex: number;
};
