import { alignRight } from "@/utils/log";
import {
	getLogForRelativeEpsilon,
	getRelativeEpsilonFromLog,
	areEqual,
} from "@/utils/math";
import { log } from "console";

const safeAddTest = (a: number, b: number) => {
	const sum = a + b;

	if (a === 0 || b === 0) {
		log(
			`>>> a: ${a} === 0 || b: ${b} === 0 => sum: ${sum} <<<`
		);
		return sum;
	}

	if (sum === 0 || isNaN(sum)) {
		log(`>>> sum: ${sum} === (0 || NAN) <<<`);
		return sum;
	}

	const logA = getLogForRelativeEpsilon(a);
	const logB = getLogForRelativeEpsilon(b);

	if (logA !== logB) {
		log(
			`>>> logA: ${logA} !== logB: ${logB} => sum: ${sum} <<<`
		);
		return sum;
	}
	const relativeEpsilon = getRelativeEpsilonFromLog(logA);
	// note: tiny numbers < 1e-308 can have a relEps of 0
	// therefore we consider them indistinct and equal

	const absSum = Math.abs(sum);
	const isLessThanRelativeEpsilon =
		absSum < relativeEpsilon;

	// Note: when relativeEpsilon is 0, these subnormal numbers
	// will not have a floating point error
	if (relativeEpsilon === 0) {
		log(
			`>>> relEp: ${relativeEpsilon} === 0 => sum: ${sum} <<<`
		);
		return sum;
	}

	log(
		`>>> less than relEp: ${alignRight(isLessThanRelativeEpsilon, 5)} ` +
			`-- abs sum: ${alignRight(absSum, 24)} -- relEp: ${alignRight(relativeEpsilon, 24)} <<<`
	);

	return Math.abs(sum) < relativeEpsilon ? 0 : sum;
};

export const testAreEqualAndSafeAddAcrossExponents = (
	first: number = -330,
	last: number = 330
) => {
	for (let i = first; i <= last; i++) {
		const n = Math.pow(10, i);
		const n2 = (0.1 + 0.2) * n;
		const s1 = n2.toPrecision(15);
		const rt1 = Number(s1);
		const n10 = safeAddTest(rt1, -n2);
		const b1 = n2 === rt1;
		const b2 = areEqual(n2, rt1);
		log(
			`[${alignRight(i, 4)}]     n: ${alignRight(n2, 24)} -- n-round-trip: ${alignRight(rt1, 24)} `
		);
		log(
			`     safeAdd: ${alignRight(n10, 24)} -- areEqual: ${alignRight(b2, 5)}`
		);
		log();
	}
};
