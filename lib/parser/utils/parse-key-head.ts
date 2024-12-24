import { NumberErr } from "@/parser/types/err-types";
import {
	FlagParam,
	KeyParams,
	TypeParams,
} from "@/parser/types/key-head";
import { TypeValuePair } from "@/parser/types/parse-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { log, logag, div } from "@/utils/log";
import { StrCharSlice } from "@/utils/slice";

const parseTypeOrFlag = (typeOrFlag: StrCharSlice): FlagParam => {
	let name: string = "";
	let dotParam: TypeValuePair<any> | NumberErr | undefined =
		undefined;
	let subParam: TypeValuePair<any> | NumberErr | undefined =
		undefined;
	let superParam: TypeValuePair<any> | NumberErr | undefined =
		undefined;
	let colonParams: (TypeValuePair<any> | NumberErr)[] = [];

	const nameAndColonParamsSlices = typeOrFlag.edgeSplitMany([":"]);
	const nameParamsSlices = nameAndColonParamsSlices[0]!
		.childSlice(1)
		.edgeSplitOrdered([".", "_", "^"]);

	name = nameParamsSlices[0]!.string;

	if (nameParamsSlices.length > 1) {
		const paramSlices = nameParamsSlices.slice(1);
		for (const paramSlice of paramSlices) {
			const paramValueSlice = paramSlice.childSlice(1);
			switch (true) {
				case paramSlice.startsWith("."):
					dotParam = parseDefaultValue(paramValueSlice);
					break;
				case paramSlice.startsWith("_"):
					subParam = parseDefaultValue(paramValueSlice);
					break;
				case paramSlice.startsWith("^"):
					superParam = parseDefaultValue(paramValueSlice);
					break;
				default:
					throw "Never";
			}
		}
	}

	if (nameAndColonParamsSlices.length > 1) {
		const colonParamSlices = nameAndColonParamsSlices.slice(1);
		for (const colonParamSlice of colonParamSlices) {
			const colonParamValueSlice = colonParamSlice.childSlice(1);
			colonParams.push(parseDefaultValue(colonParamValueSlice));
		}
	}

	return { name, dotParam, subParam, superParam, colonParams };
};

const parseParams = (
	params: StrCharSlice[]
): {
	flagParams: FlagParam[];
	stringParams: string[];
	unitParam?: string;
} => {
	const flagParams: FlagParam[] = [];
	const stringParams: string[] = [];
	let unitParam: string | undefined;
	for (const param of params) {
		switch (true) {
			case param.startsWith("%"):
				flagParams.push(parseTypeOrFlag(param));
				break;
			case param.startsWith("$"):
				stringParams.push(param.childSlice(1).string);
				break;
			case param.startsWith(">"):
				unitParam = param.childSlice(1).string;
				break;
			default:
				break;
		}
	}
	return { flagParams, stringParams, unitParam };
};

const parseType = (typeSlice: StrCharSlice): TypeParams => {
	const typeAndParamSlices = typeSlice.edgeSplitMany([
		" %",
		" $",
		" >",
	]);
	const type = typeAndParamSlices[0] as StrCharSlice;

	const nameParams = parseTypeOrFlag(type);

	if (typeAndParamSlices.length > 1) {
		const paramSlices = typeAndParamSlices.slice(1);

		const { flagParams, stringParams, unitParam } =
			parseParams(paramSlices);

		return {
			name: nameParams.name,
			nameParams,
			flagParams,
			stringParams,
			unitParam,
		};
	}

	return {
		name: nameParams.name,
		nameParams,
		flagParams: [],
		stringParams: [],
		unitParam: undefined,
	};
};

const parseTypes = (typeSlices: StrCharSlice[]) => {
	const types: TypeParams[] = [];
	for (const typeSlice of typeSlices) {
		const type = parseType(typeSlice);
		types.push(type);
	}
	return types;
};

export const parseKeyHead = (keyhead: string): KeyParams => {
	// see if keyhead contains a type reference: e.g., '.X'
	const keyHeadSlice = StrCharSlice.all(keyhead);
	log(`keyheadSlice: '${keyHeadSlice.string}'`);

	const nameAndTypeSlices: StrCharSlice[] =
		keyHeadSlice.edgeSplitMany([" ."]);
	const nameSlice = nameAndTypeSlices[0] as StrCharSlice;
	log(`name: '${nameSlice.string}'`);

	if (nameAndTypeSlices.length === 1) {
		return {
			name: nameSlice.string,
		};
	}

	const typeSlices = nameAndTypeSlices.slice(1);

	const types = parseTypes(typeSlices);

	div();
	return {
		name: nameSlice.string,
		types,
	};
};
