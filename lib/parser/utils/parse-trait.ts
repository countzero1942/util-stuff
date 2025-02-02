import {
	IndentErrKind,
	NumberErr,
	ParserIndentErr,
	ParserNumberErr,
} from "@/parser/types/err-types";
import {
	EmptyLine,
	KeyHead,
	KeyBodyRequiredHead,
	KeyInvalidHead,
	KeyValueDefinedField,
	KeyValueDefinedHead,
	KeyValueRequiredHead,
	LineInfo,
	ParserErrHead,
	KeyTrait,
} from "@/parser/types/heads";
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
	const root = new KeyBodyRequiredHead(
		StrSlice.all(rootName),
		new LineInfo(StrSlice.empty(), -1, 0)
	);
	return root;
};

export const getValueIndex = (
	head: KeyValueDefinedHead
) => {
	const { content } = head.lineInfo;
	const valueIndex = content.indexOf(": ") + 2;
	return valueIndex;
};

export const parseKeyValueDefinedHead = (
	head: KeyValueDefinedHead
): KeyValueDefinedField | ParserErrHead => {
	const { keyHead, valueHead } = head;

	const keyParamsOrErr = parseKeyHead(head, keyHead);

	if (keyParamsOrErr instanceof ParserErrHead) {
		return keyParamsOrErr; // is ParserErrHead
	}

	const typeValuePairOrErr = parseDefaultValue(
		head,
		valueHead
	);

	if (typeValuePairOrErr instanceof ParserErrHead) {
		return typeValuePairOrErr; // is ParserErrHead
	}

	return new KeyValueDefinedField(
		keyHead,
		typeValuePairOrErr, // is TypeValuePair
		head.lineInfo
	);
};

const getIndentError = (
	invalidChildren: readonly KeyHead[],
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
		trait: new ParserErrHead(err, lineInfo),

		// index is zero-based; rowErrorRange is one-based
		nextIndex: rowErrorRange.endExcl - 1,
	};
};

const getSelfTrait = (
	traitHead: KeyBodyRequiredHead,
	traitBodyIndent: number,
	nextIndex: number,
	children: KeyHead[]
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
		trait: new KeyTrait(
			traitHead.keyHead,
			children,
			traitHead.lineInfo
		),
		nextIndex,
	} as ParseTraitResult;
};

const collectInvalidIndentChildren = (
	heads: readonly KeyHead[],
	currentHeadIndex: number,
	traitBodyIndent: number
): readonly KeyHead[] => {
	const invalidChildren: KeyHead[] = [];

	while (currentHeadIndex < heads.length) {
		const head = heads[currentHeadIndex] as KeyHead;

		if (head.lineInfo.indent <= traitBodyIndent) {
			break;
		}

		invalidChildren.push(head);
		currentHeadIndex++;
	}

	return invalidChildren;
};

export const parseTrait = (
	traitHead: KeyBodyRequiredHead,
	heads: readonly KeyHead[],
	headIndex: number
): ParseTraitResult => {
	// logh(`Parse Trait: ${traitHead.keyHead}`);

	const children: KeyHead[] = [];

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

		const head = heads[currentHeadIndex] as KeyHead;

		// logg(
		// 	`i: ${currentHeadIndex}, indent: ${head.lineInfo.indent}, row: ${head.lineInfo.row}`,
		// 	`"${head.lineInfo.content}"`,
		// 	getClassName(head)
		// );

		const indent = head.lineInfo.indent;

		if (head instanceof ParserErrHead) {
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
			case head instanceof KeyValueDefinedHead:
				{
					// res is KeyValueDefinedField or ParserErrHead
					const res = parseKeyValueDefinedHead(head);
					children.push(res);
					currentHeadIndex++;
				}
				break;
			case head instanceof KeyValueRequiredHead:
			case head instanceof EmptyLine:
				children.push(head);
				currentHeadIndex++;
				break;
			// case: trait head, array head or set head
			case head instanceof KeyBodyRequiredHead:
				// recursive call to parseTrait
				const { trait, nextIndex } = parseTrait(
					head,
					heads,
					currentHeadIndex + 1
				);
				children.push(trait);
				currentHeadIndex = nextIndex;
				break;
			case head instanceof KeyInvalidHead:
				// invalid heads are only inside ParserErr
				throw "Never";
			default:
				// all heads should be processed
				throw "Never";
		}
	}
};
