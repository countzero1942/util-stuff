import { describe, it, expect } from "@jest/globals";
import { KeyTrait, KeyValueDefinedField } from "@/parser/types/nodes";
import { TraitNode, TypedFieldNode } from "@/new-parser/types/ast";
import { StringType, TypeValuePair, TypeConstraint } from "@/new-parser/types/types";
import { migrateToNewTrait, migrateToOldTrait } from "@/new-parser/utils/migration";

describe("Migration Utils", () => {
    describe("migrateToNewTrait", () => {
        it("migrates simple trait", () => {
            const oldTrait = new KeyTrait(
                "person",
                [new KeyValueDefinedField("name", "John", [])],
                []
            );

            const newTrait = migrateToNewTrait(oldTrait);
            expect(newTrait).toBeInstanceOf(TraitNode);
            expect(newTrait.key).toBe("person");
            expect(newTrait.children).toHaveLength(1);

            const child = newTrait.children[0];
            expect(child).toBeInstanceOf(TypedFieldNode);
            if (child instanceof TypedFieldNode) {
                expect(child.key).toBe("name");
                expect(child.value.value).toBe("John");
            }
        });

        it("migrates nested traits", () => {
            const oldTrait = new KeyTrait(
                "person",
                [
                    new KeyValueDefinedField("name", "John", []),
                    new KeyTrait(
                        "address",
                        [new KeyValueDefinedField("city", "NY", [])],
                        []
                    )
                ],
                []
            );

            const newTrait = migrateToNewTrait(oldTrait);
            expect(newTrait).toBeInstanceOf(TraitNode);
            expect(newTrait.key).toBe("person");
            expect(newTrait.children).toHaveLength(2);

            const [name, address] = newTrait.children;
            expect(name).toBeInstanceOf(TypedFieldNode);
            expect(address).toBeInstanceOf(TraitNode);

            if (name instanceof TypedFieldNode) {
                expect(name.key).toBe("name");
                expect(name.value.value).toBe("John");
            }

            if (address instanceof TraitNode) {
                expect(address.key).toBe("address");
                expect(address.children).toHaveLength(1);

                const city = address.children[0];
                expect(city).toBeInstanceOf(TypedFieldNode);
                if (city instanceof TypedFieldNode) {
                    expect(city.key).toBe("city");
                    expect(city.value.value).toBe("NY");
                }
            }
        });
    });

    describe("migrateToOldTrait", () => {
        it("migrates simple trait", () => {
            const newTrait = new TraitNode(
                "person",
                [
                    new TypedFieldNode(
                        "name",
                        new TypeValuePair("John", new StringType()),
                        null
                    )
                ],
                [new TypeConstraint(new StringType())],
                null
            );

            const oldTrait = migrateToOldTrait(newTrait);
            expect(oldTrait).toBeInstanceOf(KeyTrait);
            expect(oldTrait.key).toBe("person");
            if (oldTrait instanceof KeyTrait) {
                expect(oldTrait.children).toHaveLength(1);

                const child = oldTrait.children[0];
                expect(child).toBeInstanceOf(KeyValueDefinedField);
                if (child instanceof KeyValueDefinedField) {
                    expect(child.key).toBe("name");
                    expect(child.value).toBe("John");
                }
            }
        });

        it("migrates nested traits", () => {
            const newTrait = new TraitNode(
                "person",
                [
                    new TypedFieldNode(
                        "name",
                        new TypeValuePair("John", new StringType()),
                        null
                    ),
                    new TraitNode(
                        "address",
                        [
                            new TypedFieldNode(
                                "city",
                                new TypeValuePair("NY", new StringType()),
                                null
                            )
                        ],
                        [new TypeConstraint(new StringType())],
                        null
                    )
                ],
                [new TypeConstraint(new StringType())],
                null
            );

            const oldTrait = migrateToOldTrait(newTrait);
            expect(oldTrait).toBeInstanceOf(KeyTrait);
            expect(oldTrait.key).toBe("person");
            if (oldTrait instanceof KeyTrait) {
                expect(oldTrait.children).toHaveLength(2);

                const [name, address] = oldTrait.children;
                expect(name).toBeInstanceOf(KeyValueDefinedField);
                expect(address).toBeInstanceOf(KeyTrait);

                if (name instanceof KeyValueDefinedField) {
                    expect(name.key).toBe("name");
                    expect(name.value).toBe("John");
                }

                if (address instanceof KeyTrait) {
                    expect(address.key).toBe("address");
                    expect(address.children).toHaveLength(1);

                    const city = address.children[0];
                    expect(city).toBeInstanceOf(KeyValueDefinedField);
                    if (city instanceof KeyValueDefinedField) {
                        expect(city.key).toBe("city");
                        expect(city.value).toBe("NY");
                    }
                }
            }
        });
    });
});
