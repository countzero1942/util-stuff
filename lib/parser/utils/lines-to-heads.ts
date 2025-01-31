import {
	ParserStructureErr,
	StructureErrKind,
} from "@/parser/types/err-types";
import { StrSlice } from "@/utils/slice";
import {
	KeyHead,
	KeyBodyRequiredHead,
	KeyValueRequiredHead,
	KeyValueDefinedHead,
	LineInfo,
	KeyInvalidHead,
	ParserErrHead,
	EmptyLine,
} from "@/parser/types/heads";
import { getPreLineInfo } from "@/parser/utils/pre-line-info";
import { log } from "@/utils/log";
import {
	countOccurencesOf,
	splitStringOnce,
} from "@/utils/string";
import { toReadonlyTuple } from "@/utils/types";

export const splitHead = (lineInfo: LineInfo): KeyHead => {
	// create ParseErr error Object
	const createParserStructureErr = (
		head: KeyInvalidHead,
		kind: StructureErrKind,
		lineErrorSlice: StrSlice
	): ParserErrHead => {
		const err = new ParserStructureErr(
			head,
			lineErrorSlice,
			kind
		);
		return new ParserErrHead(err, lineInfo);
	};

	const { content: line } = lineInfo;

	// case: empty line
	if (line.isEmpty || line.equals(":")) {
		return new EmptyLine(lineInfo);
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
			return new KeyValueDefinedHead(
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
					return new KeyValueRequiredHead(
						keyHead,
						lineInfo
					);

				default:
					// case: "key:" "key stuff:8:" => Key Body Decl
					if (line.endsWith(":")) {
						return new KeyBodyRequiredHead(
							keyHead.slice(0, -1),
							lineInfo
						);
					}
					// case: "key:key:value", ... => ERR
					return createParserStructureErr(
						new KeyInvalidHead(keyHead, lineInfo),
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
): Promise<readonly KeyHead[]> =>
	new Promise(resolve => {
		const heads: KeyHead[] = [];

		let lineNumber = 0;
		for (const line of lines) {
			lineNumber++; // in N

			const res1 = getPreLineInfo(line, lineNumber);

			if (res1 instanceof ParserErrHead) {
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
