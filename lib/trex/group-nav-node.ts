import chalk from "chalk";
import { GroupName } from "./group-name";
import { GroupMatchNav } from "./group-nav";
import { MatchNav } from "./nav";
import {
	filterNav,
	hasUnnamedBranchesNav,
	type GroupNavLike,
} from "./group-nav-like";

/**
 * GroupMatchNavNode: Parent-aware navigation node with a multi-stage
 * construction lifecycle that yields an effectively immutable result.
 *
 * Lifecycle:
 * - Create an unsealed branch via {@link fromConstructableBranch}.
 * - Add children via {@link addChild} during construction.
 * - Finalize via {@link seal}, which sets the final {@link wholeMatchNav}
 *   and prevents further mutation.
 * - Alternatively, create a sealed leaf via {@link fromLeaf}.
 * Notes:
 * - Parent pointers enable upward navigation; cycles are GC-safe in JS.
 * - Empty children are canonicalized to a shared empty array on seal to
 *   minimize allocations.
 */
export class GroupMatchNavNode implements GroupNavLike<GroupMatchNavNode> {
	/**
	 * Shared, canonical empty children array used to avoid per-node
	 * allocations for leaf nodes and sealed branches without children.
	 */
	private static _defaultChildren: GroupMatchNavNode[] = [];

	#children: GroupMatchNavNode[];
	#wholeMatchNav: MatchNav;

	#parent: GroupMatchNavNode | null = null;

	#isConstructed: boolean;

	/**
	 * Internal constructor. Prefer {@link fromConstructableBranch} for
	 * branch building and {@link fromLeaf} for sealed leaves.
	 *
	 * @param groupName The group name associated with this node.
	 * @param wholeMatchNav The contiguous match for this node. For
	 *        constructable branches, this is a placeholder until {@link seal}.
	 * @param parent The parent node (or null for the root).
	 * @param children The initial children array.
	 * @param isConstructed Whether the node is already sealed (immutable).
	 */
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

	/**
	 * Creates an unsealed (constructable) branch node. Call {@link addChild}
	 * to add children, then {@link seal} to finalize the node.
	 *
	 * @param groupName The group name for this branch.
	 * @param parent The parent node or null for the root.
	 * @returns An unsealed branch node ready for construction.
	 */
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

	private assertIsConstructed(method: string) {
		if (this.#isConstructed === false) {
			throw new Error(
				`'${method}': cannot mutate a constructed group match nav`
			);
		}
	}

	private assertIsConstructing(method: string) {
		if (this.#isConstructed) {
			throw new Error(
				`'${method}': cannot read from a non-constructed group match nav`
			);
		}
	}

	/**
	 * Adds a child to this node during construction. Also sets the child's
	 * parent pointer to this node.
	 *
	 * @throws Error if called after {@link seal}.
	 */
	addChild(child: GroupMatchNavNode) {
		this.assertIsConstructing("addChild");

		// Ensure we don't mutate the shared empty children array.
		// Constructable branches must own a unique children array.
		if (this.#children === GroupMatchNavNode._defaultChildren) {
			this.#children = [];
		}
		child.#parent = this;
		this.#children.push(child);
	}

	/**
	 * Finalizes the node: sets {@link wholeMatchNav}, prevents further
	 * mutation, and canonicalizes empty children to a shared array.
	 *
	 * @param wholeMatchNav The finalized contiguous match for this node.
	 * @throws Error if called more than once.
	 */
	seal(wholeMatchNav: MatchNav) {
		this.assertIsConstructing("seal");

		this.#wholeMatchNav = wholeMatchNav;
		this.#isConstructed = true;
		// Canonicalize empty children to shared cached empty array
		if (this.#children.length === 0) {
			this.#children = GroupMatchNavNode._defaultChildren;
		}
	}

	/**
	 * Creates a sealed leaf node with the given match and optional parent.
	 * The resulting node is immutable (constructed) and has no children.
	 *
	 * @param groupName The group name for this leaf.
	 * @param wholeMatchNav The contiguous match for this leaf.
	 * @param parent The parent node or null for the root.
	 * @returns A sealed leaf node.
	 */
	static fromLeaf(
		groupName: GroupName,
		wholeMatchNav: MatchNav,
		parent: GroupMatchNavNode | null
	): GroupMatchNavNode {
		return new GroupMatchNavNode(
			groupName,
			wholeMatchNav,
			parent,
			GroupMatchNavNode._defaultChildren,
			true
		);
	}

