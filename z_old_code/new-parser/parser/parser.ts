import {
    StringType,
    NumberType,
    BooleanType,
    ArrayType,
    SetType,
    TypeBase,
    TypeValuePair,
    TypeConstraint
} from "../types/types";

import {
    EmptyToken,
    InvalidToken,
    KeyToken,
    KeyValueToken,
    LexToken
} from "../types/lex";

import { SourceContext } from "../types/source";

import {
    ASTNode,
    TraitNode,
    TypedFieldNode,
    ArrayNode,
    SetNode
} from "../types/ast";

export class Parser {
    private tokens: LexToken[] = [];
    private position: number = 0;

    parseNodes(tokens: LexToken[]): ASTNode[] {
        this.tokens = tokens;
        this.position = 0;
        const nodes: ASTNode[] = [];

        while (this.position < this.tokens.length) {
            const token = this.tokens[this.position];
            if (!token) break;

            if (token instanceof EmptyToken) {
                this.position++;
                continue;
            }

            if (token instanceof InvalidToken) {
                throw new Error(`Invalid token at line ${token.sourceContext?.range.start.line}`);
            }

            const node = this.parseNode(token);
            if (node) {
                nodes.push(node);
            }
            
            this.position++;
        }

        return nodes;
    }

    private parseNode(token: LexToken): ASTNode | null {
        const indent = token.sourceContext?.indent ?? 0;
        const children: ASTNode[] = [];

        if (token instanceof KeyValueToken) {
            // Check if this is a key with type constraints
            const typeMatch = token.key.value.match(/^(\w+)\[(\w+)<(\w+)>\]$/);
            if (typeMatch && typeMatch.length === 4) {  
                const [, key, containerType, elementType] = typeMatch;
                // Additional null check since we know these values exist now
                if (key && containerType && elementType) {
                    if (containerType === "array") {
                        return this.parseArrayNode(key, elementType, token.sourceContext);
                    } else if (containerType === "set") {
                        return this.parseSetNode(key, elementType, token.sourceContext);
                    }
                }
            }

            // Parse children if this token has any
            this.position++; // Move past current token
            while (this.position < this.tokens.length) {
                const childToken = this.tokens[this.position];
                if (!childToken) break;

                const childIndent = childToken.sourceContext?.indent ?? 0;
                if (childIndent <= indent) break;

                const childNode = this.parseNode(childToken);
                if (childNode) {
                    children.push(childNode);
                }
                this.position++;
            }

            // If we have children, this is a trait node
            if (children.length > 0) {
                return new TraitNode(
                    token.key.value,
                    children,
                    [new TypeConstraint(new StringType())],
                    token.sourceContext
                );
            }

            // Otherwise, this is a typed field node
            const value = token.value?.value ?? "";
            return new TypedFieldNode(
                token.key.value,
                new TypeValuePair(value, new StringType()),
                token.sourceContext
            );
        }

        return null;
    }

    private parseArrayNode(key: string, elementType: string, sourceContext: SourceContext | null): ArrayNode {
        const values: any[] = [];
        const typeConstraint = this.parseTypeConstraint(elementType);

        this.position++; // Move past the array definition token
        while (this.position < this.tokens.length) {
            const token = this.tokens[this.position];
            if (!token) break;

            const tokenIndent = token.sourceContext?.indent ?? 0;
            const expectedIndent = (sourceContext?.indent ?? 0) + 1;
            if (tokenIndent !== expectedIndent) break;

            if (token instanceof KeyToken) {
                values.push(token.key.value);
            }

            this.position++;
        }

        return new ArrayNode(
            key,
            values,
            typeConstraint.type,
            sourceContext
        );
    }

    private parseSetNode(key: string, elementType: string, sourceContext: SourceContext | null): SetNode {
        const values = new Set<any>();
        const typeConstraint = this.parseTypeConstraint(elementType);

        this.position++; // Move past the set definition token
        while (this.position < this.tokens.length) {
            const token = this.tokens[this.position];
            if (!token) break;

            const tokenIndent = token.sourceContext?.indent ?? 0;
            const expectedIndent = (sourceContext?.indent ?? 0) + 1;
            if (tokenIndent !== expectedIndent) break;

            if (token instanceof KeyToken) {
                values.add(token.key.value);
            }

            this.position++;
        }

        return new SetNode(
            key,
            values,
            typeConstraint.type,
            sourceContext
        );
    }

    private parseTypeConstraint(type: string): TypeConstraint {
        switch (type.toLowerCase()) {
            case "string":
                return new TypeConstraint(new StringType());
            case "number":
                return new TypeConstraint(new NumberType());
            case "boolean":
                return new TypeConstraint(new BooleanType());
            default:
                return new TypeConstraint(new StringType());
        }
    }
}
