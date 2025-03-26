import { ParserErrBase } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { Str, TypeBase } from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";

export class LineInfo {
	constructor(
		public readonly content: StrSlice,
		public readonly indent: number,
		public readonly row: number
	) {}
}

export abstract class KeyValueBase {
	constructor(
		readonly lineInfo: LineInfo,
		readonly isNode: boolean = false
	) {}
}

///////////////////////////////
// Key Value Sources
///////////////////////////////

/**
 * Key Value-Defined Head.
 *
 * E.g.: "key: value"
 */
export class KeyValueDefinedSource extends KeyValueBase {
	constructor(
		public readonly keyHead: StrSlice,
		public readonly valueHead: StrSlice,
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
		return `<KeyValueDefinedHead> ${this.keyHead.value}: ${this.valueHead.value}`;
	}
}

/**
 * Key Value-Required Head.
 *
 * E.g.: "key"
 */
export class KeyValueRequiredSource extends KeyValueBase {
	constructor(
		public readonly keyHead: StrSlice,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKeyHead(testKeyHead: string): boolean {
		return this.keyHead.equals(testKeyHead);
	}

	public toString(): string {
		return `<KeyValueRequiredHead> ${this.keyHead.value}`;
	}

	public static fromString(
		str: string
	): KeyValueRequiredSource {
		const lineInfo = new LineInfo(
			new StrSlice(str),
			0,
			1
		);
		const keyHead = new StrSlice(str);
		return new KeyValueRequiredSource(keyHead, lineInfo);
	}
}

/**
 * Key Body-Required Head.
 *
 * Body can be: trait, set, array
 *
 * E.g.: "key:"
 */
export class KeyBodyRequiredSource extends KeyValueBase {
	constructor(
		public readonly keyHead: StrSlice,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKeyHead(testKeyHead: string): boolean {
		return this.keyHead.equals(testKeyHead);
	}

	public toString(): string {
		return `<KeyBodyRequiredHead> ${this.keyHead.value}:`;
	}
}

export class KeyInvalidSource extends KeyValueBase {
	constructor(
		public readonly keyHead: StrSlice,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKeyHead(testKeyHead: string): boolean {
		return this.keyHead.equals(testKeyHead);
	}

	public toString(): string {
		return `<KeyInvalidHead> ${this.keyHead.value}`;
	}
}

///////////////////////////////
// Key Value Nodes
///////////////////////////////

export abstract class KeyValueNodeBase extends KeyValueBase {
	constructor(readonly lineInfo: LineInfo) {
		super(lineInfo, true);
	}
}

export class ParserErrNode extends KeyValueNodeBase {
	constructor(
		readonly err: ParserErrBase,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}
}

export class EmptyLineNode extends KeyValueBase {
	readonly isColon: boolean;
	constructor(lineInfo: LineInfo) {
		super(lineInfo);
		this.isColon = lineInfo.content.equals(":");
	}
}

export class KeyTraitNode extends KeyValueNodeBase {
	constructor(
		public readonly key: StrSlice,
		public readonly children: KeyValueBase[],
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKey(testKey: string): boolean {
		return this.key.equals(testKey);
	}

	public toString(): string {
		return `<KeyTrait> ${this.key.value}:`;
	}
}

export class KeyValueDefinedNode extends KeyValueNodeBase {
	constructor(
		readonly keyNode: StrSlice,
		readonly valueNode: TypeValuePair,
		lineInfo: LineInfo
	) {
		super(lineInfo);
	}

	public checkKey(testKey: string): boolean {
		return this.keyNode.equals(testKey);
	}

	public checkValue(value: any, type: TypeBase): boolean {
		return (
			this.valueNode.typeValue === value &&
			this.valueNode.type.equals(type)
		);
	}

	public toString(): string {
		return `<KeyValueDefinedPair> ${this.keyNode.value}: ${this.valueNode.typeValue}`;
	}
}
