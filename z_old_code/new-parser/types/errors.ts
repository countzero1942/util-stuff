import { SourceContext } from "./source";
import { LexToken } from "./lex";

/**
 * Base class for all parser errors
 */
export abstract class ParserError extends Error {
    constructor(
        message: string,
        readonly sourceContext: SourceContext | null
    ) {
        super(message);
    }

    /**
     * Get detailed error report
     */
    abstract toReport(): string[];
}

/**
 * Error during lexical analysis
 */
export class LexError extends ParserError {
    constructor(
        message: string,
        readonly invalidContent: string,
        sourceContext: SourceContext | null
    ) {
        super(message, sourceContext);
    }

    toReport(): string[] {
        const lines: string[] = [
            `Lexical Error: ${this.message}`,
            `Invalid content: "${this.invalidContent}"`
        ];

        if (this.sourceContext) {
            const pos = this.sourceContext.range.start;
            lines.push(`at line ${pos.line}, column ${pos.column}`);
        }

        return lines;
    }
}

/**
 * Error during type checking
 */
export class TypeError extends ParserError {
    constructor(
        message: string,
        readonly expectedType: string,
        readonly actualValue: any,
        sourceContext: SourceContext | null
    ) {
        super(message, sourceContext);
    }

    toReport(): string[] {
        const lines: string[] = [
            `Type Error: ${this.message}`,
            `Expected type: ${this.expectedType}`,
            `Actual value: ${this.actualValue}`
        ];

        if (this.sourceContext) {
            const pos = this.sourceContext.range.start;
            lines.push(`at line ${pos.line}, column ${pos.column}`);
        }

        return lines;
    }
}

/**
 * Error during semantic analysis
 */
export class SemanticError extends ParserError {
    constructor(
        message: string,
        readonly token: LexToken
    ) {
        super(message, token.sourceContext);
    }

    toReport(): string[] {
        const lines: string[] = [
            `Semantic Error: ${this.message}`,
            `Token: ${this.token.toString()}`
        ];

        if (this.sourceContext) {
            const pos = this.sourceContext.range.start;
            lines.push(`at line ${pos.line}, column ${pos.column}`);
        }

        return lines;
    }
}
