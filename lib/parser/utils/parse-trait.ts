import {
	IndentErrKind,
	ParserIndentErr,
	ParserNumberErr,
} from "@/parser/types/err-types";
import { StrCharSlice } from "@/parser/types/general";
import {
	HeadType,
	KeyBodyReqHead,
	KeyValDefHead,
	LineInfo,
} from "@/parser/types/head";
import { ParseTraitResult } from "@/parser/types/parse-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { logh, logg } from "@/utils/log";
import { Range } from "@/utils/seq";

export const parseKeyValDefHead = (head: KeyValDefHead) => {
	const { keyHead, valueHead } = head;
	const res = parseDefaultValue(valueHead);

	if (res.type === "NumberErr") {
		const { content, indent } = head.lineInfo;
		const slice: StrCharSlice = StrCharSlice.all(content);
		return {
			type: "ParserErr",
			err: new ParserNumberErr(head, slice, res),
		};
	}

	return {
		type: "KeyValDef",
		key: head.keyHead,
		value: res,
	} as const;
};

export const parseTrait = (
	traitHead: KeyBodyReqHead,
	heads: readonly HeadType[],
	headIndex: number
): ParseTraitResult => {
	const getIndentError = (
		invalidChildren: readonly HeadType[],
		rowErrorRange: Range,
		properIndent: number,
		kind: IndentErrKind,
		lineInfo: LineInfo
	): ParseTraitResult => {
		const err = new ParserIndentErr(
			invalidChildren,
			rowErrorRange,
			properIndent,
			kind
		);

		return {
			trait: {
				type: "ParserErr",
				err,
				...lineInfo,
			},
			// index is zero-based; rowErrorRange is one-based
			nextIndex: rowErrorRange.endExcl - 1,
		};
	};

	const getSelfTrait = (
		nextIndex: number,
		children: HeadType[]
	): ParseTraitResult => {
		if (children.length === 0 && traitHead.keyHead !== ":root") {
			const lineInfo = traitHead.lineInfo;
			const err = getIndentError(
				[],
				Range.from(0, 0),
				traitBodyIndent,
				"Missing children",
				{ lineInfo }
			);
			children.push(err.trait);
		}
		return {
			trait: {
				type: "KeyTrait",
				key: traitHead.keyHead,
				children,
				lineInfo: traitHead.lineInfo,
			},
			nextIndex,
		} as ParseTraitResult;
	};

	const collectInvalidIndentChildren = (
		i: number,
		traitBodyIndent: number
	): readonly HeadType[] => {
		const invalidChildren: HeadType[] = [];

		while (i < heads.length) {
			const head = heads[i] as HeadType;

			if (head.lineInfo.indent <= traitBodyIndent) {
				break;
			}

			invalidChildren.push(head);
			i++;
		}

		return invalidChildren;
	};

	// logh(`Parse Trait: ${traitHead.keyHead}`);

	const children: HeadType[] = [];

	let traitBodyIndent = traitHead.lineInfo.indent + 1;
	let i = headIndex;

	while (true) {
		if (i >= heads.length) {
			return getSelfTrait(i, children);
		}

		const head = heads[i] as HeadType;

		// logg(
		// 	`i: ${i}, indent: ${head.lineInfo.indent}, row: ${head.lineInfo.row}`,
		// 	`"${head.lineInfo.content}"`,
		// 	head.type
		// );

		const indent = head.lineInfo.indent;

		if (head.type === "ParserErr") {
			children.push(head);
			i++;
			continue;
		}

		switch (true) {
			// case: end of children
			case indent < traitBodyIndent:
				// logh("End of indent");
				return getSelfTrait(i, children);
			// case: invalid children or over-indent
			case indent > traitBodyIndent: {
				const invalidChildren = collectInvalidIndentChildren(
					i,
					traitBodyIndent
				);
				const rowErrorRange = Range.fromLength(
					i + 1,
					invalidChildren.length
				);
				const { lineInfo } = head;
				const errKind =
					children.length > 0
						? "Invalid children"
						: "Invalid over-indent";
				// case: invalid children to non-KeyBodyReqHead
				const err = getIndentError(
					invalidChildren,
					rowErrorRange,
					traitBodyIndent,
					errKind,
					{ lineInfo }
				);
				children.push(err.trait);
				i = err.nextIndex;
				continue;
			}
			// case: head is valid
			default:
				break;
		}

		switch (head.type) {
			case "KeyValDefHead":
			case "KeyValReqHead":
			case "EmptyLine":
				children.push(head);
				i++;
				break;
			// case: trait head, array head or set head
			case "KeyBodyReqHead":
				// recursive call to parseTrait
				const { trait, nextIndex } = parseTrait(
					head,
					heads,
					i + 1
				);
				children.push(trait);
				i = nextIndex;
				break;
			case "KeyInvalidHead":
				// invalid heads are only inside ParserErr
				throw "Never";
			default:
				// all heads should be processed
				throw "Never";
		}
	}
};
