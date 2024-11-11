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
import {
	HeadType,
	KeyBodyReqHead,
	KeyTrait,
	LineInfo,
} from "@/parser/types/head";
import {
	IndentErrKind,
	ParserErr,
	ParserIndentErr,
} from "@/parser/types/err-types";
import { Slice } from "@/parser/types/general";

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

	const [heads, errorHeads] = ArraySeq.from(allHeads).partArrays(
		h => h.type !== "ParserErr"
	);

	logh(`Heads: ${heads.length}`);
	log(heads);
	log();

	logh(`Errors: ${errorHeads.length}`);
	for (const err of errorHeads as ParserErr[]) {
		log(err.err.toMessage());
		log(err.err.toReport());
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

export type ParseTraitResult = {
	trait: KeyTrait | ParserErr;
	nextIndex: number;
};

export const parseTrait = (
	traitHead: KeyBodyReqHead,
	heads: readonly HeadType[],
	headIndex: number
): ParseTraitResult => {
	const getSelfTrait = (
		nextIndex: number,
		children: HeadType[]
	): ParseTraitResult => {
		return {
			trait: {
				type: "KeyTrait",
				key: traitHead.keyHead,
				children,
			},
			nextIndex,
		} as ParseTraitResult;
	};

	const getIndentError = (
		invalidChildren: HeadType[],
		blockErrorSlice: Slice,
		kind: IndentErrKind,
		lineInfo: LineInfo
	): ParseTraitResult => {
		const err = new ParserIndentErr(
			invalidChildren,
			blockErrorSlice,
			kind
		);

		const slice = blockErrorSlice.normalize(heads);
		const nextIndex = slice.startIncl + slice.endExcl;
		return {
			trait: {
				type: "ParserErr",
				err,
				...lineInfo,
			},
			nextIndex,
		};
	};

	const collectInvalidIndentChildren = (
		i: number,
		bodyIndent: number
	) => {
		const invalidChildren: HeadType[] = [];

		while (i < heads.length) {
			const head = heads[i] as HeadType;

			if (head.lineInfo.indent <= bodyIndent) {
				break;
			}

			invalidChildren.push(head);
			i++;
		}

		return invalidChildren;
	};

	const children: HeadType[] = [];

	let bodyIndent = traitHead.lineInfo.indent + 1;
	let i = headIndex;

	while (true) {
		if (i >= heads.length) {
			return getSelfTrait(i, children);
		}

		const head = heads[i] as HeadType;

		const indent = head.lineInfo.indent;

		switch (true) {
			// case: end of children
			case indent < bodyIndent:
				return getSelfTrait(i, children);
			// case: invalid children or over-indent
			case indent > bodyIndent: {
				const invalidChildren = collectInvalidIndentChildren(
					i,
					bodyIndent
				);
				const nextIndex = i + invalidChildren.length;
				const slice = Slice.from(i, nextIndex);
				const { lineInfo } = head;
				// case: invalid children
				if (children.length > 0) {
					const err = getIndentError(
						invalidChildren,
						slice,
						"Invalid children",
						{ lineInfo }
					);
					children.push(err.trait);
					i = err.nextIndex;
					continue;
				}
				// case: invalid over-indent at start
				else {
					return getIndentError(
						invalidChildren,
						slice,
						"Invalid over-indent",
						{ lineInfo }
					);
				}
			}
			default:
				break;
		}

		switch (head.type) {
			case "KeyValDefHead":
				children.push(head);
				i++;
				break;
			case "KeyBodyReqHead":
				const { trait, nextIndex } = parseTrait(
					head,
					heads,
					i + 1
				);
				children.push(trait);
				i = nextIndex;
				break;
		}
	}
};

export const logParseTraits = async () => {
	logh("Log Parse: Parse Default Values");
	log();

	const res1 = await fileToLines("01-trait-tree.txt");
	if (res1.type === "ErrorType") {
		log("ERROR:");
		log(res1);
		return;
	}

	const lines = res1.lines;

	const allHeads = await parseLinesToHeads(lines);
};