	/**
	 * Finds the nearest ancestor (including this node) whose
	 * {@link GroupName.isNotEmpty} is true. If none is found before
	 * reaching the root, returns the root.
	 *
	 * @remarks Secret names (starting with '@') are treated as not empty = false,
	 * so this method will skip over secret-named nodes as unnamed.
	 */
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

	/**
	 * Collects nodes that satisfy a predicate. Mirrors GroupMatchNav.filter.
	 */
	filter(fn: (group: GroupMatchNavNode) => boolean): GroupMatchNavNode[] {
		this.assertIsConstructed("filter");
		return filterNav<GroupMatchNavNode>(this, fn);
	}

	/**
	 * Internal DFS generator used by the iterator to yield
	 * { group, index, indent } entries.
	 * @internal
	 */
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

	/**
	 * Iterates over the node and its descendants in depth-first, pre-order.
	 * Yields objects of the form `{ group, index, indent }`.
	 */
	*[Symbol.iterator](): Generator<{
		group: GroupMatchNavNode;
		index: number;
		indent: number;
	}> {
		this.assertIsConstructed("[Symbol.iterator]");
		yield* GroupMatchNavNode.genRec({
			group: this,
			index: 0,
			indent: 0,
		});
	}

	/**
	 * The parent node, or null if this is the root.
	 */
	get parent(): GroupMatchNavNode | null {
		return this.#parent;
	}

	/**
	 * Whether this node is the root (has no parent).
	 */
	get isRoot(): boolean {
		return this.#parent === null;
	}

	/**
	 * Whether the node is considered named.
	 * Returns true for the root regardless of its actual name, otherwise
	 * relies on {@link GroupName.isNotEmpty}.
	 */
	get isNamed(): boolean {
		// Note: the root group nav may or may not be named
		// but it is always included in the navigation tree
		// so even if unnamed it is considered to be named
		return this.#parent === null || this.groupName.isNotEmpty;
	}

	/**
	 * Whether the node has no children.
	 *
	 * @throws Error if called on a non-constructed node.
	 */
	get isLeaf(): boolean {
		this.assertIsConstructed("isLeaf");
		return this.#children.length === 0;
	}

	/**
	 * Whether the node has one or more children.
	 *
	 * @throws Error if called on a non-constructed node.
	 */
	get isBranch(): boolean {
		this.assertIsConstructed("isBranch");
		return this.#children.length > 0;
	}

	/**
	 * Read-only list of child nodes. When empty, this is a shared
	 * canonical empty array.
	 *
	 * @throws Error if called on a non-constructed node.
	 */
	get children(): readonly GroupMatchNavNode[] {
		this.assertIsConstructed("children");
		return this.#children;
	}

	/**
	 * The contiguous match for this node. Set during {@link seal} for
	 * constructable branches, or provided at creation for leaves.
	 *
	 * @throws Error if called on a non-constructed node.
	 */
	get wholeMatchNav(): MatchNav {
		this.assertIsConstructed("wholeMatchNav");
		return this.#wholeMatchNav;
	}

	/**
	 * Whether this node has unnamed branches.
	 *
	 * @throws Error if called on a non-constructed node.
	 */
	get hasUnnamedBranches(): boolean {
		this.assertIsConstructed("hasUnnamedBranches");
		return hasUnnamedBranchesNav<GroupMatchNavNode>(this);
	}

	/**
	 * Debug-friendly string with colored formatting (via chalk) showing:
	 * - The node's group name (gray for secret names starting with '@').
	 * - The captured match.
	 * - The number of children.
	 * - The parent group name (or :null for root).
	 *
	 * @throws Error if called on a non-constructed node.
	 */
	toString(): string {
		this.assertIsConstructed("toString");
		const parentName =
			this.#parent === null
				? chalk.blueBright(":null")
				: this.#parent.groupName.isSecret
					? chalk.gray(this.#parent.groupName.toString())
					: chalk.cyan(this.#parent.groupName.toString());

		const groupNameStr = this.groupName.isSecret
			? chalk.gray(this.groupName.toString())
			: chalk.blueBright(this.groupName.toString());

		return (
			`${chalk.magentaBright("GroupNav: ")}` +
			`${"<" + groupNameStr + ">"} ` +
			`'${chalk.green(this.#wholeMatchNav.captureMatch.value)}' ` +
			`+[${chalk.cyan(this.#children.length)}] ` +
			`<${parentName}>`
		);
	}
}
