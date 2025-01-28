import { describe, expect, test } from "@jest/globals";
import {
	KeyBodyReqHead,
	KeyValDefHead,
	LineInfo,
	KeyTrait,
	KeyValDef,
	ParserErr,
} from "@/parser/types/heads";
import {
	IndentErrKind,
	ParserIndentErr,
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
	it("handles 'invalid children' errors", async () => {
		const input = `
		a: 42
			invalid-a: misplaced children
			invalid-b: indent error
		`;

		const lines = cleanMultiLineStringToArray(input);
		const heads = await parseLinesToHeads(lines);
		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTrait);
		const rootTrait = result.trait as KeyTrait;
		expect(rootTrait.checkKey(":root")).toBe(true);
		expect(rootTrait.lineInfo.indent).toBe(-1);
		expect(rootTrait.children).toHaveLength(2);

		expect(rootTrait.children[0]).toBeInstanceOf(
			KeyValDef
		);
		const childA = rootTrait.children[0] as KeyValDef;
		expect(childA.checkKey("a")).toBe(true);
		expect(childA.checkValue(42, new ZNum())).toBe(true);
		expect(childA.lineInfo.indent).toBe(0);

		expect(rootTrait.children[1]).toBeInstanceOf(
			ParserErr
		);
		const err = rootTrait.children[1] as ParserErr;
		expect(err.err).toBeInstanceOf(ParserIndentErr);

		const indentErr = err.err as ParserIndentErr;
		expect(indentErr.indent).toBe(0);
		expect(indentErr.children).toHaveLength(2);

		expect(indentErr.children[0]).toBeInstanceOf(
			KeyValDefHead
		);
		const invalidA = indentErr
			.children[0] as KeyValDefHead;
		expect(invalidA.checkKeyHead("invalid-a")).toBe(true);
		expect(
			invalidA.checkValueHead("misplaced children")
		).toBe(true);
		expect(invalidA.lineInfo.indent).toBe(1);

		expect(indentErr.children[1]).toBeInstanceOf(
			KeyValDefHead
		);
		const invalidB = indentErr
			.children[1] as KeyValDefHead;
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

	it("handles 'missing children' errors", async () => {
		const input = `
			empty-head:
			c: 6.28
		`;

		const lines = cleanMultiLineStringToArray(input);
		const heads = await parseLinesToHeads(lines);
		const result = parseTrait(createRootHead(), heads, 0);

		expect(result.trait).toBeInstanceOf(KeyTrait);
		const rootTrait = result.trait as KeyTrait;
		expect(rootTrait.checkKey(":root")).toBe(true);
		expect(rootTrait.lineInfo.indent).toBe(-1);
		expect(rootTrait.children).toHaveLength(2);

		expect(rootTrait.children[0]).toBeInstanceOf(
			KeyTrait
		);
		const emptyHead = rootTrait.children[0] as KeyTrait;
		expect(emptyHead.checkKey("empty-head")).toBe(true);
		expect(emptyHead.lineInfo.indent).toBe(0);

		expect(emptyHead.children).toHaveLength(1);
		const err = emptyHead.children[0] as ParserErr;
		expect(err.err).toBeInstanceOf(ParserIndentErr);

		const indentErr = err.err as ParserIndentErr;
		expect(indentErr.indent).toBe(1);
		expect(indentErr.children).toHaveLength(0);
		expect(indentErr.kind).toBe(
			"Missing children" as IndentErrKind
		);

		expect(rootTrait.children[1]).toBeInstanceOf(
			KeyValDef
		);
		const c = rootTrait.children[1] as KeyValDef;
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
});
