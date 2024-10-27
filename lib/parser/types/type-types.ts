import { div, divl, divs, log, logh } from "@/utils/log";
import { getFullType } from "@/utils/types";

export abstract class TypeBase {
	constructor(
		public readonly type: string,
		public readonly subtype: string
	) {}

	public abstract toKey(): string;
}

export class NoNum extends TypeBase {
	private readonly key: string;
	constructor() {
		super(".NoNum", "");
		this.key = `|${this.type}|${this.subtype}|`;
	}
	public toKey(): string {
		return this.key;
	}
}

export abstract class RBase extends TypeBase {
	constructor(subtype: string) {
		super(".R", subtype);
	}
}

export class RPrec extends RBase {
	private readonly key: string;
	constructor(
		public readonly precision: number = 15,
		public readonly UseEngineeringNotation: boolean = false,
		public readonly SciNotPower: number = 9
	) {
		super(":Prec");

		this.key = `|${this.type}|${this.subtype}|${this.precision}|${this.UseEngineeringNotation}|${this.SciNotPower}|`;
	}

	public toKey(): string {
		return this.key;
	}
}

export class RFixed extends RBase {
	private readonly key: string;
	constructor(public readonly fixed: number = 2) {
		super(":Fixed");

		this.key = `|${this.type}|${this.subtype}|${this.fixed}|`;
	}

	public toKey(): string {
		return this.key;
	}
}

export class ZNum extends TypeBase {
	private readonly key: string;
	constructor(
		subtype: string = "",
		public readonly min: number = Number.MIN_SAFE_INTEGER,
		public readonly max: number = Number.MAX_SAFE_INTEGER
	) {
		super(".Z", subtype);

		this.key = this.getKey();
	}

	private getKey() {
		const minStr =
			this.min === Number.MIN_SAFE_INTEGER
				? "-MAX"
				: this.min.toString();
		const maxStr =
			this.max === Number.MAX_SAFE_INTEGER
				? "+MAX"
				: this.max.toString();
		return `|${this.type}|${this.subtype}|${minStr}|${maxStr}|`;
	}

	public toKey(): string {
		return this.key;
	}
}

export class WNum extends ZNum {
	constructor() {
		super(".W", 0);
	}
}

export class NNum extends ZNum {
	constructor() {
		super(".N", 1);
	}
}

type Value<TValue, TType> = {
	type: TType;
	value: TValue;
};

const getTypeDefaults = () => {};
