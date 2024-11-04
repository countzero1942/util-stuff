import {
	ParseErr,
	ParserStructureErr,
} from "@/parser/types/err-types";
import { Slice } from "@/parser/types/general";
import { HeadType, LineInfo } from "@/parser/types/head";
import { logag } from "@/utils/log";
import { formatTabsToSymbols } from "@/utils/string";

export type PreLineInfo = {
	readonly type: "PreLineInfo";
	readonly content: string;
	readonly indent: number;
	readonly row: number;
};

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
): PreLineInfo | ParseErr => {
	const getSpaceError = (): ParseErr => {
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
				return Slice.none();
			}
			return Slice.fromLength(index, length);
		};

		const lineErrorSlice = getSlice();

		const lineInfo: LineInfo = {
			lineInfo: {
				indent: 0,
				content: line,
				row: lineNumber,
			},
		};

		const head: HeadType = {
			type: "KeyInvalidHead",
			keyHead,
			...lineInfo,
		};

		const err = new ParserStructureErr(
			head,
			lineErrorSlice,
			"Invalid space tabs"
		);

		return {
			type: "ParseErr",
			err,
			...lineInfo,
		};
	};

	if (line.startsWith(" ")) {
		return getSpaceError();
	}

	const { tabs, content } = getTabsAndContent(line.trimEnd());

	if (content.startsWith(" ")) {
		return getSpaceError();
	}

	const preLineInfo: PreLineInfo = {
		type: "PreLineInfo",
		content,
		indent: tabs,
		row: lineNumber,
	};
	return preLineInfo;
};
