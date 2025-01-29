import { NumberErr } from "@/parser/types/err-types";
import { TypeValuePair } from "@/parser/types/parse-types";
import { StrSlice } from "@/utils/slice";

export abstract class ParamBase {
	constructor(readonly name: StrSlice) {}

	public get fullName(): StrSlice {
		return this.name.expandSlice(1);
	}
}

export class FlagParam extends ParamBase {
	constructor(
		name: StrSlice,
		public readonly dotParam:
			| TypeValuePair
			| NumberErr
			| undefined,
		public readonly subParam:
			| TypeValuePair
			| NumberErr
			| undefined,
		public readonly superParam:
			| TypeValuePair
			| NumberErr
			| undefined,
		public readonly colonParams: (
			| TypeValuePair
			| NumberErr
		)[] = []
	) {
		super(name);
	}

	public static empty(): FlagParam {
		return new FlagParam(
			StrSlice.empty(),
			undefined,
			undefined,
			undefined,
			[]
		);
	}

	public toReport(
		indents: number = 0,
		indentStr: string = "   "
	): string[] {
		const strs: string[] = [];
		const indentStr1 = indentStr.repeat(indents);
		const indentStr2 = indentStr.repeat(indents + 1);
		const indentStr3 = indentStr.repeat(indents + 2);

		const nameStr = `${indentStr1}${this.fullName.value}`;
		strs.push(nameStr);

		if (this.dotParam) {
			strs.push(
				`${indentStr2}dotParam: ${this.dotParam.toString()}`
			);
		}

		if (this.subParam) {
			strs.push(
				`${indentStr2}subParam: ${this.subParam.toString()}`
			);
		}

		if (this.superParam) {
			strs.push(
				`${indentStr2}superParam: ${this.superParam.toString()}`
			);
		}

		if (this.colonParams.length > 0) {
			strs.push(`${indentStr2}colonParams:`);
			this.colonParams.forEach(p =>
				strs.push(`${indentStr3}${p.toString()}`)
			);
		}

		return strs;
	}
}

export class TypeParams extends ParamBase {
	constructor(
		name: StrSlice,
		public readonly nameParams: FlagParam,
		public readonly flagParams: FlagParam[] = [],
		public readonly stringParams: string[] = [],
		public readonly unitParam?: string
	) {
		super(name);
	}

	public static empty(): TypeParams {
		return new TypeParams(
			StrSlice.empty(),
			FlagParam.empty()
		);
	}

	public toReport(
		indents: number = 0,
		indentStr: string = "   "
	): string[] {
		const strs: string[] = [];
		const indentStr1 = indentStr.repeat(indents);
		const indentStr2 = indentStr.repeat(indents + 1);
		const indentStr3 = indentStr.repeat(indents + 2);

		strs.push(
			`${indentStr1}Type: ${this.fullName.toString()}`
		);
		strs.push(`${indentStr1}Name param: `);
		strs.push(
			...this.nameParams.toReport(indents + 1, indentStr)
		);
		if (this.flagParams.length > 0) {
			strs.push(`${indentStr1}Flags: `);
			this.flagParams.forEach(p =>
				strs.push(...p.toReport(indents + 1, indentStr))
			);
		}
		if (this.stringParams.length > 0) {
			strs.push(`${indentStr1}String params: `);
			this.stringParams.forEach(p =>
				strs.push(`${indentStr2}${p}`)
			);
		}
		if (this.unitParam) {
			strs.push(
				`${indentStr1}Unit param: ${this.unitParam}`
			);
		}

		return strs;
	}
}

export class KeyParams extends ParamBase {
	constructor(
		name: StrSlice,
		public readonly typeParams?: TypeParams[]
	) {
		super(name);
	}

	public static empty(): KeyParams {
		return new KeyParams(StrSlice.empty());
	}

	public toReport(
		indents: number = 0,
		indentStr: string = "   "
	): string[] {
		const strs: string[] = [];
		const indentStr1 = indentStr.repeat(indents);
		const indentStr2 = indentStr.repeat(indents + 1);
		const indentStr3 = indentStr.repeat(indents + 2);

		strs.push(
			`${indentStr1}Key: ${this.fullName.toString()}`
		);
		if (this.typeParams) {
			strs.push(`${indentStr1}Types: `);
			this.typeParams.forEach(typeParam => {
				strs.push(
					...typeParam.toReport(indents + 1, indentStr)
				);
				strs.push("");
			});
		}

		return strs;
	}
}
