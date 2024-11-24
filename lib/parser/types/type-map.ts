import { log, logagn } from "@/utils/log";
import { TypeBase } from "./type-types";

export class TypeMap {
	private readonly typeMap: Map<string, any> = new Map();
	constructor() {}

	public has<T extends TypeBase>(type: T): boolean {
		return this.typeMap.has(type.uniqueKey);
	}

	public addOrGet<T extends TypeBase>(type: T): T {
		const key = type.uniqueKey;
		const t = this.typeMap.get(key) as T | undefined;

		if (!t) {
			this.typeMap.set(key, type);

			logagn("addOrGet new", key, type);

			// log("══▶ addOrGet new:");
			// log(key);
			// log(type);
			// log();
			return type;
		} else {
			logagn("addOrGet existing", key, t);

			// log("══▶ addOrGet existing:");
			// log(key);
			// log(t);
			// log();
			return t;
		}
	}
}
