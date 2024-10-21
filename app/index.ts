import { logSplitHeads } from "@/parser/parser-start";
import { div, divshort, log } from "@/utils/log";

export abstract class TypeBase {
	constructor(
		public readonly type: string,
		public readonly subtype: string
	) {}

	public abstract toKey(): string;
}

export abstract class RBase extends TypeBase {
	constructor(subtype: string) {
		super(".R", subtype);
	}
}

export class RPrec extends RBase {
	constructor(public readonly precision: number = 15) {
		super(":Prec");
	}

	public toKey(): string {
		return `|${this.type}|${this.subtype}|${this.precision}|`;
	}
}

export class RFixed extends RBase {
	constructor(public readonly fixed: number = 2) {
		super(":Fixed");
	}

	public toKey(): string {
		return `|${this.type}|${this.subtype}|${this.fixed}|`;
	}
}

class ZNum extends TypeBase {
	constructor(
		type: string = ".Z",
		subtype: string = "",
		public readonly min: number = Number.MIN_SAFE_INTEGER,
		public readonly max: number = Number.MAX_SAFE_INTEGER
	) {
		super(type, subtype);
	}

	public toKey(): string {
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
}

class WNum extends ZNum {
	constructor() {
		super(".W", "", 0);
	}
}

class NNum extends ZNum {
	constructor() {
		super(".N", "", 1);
	}
}

type Value<TValue, TType> = {
	type: TType;
	value: TValue;
};

const getTypeDefaults = () => {};

class TypeMap {
	private readonly typeMap: Map<string, any> = new Map();
	constructor() {}

	public has<T extends TypeBase>(type: T): boolean {
		return this.typeMap.has(type.toKey());
	}

	public addOrGet<T extends TypeBase>(type: T): T {
		const key = type.toKey();
		const t = this.typeMap.get(key) as T | undefined;

		if (!t) {
			this.typeMap.set(key, type);
			log("==>addOrGet new:");
			log(key);
			log(type);
			divshort();
			return type;
		} else {
			log("==>addOrGet existing:");
			log(key);
			log(t);
			divshort();
			return t;
		}
	}
}

const testRPrec = () => {
	const typeMap = new TypeMap();

	const rt = new RPrec();
	const rt1 = typeMap.addOrGet(rt);
	const rt2 = typeMap.addOrGet(new RPrec());
	const rt3 = typeMap.addOrGet(new RPrec(6));
	const b = typeMap.has(rt);
	const b1 = typeMap.has(rt1);
	const b2 = typeMap.has(rt2);
	const b3 = typeMap.has(rt3);

	log(typeMap);
	log(`has rt: ${b}`);
	log(`has rt1: ${b1}`);
	log(`has rt2: ${b2}`);
	log(`has rt3: ${b3}`);
	log(`rt === rt1: ${rt === rt1}`);
	log(`rt === rt2: ${rt === rt2}`);
	log(`rt === rt3: ${rt === rt3}`);
	log(`rt === new RPrec(): ${rt === new RPrec()}`);
	log(rt);
};

const testRFixed = () => {
	const typeMap = new TypeMap();

	const rt = new RFixed();
	const rt1 = typeMap.addOrGet(rt);
	const rt2 = typeMap.addOrGet(new RFixed());
	const rt3 = typeMap.addOrGet(new RFixed(4));
	const b = typeMap.has(rt);
	const b1 = typeMap.has(rt1);
	const b2 = typeMap.has(rt2);
	const b3 = typeMap.has(rt3);

	log(typeMap);
	log(`has rt: ${b}`);
	log(`has rt1: ${b1}`);
	log(`has rt2: ${b2}`);
	log(`has rt3: ${b3}`);
	log(`rt === rt1: ${rt === rt1}`);
	log(`rt === rt2: ${rt === rt2}`);
	log(`rt === rt3: ${rt === rt3}`);
	log(`rt === new RPrec(): ${rt === new RFixed()}`);
	log(rt);
};

// await logSplitHeads();
testRPrec();
div();
testRFixed();
