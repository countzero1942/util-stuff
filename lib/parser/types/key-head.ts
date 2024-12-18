import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";

export type FlagParam = {
	readonly name: string;
	readonly dotParam: TypeValuePair<any> | NumberErr | undefined;
	readonly subParam: TypeValuePair<any> | NumberErr | undefined;
	readonly superParam: TypeValuePair<any> | NumberErr | undefined;
	readonly colonParams: (TypeValuePair<any> | NumberErr)[];
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
