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
	logg,
	ddiv,
	alignRight,
	logln,
} from "@/utils/log";
import { getFullType } from "@/utils/types";
import { logGeneratePassword } from "@/utils/password";
import {
	codePointSetArgs,
	codePointSetArgsTestExaustiveCheck,
	doTRexStuff,
	specificWordMatchTestWithLookAhead,
} from "./trex-stuff";
import { matchWordsTest } from "@/examples/trex/word-matching";
import {
	GroupName,
	LookAheadAnyString,
	MatchAnyString,
	MatchCodePoint,
	MatchNav,
} from "@/trex";
import { getError, getErrorMessage } from "@/utils/error";
import { ArraySeq, MathProdSeq, Range, Seq } from "@/utils/seq";
import { formatNum } from "@/utils/string";
import {
	doLogBasicStatsForMoon,
	FactorStat,
	flyMeToTheMoon,
	getFactorStats,
} from "@/my-tests/math/factors";
import { StrSlice } from "@/utils/slice";
import { Buffer } from "buffer";
import { testStrSliceJoin } from "@/my-tests/str-slice/test-join";
import { doGroupBasicsExamplesMenu } from "@/examples/trex/groups/group-basics";
import { areEqual } from "@/utils/math";
import { testAreEqualAndSafeAddAcrossExponents } from "@/my-tests/math/areEqual-and-safeAdd";
import { runRepeatMatcherExamples } from "@/examples/trex/matchers/repeat-matchers";
import { doStepNavTest } from "@/examples/utils/operations-stuff";
import chalk from "chalk";
import { runGroupRepeatMatcherExamples } from "@/examples/trex/groups/group-repeat-egs";
import { runGroupSplitterExamples } from "@/examples/trex/groups/group-splitter-egs";

// logGeneratePassword();

// codePointSetArgs();
// codePointSetArgsTestExaustiveCheck();

// codePointSetArgsTestExaustiveCheck();

// matchWordsTest();

// await runRepeatMatcherExamples();
// await doGroupBasicsExamplesMenu();
// await runGroupRepeatMatcherExamples();
// await runGroupSplitterExamples();

/**
 * Rounds a number to a specified power of 10 without using string conversions.
 *
 * @param value - The number to round.
 * @param decimals - Decimal places to round to (positive for decimals, negative for tens/hundreds).
 * @returns The symmetrically rounded number.
 */
function precRound(value: number, decimals: number): number {
	const factor = Math.pow(10, decimals);

	// 1. Extract absolute value to guarantee symmetric half-up rounding
	// (e.g., ensuring -1.5 rounds to -2, not -1)
	const absoluteValue = Math.abs(value);

	// 2. Scale Number.EPSILON to the magnitude of the value to correct for
	// standard IEEE 754 floating-point representation errors
	// (e.g., 1.005 being stored internally as 1.00499999999999989)
	const epsilon = Number.EPSILON * (absoluteValue || 1);

	// 3. Shift, correct, round, and unshift
	const rounded = Math.round((absoluteValue + epsilon) * factor) / factor;

	// 4. Reapply the original sign, using || 0 to safely convert -0 to 0
	return Math.sign(value) * rounded || 0;
}

const EPSILON_FACTOR = 2 * Number.EPSILON;

/**
 * 10^309 overflows to Infinity, so very large scales are computed in two
 * steps. Splitting at 200 keeps both intermediates comfortably finite:
 * EPSILON_FACTOR * 1e200 is about 4.4e184, and multiplying that by up to
 * 1e109 stays below Number.MAX_VALUE.
 */
const SCALE_SPLIT = 200;

/**
 * The decade scale of a number: the power of ten `s` such that
 * `|n|` lies in `[10^(s-1), 10^s)`.
 *
 * This is `floor(log10(|n|)) + 1`. The `+ 1` shifts the mantissa range
 * `[0.1, 1)` — where Number.EPSILON is the correct absolute tolerance — to a
 * scale of 0, so that `relativeEpsilonFromScale(0)` reproduces the plain
 * epsilon and every other decade scales from there.
 *
 * @param n A non-zero, finite number.
 * @returns The decade scale. Meaningless for `0` (which has no logarithm) —
 * callers must handle zero before calling.
 */
export function decadeScale(n: number): number {
	return Math.floor(Math.log10(Math.abs(n))) + 1;
}

/**
 * The relative epsilon for a given decade scale: the largest magnitude that
 * should be regarded as indistinguishable from zero at that scale.
 *
 * @param scale A decade scale, as returned by {@link decadeScale}.
 * @returns The tolerance. May be `0` for subnormal scales (below about -308),
 * where no floating-point slack exists and only exact equality is meaningful.
 */
export function relativeEpsilonFromScale(scale: number): number {
	if (scale <= SCALE_SPLIT) {
		return EPSILON_FACTOR * 10 ** scale;
	}
	// Split the exponent so neither intermediate overflows to Infinity.
	return EPSILON_FACTOR * 10 ** SCALE_SPLIT * 10 ** (scale - SCALE_SPLIT);
}

