import { StrSlice } from "@/utils/slice";
import { TypeError } from "../types/errors";
import {
    ArrayType,
    NumberType,
    SetType,
    StringType,
    TypeBase,
    TypeConstraint
} from "../types/types";

/**
 * Parse a type constraint from a type expression
 * Examples:
 * - string
 * - number
 * - array<string>
 * - set<number>
 */
export function parseTypeConstraint(
    typeExpr: string | StrSlice
): TypeConstraint | TypeError {
    const expr = typeExpr instanceof StrSlice ? 
        typeExpr.value() : typeExpr;
    
    // Check for generic types
    const genericMatch = expr.match(/^(array|set)<(.+)>$/);
    if (genericMatch) {
        const [_, container, elementType] = genericMatch;
        const elementConstraint = parseTypeConstraint(elementType);
        
        if (elementConstraint instanceof TypeError) {
            return elementConstraint;
        }

        switch (container) {
            case "array":
                return new ArrayType(elementConstraint);
            case "set":
                return new SetType(elementConstraint);
            default:
                return new TypeError(
                    `Unknown container type: ${container}`,
                    expr,
                    null,
                    null
                );
        }
    }

    // Handle primitive types
    switch (expr) {
        case "string":
            return new StringType();
        case "number":
            return new NumberType();
        default:
            return new TypeError(
                `Unknown type: ${expr}`,
                expr,
                null,
                null
            );
    }
}

/**
 * Parse type parameters from a key expression
 * Example: key[string, array<number>]
 */
export function parseTypeParams(
    keyExpr: string | StrSlice
): TypeConstraint[] | TypeError {
    const expr = keyExpr instanceof StrSlice ?
        keyExpr.value() : keyExpr;

    const match = expr.match(/^([^[]+)\[(.*)\]$/);
    if (!match) {
        return [];
    }

    const [_, key, params] = match;
    const typeExprs = params.split(",").map(p => p.trim());
    const constraints: TypeConstraint[] = [];

    for (const typeExpr of typeExprs) {
        const constraint = parseTypeConstraint(typeExpr);
        if (constraint instanceof TypeError) {
            return constraint;
        }
        constraints.push(constraint);
    }

    return constraints;
}

/**
 * Extract the base key name without type parameters
 */
export function extractKeyName(
    keyExpr: string | StrSlice
): string {
    const expr = keyExpr instanceof StrSlice ?
        keyExpr.value() : keyExpr;
    
    const match = expr.match(/^([^[]+)/);
    return match ? match[1] : expr;
}
