import {
	div,
	log,
	logg,
	loggn,
	logh,
	logobj,
} from "@/utils/log";
import { open } from "node:fs/promises";
import * as fs from "node:fs";

import { getPreLineInfo } from "@/parser/utils/pre-line-info";
import {
	parseLinesToHeads,
	splitHead,
} from "@/parser/utils/lines-to-heads";
import { ErrorType, getError } from "@/utils/error";
import { ArraySeq, NumSeq } from "@/utils/seq";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import {
	KeyValueBase,
	KeyBodyRequiredSource,
	LineInfo,
	ParserErrNode,
	KeyValueDefinedSource,
	KeyValueRequiredSource,
	EmptyLineNode,
} from "@/parser/types/key-value";
import {
	IndentErrKind,
	NumberErr,
	ParserIndentErr,
	ParserNumberErr,
} from "@/parser/types/err-types";
import {
	createRootHead,
	parseTrait,
} from "@/parser/utils/parse-trait";
import {
	formatTraitReport,
	getTraitReport,
} from "@/parser/utils/print-back";
import { StrSlice } from "@/utils/slice";
import { parseKeyHead } from "./utils/parse-key-head";
import clipboard from "clipboardy";
import {
	cleanMultiLineArray,
	cleanMultiLineStringToArray,
} from "@/utils/string";
import {
	expectedParseKeyHeadTestTextReport,
	parseKeyHeadTestText,
} from "@/tests/data/test-data";

const getTextFilePath = (name: string) =>
	`./text/parser/${name}`;

const formatLine = (line: string) => {
	return line
		.replaceAll("\t", "\\t")
		.replaceAll("\r", "\\r")
		.replaceAll("\n", "\\n");
};

export type LinesType = {
	type: "LinesType";
	lines: readonly string[];
};

export const readFileLines = async (
	path: string
): Promise<readonly string[]> =>
	new Promise((resolve, reject) => {
		try {
			const text = fs.readFileSync(path, "utf8");
			const lines = text.split(/[\r\n]+/);
			resolve(lines);
		} catch (error) {
			reject(error);
		}
	});

export const fileToLines = async (
	textFileName: string
): Promise<LinesType | ErrorType> => {
	try {
		const lines = await readFileLines(
			getTextFilePath(textFileName)
		);
		return { type: "LinesType", lines };
	} catch (error) {
		return getError(error);
	}
};

export const logParserLines = async () => {
	const file = await open(getTextFilePath("00-start.txt"));

	for await (const line of file.readLines()) {
		console.log(line);
	}
};

export const logSplitHeads = async () => {
	logh("Log Parse: Split Heads");
	log();
	log("Legend:");
	log("   Head: type and values yet to be parsed.");
	log("   <KeyValueHead>: " + "Key and value declared.");
	log(
		"   <KeyHead>: " +
			"Key declared and value required on init."
	);
	log(
		"   <KeyBodyHead>: " +
			"Key declared and indented body to follow."
	);
	div();

	// const res1 = await fileToLines("00-start.txt");
	const res1 = await fileToLines("00-with-errs.txt");
	if (res1.type === "ErrorType") {
		log("ERROR:");
		log(res1);
		return;
	}

	const lines = res1.lines;

	const allHeads = await parseLinesToHeads(lines);

	const [heads, errorHeads] = ArraySeq.from(
		allHeads
	).partArrays(
		// h => h.type !== "ParserErr"
		h => !(h instanceof ParserErrNode)
	);

	logh(`Heads: ${heads.length}`);
	// logobj(heads);
	for (const head of heads) {
		switch (true) {
			case head instanceof KeyValueDefinedSource:
				log("<KeyValDefHead>");
				log(`   keyHead: '${head.keyHead}'`);
				log(`   valueHead: '${head.valueHead}'`);
				break;
			case head instanceof KeyBodyRequiredSource:
				log("<KeyBodyReqHead>");
				log(`   keyHead: '${head.keyHead}'`);
				break;
			case head instanceof KeyValueRequiredSource:
				log("<KeyValReqHead>");
				log(`   keyHead: '${head.keyHead}'`);
				break;
			case head instanceof EmptyLineNode:
				log("<EmptyLine>");
				log(`   isColon: '${head.isColon}'`);
				break;
			default:
				log("Unknown head");
				log(`   ${head}`);
				break;
		}
		div();
	}

	log();

	logh(`Errors: ${errorHeads.length}`);
	for (const err of errorHeads as ParserErrNode[]) {
		log(err.err.toMessage());
		const report = err.err.toReport();
		log(report[0]?.content);
		log(report[1]?.content);
		div();
	}

	log();

	return;
};

