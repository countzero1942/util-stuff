import { describe, expect, test } from "@jest/globals";
import {
	KeyBodyReqHead,
	KeyValDefHead,
	LineInfo,
	KeyTrait,
	ParserErr,
	KeyValDef,
} from "@/parser/types/heads";
import {
	createRootHead,
	parseTrait,
} from "@/parser/utils/parse-trait";
import { StrSlice } from "@/utils/slice";
import { parseLinesToHeads } from "@/parser/utils/lines-to-heads";
import { ParserIndentErr } from "@/parser/types/err-types";

describe("parseTrait - Success Cases", () => {
	test("should parse simple key-value trait", async () => {
		const lines = ["a: 42"];
		const heads = await parseLinesToHeads(lines);

		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTrait);
		const trait = result.trait as KeyTrait;
		expect(trait.key.toString()).toBe("a");
		expect(result.nextIndex).toBe(0);
	});

	test("should parse nested trait with multiple levels", async () => {
		const lines = [
			"d:",
			"\tx: 33",
			"\ty:",
			"\t\tm: 1e6",
			"\t\tn: -1.e6",
		];
		const heads = await parseLinesToHeads(lines);
		const traitHead = heads[0] as KeyBodyReqHead;

		const result = parseTrait(
			traitHead,
			heads.slice(1),
			0
		);

		expect(result.trait).toBeInstanceOf(KeyTrait);
		const trait = result.trait as KeyTrait;
		expect(trait.key.toString()).toBe("d");
		expect(trait.children).toHaveLength(2);

		const xValue = trait.children[0] as KeyValDef;
		expect(xValue.key.toString()).toBe("x");
		expect(xValue.value.value).toBe(33);

		const yTrait = trait.children[1] as KeyTrait;
		expect(yTrait.key.toString()).toBe("y");
		expect(yTrait.children).toHaveLength(2);

		const mValue = yTrait.children[0] as KeyValDef;
		expect(mValue.key.toString()).toBe("m");
		expect(mValue.value.value).toBe(1e6);

		const nValue = yTrait.children[1] as KeyValDef;
		expect(nValue.key.toString()).toBe("n");
		expect(nValue.value.value).toBe(-1e6);
	});

	test("should parse trait with kebab-case keys", async () => {
		const lines = [
			"o:",
			"\tke-bab-1: 22",
			"\tke-bab-2: 44",
			"\tke-bab-3:",
			"\t\tsnake_a: sss",
		];
		const heads = await parseLinesToHeads(lines);
		const traitHead = heads[0] as KeyBodyReqHead;

		const result = parseTrait(
			traitHead,
			heads.slice(1),
			0
		);

		expect(result.trait).toBeInstanceOf(KeyTrait);
		const trait = result.trait as KeyTrait;
		expect(trait.key.toString()).toBe("o");
		expect(trait.children).toHaveLength(3);

		const kebab1 = trait.children[0] as KeyValDef;
		expect(kebab1.key.toString()).toBe("ke-bab-1");
		expect(kebab1.value.value).toBe(22);

		const kebab2 = trait.children[1] as KeyValDef;
		expect(kebab2.key.toString()).toBe("ke-bab-2");
		expect(kebab2.value.value).toBe(44);

		const kebab3 = trait.children[2] as KeyTrait;
		expect(kebab3.key.toString()).toBe("ke-bab-3");
		expect(kebab3.children).toHaveLength(1);

		const snakeA = kebab3.children[0] as KeyValDef;
		expect(snakeA.key.toString()).toBe("snake_a");
		expect(snakeA.value.value.toString()).toBe("sss");
	});

	test("should parse trait with multi-word string values", async () => {
		const lines = ["snake_d: hiss boom bah"];
		const heads = await parseLinesToHeads(lines);
		const traitHead = heads[0] as KeyBodyReqHead;

		const result = parseTrait(traitHead, [], 0);

		expect(result.trait).toBeInstanceOf(KeyTrait);
		const trait = result.trait as KeyTrait;
		expect(trait.key.toString()).toBe("snake_d");
		expect(trait.children).toHaveLength(1);

		const indentErr = trait.children[0] as ParserErr;
		expect(indentErr.err).toBeInstanceOf(ParserIndentErr);
		const indentErrTyped =
			indentErr.err as ParserIndentErr;
		expect(indentErrTyped.kind).toBe("Missing children");
		expect(indentErrTyped.children).toHaveLength(0);
	});
});
