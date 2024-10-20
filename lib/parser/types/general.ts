export type LineInfo = {
	readonly lineInfo: {
		readonly content: string;
		readonly indent: number;
		readonly row: number;
		readonly column?: number;
	};
};

export type EmptyLine = {
	readonly type: "EmptyLine";
} & LineInfo;

export type ParseErr = {
	readonly type: "ParseErr";
	readonly message: string;
} & LineInfo;

// export type EmptyLine = Simplify<
// 	{
// 		readonly type: "EmptyLine";
// 	} & LineInfo
// >;

// export type ParseErr = Simplify<
// 	{
// 		readonly type: "ParseErr";
// 		readonly message: string;
// 	} & LineInfo
// >;
