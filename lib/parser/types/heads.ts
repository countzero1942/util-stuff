import { ParserErrBase } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Str, TypeBase } from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";
import { Key } from "node:readline";

export class LineInfo {
	constructor(
		readonly content: StrSlice,
		readonly indent: number,
		readonly row: number
	) {}
}

export abstract class KeyHead {
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

	public checkKeyHead(testKeyHead: string): boolean {
		return this.keyHead.equals(testKeyHead);
	}

	public checkValueHead(testValueHead: string): boolean {
		return this.valueHead.equals(testValueHead);
	}

	public toString(): string {
		return `<KeyValDefHead> ${this.keyHead}: ${this.valueHead}`;
	}
}

/**
 * Key Value-Required Head.
 *
 * E.g.: "key"
 */
export class KeyValReqHead extends KeyHead {
	constructor(
		readonly keyHead: StrSlice,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKeyHead(testKeyHead: string): boolean {
		return this.keyHead.equals(testKeyHead);
	}

	public toString(): string {
		return `<KeyValReqHead> ${this.keyHead}`;
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
	constructor(
		readonly keyHead: StrSlice,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKeyHead(testKeyHead: string): boolean {
		return this.keyHead.equals(testKeyHead);
	}

	public toString(): string {
		return `<KeyBodyReqHead> ${this.keyHead}:`;
	}
}

export class KeyInvalidHead extends KeyHead {
	constructor(
		readonly keyHead: StrSlice,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKeyHead(testKeyHead: string): boolean {
		return this.keyHead.equals(testKeyHead);
	}

	public toString(): string {
		return `<KeyInvalidHead> ${this.keyHead}`;
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

	public checkKey(testKey: string): boolean {
		return this.key.equals(testKey);
	}

	public toString(): string {
		return `<KeyTrait> ${this.key}:`;
	}
}
/**
 * Key Value Defined.
 *
 * This is the finalized version of KeyValHead.
 *
 * The head is parsed into string key and contrained type
 *
 * The value is parsed into a TypeValuePair: actual value and type
 */
export class KeyValDef extends KeyHead {
	constructor(
		readonly key: StrSlice,
		readonly value: TypeValuePair,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKey(testKey: string): boolean {
		return this.key.equals(testKey);
	}

	public checkValue(value: any, type: TypeBase): boolean {
		return (
			this.value.value === value &&
			this.value.type.equals(type)
		);
	}

	public toString(): string {
		return `<KeyValDef> ${this.key}: ${this.value.value}`;
	}
}

export class ParserErr extends KeyHead {
	constructor(
		readonly err: ParserErrBase,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}
}
