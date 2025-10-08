import chalk from "chalk";
import { GroupName } from "./group-name";
import { GroupMatchNav } from "./group-nav";
import { MatchNav } from "./nav";

export class GroupMatchNavNode {
	private static _defaultChildren: GroupMatchNavNode[] = [];

	#children: GroupMatchNavNode[];
	#wholeMatchNav: MatchNav;

	#parent: GroupMatchNavNode | null = null;

	#isConstructed: boolean;

	protected constructor(
		public readonly groupName: GroupName,
		wholeMatchNav: MatchNav,
		parent: GroupMatchNavNode | null,
		children: GroupMatchNavNode[],
		isConstructed: boolean
	) {
		this.#parent = parent;
		this.#isConstructed = isConstructed;
		this.#children = children;
		this.#wholeMatchNav = wholeMatchNav;
	}

	static fromConstructableBranch(
		groupName: GroupName,
		parent: GroupMatchNavNode | null
	) {
		return new GroupMatchNavNode(
			groupName,
			MatchNav.fromString(""),
			parent,
			[],
			false
		);
	}

	addChild(child: GroupMatchNavNode) {
		if (this.#isConstructed) {
			throw new Error(
				"Cannot add children to a constructed group match nav"
			);
		}
		child.#parent = this;
		this.#children.push(child);
	}

	seal(wholeMatchNav: MatchNav) {
		if (this.#isConstructed) {
			throw new Error("Cannot seal a constructed group match nav");
		}
		this.#wholeMatchNav = wholeMatchNav;
		this.#isConstructed = true;
	}

	getFirstNamedAncestor(): GroupMatchNavNode {
		let current: GroupMatchNavNode = this;
		while (true) {
			if (current.groupName.isNotEmpty) {
				return current;
			}
			if (current.#parent === null) {
				return current;
			}
			current = current.#parent;
		}
	}

	forEach(
		fn: (group: GroupMatchNavNode, index: number, indent: number) => void
	) {
		const enumerateGroupsRec = (
			group: GroupMatchNavNode,
			groupIndex: number,
			indent: number
		) => {
			fn(group, groupIndex, indent);
			group.#children.forEach((child, childIndex) => {
				enumerateGroupsRec(child, childIndex, indent + 1);
			});
		};

		enumerateGroupsRec(this, 0, 0);
	}

	private static *genRec(args: {
		group: GroupMatchNavNode;
		index: number;
		indent: number;
	}): Generator<{
		group: GroupMatchNavNode;
		index: number;
		indent: number;
	}> {
		yield args;
		let index = 0;
		for (const child of args.group.children) {
			yield* GroupMatchNavNode.genRec({
				group: child,
				index,
				indent: args.indent + 1,
			});
			index++;
		}
	}

	*[Symbol.iterator](): Generator<{
		group: GroupMatchNavNode;
		index: number;
		indent: number;
	}> {
		yield* GroupMatchNavNode.genRec({
			group: this,
			index: 0,
			indent: 0,
		});
	}

	get parent(): GroupMatchNavNode | null {
		return this.#parent;
	}

	get isRoot(): boolean {
		return this.#parent === null;
	}

	get isNamed(): boolean {
		// Note: the root group nav may or may not be named
		// but it is always included in the navigation tree
		// so even if unnamed it is considered to be named
		return this.#parent === null || this.groupName.isNotEmpty;
	}

	get isLeaf(): boolean {
		return this.#children.length === 0;
	}

	get isBranch(): boolean {
		return this.#children.length > 0;
	}

	get children(): readonly GroupMatchNavNode[] {
		return this.#children;
	}

	get wholeMatchNav(): MatchNav {
		return this.#wholeMatchNav;
	}

	toString(): string {
		const parentName =
			this.#parent === null
				? chalk.blueBright(":null")
				: this.#parent.groupName.isSecret
					? chalk.gray(this.#parent.groupName.toString())
					: chalk.cyan(this.#parent.groupName.toString());

		const groupName = this.groupName.isSecret
			? chalk.gray(this.groupName.toString())
			: chalk.blueBright(this.groupName.toString());

		return (
			`${chalk.magentaBright("GroupNav: ")}` +
			`${"<" + groupName + ">"} ` +
			`'${chalk.green(this.#wholeMatchNav.captureMatch.value)}' ` +
			`+[${chalk.cyan(this.#children.length)}] ` +
			`<${parentName}>`
		);
	}
}
