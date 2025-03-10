import {
	IndentErrKind,
	NumberErr,
	ParserIndentErr,
	ParserNumberErr,
} from "@/parser/types/err-types";
import {
	EmptyLineNode,
	KeyValueBase,
	KeyBodyRequiredSource,
	KeyInvalidSource,
	KeyValueDefinedSource,
	KeyValueRequiredSource,
	LineInfo,
	ParserErrNode,
	KeyTraitNode,
	KeyValueDefinedNode,
} from "@/parser/types/key-value";
import { ParseTraitResult } from "@/parser/types/parse-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { logh, logg } from "@/utils/log";
import { Range } from "@/utils/seq";
import { StrSlice } from "@/utils/slice";
import { getClassName } from "@/utils/types";
import { Key } from "node:readline";
import { parseKeyHead } from "@/parser/utils/parse-key-head";

export const createRootHead = (
	rootName: string = ":root"
) => {
	if (rootName === "") {
		throw new Error("Root name cannot be empty");
	}
	if (rootName[0] !== ":") {
		throw new Error('Root name must start with ":"');
	}
	const root = new KeyBodyRequiredSource(
		StrSlice.all(rootName),
		new LineInfo(StrSlice.empty(), -1, 0)
	);
	return root;
};

export const getValueIndex = (
	head: KeyValueDefinedSource
) => {
	const { content } = head.lineInfo;
	const valueIndex = content.indexOf(": ") + 2;
	return valueIndex;
};

export const parseKeyValueDefinedHead = (
	head: KeyValueDefinedSource
): KeyValueDefinedNode | ParserErrNode => {
	const { keyHead, valueHead } = head;

	const keyParamsOrErr = parseKeyHead(head, keyHead);

	if (keyParamsOrErr instanceof ParserErrNode) {
		return keyParamsOrErr; // is ParserErrHead
	}

	const typeValuePairOrErr = parseDefaultValue(
		head,
		valueHead
	);

	if (typeValuePairOrErr instanceof ParserErrNode) {
		return typeValuePairOrErr; // is ParserErrHead
	}

	return new KeyValueDefinedNode(
		keyHead,
		typeValuePairOrErr, // is TypeValuePair
		head.lineInfo
	);
};

const getIndentError = (
	invalidChildren: readonly KeyValueBase[],
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
		trait: new ParserErrNode(err, lineInfo),

		// index is zero-based; rowErrorRange is one-based
		nextIndex: rowErrorRange.endExcl - 1,
	};
};

const getSelfTrait = (
	traitHead: KeyBodyRequiredSource,
	traitBodyIndent: number,
	nextIndex: number,
	children: KeyValueBase[]
): ParseTraitResult => {
	if (
		children.length === 0 &&
		!traitHead.keyHead.equals(":root")
	) {
		const err = getIndentError(
			[],
			Range.empty(),
			traitBodyIndent,
			"Missing children",
			traitHead.lineInfo
		);
		children.push(err.trait);
	}
	return {
		trait: new KeyTraitNode(
			traitHead.keyHead,
			children,
			traitHead.lineInfo
		),
		nextIndex,
	} as ParseTraitResult;
};

const collectInvalidIndentChildren = (
	heads: readonly KeyValueBase[],
	currentHeadIndex: number,
	traitBodyIndent: number
): readonly KeyValueBase[] => {
	const invalidChildren: KeyValueBase[] = [];

	while (currentHeadIndex < heads.length) {
		const head = heads[currentHeadIndex] as KeyValueBase;

		if (head.lineInfo.indent <= traitBodyIndent) {
			break;
		}

		invalidChildren.push(head);
		currentHeadIndex++;
	}

	return invalidChildren;
};

export const parseTrait = (
	traitHead: KeyBodyRequiredSource,
	heads: readonly KeyValueBase[],
	headIndex: number
): ParseTraitResult => {
	// logh(`Parse Trait: ${traitHead.keyHead}`);

	const children: KeyValueBase[] = [];

	let traitBodyIndent = traitHead.lineInfo.indent + 1;
	let currentHeadIndex = headIndex;

	while (true) {
		if (currentHeadIndex >= heads.length) {
			return getSelfTrait(
				traitHead,
				traitBodyIndent,
				currentHeadIndex,
				children
			);
		}

		const head = heads[currentHeadIndex] as KeyValueBase;

		// logg(
		// 	`i: ${currentHeadIndex}, indent: ${head.lineInfo.indent}, row: ${head.lineInfo.row}`,
		// 	`"${head.lineInfo.content}"`,
		// 	getClassName(head)
		// );

		const indent = head.lineInfo.indent;

		if (head instanceof ParserErrNode) {
			children.push(head);
			currentHeadIndex++;
			continue;
		}

		switch (true) {
			// case: end of children/indent
			case indent < traitBodyIndent:
				// logh("End of indent");
				return getSelfTrait(
					traitHead,
					traitBodyIndent,
					currentHeadIndex,
					children
				);
			// case: invalid children or over-indent
			case indent > traitBodyIndent: {
				const invalidChildren =
					collectInvalidIndentChildren(
						heads,
						currentHeadIndex,
						traitBodyIndent
					);
				const rowErrorRange = Range.fromLength(
					currentHeadIndex + 1,
					invalidChildren.length
				);
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
					head.lineInfo
				);
				children.push(err.trait);
				currentHeadIndex = err.nextIndex;
				continue;
			}
			// case: head is valid
			default:
				break;
		}

		switch (true) {
			case head instanceof KeyValueDefinedSource:
				{
					// res is KeyValueDefinedNode or ParserErrNode
					const res = parseKeyValueDefinedHead(head);
					children.push(res);
					currentHeadIndex++;
				}
				break;
			case head instanceof KeyValueRequiredSource:
			case head instanceof EmptyLineNode:
				children.push(head);
				currentHeadIndex++;
				break;
			// case: trait head, array head or set head
			case head instanceof KeyBodyRequiredSource:
				// recursive call to parseTrait
				const { trait, nextIndex } = parseTrait(
					head,
					heads,
					currentHeadIndex + 1
				);
				children.push(trait);
				currentHeadIndex = nextIndex;
				break;
			case head instanceof KeyInvalidSource:
				// invalid heads are only inside ParserErr
				throw "Never";
			default:
				// all heads should be processed
				throw "Never";
		}
	}
};
