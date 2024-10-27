import { TypeBase } from "@/parser/types/type-types";

export type NumberErrorKind =
	| "Invalid sign"
	| "Invalid decimal"
	| "Invalid grouping"
	| "Invalid chars"
	| "Invalid leading zero"
	| "Value > max"
	| "Value < min"
	| "Power > max"
	| "Power < min"
	| "Power must produce integer"
	| "Not safe integer"
	| "RegEx Fail"
	| "Has breaking chars"
	| "NaN"
	| "TODO";

export type AnalyzeNumberString = {
	hasSeparator: boolean;
	hasDecimal: boolean;
	hasSign: boolean;
	hasENotation: boolean;
	hasGNotation: boolean;
	hasBreakingChars: boolean;
};

export type ParseError = {
	type: "ParseError";
	message: string;
};

export type NumberError = {
	type: "NumberError";
	kind: NumberErrorKind;
};

export type TypeValuePair<T> = {
	type: "TypeValuePair";
	valueType: TypeBase;
	value: T;
};
