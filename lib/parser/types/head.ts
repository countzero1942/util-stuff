import {
	EmptyLine,
	LineInfo,
	ParseErr,
} from "@/parser/types/general";

export type KeyValueHead = {
	readonly type: "KeyValueHead";
	readonly keyHead: string;
	readonly valueHead: string;
} & LineInfo;

export type KeyHead = {
	readonly type: "KeyHead";
	readonly keyHead: string;
} & LineInfo;

export type KeyBodyHead = {
	readonly type: "KeyBodyHead";
	readonly keyHead: string;
} & LineInfo;

export type HeadType =
	| KeyValueHead
	| KeyHead
	| KeyBodyHead
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
