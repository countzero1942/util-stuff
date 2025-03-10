import { NumberErr } from "@/parser/types/err-types";
import { ParserErrNode } from "@/parser/types/key-value";
import {
	FlagParam,
	KeyParams,
	TypeParams,
} from "@/parser/types/key-head";
import { TypeValuePair } from "@/parser/types/parse-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { StrSlice } from "@/utils/slice";
import { KeyValueBase } from "../types/key-value";

const parseTypeOrFlagParams = (
	head: KeyValueBase,
	typeOrFlag: StrSlice
): FlagParam | ParserErrNode => {
	let name: StrSlice = StrSlice.empty();
	let dotParamOrErr:
		| TypeValuePair
		| ParserErrNode
		| undefined = undefined;
	let subParamOrErr:
		| TypeValuePair
		| ParserErrNode
		| undefined = undefined;
	let superParamOrErr:
		| TypeValuePair
		| ParserErrNode
		| undefined = undefined;
	let colonParams: TypeValuePair[] = [];

	const nameAndColonParamsSlices =
		typeOrFlag.edgeSplitMany([":"]);
	const nameParamsSlices = nameAndColonParamsSlices[0]!
		.slice(1)
		.edgeSplitOrdered([".", "_", "^"]);

	name = nameParamsSlices[0]!;

	if (nameParamsSlices.length > 1) {
		const paramSlices = nameParamsSlices.slice(1);
		for (const paramSlice of paramSlices) {
			const paramValueSlice = paramSlice.slice(1);
			switch (true) {
				case paramSlice.startsWith("."):
					dotParamOrErr = parseDefaultValue(
						head,
						paramValueSlice
					);
					if (dotParamOrErr instanceof ParserErrNode) {
						return dotParamOrErr; // is ParserErrHead
					}
					break;
				case paramSlice.startsWith("_"):
					subParamOrErr = parseDefaultValue(
						head,
						paramValueSlice
					);
					if (subParamOrErr instanceof ParserErrNode) {
						return subParamOrErr; // is ParserErrHead
					}
					break;
				case paramSlice.startsWith("^"):
					superParamOrErr = parseDefaultValue(
						head,
						paramValueSlice
					);
					if (
						superParamOrErr instanceof ParserErrNode
					) {
						return superParamOrErr; // is ParserErrHead
					}
					break;
				default:
					throw "Never";
			}
		}
	}

	if (nameAndColonParamsSlices.length > 1) {
		const colonParamSlices =
			nameAndColonParamsSlices.slice(1);
		for (const colonParamSlice of colonParamSlices) {
			const colonParamValueSlice =
				colonParamSlice.slice(1);

			const colonParamOrErr = parseDefaultValue(
				head,
				colonParamValueSlice
			);
			if (colonParamOrErr instanceof ParserErrNode) {
				return colonParamOrErr; // is ParserErrHead
			}
			colonParams.push(colonParamOrErr); // is TypeValuePair
		}
	}

	return new FlagParam(
		name,
		dotParamOrErr, // is TypeValuePair | undefined
		subParamOrErr, // is TypeValuePair | undefined
		superParamOrErr, // is TypeValuePair | undefined
		colonParams // is TypeValuePair[]
	);
};

export type TypeOuterParams = {
	flagParams: FlagParam[];
	stringParams: string[];
	unitParam?: string;
};

const parseTypeOuterParams = (
	head: KeyValueBase,
	params: StrSlice[]
): TypeOuterParams | ParserErrNode => {
	const flagParams: FlagParam[] = [];
	const stringParams: string[] = [];
	let unitParam: string | undefined;
	for (const param of params) {
		switch (true) {
			case param.startsWith("%"): {
				const flagParamOrErr = parseTypeOrFlagParams(
					head,
					param
				);
				if (flagParamOrErr instanceof ParserErrNode) {
					return flagParamOrErr; // is ParserErrHead
				}
				flagParams.push(flagParamOrErr); // is FlagParam
				break;
			}
			case param.startsWith("$"):
				stringParams.push(param.slice(1).value);
				break;
			case param.startsWith(">"):
				unitParam = param.slice(1).value;
				break;
			default:
				break;
		}
	}
	return { flagParams, stringParams, unitParam }; // is TypeOuterParams
};

const parseType = (
	head: KeyValueBase,
	typeSlice: StrSlice
): TypeParams | ParserErrNode => {
	const typeAndParamSlices = typeSlice.edgeSplitMany([
		" %",
		" $",
		" >",
	]);
	const type = typeAndParamSlices[0] as StrSlice;

	const typeNameParamsOrErr = parseTypeOrFlagParams(
		head,
		type
	);
	if (typeNameParamsOrErr instanceof ParserErrNode) {
		return typeNameParamsOrErr; // is ParserErrHead
	}
	const typeNameParams = typeNameParamsOrErr;
	const typeName = typeNameParams.name;

	if (typeAndParamSlices.length > 1) {
		const paramSlices = typeAndParamSlices.slice(1);
		const paramsOrErr = parseTypeOuterParams(
			head,
			paramSlices
		);
		if (paramsOrErr instanceof ParserErrNode) {
			return paramsOrErr; // is ParserErrHead
		}
		const { flagParams, stringParams, unitParam } =
			paramsOrErr; // is TypeOuterParams

		return new TypeParams(
			typeName,
			typeNameParams,
			flagParams,
			stringParams,
			unitParam
		);
	}

	return new TypeParams(typeName, typeNameParams);
};

const parseTypes = (
	head: KeyValueBase,
	typeSlices: StrSlice[]
): TypeParams[] | ParserErrNode => {
	const types: TypeParams[] = [];
	for (const typeSlice of typeSlices) {
		const typeOrErr = parseType(head, typeSlice);
		if (typeOrErr instanceof ParserErrNode) {
			return typeOrErr; // is ParserErrHead
		}
		types.push(typeOrErr); // is TypeParams
	}
	return types;
};

export const parseKeyHead = (
	head: KeyValueBase,
	keyHeadSlice: StrSlice
): KeyParams | ParserErrNode => {
	const nameAndTypeSlices: StrSlice[] =
		keyHeadSlice.edgeSplitMany([" ."]);
	const nameSlice = nameAndTypeSlices[0] as StrSlice;

	if (nameAndTypeSlices.length === 1) {
		return new KeyParams(nameSlice);
	}

	const typeSlices = nameAndTypeSlices.slice(1);
	const typesOrErr = parseTypes(head, typeSlices);

	if (typesOrErr instanceof ParserErrNode) {
		return typesOrErr; // is ParserErrHead
	}
	return new KeyParams(nameSlice, typesOrErr); // is TypeParams[]
};
