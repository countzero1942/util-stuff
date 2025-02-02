import { ReportLine } from "@/parser/types/err-types";
import {
	KeyTrait,
	KeyValueDefinedField,
	KeyValueDefinedHead,
	ParserErrHead,
} from "@/parser/types/heads";
import { log } from "@/utils/log";

export const getTraitReport = async (
	trait: KeyTrait,
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
			case child instanceof KeyValueDefinedHead:
				addLine(
					`${child.keyHead}: ${child.valueHead}`,
					indent,
					row
				);
				break;
			case child instanceof KeyValueDefinedField:
				{
					const { key } = child;
					const { value, type } = child.value;

					addLine(
						`${key} .in ${type.toParsableString()}: ${value}`,
						indent,
						row
					);
				}
				break;
			case child instanceof KeyTrait:
				{
					lines.push({
						content: `${child.key}:`,
						indent,
						row,
					});
					await getTraitReport(child, lines);
				}
				break;
			case child instanceof ParserErrHead:
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
