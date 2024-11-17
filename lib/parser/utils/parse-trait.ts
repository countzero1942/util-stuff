import {
	IndentErrKind,
	ParserIndentErr,
} from "@/parser/types/err-types";
import {
	HeadType,
	KeyBodyReqHead,
	LineInfo,
} from "@/parser/types/head";
import { ParseTraitResult } from "@/parser/types/parse-types";
import { logh, logg } from "@/utils/log";
import { Range } from "@/utils/seq";

export const parseTrait = (
	traitHead: KeyBodyReqHead,
	heads: readonly HeadType[],
	headIndex: number
): ParseTraitResult => {
	const getSelfTrait = (
		nextIndex: number,
		children: HeadType[]
	): ParseTraitResult => {
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
			nextIndex: rowErrorRange.endExcl,
		};
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
					i,
					invalidChildren.length
				);
				const { lineInfo } = head;
				// case: invalid children to non-KeyBodyReqHead
				if (children.length > 0) {
					const err = getIndentError(
						invalidChildren,
						rowErrorRange,
						traitBodyIndent,
						"Invalid children",
						{ lineInfo }
					);
					children.push(err.trait);
					i = err.nextIndex;
					continue;
				}
				// case: invalid over-indent at start of KeyBodyReqHead children
				else {
					return getIndentError(
						invalidChildren,
						rowErrorRange,
						traitBodyIndent,
						"Invalid over-indent",
						{ lineInfo }
					);
				}
			}
			// case: head is valid
			default:
				break;
		}

		switch (head.type) {
			case "KeyValDefHead":
			case "KeyValReqHead":
			case "EmptyLine":
			case "ParserErr":
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
