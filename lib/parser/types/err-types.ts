import { ArraySlice, StrSlice } from "@/utils/slice";
import {
	KeyValueBase,
	KeyInvalidSource,
} from "@/parser/types/key-value";
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
	| "Not an Integer"
	| "Not a Natural number"
	| "Not a Whole number"
	| "Natural and Whole numbers can't have signs"
	| "Not a Real precision number"
	| "Not a Real fixed-place number"
	| "Fixed-place can't have exponent"
	| "Fixed-place number digit count > max safe precision"
	| "Wrong number of fixed-place digits"
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

	public toString(): string {
		return `Number Error: ${this.kind}; type: ${this.numType.toParsableString()}`;
	}
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
		public readonly head: KeyValueBase,
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
		public readonly children: readonly KeyValueBase[],
		public readonly rowErrorRange: Range
	) {
		super();
	}

	public abstract toMessage(): string;
	public abstract toReport(): ReportLine[];
}

export class ParserNumberErr extends ParserLineErrBase {
	constructor(
		head: KeyValueBase,
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

export class ParserParamValidatorErr extends ParserLineErrBase {
	constructor(
		head: KeyValueBase,
		lineErrorSlice: StrSlice
	) {
		super(head, lineErrorSlice);
	}

	public toMessage(): string {
		return `Param Validator Error`;
	}
}

export type StructureErrKind =
	| "Invalid space tabs"
	| "Invalid key colon";

export class ParserStructureErr extends ParserLineErrBase {
	constructor(
		head: KeyInvalidSource,
		lineErrorSlice: StrSlice,
		public readonly kind: StructureErrKind
	) {
		super(head, lineErrorSlice);
	}

	public getHead(): KeyInvalidSource {
		return this.head as KeyInvalidSource;
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
		children: readonly KeyValueBase[],
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
