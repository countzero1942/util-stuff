import { ParseErr } from "@/parser/types/err-types";

export type LineInfo = {
	readonly lineInfo: {
		readonly content: string;
		readonly indent: number;
		readonly row: number;
		readonly column?: number;
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

export type HeadType =
	| KeyValDefHead
	| KeyValReqHead
	| KeyBodyReqHead
	| KeyInvalidHead
	| EmptyLine
	| ParseErr;

// export type KeyValueHead = Simplify<
// 	{
// 		readonly type: "KeyValueHead";
// 		readonly keyHead: string;
// 		readonly valueHead: string;
// 	} & LineInfo
// >;

// export type KeyHead = Simplify<
// 	{
// 		readonly type: "KeyHead";
// 		readonly keyHead: string;
// 	} & LineInfo
// >;

// export type KeyBodyHead = Simplify<
// 	{
// 		readonly type: "KeyBodyHead";
// 		readonly keyHead: string;
// 	} & LineInfo
// >;
