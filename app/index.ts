import {
	log,
	logh,
	div,
	loggn,
	ddivl,
	logn,
	divl,
	ddivln,
	loghn,
	logagn,
	logag,
	logobj,
} from "@/utils/log";
import {
	NNum,
	RFixed,
	RPrec,
	TypeBase,
	WNum,
	ZNum,
} from "@/parser/types/type-types";
import { TypeMap } from "@/parser/types/type-map";
import { getFullType } from "@/utils/types";
import { get } from "node:http";
import {
	getPrecisionCount,
	parseNumber,
} from "@/parser/utils/parse-num";
import { NumberError } from "@/parser/types/parse-types";

// await logSplitHeads();
// testRPrec();
// ddivln();
// testRFixed();
// ddivln();
// testZTypes();
// ddivln();

// testLog();

// const a = 1e20;
// log(a);
// log(a.toPrecision());

// const n = Number("003e003");
// log(n);
// log(n.toExponential());

// export type ParseResult<T> = TypeValuePair<T> | ParseError;

// export interface IParseNumber {
// 	parseNumber(value: string): ParseResult<number | ParseError>;
// }

export const testPrecisionCount = () => {
	const nums = [
		"+0.12030",
		"+0.012030",
		"+0.0012030",
		"-0.12030",
		"-0.012030",
		"-0.0012030",
		"0.12030",
		"0.012030",
		"0.0012030",
		"+.12030",
		"+.012030",
		"+.0012030",
		"-.12030",
		"-.012030",
		"-.0012030",
		".12030",
		".012030",
		".0012030",
	];

	let successCount = 0;
	for (const num of nums) {
		const res = getPrecisionCount(num);
		if (res !== 5) {
			console.log(`FAILED for ${num}: ${res}`);
		} else {
			successCount++;
		}
	}

	console.log(`SUCCESS: ${successCount} / ${nums.length}`);
};

const testParseRPrecExponent = (nums: string[]) => {
	const failures: {
		num: string;
		err: NumberError;
	}[] = [];

	for (const num of nums) {
		logh(`Parsing: ${num}`);
		const res = parseNumber(num);

		if (res.type === "NumberError") {
			failures.push({ num, err: res });
			log(res);
			continue;
		}
		log(res);
	}

	ddivln();

	loghn("Failures");
	for (const { num, err } of failures) {
		log(`Parsing: ${num}`);
		log(err);
		div();
	}
};

const testAParseRPrecExp = () => {
	const nums = [
		"1234.5e100",
		"+1234.5e100",
		"-1234.5e+100",
		"+1234.5e-100",
		"1234.e100",
		"1234.e-100",
		".12345e100",
		".12345e-100",
		"0.12345e100",
		"0.12345e-100",
	];
	testParseRPrecExponent(nums);
};

const testBParseRPrecExp = () => {
	const nums = [
		"1234.5g100",
		"+1234.5g100",
		"-1234.5g+100",
		"+1234.5g-100",
		"1234.g100",
		"1234.g-100",
		".12345g100",
		".12345g-100",
		"0.12345g100",
		"0.12345g-100",
	];
	testParseRPrecExponent(nums);
};

const testCParseRPrecExp = () => {
	const nums = [
		"1_234_567.8e-100",
		"+1_234_567.8e100",
		"1.234_567_8e-100",
		"-12_345.6e+100",
		"+1_234.567_8e-100",
		"-1_234.e+100",
		"+123_234.e-100",
		".123_4e100",
		"-.123_456_7e-100",
		".123_4e-100",
		"+.123_4e-100",
		"0.123_4e-100",
		"+0.123_456_7e-100",
		"-0.123_456_7e-100",
	];
	testParseRPrecExponent(nums);
};

const testDParseRPrecExp = () => {
	const nums = [
		"1_234_567.8g-100",
		"+1_234_567.8g100",
		"1.234_567_8g-100",
		"-12_345.6g+100",
		"+1_234.567_8g-100",
		"-1_234.g+100",
		"+123_234.g-100",
		".123_4g100",
		"-.123_456_7g-100",
		".123_4g-100",
		"+.123_4g-100",
		"0.123_4g-100",
		"+0.123_456_7g-100",
		"-0.123_456_7g-100",
	];
	testParseRPrecExponent(nums);
};

const testParseZNumExponent = (nums: string[]) => {
	const failures: {
		num: string;
		err: NumberError;
	}[] = [];

	for (const num of nums) {
		logh(`Parsing: ${num}`);
		const res = parseNumber(num);

		if (res.type === "NumberError") {
			failures.push({ num, err: res });
			log(res);
			continue;
		}
		logobj(res);
	}

	ddivln();

	loghn("Failures");
	for (const { num, err } of failures) {
		log(`Parsing: ${num}`);
		log(err);
		div();
	}
};

const testAParseZnumExp = () => {
	const nums = [
		"1234e2",
		"+1234e2",
		"-1234e2",
		"1234e10",
		"1234e11",
		"1234e12",
		"1234e13",
	];
	testParseZNumExponent(nums);
};

testAParseZnumExp();
