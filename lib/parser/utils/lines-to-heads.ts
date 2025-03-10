import {
	ParserStructureErr,
	StructureErrKind,
} from "@/parser/types/err-types";
import { StrSlice } from "@/utils/slice";
import {
	KeyValueBase,
	KeyBodyRequiredSource,
	KeyValueRequiredSource,
	KeyValueDefinedSource,
	LineInfo,
	KeyInvalidSource,
	ParserErrNode,
	EmptyLineNode,
} from "@/parser/types/key-value";
import { getPreLineInfo } from "@/parser/utils/pre-line-info";
import { log } from "@/utils/log";
import {
	countOccurencesOf,
	splitStringOnce,
} from "@/utils/string";
import { toReadonlyTuple } from "@/utils/types";

export const splitHead = (
	lineInfo: LineInfo
): KeyValueBase => {
	// create ParseErr error Object
	const createParserStructureErr = (
		head: KeyInvalidSource,
		kind: StructureErrKind,
		lineErrorSlice: StrSlice
	): ParserErrNode => {
		const err = new ParserStructureErr(
			head,
			lineErrorSlice,
			kind
		);
		return new ParserErrNode(err, lineInfo);
	};

	const { content: line } = lineInfo;

	// case: empty line
	if (line.isEmpty || line.equals(":")) {
		return new EmptyLineNode(lineInfo);
	}

	// split line into keyHead and valueHead
	// const parts: readonly string[] = splitStringOnce(line, ": ").map(
	// 	s => s.trim()
	// );

	const parts: readonly StrSlice[] = line.split(": ", 1);

	// switch on keyHead and valueHead parts
	switch (parts.length) {
		// case: "key: value", "key: value: value" => KeyValue Decl
		case 2: {
			const [keyHead, valueHead] = toReadonlyTuple(
				parts,
				2
			);
			return new KeyValueDefinedSource(
				keyHead,
				valueHead,
				lineInfo
			);
		}
		// case: "key", "key:", "key:value", "key:key:value..."
		case 1: {
			const [keyHead] = toReadonlyTuple(parts, 1);
			const colonCount = keyHead.countOccurencesOf(":");
			switch (colonCount) {
				case 0:
					// case: "key" => Key Declaration
					return new KeyValueRequiredSource(
						keyHead,
						lineInfo
					);

				default:
					// case: "key:" "key stuff:8:" => Key Body Decl
					if (line.endsWith(":")) {
						return new KeyBodyRequiredSource(
							keyHead.slice(0, -1),
							lineInfo
						);
					}
					// case: "key:key:value", ... => ERR
					return createParserStructureErr(
						new KeyInvalidSource(keyHead, lineInfo),
						"Invalid key colon",
						StrSlice.fromIndexOfDefaultAll(
							keyHead.source,
							keyHead.indexOf(":")
						)
					);
			}
		}
		default:
			throw Error("Never");
	}
};

export const parseLinesToHeads = async (
	lines: readonly string[]
): Promise<readonly KeyValueBase[]> =>
	new Promise(resolve => {
		const heads: KeyValueBase[] = [];

		let lineNumber = 0;
		for (const line of lines) {
			lineNumber++; // in N

			const res1 = getPreLineInfo(line, lineNumber);

			if (res1 instanceof ParserErrNode) {
				heads.push(res1);
				continue;
			}

			const preLineInfo = res1;

			const lineInfo: LineInfo = new LineInfo(
				StrSlice.all(preLineInfo.content),
				preLineInfo.indent,
				preLineInfo.row
			);

			const head = splitHead(lineInfo);
			heads.push(head);
		}

		resolve(heads);
	});
