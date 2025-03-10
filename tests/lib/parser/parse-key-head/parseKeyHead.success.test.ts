import { parseKeyHead } from "@/parser/utils/parse-key-head";
import {
	cleanMultiLineArray,
	cleanMultiLineStringToArray,
} from "@/utils/string";
import {
	expectedParseKeyHeadTestTextReport,
	parseKeyHeadTestText,
} from "@/tests/data/test-data";
import {
	KeyValueBase,
	KeyValueRequiredSource,
	ParserErrNode,
} from "@/parser/types/key-value";
import { KeyParams } from "@/parser/types/key-head";

describe("parseKeyHead - Success Cases", () => {
	it("handles complete example: test against Report", () => {
		const head = KeyValueRequiredSource.fromString(
			parseKeyHeadTestText
		);
		const keyParamsOrErr = parseKeyHead(
			head,
			head.keyHead
		);

		if (keyParamsOrErr instanceof ParserErrNode) {
			fail(
				"keyParamsOrErr is an instance of ParserErrHead"
			);
		}

		const keyParams = keyParamsOrErr as KeyParams;

		const reportLines = cleanMultiLineArray(
			keyParams.toReport(0, "\t")
		);

		const expectedReportLines =
			cleanMultiLineStringToArray(
				expectedParseKeyHeadTestTextReport
			);

		expect(reportLines).toEqual(expectedReportLines);
	});
});
