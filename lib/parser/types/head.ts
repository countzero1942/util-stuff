import { ParserErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";

export type LineInfo = {
	readonly lineInfo: {
		readonly content: string;
		readonly indent: number;
		readonly row: number;
	};
};

/**
 * Key Value-Defined Head.
 *
 * E.g.: "key: value"
 */
export type KeyValDefHead = {
	readonly type: "KeyValDefHead";
	readonly keyHead: string;
	readonly valueHead: string;
} & LineInfo;

/**
 * Key Value-Required Head.
 *
 * E.g.: "key"
 */
export type KeyValReqHead = {
	readonly type: "KeyValReqHead";
	readonly keyHead: string;
} & LineInfo;

/**
 * Key Body-Required Head.
 *
 * Body can be: trait, set, array
 *
 * E.g.: "key:"
 */
export type KeyBodyReqHead = {
	readonly type: "KeyBodyReqHead";
	readonly keyHead: string;
} & LineInfo;

export type KeyInvalidHead = {
	readonly type: "KeyInvalidHead";
	readonly keyHead: string;
} & LineInfo;

export type EmptyLine = {
	readonly type: "EmptyLine";
	readonly isColon: boolean;
} & LineInfo;

export type KeyTrait = {
	readonly type: "KeyTrait";
	readonly key: string;
	readonly children: HeadType[];
} & LineInfo;

export type KeyValDef = {
	readonly type: "KeyValDef";
	readonly key: string;
	readonly value: TypeValuePair<any>;
} & LineInfo;

/**
 * All possible head types including ParserErr
 *
 * @see {@link HeadType}
 */
export type HeadType =
	| KeyValDefHead
	| KeyValReqHead
	| KeyBodyReqHead
	| KeyInvalidHead
	| EmptyLine
	| KeyTrait
	| ParserErr;
