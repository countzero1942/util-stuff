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
