import { div, divl, divs, log, logh } from "@/utils/log";
import { StrSlice } from "@/utils/slice";
import { getFullType } from "@/utils/types";
import { get } from "node:http";
import { TypeValuePair } from "@/parser/types/parse-types";
import { NumberErr } from "@/parser/types/err-types";
import {
	parseNNum,
	parseRFixedNum,
	parseRPrecNum,
	parseWNum,
	parseZNum,
} from "@/parser/utils/parse-num";
import { convertParseNumberToHeadVersion } from "@/parser/utils/parse-value";
import {
	KeyValueBase,
	ParserErrNode,
} from "@/parser/types/key-value";

export type TypeInfo = {
	type: string;
	parentType?: string;
	variantType?: string;
};

export abstract class TypeBase {
	/**
	 * The constructor for the TypeBase class.
	 *
	 * @param typeInfo The TypeInfo object that describes the type.
	 * @param uniqueKeyMembers Optional additional members to include in the
	 * unique key of the type object. If not specified, just the type string
	 * is used.
	 */
	constructor(
		public readonly typeInfo: TypeInfo,
		uniqueKeyMembers?: string[]
	) {
		this.uniqueKey = this.makeKey(uniqueKeyMembers);
	}

	/**
	 * Returns the unique key of the type object.
	 *
	 * This is used to determine if two type objects are the same
	 * for the purposes of a type map key.
	 */
	public readonly uniqueKey: string;

	/**
	 * Returns the type string of the type object.
	 * @returns The type string of the type object
	 */
	public get type(): string {
		return this.typeInfo.type;
	}

	public equals(other: TypeBase): boolean {
		return this.uniqueKey === other.uniqueKey;
	}

	/**
	 * Private function to generate a unique key for the type object.
	 *
	 * This combines the type string with the parent type and variant type
	 * strings, if applicable, and any additional members specified.
	 *
	 * The resulting key is a string that is guaranteed to be unique
	 * for different type objects.
	 *
	 * @param additionalMembers Optional additional members to include
	 * in the key
	 * @returns The unique key string
	 */
	private makeKey(additionalMembers?: string[]): string {
		const types: string[] = [];
		types.push(`{T}${this.typeInfo.type}`);

		if (this.typeInfo.parentType) {
			types.push(`{PT}${this.typeInfo.parentType}`);
		}

		if (this.typeInfo.variantType) {
			types.push(`{VT}${this.typeInfo.variantType}`);
		}

		if (additionalMembers) {
			types.push(...additionalMembers);
		}

		return `|${types.join("|")}|`;
	}

	public toParsableString(): string {
		return this.typeInfo.type;
	}
}

export class Str extends TypeBase {
	constructor() {
		super({ type: ".$" });
	}
}

export class NoNum extends TypeBase {
	constructor() {
		super({ type: ".NoNum" });
	}
}

export abstract class NumBase extends TypeBase {
	constructor(
		typeInfo: TypeInfo,
		uniqueKeyMembers?: string[]
	) {
		super(typeInfo, uniqueKeyMembers);
	}

	public abstract parseNum(
		valueSlice: StrSlice
	): TypeValuePair | NumberErr;

	public parseNumHeadVersion(
		head: KeyValueBase,
		valueSlice: StrSlice
	): TypeValuePair | ParserErrNode {
		const typeValuePairOrErr = this.parseNum(valueSlice);

		return convertParseNumberToHeadVersion(
			typeValuePairOrErr,
			head,
			valueSlice
		);
	}
}

export class RNumBase extends NumBase {
	constructor(
		typeInfo: TypeInfo = { type: ".R" },
		uniqueKeyMembers?: string[]
	) {
		super(typeInfo, uniqueKeyMembers);
	}

	public parseNum(
		valueSlice: StrSlice
	): TypeValuePair | NumberErr {
		return parseRPrecNum(valueSlice);
	}
}

export class RPrec extends RNumBase {
	constructor(
		public readonly precision: number = 15,
		public readonly UseEngineeringNotation: boolean = false,
		public readonly SciNotPower: number = 9
	) {
		const additionalMembers: string[] = [
			`{Prec}${precision}`,
			`{G}${UseEngineeringNotation}`,
			`{Pow}${SciNotPower}`,
		];
		super(
			{ type: ".R", variantType: ":Prec" },
			additionalMembers
		);
	}

	public toParsableString(): string {
		const gString = this.UseEngineeringNotation
			? " %g"
			: "";

		return `${this.typeInfo.type}:${this.precision}:${this.SciNotPower}${gString}`;
	}
}

export class RFixed extends RNumBase {
	constructor(public readonly fixed: number = 2) {
		super({ type: ".R", variantType: ":Fixed" }, [
			`{Places}${fixed}`,
		]);
	}

	public toParsableString(): string {
		return `${this.typeInfo.type}.${this.fixed}`;
	}

	public parseNum(
		valueSlice: StrSlice
	): TypeValuePair | NumberErr {
		return parseRFixedNum(valueSlice, this.fixed);
	}
}

export class ZNum extends NumBase {
	constructor(
		typeInfo: TypeInfo = { type: ".Z" },
		public readonly min: number = Number.MIN_SAFE_INTEGER,
		public readonly max: number = Number.MAX_SAFE_INTEGER
	) {
		const minStr =
			min === Number.MIN_SAFE_INTEGER
				? "(min)-MAX"
				: `(min)${min.toString()}`;
		const maxStr =
			max === Number.MAX_SAFE_INTEGER
				? "(max)+MAX"
				: `(max)${max.toString()}`;

		super(typeInfo, [minStr, maxStr]);
	}

	public parseNum(
		valueSlice: StrSlice
	): TypeValuePair | NumberErr {
		return parseZNum(valueSlice);
	}
}

export class WNum extends ZNum {
	constructor() {
		super({ type: ".W", parentType: ".Z" }, 0);
	}

	public parseNum(
		valueSlice: StrSlice
	): TypeValuePair | NumberErr {
		return parseWNum(valueSlice);
	}
}

export class NNum extends ZNum {
	constructor() {
		super({ type: ".N", parentType: ".Z" }, 1);
	}

	public parseNum(
		valueSlice: StrSlice
	): TypeValuePair | NumberErr {
		return parseNNum(valueSlice);
	}
}
