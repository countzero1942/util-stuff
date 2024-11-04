import { div, logh } from "@/utils/log";
import {
	clamp,
	fixedRound,
	getDigitAccuracy,
	isPowerOfTen,
} from "@/utils/math";
import { MathProdSeq, MathSumSeq, NumSeq } from "@/utils/seq";
import { formatNum } from "@/utils/string";
import { log } from "console";
import exp from "constants";
import { get } from "http";

const getModBase = (count: number) => {
	const mod = Math.floor(count / 25);
	return mod < 1 ? 1 : mod;
};

type PiAccType = {
	k: number;
	denom: number;
	sum: number;
	pi: number;
};

export const getPiSumSeq = (count: number) => {
	return MathSumSeq.from(0, count, k => {
		return 4 * ((-1) ** k / (2 * k + 1));
	});
};

export const getInversePiSumSeq = (count: number) => {
	return MathSumSeq.from(1, count, k => {
		return 4 * ((-1) ** (k + 1) / (2 * k));
	});
};

export const getPiThingSumSeq = (count: number) => {
	return MathSumSeq.from(1, count, k => {
		return 4 * ((-1) ** (k + 1) / k);
	});
};

export const getPiOverTwoProdSeq = (count: number) => {
	return MathProdSeq.from(1, count, k => {
		const fourNSquared = 4 * k * k;

		return fourNSquared / (fourNSquared - 1);
	});
};

export const getDetailedPiSumSeq = (count: number) => {
	const modBase = getModBase(count);
	return NumSeq.from(0, count)
		.accum(
			{ k: 0, denom: 1, sum: 0, pi: 0 } as PiAccType,
			({ k, denom, sum, pi }, n) => {
				k = n;
				denom = 2 * k + 1;
				sum += (-1) ** k / denom;
				pi = 4 * sum;
				return { k, denom, sum, pi };
			}
		)
		.filter(({ k }) => k % modBase === 0);
};

export const getDetailedPiSumSeqLog10 = (count: number) => {
	return NumSeq.from(0, count)
		.accum({ k: 0, pi: 0 }, ({ k, pi }, n) => {
			k = n;
			const denom = 2 * k + 1;
			pi += 4 * ((-1) ** k / denom);
			return { k, pi };
		})
		.filter(({ k }) => isPowerOfTen(k));
};

export const logDetailedPiSumSeq = (count: number) => {
	const piSeq = getDetailedPiSumSeq(count);
	piSeq.foreach(({ k, denom, sum, pi }) => {
		const numDigits = getDigitAccuracy(pi, Math.PI);
		const places = 15;
		log(`${k}: 1/${denom}; sum -> ${sum.toFixed(places)}; `);
		log(
			`   pi-sum -> ${pi.toFixed(places)}; ` +
				`pi -> ${Math.PI} ` +
				`num-digits -> ${numDigits}`
		);
		log();
	});
};

export const logDetailedPiSumSeqLog10 = (count: number) => {
	const piSeq = getDetailedPiSumSeqLog10(count);
	piSeq.foreach(({ k, pi }) => {
		const numDigits = getDigitAccuracy(pi, Math.PI);
		const places = 15;
		log(
			`${formatNum(k)}: pi-sum -> ${pi.toFixed(places)}; ` +
				`pi -> ${Math.PI.toFixed(places)}; `
		);
		log(`   num-digits -> ${numDigits}`);
		log();
	});
};

export const logPiSumSeq = (count: number) => {
	const sigDigits = 15;
	const piSum = getPiSumSeq(count).getSum();
	const pi = Math.PI;
	const numDigits = getDigitAccuracy(piSum, pi);
	log(`pi-sum -> ${piSum.toFixed(sigDigits)}`);
	log(`pi     -> ${pi.toFixed(sigDigits)}`);
	log(`num-digits -> ${numDigits}`);
	div();
};

export const logPiSumSeqB = (count: number) => {
	const sigDigits = 15;
	const piSum = getPiSumSeq(count).lastOrThrow();
	const pi = Math.PI;
	const numDigits = getDigitAccuracy(piSum, pi);
	log(`pi-sum -> ${piSum.toFixed(sigDigits)}`);
	log(`pi     -> ${pi.toFixed(sigDigits)}`);
	log(`num-digits -> ${numDigits}`);
	div();
};

