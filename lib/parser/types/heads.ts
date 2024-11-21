import { ParserErrBase } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Key } from "node:readline";

export class LineInfo {
	constructor(
		readonly content: string,
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
		readonly keyHead: string,
		readonly valueHead: string,
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
	constructor(readonly keyHead: string, lineInfo: LineInfo) {
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
	constructor(readonly keyHead: string, lineInfo: LineInfo) {
		super(lineInfo);
	}
}

export class KeyInvalidHead extends KeyHead {
	constructor(readonly keyHead: string, lineInfo: LineInfo) {
		super(lineInfo);
	}
}

export class EmptyLine extends KeyHead {
	readonly isColon: boolean;
	constructor(lineInfo: LineInfo) {
		super(lineInfo);
		this.isColon = lineInfo.content === ":";
	}
}

export class KeyTrait extends KeyHead {
	constructor(
		readonly key: string,
		readonly children: KeyHead[],
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}
}

export class KeyValDef extends KeyHead {
	constructor(
		readonly key: string,
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