export function isZeroAtScale(residue: number, scale: number): boolean {
	if (residue === 0) return true;
	if (!Number.isFinite(residue)) return false;

	const epsilon = relativeEpsilonFromScale(scale);
	// A zero epsilon means subnormal territory, where there is no rounding
	// slack to absorb: only an exact zero counts, and that was handled above.
	if (epsilon === 0) return false;

	return Math.abs(residue) < epsilon;
}

export function areEqualX(a: number, b: number): boolean {
	// Covers exact equality, both-zero, and matching infinities.
	if (a === b) return true;

	// Any remaining non-finite pair is unequal: NaN against anything, or
	// infinities of opposite sign, or an infinity against a finite value.
	if (!Number.isFinite(a) || !Number.isFinite(b)) return false;

	// Exactly one is zero. The other is non-zero, so the difference is the
	// non-zero value itself; test it against its own scale.
	if (a === 0 || b === 0) {
		const nonZero = a === 0 ? b : a;
		return isZeroAtScale(nonZero, decadeScale(nonZero));
	}

	// The larger operand sets the tolerance. Note this deliberately does NOT
	// require the two to share a decade: 0.9999999999999999 and
	// 1.0000000000000002 differ only in the 16th digit yet fall in different
	// decades, and must still compare equal.
	const scale = Math.max(decadeScale(a), decadeScale(b));
	return isZeroAtScale(a - b, scale);
}

export const fixedRound = (x: number, places: number = 0) => {
	switch (places) {
		case 0:
			return Math.round(x);
		default:
			const pow = Math.pow(10, places);
			return Math.round(x * pow) / pow;
	}
};

export function myPrecRound(n: number, sigDigits: number) {
	// 123,456,789 -> round(-3) -> 123,456,000
	// num-digs: 9, sig-digs: 6, round: -3
	// sig-digs - num-digs = round
	// 6 - 9 = -3
	// try: num-digs = ceil(log10)

	const absN = Math.abs(n);
	const signN = Math.sign(n);

	const logN = Math.log10(absN);

	const numDigits = Math.ceil(logN);
	const roundPlaces = sigDigits - numDigits;

	const epsilon = Number.EPSILON * absN * 2.0;

	const absNPlusEpsilon = absN + epsilon;

	const rounded = fixedRound(absNPlusEpsilon, roundPlaces);

	const final = !Number.isNaN(rounded)
		? signN * rounded
		: absN < 1.0
			? 0
			: signN < 0
				? -Infinity
				: Infinity;

	return final;
}

function testAreEqual(a: number, b: number): boolean {
	const match = areEqualX(a, b);
	log(
		`a: ${alignRight(a, 24)} | b: ${alignRight(b, 24)} | Match: ${match ? "Yes" : "No"}`
	);
	return match;
}

function testPrecRoundPower(
	power: number,
	n: number = 1.005,
	expected: number = 1.01,
	sigDigits: number = 3
): boolean {
	const factor = Math.pow(10, power);
	const scaledN = n * factor;
	const scaledExpected = expected * factor;
	const myNumber = myPrecRound(scaledN, sigDigits);
	const match = areEqual(myNumber, scaledExpected);
	log(
		`Power: ${alignRight(power, 4)} | Value: ${alignRight(scaledN, 24)} ` +
			`| Mine: ${alignRight(myNumber, 24)} ` +
			`| Expected: ${alignRight(scaledExpected, 24)} ` +
			`| Match: ${match ? "Yes" : "No"} `
	);
	return match;
}

function testPrecRoundPowers(
	n: number = 1.005,
	expected: number = 1.01,
	sigDigits: number = 3
) {
	let failed = 0;
	const leastPower = -306;
	const greatestPower = 308;
	for (let power = leastPower; power <= greatestPower; power++) {
		const match = testPrecRoundPower(power, n, expected, sigDigits);
		if (!match) failed++;
		// const factor = Math.pow(10, power);
		// const scaledN = n * factor;
		// const scaledExpected = expected * factor;
		// const myNumber = myPrecRound(scaledN, sigDigits);
		// const match = areEqual(myNumber, scaledExpected);
		// log(
		// 	`Power: ${alignRight(power, 4)} | Value: ${alignRight(scaledN, 24)} ` +
		// 		`| Mine: ${alignRight(myNumber, 24)} ` +
		// 		`| Expected: ${alignRight(scaledExpected, 24)} ` +
		// 		`| Match: ${match ? "Yes" : "No"} `
		// );
		// if (!match) failed++;
	}
	logln();
	log(`Failed: ${failed}`);
}

//testPrecRoundPowers(1.005, 1.01, 3);
testPrecRoundPowers(-1.005, -1.01, 3);

testPrecRoundPower(-256, 1.005, 1.01, 3);
testPrecRoundPower(-257, 1.005, 1.01, 3);

const a1 = 1.0000000000000001;
//         1 23456789012345678901234567890
const a2 = 1.000000000000001;
//         1 23456789012345678901234567890
const a3 = 1.00000000000001;
//         1 23456789012345678901234567890
const b = 1.0;

testAreEqual(a1, b);
testAreEqual(a2, b);
testAreEqual(a3, b);
