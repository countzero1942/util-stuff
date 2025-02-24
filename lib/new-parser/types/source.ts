import { StrSlice } from "@/utils/slice";

/**
 * Represents a position in the source text
 */
export interface SourcePosition {
    readonly line: number;
    readonly column: number;
}

/**
 * Represents a range in the source text
 */
export interface SourceRange {
    readonly start: SourcePosition;
    readonly end: SourcePosition;
}

/**
 * Represents source context information for LSP integration
 */
export interface SourceContext {
    readonly content: StrSlice;
    readonly indent: number;
    readonly range: SourceRange;
}

/**
 * Creates a SourceContext from basic information
 */
export function createSourceContext(
    content: StrSlice,
    indent: number,
    line: number,
    startColumn: number,
    endColumn: number
): SourceContext {
    return {
        content,
        indent,
        range: {
            start: { line, column: startColumn },
            end: { line, column: endColumn }
        }
    };
}

/**
 * Creates a minimal SourceContext for testing
 */
export function createTestSourceContext(content: string): SourceContext {
    return createSourceContext(
        new StrSlice(content),
        0,
        1,
        0,
        content.length
    );
}
