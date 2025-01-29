import { NumberErr } from "@/parser/types/err-types";
import {
    FlagParam,
    KeyParams,
    TypeParams,
} from "@/parser/types/key-head";
import { TypeValuePair } from "@/parser/types/parse-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { log, logag, div } from "@/utils/log";
import { StrSlice } from "@/utils/slice";

const parseTypeOrFlag = (typeOrFlag: StrSlice): FlagParam => {
    let name: StrSlice = StrSlice.empty();
    let dotParam: TypeValuePair | NumberErr | undefined = undefined;
    let subParam: TypeValuePair | NumberErr | undefined = undefined;
    let superParam: TypeValuePair | NumberErr | undefined = undefined;
    let colonParams: (TypeValuePair | NumberErr)[] = [];

    const nameAndColonParamsSlices = typeOrFlag.edgeSplitMany([":"]);
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
            const colonParamValueSlice = colonParamSlice.slice(1);
            colonParams.push(parseDefaultValue(colonParamValueSlice));
        }
    }

    return new FlagParam(name, dotParam, subParam, superParam, colonParams);
};

const parseParams = (params: StrSlice[]): {
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
                stringParams.push(param.slice(1).value);
                break;
            case param.startsWith(">"):
                unitParam = param.slice(1).value;
                break;
            default:
                break;
        }
    }
    return { flagParams, stringParams, unitParam };
};

const parseType = (typeSlice: StrSlice): TypeParams => {
    const typeAndParamSlices = typeSlice.edgeSplitMany([" %", " $", " >"]);
    const type = typeAndParamSlices[0] as StrSlice;

    const nameParams = parseTypeOrFlag(type);

    if (typeAndParamSlices.length > 1) {
        const paramSlices = typeAndParamSlices.slice(1);
        const { flagParams, stringParams, unitParam } = parseParams(paramSlices);

        return new TypeParams(
            nameParams.name,
            nameParams,
            flagParams,
            stringParams,
            unitParam
        );
    }

    return new TypeParams(nameParams.name, nameParams);
};

const parseTypes = (typeSlices: StrSlice[]) => {
    const types: TypeParams[] = [];
    for (const typeSlice of typeSlices) {
        const type = parseType(typeSlice);
        types.push(type);
    }
    return types;
};

export const parseKeyHead = (keyhead: string): KeyParams => {
    // see if keyhead contains a type reference: e.g., '.X'
    const keyHeadSlice = StrSlice.all(keyhead);
    log(`keyheadSlice: '${keyHeadSlice.value}'`);

    const nameAndTypeSlices: StrSlice[] = keyHeadSlice.edgeSplitMany([" ."]);
    const nameSlice = nameAndTypeSlices[0] as StrSlice;
    log(`name: '${nameSlice.value}'`);

    if (nameAndTypeSlices.length === 1) {
        return new KeyParams(nameSlice);
    }

    const typeSlices = nameAndTypeSlices.slice(1);
    const types = parseTypes(typeSlices);

    div();
    return new KeyParams(nameSlice, types);
};
