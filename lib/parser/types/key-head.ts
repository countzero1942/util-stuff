import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";

export type FlagParam = {
	readonly name: string;
	readonly dotParam: TypeValuePair<any> | NumberErr | undefined;
	readonly colonParams: TypeValuePair<any>[];
};

export type TypeParams = {
	readonly name: string;
	readonly dotParam: TypeValuePair<any> | NumberErr | undefined;
	readonly colonParams: TypeValuePair<any>[];
	readonly flagParams: FlagParam[];
	readonly stringParams: string[];
	readonly unitParam: string | undefined;
};

export type KeyParams = {
	readonly name: string;
	readonly types?: TypeParams[];
};
