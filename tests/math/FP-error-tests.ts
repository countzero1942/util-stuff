import { div, log, logh } from "@/utils/log";
import {
	areEqual,
	fixedRound,
	getRelativeEspilon,
	precisionRound,
} from "@/utils/math";
import { formatNum } from "@/utils/string";

const format = (n: number) => {
	switch (true) {
		case n >= 10e5 && n <= 10e15:
			return formatNum(n);
		case n > 10e15:
			return n.toExponential();
		default:
			return n.toString();
	}
};

const logPreciscionRound = (n: number, sigDigits: number) => {
	const pr = precisionRound(n, sigDigits);
	const relEps = getRelativeEspilon(n);
	const cleanPR = Number(pr.toPrecision(15));
	log(`n: ${format(n)}; sigDig: ${sigDigits}`);
	log(
		`   precRound: ${format(pr)} : clean precRound: ${format(
			cleanPR
		)}`
	);
	log(`  precRound - clearPrecRound = ${Math.abs(pr - cleanPR)}`);
	log(`  relEpsilon:                  ${relEps}`);
	div();
	log(`   ARE EQUAL: ${areEqual(pr, cleanPR)}`);
};

const logPrecisionRoundRange = (
	n: number,
	range: number,
	inc: number = 1
) => {
	const min = -range;
	const max = range;
	for (let pow = min; pow <= max; pow += inc) {
		const currentN = n * 10 ** pow;
		const lg10 = Math.log10(currentN);
		log(
			`pow of 10: ${pow + 14}, ` +
				`shift: ${pow}, log10: ${fixedRound(lg10, 5)}`
		);
		logPreciscionRound(currentN, 6);
		div();
	}
};

const logPlusMinusRelEps = (n: number) => {
	const relEps = getRelativeEspilon(n);
	const cleanN = Number(n.toPrecision(15));
	const prRoundN = precisionRound(n, 15);

	div();
	log(`n:           ${n.toExponential()}:`);
	log(`clean n:     ${cleanN.toExponential()}`);
	log(`precRound n: ${prRoundN.toExponential()}`);
	log(`             1 234567890123456`);
	div();
	log(`   relEps:           ${relEps.toExponential()}`);
	const deltaCleanN = Math.abs(n - cleanN);
	const deltaPrecRN = Math.abs(n - prRoundN);
	const ratioCleanN = Math.round((deltaCleanN / relEps) * 100);
	const ratioPrecRN = Math.round((deltaPrecRN / relEps) * 100);
	log(`   delta cleanN =    ${deltaCleanN.toExponential()}`);
	log(`   delta precRN =    ${deltaPrecRN.toExponential()}`);
	log(` DCleanN/relEps =    ${ratioCleanN}%`);
	log(` DPrecRN/relEps =    ${ratioPrecRN}%`);
	div();
	const areEqCleanN = areEqual(n, cleanN);
	const areEqPrecRN = areEqual(n, cleanN);
	log(`   ARE EQUAL cleanN: ${areEqCleanN}`);
	log(`   ARE EQUAL precRN: ${areEqPrecRN}`);
	div();
	log();

	return { ratioCleanN, ratioPrecRN, areEqCleanN, areEqPrecRN };
};

/**
 * This loops through powers of ten with added
 * floating-point error to test `areEqual(a,b)`
 *
 * Also tests added FP error to 0.
 *
 * Uses call back to generate FP error
 *
 * ```ts
 * (fnAddFPError: (base: number) => number
 *    = base => base + 0.1 + 0.2)
 * ```
 *
 * @param fnAddFPError The callback to add FP error to base number
 */
export const loopThruPowersOf10PlusFPErr = (
	fnAddFPError: (base: number) => number = base => base + 0.1 + 0.2
) => {
	const baseNums: number[] = [];
	baseNums.push(0);
	for (let pow = 0; pow <= 17; pow++) {
		const p = 10 ** pow;
		baseNums.push(p);
	}
	const max = baseNums.length;

	let passCountCleanN = 0;
	let maxRatioCleanN = 0;
	let passCountPrecRN = 0;
	let maxRatioPrecRN = 0;

	for (const baseNum of baseNums) {
		const { ratioCleanN, ratioPrecRN, areEqCleanN, areEqPrecRN } =
			logPlusMinusRelEps(fnAddFPError(baseNum));

		passCountCleanN += areEqCleanN ? 1 : 0;
		passCountPrecRN += areEqCleanN ? 1 : 0;
		maxRatioCleanN = Math.max(maxRatioCleanN, ratioCleanN);
		maxRatioPrecRN = Math.max(maxRatioPrecRN, ratioPrecRN);
	}

	log();
	div();
	logh("REPORT");
	log("Cleaned n using 'Number(n.toPrecision(15))':");
	log(`   total areEqual(cleanedN, n): ${passCountCleanN}/${max}`);
	log(
		`   max ratio: delta(cleanN, n)/relEpsilon: ${maxRatioCleanN}%`
	);
	log();
	log("Precision rounded n using 'precisionRound(n, 15)':");
	log(`   total areEqual(precRoundN, n): ${passCountPrecRN}/${max}`);
	log(
		`   max ratio: delta(precRoundN, n)/relEpsilon: ${maxRatioPrecRN}%`
	);
	div();
};
