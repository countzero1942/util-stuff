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
	IndentErrKind,
	ParserIndentErr,
	ParserStructureErr,
	StructureErrKind,
} from "@/parser/types/err-types";
import {
	createRootHead,
	parseTrait,
} from "@/parser/utils/parse-trait";
import { StrSlice } from "@/utils/slice";
import { Range } from "@/utils/seq";
import {
	RPrec,
	Str,
	ZNum,
} from "@/parser/types/type-types";
import { parseLinesToHeads } from "@/parser/utils/lines-to-heads";
import { cleanMultiLineStringToArray } from "@/utils/string";
import {
	formatTraitReport,
	getTraitReport,
} from "@/parser/utils/print-back";

describe("parseTrait - Error Cases", () => {
	it("handles indent error: 'invalid children' error", async () => {
		const input = `
		a: 42
			invalid-a: misplaced children
			invalid-b: indent error
		`;

		const lines = cleanMultiLineStringToArray(input);
		const heads = await parseLinesToHeads(lines);
		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTraitNode);
		const rootTrait = result.trait as KeyTraitNode;
		expect(rootTrait.checkKey(":root")).toBe(true);
		expect(rootTrait.lineInfo.indent).toBe(-1);
		expect(rootTrait.children).toHaveLength(2);

		expect(rootTrait.children[0]).toBeInstanceOf(
			KeyValueDefinedNode
		);
		const childA = rootTrait
			.children[0] as KeyValueDefinedNode;
		expect(childA.checkKey("a")).toBe(true);
		expect(childA.valueNode.typeValue).toBe(42);
		expect(childA.valueNode.type).toBeInstanceOf(ZNum);
		// expect(childA.checkValue(42, new ZNum())).toBe(true);
		expect(childA.lineInfo.indent).toBe(0);

		expect(rootTrait.children[1]).toBeInstanceOf(
			ParserErrNode
		);
		const err = rootTrait.children[1] as ParserErrNode;
		expect(err.err).toBeInstanceOf(ParserIndentErr);

		const indentErr = err.err as ParserIndentErr;
		expect(indentErr.indent).toBe(0);
		expect(indentErr.children).toHaveLength(2);

		expect(indentErr.children[0]).toBeInstanceOf(
			KeyValueDefinedSource
		);
		const invalidA = indentErr
			.children[0] as KeyValueDefinedSource;
		expect(invalidA.checkKeyHead("invalid-a")).toBe(true);
		expect(
			invalidA.checkValueHead("misplaced children")
		).toBe(true);
		expect(invalidA.lineInfo.indent).toBe(1);

		expect(indentErr.children[1]).toBeInstanceOf(
			KeyValueDefinedSource
		);
		const invalidB = indentErr
			.children[1] as KeyValueDefinedSource;
		expect(invalidB.checkKeyHead("invalid-b")).toBe(true);
		expect(invalidB.checkValueHead("indent error")).toBe(
			true
		);
		expect(invalidB.lineInfo.indent).toBe(1);

		const expectedReportLines: string[] = [
			`   1  a .in .Z: 42`,
			`      <Indent Error: 'Invalid children'; lines: 2 - 3>`,
			`   2     invalid-a: misplaced children`,
			`   3     invalid-b: indent error`,
		];

		const reportLines = await getTraitReport(rootTrait);
		const reportStrs = formatTraitReport(reportLines);

		expect(reportStrs).toEqual(expectedReportLines);
	});

	it("handles indent error: 'missing children' error", async () => {
		const input = `
			empty-head:
			c: 6.28
		`;

		const lines = cleanMultiLineStringToArray(input);
		const heads = await parseLinesToHeads(lines);
		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTraitNode);
		const rootTrait = result.trait as KeyTraitNode;
		expect(rootTrait.checkKey(":root")).toBe(true);
		expect(rootTrait.lineInfo.indent).toBe(-1);
		expect(rootTrait.children).toHaveLength(2);

		expect(rootTrait.children[0]).toBeInstanceOf(
			KeyTraitNode
		);
		const emptyHead = rootTrait
			.children[0] as KeyTraitNode;
		expect(emptyHead.checkKey("empty-head")).toBe(true);
		expect(emptyHead.lineInfo.indent).toBe(0);

		expect(emptyHead.children).toHaveLength(1);
		const err = emptyHead.children[0] as ParserErrNode;
		expect(err.err).toBeInstanceOf(ParserIndentErr);

		const indentErr = err.err as ParserIndentErr;
		expect(indentErr.indent).toBe(1);
		expect(indentErr.children).toHaveLength(0);
		expect(indentErr.kind).toBe(
			"Missing children" as IndentErrKind
		);

		expect(rootTrait.children[1]).toBeInstanceOf(
			KeyValueDefinedNode
		);
		const c = rootTrait
			.children[1] as KeyValueDefinedNode;
		expect(c.checkKey("c")).toBe(true);
		expect(c.checkValue(6.28, new RPrec(3))).toBe(true);

		const expectedReportLines: string[] = [
			"   1  empty-head:",
			"         <Indent Error: 'Missing children'>",
			"   2  c .in .R:3:9: 6.28",
		];
		const reportLines = await getTraitReport(rootTrait);
		const reportStrs = formatTraitReport(reportLines);

		expect(reportStrs).toEqual(expectedReportLines);
	});

	it("handles indent error: 'over indent' error", async () => {
		const input = `
			o: 
					over-a: over
					over-b: indented children
		`;

		const lines = cleanMultiLineStringToArray(input);
		const heads = await parseLinesToHeads(lines);
		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTraitNode);
		const rootTrait = result.trait as KeyTraitNode;
		expect(rootTrait.checkKey(":root")).toBe(true);
		expect(rootTrait.lineInfo.indent).toBe(-1);
		expect(rootTrait.children).toHaveLength(1);

		const oTrait = rootTrait.children[0] as KeyTraitNode;
		expect(oTrait.checkKey("o")).toBe(true);
		expect(oTrait.lineInfo.indent).toBe(0);
		expect(oTrait.children).toHaveLength(1);

		const err = oTrait.children[0] as ParserErrNode;
		expect(err.err).toBeInstanceOf(ParserIndentErr);

		const indentErr = err.err as ParserIndentErr;
		expect(indentErr.indent).toBe(1);
		expect(indentErr.children).toHaveLength(2);
		expect(indentErr.kind).toBe(
			"Invalid over-indent" as IndentErrKind
		);

		expect(indentErr.children[0]).toBeInstanceOf(
			KeyValueDefinedSource
		);
		const overA = indentErr
			.children[0] as KeyValueDefinedSource;
		expect(overA.checkKeyHead("over-a")).toBe(true);
		expect(overA.checkValueHead("over")).toBe(true);

		expect(indentErr.children[1]).toBeInstanceOf(
			KeyValueDefinedSource
		);
		const overB = indentErr
			.children[1] as KeyValueDefinedSource;
		expect(overB.checkKeyHead("over-b")).toBe(true);
		expect(
			overB.checkValueHead("indented children")
		).toBe(true);

		const expectedReportLines: string[] = [
			`   1  o:`,
			`         <Indent Error: 'Invalid over-indent'; lines: 2 - 3>`,
			`   2        over-a: over`,
			`   3        over-b: indented children`,
		];

		const reportLines = await getTraitReport(rootTrait);
		const reportStrs = formatTraitReport(reportLines);

		expect(reportStrs).toEqual(expectedReportLines);
	});

	it("handles invalid space tabs", async () => {
		const input = `
			d:
			   spaces: 23
		`;

		const lines = cleanMultiLineStringToArray(input);
		const heads = await parseLinesToHeads(lines);
		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTraitNode);
		const rootTrait = result.trait as KeyTraitNode;
		expect(rootTrait.checkKey(":root")).toBe(true);
		expect(rootTrait.children).toHaveLength(1);

		expect(rootTrait.children[0]).toBeInstanceOf(
			KeyTraitNode
		);
		const dTrait = rootTrait.children[0] as KeyTraitNode;
		expect(dTrait.checkKey("d")).toBe(true);
		expect(dTrait.children).toHaveLength(1);

		expect(dTrait.children[0]).toBeInstanceOf(
			ParserErrNode
		);

		const err = dTrait.children[0] as ParserErrNode;
		expect(err.err).toBeInstanceOf(ParserStructureErr);
		const structureErr = err.err as ParserStructureErr;
		expect(structureErr.kind).toBe(
			"Invalid space tabs" as StructureErrKind
		);

		const spaces = structureErr.getHead();
		expect(spaces.keyHead.value).toBe("   spaces: 23");

		const expectedReportLines: string[] = [
			"   1  d:",
			"   2     spaces: 23",
			"      ^^^: <Structure Error: Invalid space tabs>",
		];

		const reportLines = await getTraitReport(rootTrait);
		const reportStrs = formatTraitReport(reportLines);

		expect(reportStrs).toEqual(expectedReportLines);
	});

	it("handles invalid key colon", async () => {
		const input = `
			key:value:value
		`;

		const lines = cleanMultiLineStringToArray(input);
		const heads = await parseLinesToHeads(lines);
		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTraitNode);
		const rootTrait = result.trait as KeyTraitNode;
		expect(rootTrait.checkKey(":root")).toBe(true);
		expect(rootTrait.children).toHaveLength(1);

		const err = rootTrait.children[0] as ParserErrNode;
		expect(err.err).toBeInstanceOf(ParserStructureErr);
		const structureErr = err.err as ParserStructureErr;
		expect(structureErr.kind).toBe(
			"Invalid key colon" as StructureErrKind
		);

		const keyColon = structureErr.getHead();
		expect(keyColon.keyHead.value).toBe(
			"key:value:value"
		);

		const expectedReportLines: string[] = [
			"   1  key:value:value",
			"         ^^^^^^^^^^^^: <Structure Error: Invalid key colon>",
		];

		const reportLines = await getTraitReport(rootTrait);
		const reportStrs = formatTraitReport(reportLines);

		expect(reportStrs).toEqual(expectedReportLines);
	});
});
