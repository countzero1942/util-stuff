import { StrSlice } from "@/utils/slice";
import { SourceContext } from "./source";

/**
 * Base class for all lexical tokens
 */
export abstract class LexToken {
    constructor(readonly sourceContext: SourceContext | null = null) {}
    abstract toString(): string;
}

/**
 * Token for empty lines
 */
export class EmptyToken extends LexToken {
    constructor(sourceContext: SourceContext | null = null) {
        super(sourceContext);
    }

    toString(): string {
        return "EmptyToken()";
    }
}

/**
 * Token for invalid lines
 */
export class InvalidToken extends LexToken {
    constructor(
        readonly message: StrSlice,
        sourceContext: SourceContext | null = null
    ) {
        super(sourceContext);
    }

    toString(): string {
        return `InvalidToken(${this.message})`;
    }
}

/**
 * Token for key-only lines
 */
export class KeyToken extends LexToken {
    constructor(
        readonly key: StrSlice,
        sourceContext: SourceContext | null = null
    ) {
        super(sourceContext);
    }

    toString(): string {
        return `KeyToken(${this.key})`;
    }
}

/**
 * Token for key-colon lines
 */
export class KeyColonToken extends LexToken {
    constructor(
        readonly key: StrSlice,
        sourceContext: SourceContext | null = null
    ) {
        super(sourceContext);
    }

    toString(): string {
        return `KeyColonToken(${this.key}:)`;
    }
}

/**
 * Token for key-value lines
 */
export class KeyValueToken extends LexToken {
    constructor(
        readonly key: StrSlice,
        readonly value: StrSlice,
        sourceContext: SourceContext | null = null
    ) {
        super(sourceContext);
    }

    toString(): string {
        return `KeyValueToken(${this.key}: ${this.value})`;
    }
}
