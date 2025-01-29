import { parseKeyHead } from "@/parser/utils/parse-key-head";
import {
	cleanMultiLineArray,
	cleanMultiLineStringToArray,
} from "@/utils/string";
import {
	expectedParseKeyHeadTestTextReport,
	parseKeyHeadTestText,
} from "@/tests/data/test-data";

describe("parseKeyHead - Success Cases", () => {
	it("handles complete example: test against Report", () => {
		const keyParams = parseKeyHead(parseKeyHeadTestText);
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
