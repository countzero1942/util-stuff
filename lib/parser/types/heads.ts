import { ParserErrBase } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Str } from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";
import { Key } from "node:readline";

export class LineInfo {
	constructor(
		readonly content: StrSlice,
		readonly indent: number,
		readonly row: number
	) {}
}

export class KeyHead {
	constructor(readonly lineInfo: LineInfo) {}
}

/**
 * Key Value-Defined Head.
 *
 * E.g.: "key: value"
 */
export class KeyValDefHead extends KeyHead {
	constructor(
		readonly keyHead: StrSlice,
		readonly valueHead: StrSlice,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}
}

/**
 * Key Value-Required Head.
 *
 * E.g.: "key"
 */
export class KeyValReqHead extends KeyHead {
	constructor(readonly keyHead: StrSlice, lineInfo: LineInfo) {
		super(lineInfo);
	}
}

/**
 * Key Body-Required Head.
 *
 * Body can be: trait, set, array
 *
 * E.g.: "key:"
 */
export class KeyBodyReqHead extends KeyHead {
	constructor(readonly keyHead: StrSlice, lineInfo: LineInfo) {
		super(lineInfo);
	}
}

export class KeyInvalidHead extends KeyHead {
	constructor(readonly keyHead: StrSlice, lineInfo: LineInfo) {
		super(lineInfo);
	}
}

export class EmptyLine extends KeyHead {
	readonly isColon: boolean;
	constructor(lineInfo: LineInfo) {
		super(lineInfo);
		this.isColon = lineInfo.content.equals(":");
	}
}

export class KeyTrait extends KeyHead {
	constructor(
		readonly key: StrSlice,
		readonly children: KeyHead[],
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}
}

export class KeyValDef extends KeyHead {
	constructor(
		readonly key: StrSlice,
		readonly value: TypeValuePair<any>,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}
}

export class ParserErr extends KeyHead {
	constructor(readonly err: ParserErrBase, lineInfo: LineInfo) {
		super(lineInfo);
	}
}
