import { describe, it, expect } from "@jest/globals";
import {
	splitHead,
	parseLinesToHeads,
} from "@/parser/utils/lines-to-heads";
import { StrSlice } from "@/utils/slice";
import {
	LineInfo,
	ParserErrHead,
} from "@/parser/types/heads";
import {
	ParserStructureErr,
	StructureErrKind,
} from "@/parser/types/err-types";

describe("splitHead - Error Cases", () => {
	const createLineInfo = (content: string): LineInfo =>
		new LineInfo(
			StrSlice.from(content),
			0, // indent
			1 // row
		);

	it("handles invalid key with multiple colons (key:key:value)", () => {
		const result = splitHead(
			createLineInfo("person:name:John")
		);
		expect(result).toBeInstanceOf(ParserErrHead);

		const error = (result as ParserErrHead)
			.err as ParserStructureErr;
		expect(error.kind).toBe(
			"Invalid key colon" as StructureErrKind
		);
	});

	it("parses invalid key with colon and no space (key:value)", () => {
		const result = splitHead(createLineInfo("name:John"));
		expect(result).toBeInstanceOf(ParserErrHead);

		const error = (result as ParserErrHead)
			.err as ParserStructureErr;
		expect(error.kind).toBe(
			"Invalid key colon" as StructureErrKind
		);
	});
});
