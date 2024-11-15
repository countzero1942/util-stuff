import { ArraySlice, StrCharSlice } from "@/parser/types/general";
import {
	HeadType,
	KeyInvalidHead,
	LineInfo,
} from "@/parser/types/head";
import { TypeBase } from "@/parser/types/type-types";
import { Range } from "@/utils/seq";

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
	constructor() {}

	public abstract toMessage(): string;
	public abstract toReport(): string[];
}

export abstract class ParserLineErrBase extends ParserErrBase {
	constructor(
		public readonly head: HeadType,
		public readonly lineErrorSlice: StrCharSlice
	) {
		super();
	}

	public abstract toMessage(): string;
	public abstract toReport(): string[];
}

export abstract class ParserBlockErrBase extends ParserErrBase {
	constructor(
		public readonly children: readonly HeadType[],
		public readonly rowErrorRange: Range
	) {
		super();
	}

	public abstract toMessage(): string;
	public abstract toReport(): string[];
}

export class ParserNumberErr extends ParserLineErrBase {
	constructor(
		head: HeadType,
		lineErrorSlice: StrCharSlice,
		public readonly numberErr: NumberErr
	) {
		super(head, lineErrorSlice);
	}

	public toMessage(): string {
		const { numberErr } = this;
		return `Number Error: ${numberErr.kind}`;
	}

	public toReport(): string[] {
		const { content } = this.head.lineInfo;
		return [
			`${content}`,
			`\n${this.lineErrorSlice.getErrorString()}`,
		];
	}
}
export type StructureErrKind =
	| "Invalid space tabs"
	| "Invalid key colon";

export class ParserStructureErr extends ParserLineErrBase {
	constructor(
		head: KeyInvalidHead,
		lineErrorSlice: StrCharSlice,
		public readonly kind: StructureErrKind
	) {
		super(head, lineErrorSlice);
	}

	public toMessage(): string {
		const { kind } = this;
		return `Structure Error: ${kind}`;
	}

	public toReport(): string[] {
		const { keyHead } = this.head as KeyInvalidHead;
		return [
			`${keyHead}`,
			`\n${this.lineErrorSlice.getErrorString()}`,
		];
	}
}

export type IndentErrKind =
	| "Missing children"
	| "Invalid children"
	| "Invalid over-indent";

export class ParserIndentErr extends ParserBlockErrBase {
	constructor(
		children: readonly HeadType[],
		rowErrorRange: Range,
		public readonly kind: IndentErrKind
	) {
		super(children, rowErrorRange);
	}

	public toMessage(): string {
		const { kind } = this;
		const { startIncl, endExcl } = this.rowErrorRange;
		return `Indent Error: '${kind}'; lines: ${startIncl} - ${
			endExcl - 1
		}`;
	}

	public toReport(): string[] {
		return this.children.map(child => `${child.lineInfo.content}`);
	}
}
export type ParserErr = {
	readonly type: "ParserErr";
	readonly err: ParserErrBase;
} & LineInfo;
