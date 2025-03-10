import { TypeBase, TypeValuePair, TypeConstraint } from "./types";
import { SourceContext } from "./source";

/**
 * Base class for all AST nodes
 */
export abstract class ASTNode {
    constructor(
        readonly sourceContext: SourceContext | null
    ) {}

    abstract toString(): string;
}

/**
 * Node representing a trait definition with children
 */
export class TraitNode extends ASTNode {
    constructor(
        readonly key: string,
        readonly children: ASTNode[],
        readonly constraints: TypeConstraint[],
        sourceContext: SourceContext | null
    ) {
        super(sourceContext);
    }

    toString(): string {
        return `TraitNode(${this.key})`;
    }
}

/**
 * Node representing a typed key-value field
 */
export class TypedFieldNode extends ASTNode {
    constructor(
        readonly key: string,
        readonly value: TypeValuePair,
        sourceContext: SourceContext | null
    ) {
        super(sourceContext);
    }

    toString(): string {
        return `TypedFieldNode(${this.key}: ${this.value})`;
    }
}

/**
 * Node representing an array of values
 */
export class ArrayNode extends ASTNode {
    constructor(
        readonly key: string,
        readonly values: any[],
        readonly elementType: TypeBase,
        sourceContext: SourceContext | null
    ) {
        super(sourceContext);
    }

    toString(): string {
        return `ArrayNode(${this.key}[${this.values.join(", ")}])`;
    }
}

/**
 * Node representing a set of values
 */
export class SetNode extends ASTNode {
    constructor(
        readonly key: string,
        readonly values: Set<any>,
        readonly elementType: TypeBase,
        sourceContext: SourceContext | null
    ) {
        super(sourceContext);
    }

    toString(): string {
        return `SetNode(${this.key}{${Array.from(this.values).join(", ")}})`;
    }
}
