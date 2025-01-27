import { describe, it, expect } from "@jest/globals";
import { parseLinesToHeads } from "@/parser/utils/lines-to-heads";
import {
	KeyValDefHead,
	KeyValReqHead,
	KeyBodyReqHead,
	EmptyLine,
	ParserErr,
} from "@/parser/types/heads";

describe("parseLinesToHeads - Success Cases", () => {
	it("handles empty lines", async () => {
		const lines = [""];
		const result = await parseLinesToHeads(lines);
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(EmptyLine);
	});

	it("parses key-value definitions", async () => {
		const lines = [
			"name: John",
			"age: 30",
			"value .in .R:6:9: 1.23456",
		];
		const result = await parseLinesToHeads(lines);
		expect(result).toHaveLength(3);
		result.forEach(head => {
			expect(head).toBeInstanceOf(KeyValDefHead);
		});

		expect((result[0] as KeyValDefHead).keyHead.toString()).toBe(
			"name"
		);
		expect((result[0] as KeyValDefHead).valueHead.toString()).toBe(
			"John"
		);
		expect((result[2] as KeyValDefHead).keyHead.toString()).toBe(
			"value .in .R:6:9"
		);
	});

	it("parses key value requirements", async () => {
		const lines = ["age", "a4 in .Z"];
		const result = await parseLinesToHeads(lines);
		expect(result).toHaveLength(2);
		result.forEach(head => {
			expect(head).toBeInstanceOf(KeyValReqHead);
		});

		expect((result[0] as KeyValReqHead).keyHead.toString()).toBe(
			"age"
		);
		expect((result[1] as KeyValReqHead).keyHead.toString()).toBe(
			"a4 in .Z"
		);
	});

	it("parses key body requirements", async () => {
		const lines = ["person:", "x R:6:9:", "a2 .in .trait:"];
		const result = await parseLinesToHeads(lines);
		expect(result).toHaveLength(3);
		result.forEach(head => {
			expect(head).toBeInstanceOf(KeyBodyReqHead);
		});

		expect((result[0] as KeyBodyReqHead).keyHead.toString()).toBe(
			"person"
		);
		expect((result[1] as KeyBodyReqHead).keyHead.toString()).toBe(
			"x R:6:9"
		);
	});

	it("handles mixed valid line types", async () => {
		const lines = [
			"",
			"name: John",
			"age",
			"person:",
			"value: thing: stuff",
		];
		const result = await parseLinesToHeads(lines);
		expect(result).toHaveLength(5);
		expect(result[0]).toBeInstanceOf(EmptyLine);
		expect(result[1]).toBeInstanceOf(KeyValDefHead);
		expect(result[2]).toBeInstanceOf(KeyValReqHead);
		expect(result[3]).toBeInstanceOf(KeyBodyReqHead);
		expect(result[4]).toBeInstanceOf(KeyValDefHead);
	});
});
