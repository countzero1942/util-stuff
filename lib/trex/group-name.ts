export abstract class GroupNamerBase {
	public abstract copy(): GroupNamerBase;

	public abstract next(): GroupName;
}

export class GroupName extends GroupNamerBase {
	private constructor(
		public readonly name: string,
		public readonly category: string | undefined
	) {
		super();
	}

	public static fromName(name: string): GroupName {
		if (name === "") {
			throw new Error("'name' cannot be empty");
		}
		return new GroupName(name, undefined);
	}

	public static fromNameAndCategory(
		name: string,
		category: string
	): GroupName {
		if (name === "") {
			throw new Error("'name' cannot be empty");
		}
		if (category === "") {
			throw new Error("'category' cannot be empty");
		}
		return new GroupName(name, category);
	}

	private static _empty: GroupName = new GroupName(
		"",
		undefined
	);
	public static get empty(): GroupName {
		return GroupName._empty;
	}

	public isEmpty(): boolean {
		return this.name === "";
	}

	public isNotEmpty(): boolean {
		return this.name !== "";
	}

	public is(
		name: string,
		category: string | undefined = undefined
	): boolean {
		return (
			this.name === name && this.category === category
		);
	}

	public isGroupName(groupName: GroupName): boolean {
		return (
			this === groupName ||
			(this.name === groupName.name &&
				this.category === groupName.category)
		);
	}

	public override copy(): GroupNamerBase {
		// note: GroupName is immutable
		// so no need to copy
		return this;
	}

	public override next(): GroupName {
		// note: GroupName doesn't change
		// so next name is always itself
		return this;
	}

	private static _fragment =
		GroupName.fromName(":fragment");
	public static get fragment(): GroupName {
		return GroupName._fragment;
	}

	private static _end = GroupName.fromName(":end");
	public static get end(): GroupName {
		return GroupName._end;
	}

	private static _flattened =
		GroupName.fromName(":flattened");
	public static get flattened(): GroupName {
		return GroupName._flattened;
	}

	public toString(): string {
		return `${this.name}${this.category ? ":" + this.category : ""}`;
	}
}

export type GroupNamerMode = "repeat last" | "modulus";

export class GroupNamer extends GroupNamerBase {
	#_mode: GroupNamerMode;
	#_names: readonly GroupName[];
	private _index: number;

	private constructor(
		mode: GroupNamerMode,
		names: readonly GroupName[]
	) {
		super();
		this.#_mode = mode;
		this.#_names = names.slice(); // defensive copy
		this._index = 0;
	}

	public static from(
		mode: GroupNamerMode,
		names: readonly GroupName[]
	): GroupNamer {
		return new GroupNamer(mode, names);
	}

	public copy(): GroupNamerBase {
		return GroupNamer.from(this.#_mode, this.#_names);
	}

	public next(): GroupName {
		const nextName = this.#_names[this._index];

		switch (this.#_mode) {
			case "repeat last":
				const lastIndex = this.#_names.length - 1;
				if (this._index < lastIndex) {
					this._index++;
				}
				break;
			case "modulus":
				this._index =
					(this._index + 1) % this.#_names.length;
				break;
			default:
				throw "never";
		}

		return nextName;
	}
}
