import {
	ParserErr,
	ParserStructureErr,
	StructureErrKind,
} from "@/parser/types/err-types";
import { Slice } from "@/parser/types/general";
import {
	HeadType,
	KeyBodyReqHead,
	KeyValReqHead,
	KeyValDefHead,
	LineInfo,
	KeyInvalidHead,
} from "@/parser/types/head";
import { getPreLineInfo } from "@/parser/utils/pre-line-info";
import { log } from "@/utils/log";
import { countOccurencesOf, splitStringOnce } from "@/utils/string";
import { toReadonlyTuple } from "@/utils/types";

export const splitHead = (lineInfo: LineInfo): HeadType => {
	// create ParseErr error Object
	const createParserStructureErr = (
		head: KeyInvalidHead,
		kind: StructureErrKind,
		lineErrorSlice: Slice
	): ParserErr => {
		const err = new ParserStructureErr(head, lineErrorSlice, kind);
		return { type: "ParserErr", err, ...lineInfo };
	};

	const { content: line } = lineInfo.lineInfo;

	// case: empty line
	if (line === "" || line === ":") {
		return {
			type: "EmptyLine",
			isColon: line === ":",
			...lineInfo,
		};
	}

	// split line into keyHead and valueHead
	const parts: readonly string[] = splitStringOnce(line, ": ").map(
		s => s.trim()
	);

	// switch on keyHead and valueHead parts
	switch (parts.length) {
		// case: "key: value", "key: value: value" => KeyValue Decl
		case 2: {
			const [keyHead, valueHead] = toReadonlyTuple(parts, 2);
			return {
				type: "KeyValDefHead",
				keyHead,
				valueHead,
				...lineInfo,
			};
		}
		// case: "key", "key:", "key:value", "key:key:value..."
		case 1: {
			const [keyHead] = toReadonlyTuple(parts, 1);
			const colonCount = countOccurencesOf(keyHead, ":");
			switch (colonCount) {
				case 0:
					// case: "key" => Key Declaration
					return {
						type: "KeyValReqHead",
						keyHead,
						...lineInfo,
					};

				default:
					// case: "key:" "key stuff:8:" => Key Body Decl
					if (line.endsWith(":")) {
						return {
							type: "KeyBodyReqHead",
							keyHead: keyHead.slice(0, -1),
							...lineInfo,
						};
					}
					// case: "key:key:value", ... => ERR
					return createParserStructureErr(
						{
							type: "KeyInvalidHead",
							keyHead,
							...lineInfo,
						},
						"Invalid key colon",
						Slice.fromIndexOfDefaultAll(keyHead.indexOf(":"))
					);
			}
		}
		default:
			throw Error("Never");
	}
};

export const parseLinesToHeads = async (
	lines: readonly string[]
): Promise<readonly HeadType[]> =>
	new Promise(resolve => {
		const heads: HeadType[] = new Array<HeadType>();

		let lineNumber = 0;
		for (const line of lines) {
			lineNumber++; // in N

			const res1 = getPreLineInfo(line, lineNumber);

			if (res1.type === "ParserErr") {
				heads.push(res1);
				continue;
			}

			const preLineInfo = res1;

			const lineInfo: LineInfo = {
				lineInfo: {
					content: preLineInfo.content,
					row: preLineInfo.row,
					indent: preLineInfo.indent,
				},
			};

			const head = splitHead(lineInfo);
			heads.push(head);
		}

		resolve(heads);
	});
