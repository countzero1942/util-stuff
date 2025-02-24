import { StrSlice } from "@/utils/slice";
import { SourceContext } from "../types/source";
import {
    EmptyToken,
    InvalidToken,
    KeyColonToken,
    KeyToken,
    KeyValueToken,
    LexToken
} from "../types/lex";

/**
 * Options for the lexer
 */
export interface LexerOptions {
    /** Whether to track source information */
    trackSource?: boolean;
}

/**
 * Default lexer options
 */
const DEFAULT_OPTIONS: Required<LexerOptions> = {
    trackSource: false
};

/**
 * Lexer for the trait language
 */
export class Lexer {
    private readonly options: Required<LexerOptions>;

    constructor(options: LexerOptions = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    /**
     * Tokenize a string into a stream of tokens
     */
    tokenize(input: string | StrSlice): Iterable<LexToken> {
        const inputSlice = typeof input === 'string' ? new StrSlice(input) : input;
        return this.tokenizeLines(inputSlice);
    }

    /**
     * Tokenize a string into a stream of tokens, preserving line information
     */
    *tokenizeLines(input: StrSlice): Iterable<LexToken> {
        const lines = input.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i] ?? new StrSlice("");
            yield this.tokenizeLine(line, i + 1);
        }
    }

    /**
     * Tokenize a single line
     */
    public tokenizeLine(line: string | StrSlice, lineNumber: number): LexToken {
        const lineSlice = typeof line === 'string' ? new StrSlice(line) : line;
        const trimmed = lineSlice.trimEnd();
        
        if (trimmed.isEmpty || trimmed.toString() === ":") {
            return new EmptyToken(this.createSourceContext(
                trimmed,
                0,
                lineNumber
            ));
        }

        // Count indentation
        const indent = this.countIndentation(lineSlice);
        if (indent === -1) {
            return new InvalidToken(
                new StrSlice("Invalid indentation"),
                this.createSourceContext(
                    trimmed,
                    0,
                    lineNumber
                )
            );
        }

        // Create source context with proper indentation
        const sourceContext = this.createSourceContext(
            trimmed,
            indent,
            lineNumber
        );

        // Split key and value
        const colonIndex = trimmed.indexOf(":");
        if (colonIndex === -1) {
            return new KeyToken(
                trimmed,
                sourceContext
            );
        }

        const key = trimmed.slice(0, colonIndex);
        const value = trimmed.slice(colonIndex + 1).trim();

        if (value.isEmpty) {
            return new KeyColonToken(
                key,
                sourceContext
            );
        }

        return new KeyValueToken(
            key,
            value,
            sourceContext
        );
    }

    /**
     * Count the number of indentation levels
     * Returns -1 if indentation is invalid (contains spaces)
     */
    private countIndentation(line: StrSlice): number {
        let pos = 0;
        let indent = 0;

        while (pos < line.length && /\s/.test(line.slice(pos, pos + 1).toString())) {
            const char = line.slice(pos, pos + 1).toString();
            if (char === "\t") {
                indent++;
            } else {
                // Any non-tab whitespace is invalid
                return -1;
            }
            pos++;
        }

        return indent;
    }

    /**
     * Create a source context for a token
     */
    private createSourceContext(
        content: StrSlice,
        indent: number,
        lineNumber: number
    ): SourceContext | null {
        if (!this.options.trackSource) {
            return null;
        }

        return {
            content,
            indent,
            range: {
                start: { line: lineNumber, column: 1 },
                end: { line: lineNumber, column: content.length + 1 }
            }
        };
    }
}
