import { Slice } from "@/parser/types/general";
import {
	HeadType,
	KeyInvalidHead,
	LineInfo,
} from "@/parser/types/head";
import { TypeBase } from "@/parser/types/type-types";

export type NumberErrKind =
	| "Invalid exponent"
	| "Invalid form"
	| "Invalid chars"
	| "Invalid leading zero"
	| "Invalid grouping"
	| "Value > max"
	| "Value < min"
	| "Power > max"
	| "Power < min"
	| "Power must produce integer"
	| "Not safe integer"
	| "RegEx Fail"
	| "Invalid number"
	| "Has breaking chars"
	| "Invalid number input"
	| "NaN"
	| "Invalid sign"
	| "Invalid decimal"
	| "NEVER"
	| "TODO";

export type NumberErr = {
	type: "NumberErr";
	numType: TypeBase;
	kind: NumberErrKind;
};

export abstract class ParserErrBase {
	constructor(
		public readonly head: HeadType,
		public readonly lineErrorSlice: Slice
	) {}

	public abstract toMessage(): string;
	public abstract toReport(): string;
}

export class ParserNumberErr extends ParserErrBase {
	constructor(
		head: HeadType,
		lineErrorSlice: Slice,
		public readonly numberErr: NumberErr
	) {
		super(head, lineErrorSlice);
	}

	public toMessage(): string {
		const { numberErr } = this;
		return `Number Error: ${numberErr.kind}`;
	}

	public toReport(): string {
		const { content } = this.head.lineInfo;
		return `${content}\n${this.lineErrorSlice.getErrorString(
			content
		)}`;
	}
}
export type StructureErrKind =
	| "Invalid space tabs"
	| "Invalid key colon";

export class ParserStructureErr extends ParserErrBase {
	constructor(
		head: KeyInvalidHead,
		lineErrorSlice: Slice,
		public readonly kind: StructureErrKind
	) {
		super(head, lineErrorSlice);
	}

	public toMessage(): string {
		const { kind } = this;
		return `Structure Error: ${kind}`;
	}

	public toReport(): string {
		const { keyHead } = this.head as KeyInvalidHead;
		return `${keyHead}\n${this.lineErrorSlice.getErrorString(
			keyHead
		)}`;
	}
}

export type ParseErr = {
	readonly type: "ParseErr";
	readonly err: ParserErrBase;
} & LineInfo;

// export type ParseError = {
// 	type: "ParseError";
// 	message: string;
// };
