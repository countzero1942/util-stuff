import { describe, it, expect } from "@jest/globals";
import { Lexer } from "@/new-parser/lexer/lexer";
import {
	KeyValueToken,
	InvalidToken,
} from "@/new-parser/types/lex";
import { StrSlice } from "@/utils/slice";

describe("Lexer", () => {
	describe("tokenizeLine", () => {
		const lexer = new Lexer();

		it("handles empty line", () => {
			const token = lexer.tokenizeLine(
				new StrSlice(""),
				1
			);
			expect(token).toBeInstanceOf(KeyValueToken);
			expect(token.sourceContext?.indent).toBe(0);
		});

		it("handles simple key-value pair", () => {
			const token = lexer.tokenizeLine(
				new StrSlice("myKey: value"),
				1
			);
			expect(token).toBeInstanceOf(KeyValueToken);
			expect(token.sourceContext?.indent).toBe(0);
			if (token instanceof KeyValueToken) {
				expect(token.key.value).toBe("myKey");
				expect(token.value.value).toBe("value");
			}
		});

		it("handles key-only line", () => {
			const token = lexer.tokenizeLine(
				new StrSlice("myKey:"),
				1
			);
			expect(token).toBeInstanceOf(KeyValueToken);
			expect(token.sourceContext?.indent).toBe(0);
			if (token instanceof KeyValueToken) {
				expect(token.key.value).toBe("myKey");
				expect(token.value).toBeUndefined();
			}
		});

		it("handles indentation with tabs", () => {
			const token = lexer.tokenizeLine(
				new StrSlice("\t\tmyKey: value"),
				1
			);
			expect(token).toBeInstanceOf(KeyValueToken);
			if (token instanceof KeyValueToken) {
				expect(token.sourceContext?.indent).toBe(2);
				expect(token.key.value).toBe("myKey");
				expect(token.value.value).toBe("value");
			}
		});

		it("rejects space indentation by default", () => {
			const token = lexer.tokenizeLine(
				new StrSlice("    myKey: value"),
				1
			);
			expect(token).toBeInstanceOf(InvalidToken);
		});
	});

	describe("tokenizeLines", () => {
		const lexer = new Lexer();

		it("handles multiple lines", () => {
			const input = new StrSlice(`
key1: value1
key2: value2
key3: value3
`);
			const tokens = Array.from(
				lexer.tokenizeLines(input)
			);
			expect(tokens).toHaveLength(4); // Including empty line
			expect(tokens[1]).toBeInstanceOf(KeyValueToken);
			if (tokens[1] instanceof KeyValueToken) {
				expect(tokens[1].key.value).toBe("key1");
				expect(tokens[1].value.value).toBe("value1");
			}
		});

		it("handles indented lines", () => {
			const input = new StrSlice(`
parent:
\tchild1: value1
\tchild2: value2
`);
			const tokens = Array.from(
				lexer.tokenizeLines(input)
			);
			expect(tokens).toHaveLength(4);
			expect(tokens[2]).toBeInstanceOf(KeyValueToken);
			if (tokens[2] instanceof KeyValueToken) {
				expect(tokens[2].sourceContext?.indent).toBe(1);
				expect(tokens[2].key.value).toBe("child1");
				expect(tokens[2].value.value).toBe("value1");
			}
		});
	});
});
