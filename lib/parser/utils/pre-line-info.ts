import { ParserStructureErr } from "@/parser/types/err-types";
import { StrSlice } from "@/utils/slice";
import {
	KeyHead,
	ParserErr,
	LineInfo,
	KeyInvalidHead,
} from "@/parser/types/heads";
import { div, logag } from "@/utils/log";
import { formatTabsToSymbols } from "@/utils/string";
import { log } from "console";

export class PreLineInfo {
	constructor(
		public readonly content: string,
		public readonly indent: number,
		public readonly row: number
	) {}
}

type TabsAndContent = {
	tabs: number;
	content: string;
};

const getTabsAndContent = (
	line: string
): TabsAndContent => {
	// Note: due to Regex limits, 'content' picks up
	// tabs on empty line, so they won't be counted.
	// But it shouldn't matter

	const tabRegEx = /^(?<tabs>\t+)?(?<content>.*)/g;
	type TabContentGroups =
		| {
				tabs?: string;
				content?: string;
		  }
		| undefined;
	const res = tabRegEx.exec(line);

	const groups: TabContentGroups = res?.groups;

	return {
		tabs: groups?.tabs?.length ?? 0,
		content: groups?.content ?? "",
	};
};

const getSpaceError = (
	line: string,
	lineNumber: number
): ParserErr => {
	const keyHead = formatTabsToSymbols(line);
	const getSlice = () => {
		const match = keyHead.match(/^(?:(?:\\t)|(?:[ ]))+/);
		const index = match?.index;
		const length = match?.[0]?.length;
		if (
			match === null ||
			index === undefined ||
			length === undefined
		) {
			return StrSlice.none(keyHead);
		}
		return StrSlice.fromLength(keyHead, index, length);
	};

	const lineErrorSlice = getSlice();

	const lineInfo = new LineInfo(
		StrSlice.all(keyHead),
		0,
		lineNumber
	);

	const head = new KeyInvalidHead(
		StrSlice.all(keyHead),
		lineInfo
	);

	const err = new ParserStructureErr(
		head,
		lineErrorSlice,
		"Invalid space tabs"
	);

	return new ParserErr(err, lineInfo);
};

export const getPreLineInfo = (
	line: string,
	lineNumber: number
): PreLineInfo | ParserErr => {
	if (line.startsWith(" ")) {
		return getSpaceError(line, lineNumber);
	}

	const { tabs, content } = getTabsAndContent(
		line.trimEnd()
	);

	if (content.startsWith(" ")) {
		return getSpaceError(line, lineNumber);
	}

	const preLineInfo = new PreLineInfo(
		content,
		tabs,
		lineNumber
	);

	return preLineInfo;
};
