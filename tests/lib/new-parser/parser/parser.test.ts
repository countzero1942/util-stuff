import { describe, it, expect } from "@jest/globals";
import { Lexer } from "@/new-parser/lexer/lexer";
import { Parser } from "@/new-parser/parser/parser";
import { StrSlice } from "@/utils/slice";
import { TraitNode, TypedFieldNode } from "@/new-parser/types/ast";

describe("Parser", () => {
    const lexer = new Lexer();
    const parser = new Parser();

    describe("tokenize", () => {
        it("handles empty input", () => {
            const tokens = Array.from(lexer.tokenizeLines(new StrSlice("")));
            expect(tokens).toHaveLength(1);
        });

        it("handles simple key-value pair", () => {
            const tokens = Array.from(lexer.tokenizeLines(new StrSlice("key: value")));
            expect(tokens).toHaveLength(1);
        });
    });

    describe("parseNode", () => {
        it("parses a simple node", () => {
            const input = new StrSlice(`
parent1:
    child1: value1
    child2: value2
parent2:
    child3: value3
`);
            const tokens = Array.from(lexer.tokenizeLines(input));
            const nodes = parser.parseNodes(tokens);

            expect(nodes).toHaveLength(2);
            const [parent1, parent2] = nodes;

            expect(parent1).toBeDefined();
            expect(parent2).toBeDefined();

            if (parent1 instanceof TraitNode) {
                expect(parent1.key).toBe("parent1");
                expect(parent1.children).toHaveLength(2);

                const [child1, child2] = parent1.children;
                expect(child1).toBeDefined();
                expect(child2).toBeDefined();

                if (child1 instanceof TypedFieldNode) {
                    expect(child1.key).toBe("child1");
                    expect(child1.value.value).toBe("value1");
                }

                if (child2 instanceof TypedFieldNode) {
                    expect(child2.key).toBe("child2");
                    expect(child2.value.value).toBe("value2");
                }
            }

            if (parent2 instanceof TraitNode) {
                expect(parent2.key).toBe("parent2");
                expect(parent2.children).toHaveLength(1);

                const [child3] = parent2.children;
                expect(child3).toBeDefined();

                if (child3 instanceof TypedFieldNode) {
                    expect(child3.key).toBe("child3");
                    expect(child3.value.value).toBe("value3");
                }
            }
        });

        it("handles nested nodes", () => {
            const input = new StrSlice(`
parent:
    child1:
        grandchild1: value1
        grandchild2: value2
    child2:
        grandchild3: value3
`);
            const tokens = Array.from(lexer.tokenizeLines(input));
            const nodes = parser.parseNodes(tokens);

            expect(nodes).toHaveLength(1);
            const parent = nodes[0];
            expect(parent).toBeDefined();

            if (parent instanceof TraitNode) {
                expect(parent.key).toBe("parent");
                expect(parent.children).toHaveLength(2);

                const [child1, child2] = parent.children;
                expect(child1).toBeDefined();
                expect(child2).toBeDefined();

                if (child1 instanceof TraitNode) {
                    expect(child1.key).toBe("child1");
                    expect(child1.children).toHaveLength(2);

                    const [grandchild1, grandchild2] = child1.children;
                    expect(grandchild1).toBeDefined();
                    expect(grandchild2).toBeDefined();

                    if (grandchild1 instanceof TypedFieldNode) {
                        expect(grandchild1.key).toBe("grandchild1");
                        expect(grandchild1.value.value).toBe("value1");
                    }

                    if (grandchild2 instanceof TypedFieldNode) {
                        expect(grandchild2.key).toBe("grandchild2");
                        expect(grandchild2.value.value).toBe("value2");
                    }
                }

                if (child2 instanceof TraitNode) {
                    expect(child2.key).toBe("child2");
                    expect(child2.children).toHaveLength(1);

                    const [grandchild3] = child2.children;
                    expect(grandchild3).toBeDefined();

                    if (grandchild3 instanceof TypedFieldNode) {
                        expect(grandchild3.key).toBe("grandchild3");
                        expect(grandchild3.value.value).toBe("value3");
                    }
                }
            }
        });
    });

    describe("Error Cases", () => {
        it("handles invalid indentation", () => {
            const input = new StrSlice(`
parent:
  child1: value1
    child2: value2
`);
            const tokens = Array.from(lexer.tokenizeLines(input));
            expect(() => parser.parseNodes(tokens)).toThrow();
        });
    });
});
