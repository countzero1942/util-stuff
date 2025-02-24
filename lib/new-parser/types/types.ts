/**
 * Interface for type constraints
 */
export interface TypeBase {
    /**
     * Validate a value against this type constraint
     */
    validate(value: any): boolean;

    /**
     * String representation of the type
     */
    toString(): string;
}

/**
 * Type constraint for strings
 */
export class StringType implements TypeBase {
    /**
     * Validate a value against this type constraint
     */
    validate(value: any): boolean {
        return typeof value === "string";
    }

    /**
     * String representation of the type
     */
    toString(): string {
        return "string";
    }
}

/**
 * Type constraint for booleans
 */
export class BooleanType implements TypeBase {
    /**
     * Validate a value against this type constraint
     */
    validate(value: any): boolean {
        return typeof value === "boolean";
    }

    /**
     * String representation of the type
     */
    toString(): string {
        return "boolean";
    }
}

/**
 * Type constraint for numbers
 */
export class NumberType implements TypeBase {
    /**
     * Validate a value against this type constraint
     */
    validate(value: any): boolean {
        return typeof value === "number";
    }

    /**
     * String representation of the type
     */
    toString(): string {
        return "number";
    }
}

/**
 * Type constraint for arrays
 */
export class ArrayType implements TypeBase {
    /**
     * The type constraint for the elements of the array
     */
    constructor(
        readonly elementType: TypeBase
    ) {}

    /**
     * Validate a value against this type constraint
     */
    validate(value: any): boolean {
        if (!Array.isArray(value)) return false;
        return value.every(item => this.elementType.validate(item));
    }

    /**
     * String representation of the type
     */
    toString(): string {
        return `array<${this.elementType.toString()}>`;
    }
}

/**
 * Type constraint for sets
 */
export class SetType implements TypeBase {
    /**
     * The type constraint for the elements of the set
     */
    constructor(
        readonly elementType: TypeBase
    ) {}

    /**
     * Validate a value against this type constraint
     */
    validate(value: any): boolean {
        if (!(value instanceof Set)) return false;
        return Array.from(value).every(item => this.elementType.validate(item));
    }

    /**
     * String representation of the type
     */
    toString(): string {
        return `set<${this.elementType.toString()}>`;
    }
}

/**
 * A pair of a value and its type constraint
 */
export class TypeValuePair {
    /**
     * The value
     */
    readonly value: any;

    /**
     * The type constraint
     */
    readonly type: TypeBase;

    /**
     * Create a new TypeValuePair
     */
    constructor(
        value: any,
        type: TypeBase
    ) {
        this.value = value;
        this.type = type;
    }
}

/**
 * A type constraint with an optional required flag
 */
export class TypeConstraint {
    /**
     * The underlying type constraint
     */
    readonly type: TypeBase;

    /**
     * Whether the value is required
     */
    readonly required: boolean;

    /**
     * Create a new TypeConstraint
     */
    constructor(
        type: TypeBase,
        required: boolean = true
    ) {
        this.type = type;
        this.required = required;
    }

    /**
     * Validate a value against this type constraint
     */
    validate(value: any): boolean {
        if (value === undefined || value === null) {
            return !this.required;
        }
        return this.type.validate(value);
    }

    /**
     * String representation of the type
     */
    toString(): string {
        return `${this.type.toString()}${this.required ? "" : "?"}`;
    }
}