export const logPiSumSeqAvg = (count: number) => {
	const sigDigits = 15;
	const [sum, prevSum] = getPiSumSeq(count).getLastTwoSums();
	const avg = (sum + prevSum) / 2;
	const pi = Math.PI;
	log(`pi-sum      -> ${sum.toFixed(sigDigits)}`);
	log(`      num-digits -> ${getDigitAccuracy(sum, pi)}`);
	log(`pi-prev-sum -> ${prevSum.toFixed(sigDigits)}`);
	log(`      num-digits -> ${getDigitAccuracy(prevSum, pi)}`);
	log(`pi-avg      -> ${avg.toFixed(sigDigits)}`);
	log(`      num-digits -> ${getDigitAccuracy(avg, pi)}`);
	log(`pi          -> ${pi.toFixed(sigDigits)}`);
	div();
};

export const loopPiSumSeq = (count: number) => {
	for (let i = 0; i <= count; i++) {
		logPiSumSeq(i);
	}
};

export const logPiOverTwoProdSeq = (count: number) => {
	const sigDigits = 15;
	const piOverTwoProd = getPiOverTwoProdSeq(count).getProd();
	const piProd = 2 * piOverTwoProd;
	const pi = Math.PI;
	const numDigits = getDigitAccuracy(piProd, pi);
	log(`pi-prod/2 -> ${piOverTwoProd.toFixed(sigDigits)}`);
	log(`pi-prod -> ${piProd.toFixed(sigDigits)}`);
	log(`pi     -> ${pi.toFixed(sigDigits)}`);
	log(`num-digits -> ${numDigits}`);
	div();
};

export const logPiOverTwoProdSeqB = (count: number) => {
	const sigDigits = 15;
	const piOverTwoProd = getPiOverTwoProdSeq(count).lastOrThrow();
	const piProd = 2 * piOverTwoProd;
	const pi = Math.PI;
	const numDigits = getDigitAccuracy(piProd, pi);
	log(`pi-prod/2 -> ${piOverTwoProd.toFixed(sigDigits)}`);
	log(`pi-prod -> ${piProd.toFixed(sigDigits)}`);
	log(`pi     -> ${pi.toFixed(sigDigits)}`);
	log(`num-digits -> ${numDigits}`);
	div();
};

export const loopPiProdSeq = (count: number) => {
	for (let i = 0; i <= count; i++) {
		logPiOverTwoProdSeq(i);
	}
};

export const getFastPiSumSeq = (count: number) => {
	return MathSumSeq.from(0, count, k => {
		const sign = (-1) ** k;
		const pow = 4 ** k;
		const fourK = 4 * k;
		const sumPart =
			2 / (fourK + 1) + 2 / (fourK + 2) + 1 / (fourK + 3);

		return (sign / pow) * sumPart;
	});
};

export const logFastPiSumSeq = (count: number) => {
	const sigDigits = 15;
	const piSum = getFastPiSumSeq(count).getSum();
	const pi = Math.PI;
	const numDigits = getDigitAccuracy(piSum, pi);
	log(`pi-sum -> ${piSum.toFixed(sigDigits)}`);
	log(`pi     -> ${pi.toFixed(sigDigits)}`);
	log(`count: ${count}; num-digits -> ${numDigits}`);
	div();
};

export const loopFastPiSumSeq = (count: number) => {
	for (let i = 0; i <= count; i += 2) {
		logFastPiSumSeq(i);
	}
};

export const logFastPiSumSeqAvg = (count: number) => {
	const sigDigits = 15;
	const [sum, prevSum] = getPiSumSeq(count).getLastTwoSums();
	const avg = (sum + prevSum) / 2;
	const pi = Math.PI;
	log(`pi-sum      -> ${sum.toFixed(sigDigits)}`);
	log(`      num-digits -> ${getDigitAccuracy(sum, pi)}`);
	log(`pi-prev-sum -> ${prevSum.toFixed(sigDigits)}`);
	log(`      num-digits -> ${getDigitAccuracy(prevSum, pi)}`);
	log(`pi-avg      -> ${avg.toFixed(sigDigits)}`);
	log(`      num-digits -> ${getDigitAccuracy(avg, pi)}`);
	log(`pi          -> ${pi.toFixed(sigDigits)}`);
	div();
};
