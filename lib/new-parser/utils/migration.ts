import {
	KeyTrait,
	KeyValueDefinedField,
	LineInfo,
} from "@/parser/types/heads";
import { TypeValuePair as OldTypeValuePair } from "@/parser/types/parse-types";
import { TypeBase, Str } from "@/parser/types/type-types";
import { StrSlice } from "@/utils/slice";
import { TraitNode, TypedFieldNode } from "../types/ast";
import { SourceContext } from "../types/source";
import {
	StringType,
	TypeValuePair,
	TypeConstraint,
} from "../types/types";

/**
 * Convert a legacy LineInfo to a SourceContext
 */
export function convertLineInfo(
	info: LineInfo
): SourceContext {
	return {
		content: info.content,
		indent: info.indent,
		range: {
			start: { line: info.row, column: 1 },
			end: {
				line: info.row,
				column: info.content.length + 1,
			},
		},
	};
}

/**
 * Convert a legacy type to a new type
 */
export function convertOldTypeToNew(
	type: TypeBase
): StringType {
	// For now, we only support string type
	return new StringType();
}

/**
 * Convert a new type to a legacy type
 */
export function convertNewTypeToOld(
	type: StringType
): TypeBase {
	// For now, we only support string type
	return new Str();
}

/**
 * Convert a legacy node to a new node
 */
export function convertOldToNew(
	node: KeyTrait | KeyValueDefinedField
): TraitNode | TypedFieldNode {
	if (node instanceof KeyTrait) {
		return new TraitNode(
			node.key.value,
			node.children
				.filter(
					(
						child
					): child is
						| KeyTrait
						| KeyValueDefinedField =>
						child instanceof KeyTrait ||
						child instanceof KeyValueDefinedField
				)
				.map(convertOldToNew),
			[],
			node.lineInfo
				? convertLineInfo(node.lineInfo)
				: null
		);
	}

	return new TypedFieldNode(
		node.key.value,
		new TypeValuePair(node.value.value, new StringType()),
		node.lineInfo ? convertLineInfo(node.lineInfo) : null
	);
}

/**
 * Convert a new node to a legacy node
 */
export function convertNewToOld(
	node: TraitNode | TypedFieldNode
): KeyTrait | KeyValueDefinedField {
	if (node instanceof TraitNode) {
		return new KeyTrait(
			new StrSlice(node.key),
			node.children.map(child => {
				if (
					!(
						child instanceof TraitNode ||
						child instanceof TypedFieldNode
					)
				) {
					throw new Error(
						`Unexpected node type: ${child.constructor.name}`
					);
				}
				return convertNewToOld(child);
			}),
			node.sourceContext
				? new LineInfo(
						new StrSlice(
							node.sourceContext.content.toString()
						),
						node.sourceContext.indent,
						node.sourceContext.range.start.line
					)
				: new LineInfo(new StrSlice(""), 0, 0)
		);
	}

	return new KeyValueDefinedField(
		new StrSlice(node.key),
		new OldTypeValuePair(
			node.value.value,
			convertNewTypeToOld(node.value.type)
		),
		node.sourceContext
			? new LineInfo(
					new StrSlice(
						node.sourceContext.content.toString()
					),
					node.sourceContext.indent,
					node.sourceContext.range.start.line
				)
			: new LineInfo(new StrSlice(""), 0, 0)
	);
}

/**
 * Convert a SourceContext to a legacy LineInfo
 */
export function convertSourceContext(
	context: SourceContext | null
): LineInfo | null {
	if (!context) {
		return null;
	}
	
	return {
		content: context.content,
		indent: context.indent,
		row: context.range.start.line
	};
}

export function migrateToNewTrait(
	oldTrait: KeyTrait
): TraitNode {
	return new TraitNode(
		oldTrait.key.value,
		oldTrait.children
			.filter((child): child is KeyTrait | KeyValueDefinedField => 
				child instanceof KeyTrait || child instanceof KeyValueDefinedField)
			.map(migrateToNewNode),
		[new TypeConstraint(new StringType())],
		null
	);
}

export function migrateToOldTrait(
	newTrait: TraitNode | TypedFieldNode
): KeyTrait {
	const lineInfo = convertSourceContext(newTrait.sourceContext) || {
		content: StrSlice.from(""),
		indent: 0,
		row: 0
	};

	if (newTrait instanceof TypedFieldNode) {
		return new KeyTrait(
			StrSlice.from(newTrait.key),
			[],
			lineInfo
		);
	}

	return new KeyTrait(
		StrSlice.from(newTrait.key),
		newTrait.children.map((child) => migrateToOldNode(child as TraitNode | TypedFieldNode)),
		lineInfo
	);
}

export function migrateToNewNode(
	oldNode: KeyTrait | KeyValueDefinedField
): TraitNode | TypedFieldNode {
	if (oldNode instanceof KeyValueDefinedField) {
		return new TypedFieldNode(
			oldNode.key.value,
			new TypeValuePair(oldNode.value.value.toString(), new StringType()),
			oldNode.lineInfo ? convertLineInfo(oldNode.lineInfo) : null
		);
	}

	return migrateToNewTrait(oldNode);
}

export function migrateToOldNode(
	newNode: TraitNode | TypedFieldNode
): KeyTrait | KeyValueDefinedField {
	const lineInfo = convertSourceContext(newNode.sourceContext) || {
		content: StrSlice.from(""),
		indent: 0,
		row: 0
	};

	if (newNode instanceof TypedFieldNode) {
		return new KeyValueDefinedField(
			StrSlice.from(newNode.key),
			new OldTypeValuePair(
				newNode.value.value.toString(),
				convertNewTypeToOld(newNode.value.type)
			),
			lineInfo
		);
	}

	return migrateToOldTrait(newNode);
}
