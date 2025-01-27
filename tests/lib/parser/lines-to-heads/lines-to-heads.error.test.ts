import {
	ParserStructureErr,
	StructureErrKind,
} from "@/parser/types/err-types";
import {
	KeyValDefHead,
	ParserErr,
} from "@/parser/types/heads";
import { parseLinesToHeads } from "@/parser/utils/lines-to-heads";

describe("parseLinesToHeads - Error Cases", () => {
	it("rejects lines starting with spaces", async () => {
		const lines = ["   key: value"];
		const result = await parseLinesToHeads(lines);
		expect(result[0]).toBeInstanceOf(ParserErr);

		const err = (result[0] as ParserErr).err;
		expect(err).toBeInstanceOf(ParserStructureErr);

		const structureErr = err as ParserStructureErr;
		expect(structureErr.kind).toBe(
			"Invalid space tabs" as StructureErrKind
		);

		const report = structureErr.toReport();
		expect(report).toStrictEqual([
			{ content: "   key: value", indent: 0, row: 1 },
			{
				content:
					"^^^: <Structure Error: Invalid space tabs>",
				indent: 0,
			},
		]);
	});

	it("rejects lines with spaces after tabs", async () => {
		{
			const lines = [
				"\t key: value",
				"\t \tkey: value",
				"\t \t key: value",
				"\t\t key: value",
			];
			const reportLines = [
				"\\t key: value",
				"\\t \\tkey: value",
				"\\t \\t key: value",
				"\\t\\t key: value",
				"\\t\\t \\t\\t key: value",
			];
			const reportErrs = [
				"^^^: <Structure Error: Invalid space tabs>",
				"^^^^^: <Structure Error: Invalid space tabs>",
				"^^^^^^: <Structure Error: Invalid space tabs>",
				"^^^^^: <Structure Error: Invalid space tabs>",
				"^^^^^^^^^^: <Structure Error: Invalid space tabs>",
			];
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] as string;
				const result = await parseLinesToHeads([line]);
				expect(result[0]).toBeInstanceOf(ParserErr);

				const err = (result[0] as ParserErr).err;
				expect(err).toBeInstanceOf(ParserStructureErr);

				const structureErr = err as ParserStructureErr;
				expect(structureErr.kind).toBe(
					"Invalid space tabs" as StructureErrKind
				);

				const report = structureErr.toReport();
				expect(report[0]?.content).toBe(reportLines[i]);
				expect(report[1]?.content).toBe(reportErrs[i]);
			}
		}
	});

	it("handles multiple error lines", async () => {
		const lines = [" error1", "\t error2", " error3"];
		const result = await parseLinesToHeads(lines);
		expect(result).toHaveLength(3);
		result.forEach(head => {
			expect(head).toBeInstanceOf(ParserErr);
			expect((head as ParserErr).err).toBeInstanceOf(
				ParserStructureErr
			);
			expect(
				((head as ParserErr).err as ParserStructureErr)
					.kind
			).toBe("Invalid space tabs" as StructureErrKind);
		});
	});

	it("handles mixed valid and error lines", async () => {
		const lines = [
			"valid: line",
			" error",
			"another: valid",
			"\t error",
		];
		const results = await parseLinesToHeads(lines);
		expect(results).toHaveLength(4);

		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			switch (i) {
				case 0:
				case 2:
					expect(result).toBeInstanceOf(KeyValDefHead);
					break;
				case 1:
				case 3:
					expect(result).toBeInstanceOf(ParserErr);
					expect(
						(result as ParserErr).err
					).toBeInstanceOf(ParserStructureErr);
					expect(
						(
							(result as ParserErr)
								.err as ParserStructureErr
						).kind
					).toBe(
						"Invalid space tabs" as StructureErrKind
					);
					break;
			}
		}
	});

	it("handles invalid key colon", async () => {
		const lines = ["key:value", "key:value:value"];
		const errors = [
			"   ^^^^^^: <Structure Error: Invalid key colon>",
			"   ^^^^^^^^^^^^: <Structure Error: Invalid key colon>",
		];
		const results = await parseLinesToHeads(lines);
		expect(results).toHaveLength(2);
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			expect(result).toBeInstanceOf(ParserErr);
			expect((result as ParserErr).err).toBeInstanceOf(
				ParserStructureErr
			);
			expect(
				(
					(result as ParserErr)
						.err as ParserStructureErr
				).kind
			).toBe("Invalid key colon" as StructureErrKind);
			expect(
				(result as ParserErr).err.toReport()[1]?.content
			).toBe(errors[i]);
		}
	});
});
