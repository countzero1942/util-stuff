import { ReportLine } from "@/parser/types/err-types";
import { log } from "@/utils/log";
import {
	KeyValueDefinedSource,
	ParserErrNode,
	KeyTraitNode,
	KeyValueDefinedNode,
} from "@/parser/types/key-value";
import { StrSlice } from "@/utils/slice";

export const getTraitReport = async (
	trait: KeyTraitNode,
	lines?: ReportLine[]
): Promise<ReportLine[]> => {
	// create lines array if not yet created
	lines = lines ?? [];

	const addLine = (
		content: string,
		indent: number,
		row: number
	) => {
		const line: ReportLine = { content, indent, row };
		lines.push(line);
	};

	const { key, children } = trait;

	for (const child of children) {
		const { indent, row } = child.lineInfo;
		if (indent < trait.lineInfo.indent) {
			return lines;
		}

		switch (true) {
			case child instanceof KeyValueDefinedSource:
				addLine(
					`${child.keyHead.value}: ${child.valueHead.value}`,
					indent,
					row
				);
				break;
			case child instanceof KeyValueDefinedNode:
				{
					const { keyNode, valueNode } = child;
					const { typeValue, type } = valueNode;

					// const typeStr =
					// 	typeValue instanceof StrSlice
					// 		? typeValue.value
					// 		: typeValue.toString();

					addLine(
						`${keyNode.value} .in ${type.toParsableString()}: ${typeValue.toString()}`,
						indent,
						row
					);
				}
				break;
			case child instanceof KeyTraitNode:
				{
					lines.push({
						content: `${child.key.value}:`,
						indent,
						row,
					});
					await getTraitReport(child, lines);
				}
				break;
			case child instanceof ParserErrNode:
				{
					const childLines = child.err.toReport();
					lines.push(...childLines);
				}
				break;
			default:
				throw "Never";
		}
	}

	return lines;
};

export const formatTraitReport = (
	lines: readonly ReportLine[],
	rowGutterLen = 4,
	indentStr = "   "
) => {
	const strLines = lines.map(line => {
		const { content, indent, row } = line;
		const rowStr =
			row !== undefined
				? `${row.toString().padStart(rowGutterLen, " ")}`
				: " ".repeat(rowGutterLen);
		const fullIndentStr = indentStr.repeat(indent);
		return `${rowStr}  ${fullIndentStr}${content}`;
	});

	return strLines;
};
