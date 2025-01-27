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
	KeyHead,
	KeyBodyReqHead,
	KeyTrait,
	LineInfo,
	ParserErr,
	KeyValDefHead,
	KeyValReqHead,
	EmptyLine,
} from "@/parser/types/heads";
import {
	IndentErrKind,
	NumberErr,
	ParserIndentErr,
} from "@/parser/types/err-types";
import { parseTrait } from "@/parser/utils/parse-trait";
import { getTraitReport } from "@/parser/utils/print-back";
import { StrSlice } from "@/utils/slice";

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
		h => !(h instanceof ParserErr)
	);

	logh(`Heads: ${heads.length}`);
	// logobj(heads);
	for (const head of heads) {
		switch (true) {
			case head instanceof KeyValDefHead:
				log("<KeyValDefHead>");
				log(`   keyHead: '${head.keyHead}'`);
				log(`   valueHead: '${head.valueHead}'`);
				break;
			case head instanceof KeyBodyReqHead:
				log("<KeyBodyReqHead>");
				log(`   keyHead: '${head.keyHead}'`);
				break;
			case head instanceof KeyValReqHead:
				log("<KeyValReqHead>");
				log(`   keyHead: '${head.keyHead}'`);
				break;
			case head instanceof EmptyLine:
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
	for (const err of errorHeads as ParserErr[]) {
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
			case head instanceof KeyValDefHead:
				const { keyHead, valueHead } = head;
				const res = parseDefaultValue(valueHead);
				if (res instanceof NumberErr) {
					const { kind } = res;
					log(`==> ERROR: ${keyHead}: ${kind}`);
					continue;
				}
				const { valueType, value } = res;
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

const rootSlice = StrSlice.all(":root");

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

	const root = new KeyBodyReqHead(
		rootSlice,
		new LineInfo(StrSlice.empty(), -1, 0)
	);

	const trait = parseTrait(root, allHeads, 0);
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

	const root = new KeyBodyReqHead(
		rootSlice,
		new LineInfo(StrSlice.empty(), -1, 0)
	);

	const res = parseTrait(root, allHeads, 0);

	const trait = res.trait;

	if (trait instanceof ParserErr) {
		log("ERROR:");
		log(trait);
		return;
	}

	const report = await getTraitReport(trait);
	log(`Report: ${report.length} lines`);

	const rowStrLen = 4;
	for (const line of report) {
		const { content, indent, row } = line;
		const rowStr =
			row !== undefined
				? `${row.toString().padStart(rowStrLen, " ")}`
				: " ".repeat(rowStrLen);
		const indentStr = "   ".repeat(indent);
		log(`${rowStr}  ${indentStr}${content}`);
	}
};
