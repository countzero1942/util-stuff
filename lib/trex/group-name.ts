export abstract class GroupNamerBase {
	abstract copy(): GroupNamerBase;

	abstract next(): GroupName;
}

export class GroupName extends GroupNamerBase {
	private constructor(
		public readonly name: string,
		public readonly category: string | undefined
	) {
		super();
	}

	static fromName(name: string): GroupName {
		if (name === "") {
			return GroupName.empty;
		}
		return new GroupName(name, undefined);
	}

	static fromNameAndCategory(name: string, category: string): GroupName {
		if (name === "") {
			throw new Error("'name' cannot be empty");
		}
		if (category === "") {
			throw new Error("'category' cannot be empty");
		}
		return new GroupName(name, category);
	}

	private static _empty: GroupName = new GroupName("", undefined);
	static get empty(): GroupName {
		return GroupName._empty;
	}

	get isSecret(): boolean {
		return this.name.startsWith("@");
	}

	get isEmpty(): boolean {
		return this.name === "" || this.name.startsWith("@");
	}

	get isNotEmpty(): boolean {
		return this.name !== "" && !this.name.startsWith("@");
	}

	is(name: string, category: string | undefined = undefined): boolean {
		return this.name === name && this.category === category;
	}

	isGroupName(groupName: GroupName): boolean {
		return (
			this === groupName ||
			(this.name === groupName.name &&
				this.category === groupName.category)
		);
	}

	override copy(): GroupNamerBase {
		// note: GroupName is immutable
		// so no need to copy
		return this;
	}

	override next(): GroupName {
		// note: GroupName doesn't change
		// so next name is always itself
		return this;
	}

	private static _fragment = GroupName.fromName(":fragment");
	static get fragment(): GroupName {
		return GroupName._fragment;
	}

	private static _end = GroupName.fromName(":end");
	static get end(): GroupName {
		return GroupName._end;
	}

	toString(): string {
		return `${this.name}${this.category ? ":" + this.category : ""}`;
	}
}

export class GroupNameSet<TName extends string> {
	readonly names: readonly TName[];
	#_nameSet: Map<TName, GroupName>;
	constructor(names: readonly TName[]) {
		this.names = names.slice();
		this.#_nameSet = new Map(
			this.names.map(name => [name, GroupName.fromName(name)])
		);
	}

	static fromNames<TName extends string>(...names: readonly TName[]) {
		return new GroupNameSet(names);
	}

	getName(name: TName): GroupName {
		const group = this.#_nameSet.get(name);
		if (!group) {
			throw new Error(`GroupNameSet: No group found for name: ${name}`);
		}
		return group;
	}
}

export type GroupNamerMode = "repeat last" | "modulus";

export class GroupNamer extends GroupNamerBase {
	#_mode: GroupNamerMode;
	#_names: readonly GroupName[];
	private _index: number;

	private constructor(mode: GroupNamerMode, names: readonly GroupName[]) {
		super();
		this.#_mode = mode;
		this.#_names = names.slice(); // defensive copy
		this._index = 0;
	}

	static from(
		mode: GroupNamerMode,
		names: readonly GroupName[]
	): GroupNamer {
		return new GroupNamer(mode, names);
	}

	copy(): GroupNamerBase {
		return GroupNamer.from(this.#_mode, this.#_names);
	}

	next(): GroupName {
		const nextName = this.#_names[this._index];

		switch (this.#_mode) {
			case "repeat last":
				const lastIndex = this.#_names.length - 1;
				if (this._index < lastIndex) {
					this._index++;
				}
				break;
			case "modulus":
				this._index = (this._index + 1) % this.#_names.length;
				break;
			default:
				throw "never";
		}

		return nextName;
	}
}
