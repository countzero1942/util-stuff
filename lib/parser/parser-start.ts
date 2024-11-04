import { div, log, loggn, logh } from "@/utils/log";
import { open } from "node:fs/promises";
import * as fs from "node:fs";

import { getPreLineInfo } from "@/parser/utils/pre-line-info";
import {
	parseLinesToHeads,
	splitHead,
} from "@/parser/utils/lines-to-heads";
import { ErrorType, getError } from "@/utils/error";
import { ArraySeq, NumSeq } from "@/utils/seq";
import { parseDefValue } from "@/parser/utils/parse-value";
import { LineInfo } from "@/parser/types/head";
import { ParseErr } from "@/parser/types/err-types";

const getTextFilePath = (name: string) => `./text/parser/${name}`;

const setLineColumn = (
	lineInfo: LineInfo,
	lineColumn: number
): LineInfo => {
	return {
		lineInfo: {
			...lineInfo.lineInfo,
			column: lineColumn,
		},
	};
};

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

export const logSplitHeads = async () => {
	logh("Log Parse: Split Heads");
	log();
	log("Legend:");
	log("   Head: type and values yet to be parsed.");
	log("   <KeyValueHead>: " + "Key and value declared.");
	log("   <KeyHead>: " + "Key declared and value required on init.");
	log(
		"   <KeyBodyHead>: " +
			"Key declared and indented body to follow."
	);
	div();

	const res1 = await fileToLines("00-with-errs.txt");
	if (res1.type === "ErrorType") {
		log("ERROR:");
		log(res1);
		return;
	}

	const lines = res1.lines;

	const allHeads = await parseLinesToHeads(lines);

	const allHeadsSeq = ArraySeq.from(allHeads);

	const [heads, errorHeads] = allHeadsSeq.partArrays(
		h => h.type !== "ParseErr"
	);

	// logh(`Heads: ${heads.length}`);
	// log(heads);
	// log();

	logh(`Errors: ${errorHeads.length}`);
	for (const err of errorHeads) {
		if (err.type === "ParseErr") {
			log(err.err.head);
			log(err.err.toMessage());
			log(err.err.toReport());
			div();
		}
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
		switch (head.type) {
			case "KeyValDefHead":
				const { keyHead, valueHead } = head;
				const res = parseDefValue(valueHead);
				if (res.type === "NumberErr") {
					const { kind } = res;
					log(`==> ERROR: ${keyHead}: ${kind}`);
					continue;
				}
				const { valueType, value } = res;
				loggn(`${keyHead}: ${value}`, valueType);
				break;
			default:
				break;
		}
	}

	return;
};

// export const logSplitHeads2 = async () => {
// 	logh("Log Parse Begin 01");
// 	logln(40);
// 	log("Legend:");
// 	log("   Head: type and values yet to be parsed.");
// 	log("   <KeyValueHead>: " + "Key and value declared.");
// 	log("   <KeyHead>: " + "Key declared and value required on init.");
// 	log(
// 		"   <KeyBodyHead>: " +
// 			"Key declared and indented body to follow."
// 	);
// 	logln(40);

// 	const file = await open(getTextFile("00-with-errs.txt"));

// 	const errors: ParseErr[] = [];
// 	const dict = new Map<string, any>();

// 	const logLineInfo = (li: LineInfo) => {
// 		const { content, row, indent } = li.lineInfo;
// 		log(
// 			`   LineInfo: row: #${row}, indent: ${indent}, ` +
// 				`content: "${formatLine(content)}"`
// 		);
// 	};

// 	const logError = (err: ParseErr) => {};

// 	let lineNumber = 0;
// 	for await (const line of file.readLines()) {
// 		lineNumber++; // in N

// 		log(`ORG LINE #${lineNumber}: ` + `"${formatLine(line)}"`);

// 		const res1 = getPreLineInfo(line, lineNumber);

// 		if (res1.type === "ParseErr") {
// 			const err = res1;
// 			const { message } = err;
// 			logLineInfo(err);
// 			log(`PARSE-ERR: (${errors.length}): "${message}"`);
// 			errors.push(res1);
// 			logln(40);
// 			continue;
// 		}

// 		const lineInfo: LineInfo = {
// 			lineInfo: {
// 				content: res1.content,
// 				row: res1.row,
// 				indent: res1.indent,
// 			},
// 		};

// 		logLineInfo(lineInfo);

// 		const res2 = splitHead(lineInfo);
// 		switch (res2.type) {
// 			case "KeyValueHead":
// 				{
// 					const { keyHead, valueHead } = res2;
// 					log(
// 						`<KeyValueHead>: ` +
// 							`keyHead: "${keyHead}", ` +
// 							`valueHead: "${valueHead}"`
// 					);
// 				}
// 				break;
// 			case "KeyHead":
// 				{
// 					const { keyHead } = res2;
// 					log(`<KeyHead>: keyHead: "${keyHead}"`);
// 				}
// 				break;
// 			case "KeyBodyHead":
// 				{
// 					const { keyHead } = res2;
// 					log(`<KeyBodyHead>: keyHead: "${keyHead}"`);
// 				}
// 				break;
// 			case "EmptyLine":
// 				{
// 					log("<EmptyLine>");
// 				}
// 				break;
// 			case "ParseErr":
// 				{
// 					const err = res2;
// 					const { message } = err;
// 					log(`PARSE-ERR: (${errors.length}): "${message}"`);
// 					errors.push(err);
// 				}
// 				break;
// 			default:
// 				exhaustiveGuard(res2);
// 		}

// 		logln(40);
// 	}
// };

export const logParserLines = async () => {
	const file = await open(getTextFilePath("00-start.txt"));

	for await (const line of file.readLines()) {
		console.log(line);
	}
};
