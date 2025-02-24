import { describe, it, expect } from "@jest/globals";
import {
    parseTypeConstraint,
    parseTypeParams,
    extractKeyName
} from "@/new-parser/utils/type-parser";
import {
    ArrayType,
    NumberType,
    SetType,
    StringType,
    TypeError
} from "@/new-parser/types/types";
import { StrSlice } from "@/utils/slice";

describe("Type Parser Utils", () => {
    describe("parseTypeConstraint", () => {
        it("parses primitive types", () => {
            const stringType = parseTypeConstraint("string");
            expect(stringType).toBeInstanceOf(StringType);

            const numberType = parseTypeConstraint("number");
            expect(numberType).toBeInstanceOf(NumberType);
        });

        it("parses array types", () => {
            const arrayType = parseTypeConstraint("array<string>");
            expect(arrayType).toBeInstanceOf(ArrayType);
            expect((arrayType as ArrayType).elementType).toBeInstanceOf(StringType);
        });

        it("parses set types", () => {
            const setType = parseTypeConstraint("set<number>");
            expect(setType).toBeInstanceOf(SetType);
            expect((setType as SetType).elementType).toBeInstanceOf(NumberType);
        });

        it("handles nested generic types", () => {
            const type = parseTypeConstraint("array<array<string>>");
            expect(type).toBeInstanceOf(ArrayType);
            
            const elementType = (type as ArrayType).elementType;
            expect(elementType).toBeInstanceOf(ArrayType);
            expect((elementType as ArrayType).elementType).toBeInstanceOf(StringType);
        });

        it("returns TypeError for unknown types", () => {
            const result = parseTypeConstraint("unknown");
            expect(result).toBeInstanceOf(TypeError);
        });
    });

    describe("parseTypeParams", () => {
        it("parses empty type parameters", () => {
            const result = parseTypeParams("key");
            expect(result).toEqual([]);
        });

        it("parses single type parameter", () => {
            const result = parseTypeParams("key[string]");
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(StringType);
        });

        it("parses multiple type parameters", () => {
            const result = parseTypeParams("key[string, number]");
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(StringType);
            expect(result[1]).toBeInstanceOf(NumberType);
        });

        it("parses generic type parameters", () => {
            const result = parseTypeParams("key[array<string>, set<number>]");
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(ArrayType);
            expect(result[1]).toBeInstanceOf(SetType);
        });

        it("handles StrSlice input", () => {
            const slice = new StrSlice("key[string]");
            const result = parseTypeParams(slice);
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(StringType);
        });
    });

    describe("extractKeyName", () => {
        it("extracts key without type parameters", () => {
            expect(extractKeyName("key")).toBe("key");
            expect(extractKeyName("myKey")).toBe("myKey");
        });

        it("extracts key with type parameters", () => {
            expect(extractKeyName("key[string]")).toBe("key");
            expect(extractKeyName("myKey[array<number>]")).toBe("myKey");
        });

        it("handles StrSlice input", () => {
            const slice = new StrSlice("key[string]");
            expect(extractKeyName(slice)).toBe("key");
        });
    });
});