export const logParseDefaultValues = async () => {
	logh("Log Parse: Parse Default Values");
	log();

	const res1 = await fileToLines("01-def-values.txt");
	if (res1.type === "ErrorType") {
		log("ERROR:");
		log(res1);
		return;
	}

	const lines = res1.lines;

	const allHeads = await parseLinesToHeads(lines);

	for (const head of allHeads) {
		switch (true) {
			case head instanceof KeyValueDefinedSource:
				const { keyHead, valueHead } = head;
				const typeValuePairOrErr = parseDefaultValue(
					head,
					valueHead
				);
				if (
					typeValuePairOrErr instanceof ParserErrNode
				) {
					if (
						typeValuePairOrErr.err instanceof
						ParserNumberErr
					) {
						const { kind } =
							typeValuePairOrErr.err.numberErr;
						log(`==> ERROR: ${keyHead}: ${kind}`);
						continue;
					} else {
						throw "Never";
					}
				}
				const { type: valueType, value } =
					typeValuePairOrErr;
				loggn(
					`${keyHead}: ${valueHead} -> ${value}`,
					valueType
				);
				break;
			default:
				break;
		}
	}

	return;
};

export const logParseTraits = async () => {
	logh("Log Parse: Parse Traits");
	log();

	const res1 = await fileToLines("01-trait-tree.txt");
	if (res1.type === "ErrorType") {
		log("ERROR:");
		log(res1);
		return;
	}

	const lines = res1.lines;

	const allHeads = await parseLinesToHeads(lines);

	const trait = parseTrait(createRootHead(), allHeads, 0);
	div();
	logobj(trait);
};

export const logTraitReport = async (
	fileName = "01-trait-tree.txt"
) => {
	logh("Log Trait Report");
	log();
	log(`File: '${fileName}'`);
	log();

	const res1 = await fileToLines(fileName);
	if (res1.type === "ErrorType") {
		log("ERROR:");
		log(res1);
		return;
	}

	const lines = res1.lines;

	const allHeads = await parseLinesToHeads(lines);

	const res = parseTrait(createRootHead(), allHeads, 0);

	const trait = res.trait;

	if (trait instanceof ParserErrNode) {
		log("ERROR:");
		log(trait);
		return;
	}

	const report = await getTraitReport(trait);
	log(`Report: ${report.length} lines`);

	const reportStrs = formatTraitReport(report);

	for (const str of reportStrs) {
		log(str);
	}

	// const rowStrLen = 4;
	// for (const line of report) {
	// 	const { content, indent, row } = line;
	// 	const rowStr =
	// 		row !== undefined
	// 			? `${row.toString().padStart(rowStrLen, " ")}`
	// 			: " ".repeat(rowStrLen);
	// 	const indentStr = "   ".repeat(indent);
	// 	log(`${rowStr}  ${indentStr}${content}`);
	// }
};

export const logTraitReportFromString = async (
	str: string
) => {
	logh("Log Trait Report");
	log();
	log(`Text:`);
	log();

	const lines = cleanMultiLineStringToArray(str);

	lines.forEach(line => log(line));
	log();
	div();

	const allHeads = await parseLinesToHeads(lines);

	const res = parseTrait(createRootHead(), allHeads, 0);
	// div();
	// logobj(res);
	// div();

	const trait = res.trait;

	if (trait instanceof ParserErrNode) {
		log("ERROR:");
		log(trait);
		return;
	}

	const report = await getTraitReport(trait);
	log(`Report: ${report.length} lines:\n`);

	const reportStrs = formatTraitReport(report);

	for (const str of reportStrs) {
		log(str);
	}
	log();
	div();
};

export const logParseKeyHeadReport = () => {
	const head = KeyValueRequiredSource.fromString(
		parseKeyHeadTestText
	);

	const keyParamsOrErr = parseKeyHead(head, head.keyHead);
	if (keyParamsOrErr instanceof ParserErrNode) {
		log("ERROR:");
		log(keyParamsOrErr);
		return;
	}
	const report = keyParamsOrErr.toReport();
	const reportText = report.join("\n");
	log(reportText);
	div();
	clipboard.writeSync(reportText);
	log("Copied to clipboard");
	div();
};

export const compareParseKeyHeadReport = () => {
	const head = KeyValueRequiredSource.fromString(
		parseKeyHeadTestText
	);

	const keyParamsOrErr = parseKeyHead(head, head.keyHead);
	if (keyParamsOrErr instanceof ParserErrNode) {
		log("ERROR:");
		log(keyParamsOrErr);
		return;
	}
	const keyParams = keyParamsOrErr;
	const reportLines = cleanMultiLineArray(
		keyParams.toReport(0, "\t")
	);

	const expectedReportLines = cleanMultiLineStringToArray(
		expectedParseKeyHeadTestTextReport
	);

	let i = 0;
	let failCount = 0;
	while (
		i < expectedReportLines.length &&
		i < reportLines.length
	) {
		const match: boolean =
			expectedReportLines[i] === reportLines[i];
		const failText = !match ? "<FAIL>" : "";

		if (!match) {
			failCount++;
		}

		log(`${i}: expected / report ${failText}`);
		log(`'${expectedReportLines[i]}'`);
		log(`'${reportLines[i]}'`);
		div();
		i++;
	}

	log(`failCount: ${failCount}`);
	log(`reportLines.length: ${reportLines.length}`);
	log(
		`expectedReportLines.length: ${expectedReportLines.length}`
	);
	div();
};
