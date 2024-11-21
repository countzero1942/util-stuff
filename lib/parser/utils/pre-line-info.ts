import { ParserStructureErr } from "@/parser/types/err-types";
import { StrCharSlice } from "@/parser/types/general";
import {
	KeyHead,
	ParserErr,
	LineInfo,
	KeyInvalidHead,
} from "@/parser/types/heads";
import { logag } from "@/utils/log";
import { formatTabsToSymbols } from "@/utils/string";

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

const getTabsAndContent = (line: string): TabsAndContent => {
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

export const getPreLineInfo = (
	line: string,
	lineNumber: number
): PreLineInfo | ParserErr => {
	const getSpaceError = (): ParserErr => {
		const keyHead = formatTabsToSymbols(line);

		const getSlice = () => {
			const match = keyHead.match(/([ ]+)/);
			const index = match?.index;
			const length = match?.[1]?.length;
			if (
				match === null ||
				index === undefined ||
				length === undefined
			) {
				return StrCharSlice.none(keyHead);
			}
			return StrCharSlice.fromLength(keyHead, index, length);
		};

		const lineErrorSlice = getSlice();

		const lineInfo = new LineInfo(line, 0, lineNumber);

		const head = new KeyInvalidHead(keyHead, lineInfo);

		const err = new ParserStructureErr(
			head,
			lineErrorSlice,
			"Invalid space tabs"
		);

		return new ParserErr(err, lineInfo);
	};

	if (line.startsWith(" ")) {
		return getSpaceError();
	}

	const { tabs, content } = getTabsAndContent(line.trimEnd());

	if (content.startsWith(" ")) {
		return getSpaceError();
	}

	const preLineInfo = new PreLineInfo(content, tabs, lineNumber);

	return preLineInfo;
};
