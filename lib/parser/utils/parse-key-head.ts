import { NumberErr } from "@/parser/types/err-types";
import {
	FlagParam,
	KeyParams,
	TypeParams,
} from "@/parser/types/key-head";
import { TypeValuePair } from "@/parser/types/parse-types";
import { parseDefaultValue } from "@/parser/utils/parse-value";
import { log, logag, div } from "@/utils/log";

/**
 * This function takes the type part of a key-head and splits it into
 * individual type strings, begining with '. '.
 *
 * For example, if the type-part of the key-head is '.X.2:4:6 %flag $string .Y.3:5:7 .Z',
 * the output will be ['X.2:4:6 %flag $string', 'Y.3:5:7', 'Z'].
 *
 * @param {string} rest The string to split.
 * @returns {string[]} The array of type strings.
 */
const getTypeStrs = (rest: string) => {
	const typeStrs: string[] = [];
	let i_start = 0;
	while (true) {
		const i = rest.indexOf(" .", i_start);
		const i_end = i === -1 ? rest.length : i;
		const typeStr = rest.substring(i_start, i_end);
		// log(`--> typeStr: '${typeStr}'`);
		typeStrs.push(typeStr);
		if (i === -1) break;
		i_start = i_end + 1;
	}
	return typeStrs;
};

/**
 * This function takes a string and parses it into a `FlagParam` object.
 *
 * The syntax is as follows: '.X.2:4:6' or '%flag.2:4:6'
 *
 * Since both types and flags have the same syntax,
 * this function can be used to parse both.
 *
 */
const parseTypeOrFlag = (typeOrFlag: string): FlagParam => {
	let rest = typeOrFlag;
	let name: string = "";
	let dotParam: TypeValuePair<any> | NumberErr | undefined;
	let colonParams: TypeValuePair<any>[] = [];
	const matchName = /[.%][a-zA-Z][\w\-_]*[ ]*/.exec(rest);
	if (matchName) {
		name = matchName[0].trim();
		rest = rest.substring(matchName.index + matchName[0].length);
	}
	const matchDotParam = /[._^][\w\-_.]*[ ]*/.exec(rest);
	if (matchDotParam) {
		const dotParamStr = matchDotParam[0].trim();
		if (dotParamStr.length > 1) {
			dotParam = parseDefaultValue(dotParamStr.slice(1));
			rest = rest.substring(
				matchDotParam.index + matchDotParam[0].length
			);
		}
	}

	const colonParamMatches = rest.matchAll(
		/[:][\w].*?(?=(?:[:][\w]|$))/g
	);
	for (const colonParamMatch of colonParamMatches) {
		const colonParamStr = colonParamMatch[0].trim();
		const result = parseDefaultValue(colonParamStr.slice(1));
		if (result instanceof NumberErr) break;
		colonParams.push(result);
	}
	return { name, dotParam, colonParams };
};

/**
 * Splits the type string into type parts.
 *
 * The input string is expected to be the type part of a key-head.
 * The output is an array of strings, where each string represents
 * a type part.
 *
 * E.g., if the type string is:
 *    '.X.2.6:6.28:abc def:12. %y %z.2:2 $abc $def xyz >kg.m/s2'
 *
 * the output will be:
 *    [ '.X.2.6:6.28:abc def:12.', '%y', '%z.2:2',
 *      '$abc', '$def xyz', '>kg.m/s2' ]
 *
 * If the input string is empty, the output will be an empty array.
 *
 * @param {string} rest The input string to split.
 * @returns {string[]} The array of type strings.
 */
const splitTypeParts = (rest: string): string[] => {
	const matches = rest.matchAll(
		/[%$>][a-zA-Z].*?(?=(?:[%$>][a-zA-Z]|$))/g
	);

	const parts: string[] = [];
	let i = 0;
	for (const match of matches) {
		if (i === 0) {
			parts.push(rest.slice(0, match.index).trim());
		}

		parts.push(match[0].trim());
		i++;
	}
	if (i === 0) {
		parts.push(rest.trim());
	}

	logag("parts", parts);

	return parts;
};

const parseParams = (
	parts: string[]
): {
	flagParams: FlagParam[];
	stringParams: string[];
	unitParam?: string;
} => {
	const flagParams: FlagParam[] = [];
	const stringParams: string[] = [];
	let unitParam: string | undefined;
	for (const part of parts) {
		switch (true) {
			case part.startsWith("%"):
				flagParams.push(parseTypeOrFlag(part));
				break;
			case part.startsWith("$"):
				stringParams.push(part.slice(1));
				break;
			case part.startsWith(">"):
				unitParam = part.slice(1);
				break;
			default:
				break;
		}
	}
	return { flagParams, stringParams, unitParam };
};

const parseType = (rest: string): TypeParams => {
	const parts = splitTypeParts(rest);
	if (parts.length === 0) throw "Never";
	const res = parseTypeOrFlag(parts[0] as string);
	const paramParts = parts.length > 1 ? parts.slice(1) : [];
	const params = parseParams(paramParts);
	const typeParams: TypeParams = {
		name: res.name,
		dotParam: res.dotParam,
		colonParams: res.colonParams,
		flagParams: params.flagParams,
		stringParams: params.stringParams,
		unitParam: params.unitParam,
	};

	return typeParams;
};

const parseTypes = (rest: string) => {
	const typeStrs = getTypeStrs(rest);
	const types: TypeParams[] = [];
	for (const typeStr of typeStrs) {
		const type = parseType(typeStr);
		types.push(type);
	}
	return types;
};

export const parseKeyHead = (keyhead: string): KeyParams => {
	const getName = (i: number) => {
		let name = keyhead.substring(0, i).trim();
		// '%a in .X' or '%a .X'
		return name.endsWith(" in")
			? name.substring(0, name.length - 3).trim()
			: name;
	};

	// see if keyhead contains a type reference: e.g., '.X'
	const i = keyhead.indexOf(" .");
	if (i === -1) {
		return {
			name: keyhead,
		};
	}
	log(`keyhead: '${keyhead}'`);
	const name = getName(i);
	log(`name: '${name}'`);
	const rest = keyhead.substring(i + 1);
	log(`rest: '${rest}'`);
	const types = parseTypes(rest);
	div();
	return {
		name,
		types,
	};
};
