import { describe, expect, test } from "@jest/globals";
import {
	KeyBodyRequiredSource,
	KeyValueDefinedSource,
	LineInfo,
	ParserErrNode,
	KeyTraitNode,
	KeyValueDefinedNode,
} from "@/parser/types/key-value";

import {
	createRootHead,
	parseTrait,
} from "@/parser/utils/parse-trait";
import { StrSlice } from "@/utils/slice";
import { parseLinesToHeads } from "@/parser/utils/lines-to-heads";
import { ParserIndentErr } from "@/parser/types/err-types";
import {
	RPrec,
	Str,
	ZNum,
} from "@/parser/types/type-types";
import { cleanMultiLineStringToArray } from "@/utils/string";

describe("parseTrait - Success Cases", () => {
	test("should parse simple key-value trait", async () => {
		const lines = ["a: 42"];
		const heads = await parseLinesToHeads(lines);

		const result = parseTrait(createRootHead(), heads, 0);
		expect(result.trait).toBeInstanceOf(KeyTraitNode);

		const trait = result.trait as KeyTraitNode;
		expect(trait.checkKey(":root")).toBe(true);
		expect(trait.children.length).toBe(1);
		expect(trait.children[0]).toBeInstanceOf(
			KeyValueDefinedNode
		);

		const child = trait
			.children[0] as KeyValueDefinedNode;
		expect(child.checkKey("a")).toBe(true);
		expect(child.checkValue(42, new ZNum())).toBe(true);
	});

	test("should parse nested trait with multiple levels", async () => {
		const lines = [
			"d:",
			"\tx: 33",
			"\ty:",
			"\t\tm: 1.234",
			"\t\tn: -1e6",
		];
		const heads = await parseLinesToHeads(lines);

		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTraitNode);
		const trait = result.trait as KeyTraitNode;
		expect(trait.checkKey(":root")).toBe(true);
		expect(trait.children).toHaveLength(1);

		expect(trait.children[0]).toBeInstanceOf(
			KeyTraitNode
		);
		const dTrait = trait.children[0] as KeyTraitNode;
		expect(dTrait.checkKey("d")).toBe(true);
		expect(dTrait.children).toHaveLength(2);

		expect(dTrait.children[0]).toBeInstanceOf(
			KeyValueDefinedNode
		);
		const xValue = dTrait
			.children[0] as KeyValueDefinedNode;
		expect(xValue.checkKey("x")).toBe(true);
		expect(xValue.checkValue(33, new ZNum())).toBe(true);

		expect(dTrait.children[1]).toBeInstanceOf(
			KeyTraitNode
		);
		const yTrait = dTrait.children[1] as KeyTraitNode;
		expect(yTrait.checkKey("y")).toBe(true);
		expect(yTrait.children).toHaveLength(2);

		expect(yTrait.children[0]).toBeInstanceOf(
			KeyValueDefinedNode
		);
		const mValue = yTrait
			.children[0] as KeyValueDefinedNode;
		expect(mValue.checkKey("m")).toBe(true);
		expect(mValue.checkValue(1.234, new RPrec(4))).toBe(
			true
		);

		expect(yTrait.children[1]).toBeInstanceOf(
			KeyValueDefinedNode
		);
		const nValue = yTrait
			.children[1] as KeyValueDefinedNode;
		expect(nValue.checkKey("n")).toBe(true);
		expect(nValue.valueNode.typeValue).toBe(-1_000_000);
		expect(nValue.valueNode.type).toStrictEqual(
			new ZNum()
		);
	});

	test("should parse trait with kebab-case keys", async () => {
		// const lines = [
		// 	"o:",
		// 	"\tke-bab-1: 22",
		// 	"\tke-bab-2: 4.4",
		// 	"\tke-bab-3:",
		// 	"\t\tsnake_a: sss",
		// ];
		const text = `
			o:
				ke-bab-1: 22
				ke-bab-2: 4.4
				ke-bab-3:
					snake_a: sss
		`;
		const heads = await parseLinesToHeads(
			cleanMultiLineStringToArray(text)
		);

		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTraitNode);
		const trait = result.trait as KeyTraitNode;
		expect(trait.checkKey(":root")).toBe(true);
		expect(trait.lineInfo.indent).toBe(-1);
		expect(trait.children).toHaveLength(1);

		expect(trait.children[0]).toBeInstanceOf(
			KeyTraitNode
		);
		const oTrait = trait.children[0] as KeyTraitNode;
		expect(oTrait.lineInfo.indent).toBe(0);
		expect(oTrait.checkKey("o")).toBe(true);
		expect(oTrait.children).toHaveLength(3);

		const kebab1 = oTrait
			.children[0] as KeyValueDefinedNode;
		expect(kebab1.lineInfo.indent).toBe(1);
		expect(kebab1.checkKey("ke-bab-1")).toBe(true);
		expect(kebab1.valueNode.typeValue).toBe(22);
		expect(kebab1.valueNode.type).toStrictEqual(
			new ZNum()
		);

		const kebab2 = oTrait
			.children[1] as KeyValueDefinedNode;
		expect(kebab2.lineInfo.indent).toBe(1);
		expect(kebab2.checkKey("ke-bab-2")).toBe(true);
		expect(kebab2.valueNode.typeValue).toBe(4.4);
		expect(kebab2.valueNode.type).toStrictEqual(
			new RPrec(2)
		);

		const kebab3 = oTrait.children[2] as KeyTraitNode;
		expect(kebab3.lineInfo.indent).toBe(1);
		expect(kebab3.checkKey("ke-bab-3")).toBe(true);
		expect(kebab3.children).toHaveLength(1);

		const snakeA = kebab3
			.children[0] as KeyValueDefinedNode;
		expect(snakeA.lineInfo.indent).toBe(2);
		expect(snakeA.checkKey("snake_a")).toBe(true);
		expect(snakeA.valueNode.typeValue.value).toBe("sss");
		expect(snakeA.valueNode.type).toStrictEqual(
			new Str()
		);
	});

	test("should parse trait with multi-word string values", async () => {
		const lines = ["snake_d: hiss boom bah"];
		const heads = await parseLinesToHeads(lines);

		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTraitNode);
		const trait = result.trait as KeyTraitNode;
		expect(trait.checkKey(":root")).toBe(true);
		expect(trait.children).toHaveLength(1);

		expect(trait.children[0]).toBeInstanceOf(
			KeyValueDefinedNode
		);
		const snakeD = trait
			.children[0] as KeyValueDefinedNode;
		expect(snakeD.lineInfo.indent).toBe(0);
		expect(snakeD.checkKey("snake_d")).toBe(true);
		expect(snakeD.valueNode.typeValue.value).toBe(
			"hiss boom bah"
		);
		expect(snakeD.valueNode.type).toStrictEqual(
			new Str()
		);
	});
});
