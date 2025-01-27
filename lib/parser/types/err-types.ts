import { ArraySlice, StrSlice } from "@/utils/slice";
import {
	KeyHead,
	KeyInvalidHead,
} from "@/parser/types/heads";
import { TypeBase } from "@/parser/types/type-types";
import { Range } from "@/utils/seq";
import { formatTabsToSymbols } from "@/utils/string";

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

export class NumberErr {
	constructor(
		public readonly numType: TypeBase,
		public readonly kind: NumberErrKind
	) {}
}

export class ReportLine {
	constructor(
		public readonly content: string,
		public readonly indent: number,
		public readonly row?: number
	) {}
}

export abstract class ParserErrBase {
	constructor() {}

	public abstract toMessage(): string;
	public abstract toReport(): ReportLine[];
}

export abstract class ParserLineErrBase extends ParserErrBase {
	constructor(
		public readonly head: KeyHead,
		public readonly lineErrorSlice: StrSlice
	) {
		super();
	}

	public abstract toMessage(): string;
	public toReport(): ReportLine[] {
		const { content, indent, row } = this.head.lineInfo;
		const errorString =
			this.lineErrorSlice.getErrorString();
		const errorMessage = this.toMessage();
		return [
			{
				content: content.value,
				indent,
				row,
			},
			{
				content: `${errorString}: <${errorMessage}>`,
				indent,
			},
		];
	}
}

export abstract class ParserBlockErrBase extends ParserErrBase {
	constructor(
		public readonly children: readonly KeyHead[],
		public readonly rowErrorRange: Range
	) {
		super();
	}

	public abstract toMessage(): string;
	public abstract toReport(): ReportLine[];
}

export class ParserNumberErr extends ParserLineErrBase {
	constructor(
		head: KeyHead,
		lineErrorSlice: StrSlice,
		public readonly numberErr: NumberErr
	) {
		super(head, lineErrorSlice);
	}

	public toMessage(): string {
		const { numberErr } = this;
		return `Number Error: ${numberErr.kind}`;
	}
}
export type StructureErrKind =
	| "Invalid space tabs"
	| "Invalid key colon";

export class ParserStructureErr extends ParserLineErrBase {
	constructor(
		head: KeyInvalidHead,
		lineErrorSlice: StrSlice,
		public readonly kind: StructureErrKind
	) {
		super(head, lineErrorSlice);
	}

	public toMessage(): string {
		const { kind } = this;
		return `Structure Error: ${kind}`;
	}
}

export type IndentErrKind =
	| "Missing children"
	| "Invalid children"
	| "Invalid over-indent";

export class ParserIndentErr extends ParserBlockErrBase {
	constructor(
		children: readonly KeyHead[],
		rowErrorRange: Range,
		public readonly indent: number,
		public readonly kind: IndentErrKind
	) {
		super(children, rowErrorRange);
	}

	public toMessage(): string {
		const { kind } = this;
		const { startIncl, endExcl } = this.rowErrorRange;
		const errPart = `Indent Error: '${kind}'`;
		const errMsg =
			kind === "Missing children"
				? errPart
				: `${errPart}; lines: ${startIncl} - ${endExcl - 1}`;

		return errMsg;
	}

	public toReport(): ReportLine[] {
		const childLines = this.children.map(child => ({
			content: child.lineInfo.content.value,
			indent: child.lineInfo.indent,
			row: child.lineInfo.row,
		}));

		return [
			new ReportLine(
				`<${this.toMessage()}>`,
				this.indent
			),
			...childLines,
		];
	}
}
