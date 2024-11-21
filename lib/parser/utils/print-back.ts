import { ReportLine } from "@/parser/types/err-types";
import {
	KeyTrait,
	KeyValDef,
	KeyValDefHead,
	ParserErr,
} from "@/parser/types/heads";
import { log } from "@/utils/log";

export const getTraitReport = async (
	trait: KeyTrait,
	lines?: ReportLine[]
): Promise<ReportLine[]> => {
	// create lines array if not yet created
	lines = lines ?? [];

	const addLine = (content: string, indent: number, row: number) => {
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
			case child instanceof KeyValDefHead:
				addLine(
					`${child.keyHead}: ${child.valueHead}`,
					indent,
					row
				);
				break;
			// case "KeyValDefHead":
			// 	addLine(
			// 		`${child.keyHead}: ${child.valueHead}`,
			// 		indent,
			// 		row
			// 	);
			// 	break;
			case child instanceof KeyValDef:
				{
					const { key } = child;
					const { value, valueType } = child.value;

					addLine(
						`${key} in ${valueType.toKey()}: ${value}`,
						indent,
						row
					);
				}
				break;
			case child instanceof KeyTrait:
				// case "KeyTrait":
				{
					lines.push({ content: `${child.key}:`, indent, row });
					await getTraitReport(child, lines);
				}
				break;
			case child instanceof ParserErr:
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
