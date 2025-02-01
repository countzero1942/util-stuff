import { NumberErr } from "@/parser/types/err-types";
import { ParserErrHead } from "@/parser/types/heads";
import {
	FlagParam,
	KeyParams,
	TypeParams,
} from "@/parser/types/key-head";
import { TypeValuePair } from "@/parser/types/parse-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { StrSlice } from "@/utils/slice";
import { KeyHead } from "../types/heads";

const parseTypeOrFlagParams = (
	head: KeyHead,
	typeOrFlag: StrSlice
): FlagParam | ParserErrHead => {
	let name: StrSlice = StrSlice.empty();
	let dotParamOrErr:
		| TypeValuePair
		| ParserErrHead
		| undefined = undefined;
	let subParamOrErr:
		| TypeValuePair
		| ParserErrHead
		| undefined = undefined;
	let superParamOrErr:
		| TypeValuePair
		| ParserErrHead
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
					break;
				case paramSlice.startsWith("_"):
					subParamOrErr = parseDefaultValue(
						head,
						paramValueSlice
					);
					break;
				case paramSlice.startsWith("^"):
					superParamOrErr = parseDefaultValue(
						head,
						paramValueSlice
					);
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
			if (colonParamOrErr instanceof ParserErrHead) {
				return colonParamOrErr; // is ParserErrHead
			}
			colonParams.push(colonParamOrErr); // is TypeValuePair
		}
	}

	if (dotParamOrErr instanceof ParserErrHead) {
		return dotParamOrErr; // is ParserErrHead
	}
	if (subParamOrErr instanceof ParserErrHead) {
		return subParamOrErr; // is ParserErrHead
	}
	if (superParamOrErr instanceof ParserErrHead) {
		return superParamOrErr; // is ParserErrHead
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
	head: KeyHead,
	params: StrSlice[]
): TypeOuterParams | ParserErrHead => {
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
				if (flagParamOrErr instanceof ParserErrHead) {
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
	head: KeyHead,
	typeSlice: StrSlice
): TypeParams | ParserErrHead => {
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
	if (typeNameParamsOrErr instanceof ParserErrHead) {
		return typeNameParamsOrErr; // is ParserErrHead
	}

	if (typeAndParamSlices.length > 1) {
		const paramSlices = typeAndParamSlices.slice(1);
		const paramsOrErr = parseTypeOuterParams(
			head,
			paramSlices
		);
		if (paramsOrErr instanceof ParserErrHead) {
			return paramsOrErr; // is ParserErrHead
		}
		const { flagParams, stringParams, unitParam } =
			paramsOrErr; // is TypeOuterParams

		return new TypeParams(
			typeNameParamsOrErr.name, // is FlagParam
			typeNameParamsOrErr, // is FlagParam
			flagParams,
			stringParams,
			unitParam
		);
	}

	return new TypeParams(
		typeNameParamsOrErr.name, // is FlagParam
		typeNameParamsOrErr // is FlagParam
	);
};

const parseTypes = (
	head: KeyHead,
	typeSlices: StrSlice[]
): TypeParams[] | ParserErrHead => {
	const types: TypeParams[] = [];
	for (const typeSlice of typeSlices) {
		const typeOrErr = parseType(head, typeSlice);
		if (typeOrErr instanceof ParserErrHead) {
			return typeOrErr; // is ParserErrHead
		}
		types.push(typeOrErr); // is TypeParams
	}
	return types;
};

export const parseKeyHead = (
	head: KeyHead,
	keyHeadSlice: StrSlice
): KeyParams | ParserErrHead => {
	const nameAndTypeSlices: StrSlice[] =
		keyHeadSlice.edgeSplitMany([" ."]);
	const nameSlice = nameAndTypeSlices[0] as StrSlice;

	if (nameAndTypeSlices.length === 1) {
		return new KeyParams(nameSlice);
	}

	const typeSlices = nameAndTypeSlices.slice(1);
	const typesOrErr = parseTypes(head, typeSlices);

	if (typesOrErr instanceof ParserErrHead) {
		return typesOrErr; // is ParserErrHead
	}
	return new KeyParams(nameSlice, typesOrErr); // is TypeParams[]
};
