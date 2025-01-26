import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";

export type FlagParam = {
	readonly name: string;
	readonly dotParam: TypeValuePair | NumberErr | undefined;
	readonly subParam: TypeValuePair | NumberErr | undefined;
	readonly superParam: TypeValuePair | NumberErr | undefined;
	readonly colonParams: (TypeValuePair | NumberErr)[];
};

export type TypeParams = {
	readonly name: string;
	readonly nameParams: FlagParam;
	readonly flagParams: FlagParam[];
	readonly stringParams: string[];
	readonly unitParam: string | undefined;
};

export type KeyParams = {
	readonly name: string;
	readonly types?: TypeParams[];
};
