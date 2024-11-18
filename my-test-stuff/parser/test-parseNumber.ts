import { NumberErr } from "@/parser/types/err-types";
import {
	getPrecisionCount,
	parseDefNumber,
} from "@/parser/utils/parse-num";
import { ddivln, div, log, logh, loghn } from "@/utils/log";

/**
 * Tests the getPrecisionCount function with a variety of decimal numbers.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
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

/**
 * Tests the parseNumber function with an array of strings representing
 * numbers in exponential notation.
 *
 * This will log success or failure for each number in the array.
 *
 * @param nums An array of strings, each representing a number in exponential notation.
 * @returns void
 */
export const testParseNumber = (nums: string[]) => {
	const failures: {
		num: string;
		err: NumberErr;
	}[] = [];

	for (const num of nums) {
		logh(`Parsing: ${num}`);
		const res = parseDefNumber(num);

		if (res.type === "NumberErr") {
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

/**
 * Tests the parseNumber function with an array of strings representing
 * numbers in 'e' decimal exponential notation, with no separators.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
export const testAParseRPrecExp = () => {
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
	testParseNumber(nums);
};

/**
 * Tests the parseNumber function with an array of strings representing
 * numbers in 'g' decimal engineering notation, with no separators.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
export const testBParseRPrecExp = () => {
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
	testParseNumber(nums);
};

/**
 * Tests the parseNumber function with an array of strings representing
 * numbers in 'e' decimal exponential notation, with separators.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
export const testCParseRPrecExp = () => {
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
	testParseNumber(nums);
};

/**
 * Tests the parseNumber function with an array of strings representing
 * numbers in 'g' decimal engineering notation, with separators.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
export const testDParseRPrecExp = () => {
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
	testParseNumber(nums);
};

/**
 * Tests the parseNumber function with an array of strings representing
 * numbers in 'e' decimal scientific notation, with separators, which should
 * fail to parse.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
export const testErrParseRPrecExp = () => {
	const nums = [
		"+1 234_567.8e+100",
		"+1;234_567.8e+100",
		"+1,234_567.8e+100",
		"+1_234_5g7.8e+100",
		"+1_234_567.8eg+100",
		"-+1_234_567.8e-100",
		"-1_234_567.8e+-100",
		"-1_234_567..8e-100",
		"+1_2f4_567.8e+100",
		"+1_234_567.8g+1z0",
		"+0_234_567.8g+100",
		"+01_234_567.8g-100",
		"+00.123_45g-100",
		"1_23_567.8g-100",
		"-1_234_56.8g-100",
		"+_234_56.8g-100",
		"+1_234.56_7g+100",
		"1_234_567.8e+308",
		"1_234_567.8g-309",
	];
	testParseNumber(nums);
};

/**
 * Tests the parseNumber function with an array of strings representing
 * integer numbers in 'e' scientific notation, without separators.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
export const testAParseZnumExp = () => {
	const nums = [
		"1234e2",
		"+1234e2",
		"-1234e2",
		"1234e10",
		"1234e11",
		"1234e12",
		"1234e13",
	];
	testParseNumber(nums);
};

/**
 * Tests the parseNumber function with an array of strings representing
 * integer numbers in 'e' scientific notation, with separators.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
export const testBParseZnumExp = () => {
	const nums = [
		"1_234e2",
		"+123_456e2",
		"+123_456g2",
		"-123_456e2",
		"123_456e7",
		"123_456e8",
		"123_456e9",
		"123_456e10",
		"123_456e11",
	];
	testParseNumber(nums);
};

/**
 * Tests the parseNumber function with an array of strings representing
 * invalid integer numbers in 'e' scientific notation, with separators.
 *
 * This will log success or failure for each number in the array.
 *
 * @returns void
 */
export const testErrParseZnumExp = () => {
	const nums = [
		"+1 23_456e3",
		"+1;23_456e3",
		"-12e_456e2",
		"+123_456eg2",
		"+-123_456e3",
		"+123_456e-+3",
		"-123_z56e3",
		"+123_456e1z",
		"-0123_456e3",
		"+0_456e3",
		"0e3",
		"+00e3",
		"-123_45e3",
		"+_123_456e3",
		"-123_456e3",
		"+123_456_e3",
		"+123_456e308",
		"+123_456e-3",
		"-1e16",
		"+1e16",
	];
	testParseNumber(nums);
};

export const testAParseRPrec = () => {
	const nums = [
		"1234.5",
		"+1234.56789",
		"-1234.",
		"-1234.0",
		"+.12345",
		"+0.12345",
		".12345678901234567",
		"12345678901234567.",
	];
	testParseNumber(nums);
};

export const testBParseRPrec = () => {
	const nums = [
		"1_234.5",
		"+1_234.567_89",
		"-1_234.",
		"-1_234_567.0",
		"+.123_45",
		"+0.123_45",
		".123_456_789_012_345_67",
		"123_456_789_012_345_678.",
	];
	testParseNumber(nums);
};

export const testErrParseRPrec = () => {
	const nums = [
		"+-1_234.5",
		"1_234..5",
		"+-1234.567",
		"-1234.567.",
		"+1_2a4.567_89",
		"-1_234.567_z9",
		"+1234.56z89",
		"-01_234.567_89",
		"+0_234.567_89",
		"-01234.56789",
		"+0234.56789",
		"+1_234.56789",
		"+1_23_4.567_89",
		"+1234.567_89",
		"+1_234.5678_9",
		"-_234.567_89",
		"+1_234.567_890_",
		"+0.123_45_6789",
		"-.123_45_6789",
	];
	testParseNumber(nums);
};

export const testAParseZNum = () => {
	const nums = [
		"-0",
		"+1",
		"+1234",
		"-1234567",
		"+123_456",
		"+1_234_457",
		"+12_345_678",
		"+123_456_789",
		"-123_456_789_012_345",
	];
	testParseNumber(nums);
};

export const testErrParseZNum = () => {
	const nums = [
		"-+0",
		"++1",
		"+1234",
		"+12f4",
		"-1z34567",
		"00",
		"02",
		"+023_456",
		"+0_123_456_",
		"+1_23_457",
		"+_1_234_457",
		"+_234_457",
		"-12345678901234567",
		"+9234567890123456",
	];
	testParseNumber(nums);
};
