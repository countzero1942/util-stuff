import {
	EmptyLine,
	LineInfo,
	ParseErr,
} from "@/parser/types/general";
import {
	KeyBodyHead,
	KeyHead,
	KeyValueHead,
} from "@/parser/types/head";
import { log } from "@/utils/log";
import { countOccurencesOf, splitStringOnce } from "@/utils/string";
import { toReadonlyTuple } from "@/utils/types";

export type HeadType =
	| KeyValueHead
	| KeyHead
	| KeyBodyHead
	| EmptyLine
	| ParseErr;

export const splitHead = (lineInfo: LineInfo): HeadType => {
	const { content: line } = lineInfo.lineInfo;

	// case: empty line
	if (line === "" || line === ":") {
		return {
			type: "EmptyLine",
			...lineInfo,
		};
	}

	// split line into keyHead and valueHead
	const parts: readonly string[] = splitStringOnce(line, ": ").map(
		s => s.trim()
	);

	// create ParseErr error Object
	const createParseErr = (message: string): ParseErr => {
		return { type: "ParseErr", message, ...lineInfo };
	};

	// Error messages
	const confusingColon =
		"Cannot discern key assignment colon. Must be ': '.";

	// switch on keyHead and valueHead parts
	switch (parts.length) {
		// case: "key: value", "key: value: value" => KeyValue Decl
		case 2: {
			const [keyHead, valueHead] = toReadonlyTuple(parts, 2);
			return {
				type: "KeyValueHead",
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
						type: "KeyHead",
						keyHead,
						...lineInfo,
					};

				default:
					// case: "key:" "key: stuff:8:" => Key Body Decl
					if (line.endsWith(":")) {
						return {
							type: "KeyBodyHead",
							keyHead: keyHead.slice(0, -1),
							...lineInfo,
						};
					}
					// case: "key:key:value", ... => ERR
					return createParseErr(confusingColon);
			}
		}
		default:
			throw Error("Never");
	}
};
