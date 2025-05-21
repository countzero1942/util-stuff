import { div, logh, logobj } from "@/utils/log";
import { Range } from "@/utils/seq";
import { formatNum } from "@/utils/string";
import { log } from "console";
import { PrimeFactorizer } from "./prime-factorizer";

/**
 * Returns all factor pairs (a, b) such that a * b === n.
 * Each pair is represented as a [a, b] tuple.
 * Only works for positive integers n >= 1.
 */
export const getFactorPairs = (
	n: number
): [number, number][] => {
	if (!Number.isInteger(n) || n < 1)
		throw new Error("Input must be a positive integer");
	const pairs: [number, number][] = [];
	const sqrt = Math.floor(Math.sqrt(n));
	for (let a = 1; a <= sqrt; a++) {
		if (n % a === 0) {
			pairs.push([a, n / a]);
		}
	}
	return pairs;
};

export const getFactorsFromFactorPairs = (
	pairs: [number, number][]
): number[] => {
	const factors: Set<number> = new Set();
	for (const pair of pairs) {
		factors.add(pair[0]);
		factors.add(pair[1]);
	}
	return Array.from(factors).sort((a, b) => a - b);
};

export const getFactors = (n: number): number[] => {
	const pairs = getFactorPairs(n);
	return getFactorsFromFactorPairs(pairs);
};

export const logFactorPairs = (n: number) => {
	const pairs = getFactorPairs(n);
	const factors = getFactorsFromFactorPairs(pairs);
	logh(
		`Factor pairs of ${formatNum(n)} (count: ${factors.length})`
	);
	for (const pair of pairs) {
		log(
			`${formatNum(pair[0])} × ${formatNum(pair[1])} = ${formatNum(pair[0] * pair[1])}`
		);
	}
};

export const getPerfectSquares = (n: number): number[] => {
	const pairs = getFactorPairs(n);
	const factors = getFactorsFromFactorPairs(pairs);
	return factors.filter(factor =>
		Number.isInteger(Math.sqrt(factor))
	);
};

export const getPerfectSquaresFromFactors = (
	factors: number[]
): number[] => {
	return factors.filter(factor =>
		Number.isInteger(Math.sqrt(factor))
	);
};

export const flyMeToTheMoon = () => {
	const factors = getFactors(384400);

	for (const factor of factors) {
		logFactorPairs(factor);
	}

	const perfectSquares = getPerfectSquares(384400);
	logh(
		`Number of perfect squares: ${perfectSquares.length}`
	);
	for (const square of perfectSquares) {
		log(formatNum(square));
	}
	const perfectSquaresStr = perfectSquares.join(", ");
	log(perfectSquaresStr);

	logh("All factors");
	const factorsStr = factors.join(", ");
	log(factorsStr);
};

export type FactorStat = {
	n: number;
	factorPairs: [number, number][];
	factors: number[];
	perfectSquares: number[];
	primeFactors: number[];
	isPerfectSquare: boolean;
	abundance: number;
};

export const getFactorStats = (
	range: Range,
	factorPairThreshold: number = 5,
	perfectSquareThreshold: number = 10
): FactorStat[] => {
	const primeFactorizer = new PrimeFactorizer(
		range.endExcl
	);

	const stats: FactorStat[] = [];
	for (let n = range.startIncl; n <= range.endExcl; n++) {
		const factorPairs = getFactorPairs(n);
		if (factorPairs.length < factorPairThreshold) {
			continue;
		}
		const factors =
			getFactorsFromFactorPairs(factorPairs);
		const perfectSquares =
			getPerfectSquaresFromFactors(factors);
		if (perfectSquares.length < perfectSquareThreshold) {
			continue;
		}

		const isPerfectSquare = Number.isInteger(
			Math.sqrt(n)
		);

		const abundance =
			factors.reduce((a, b) => a + b, 0) - n;

		const primeFactors =
			primeFactorizer.getPrimeFactors(n);
		stats.push({
			n,
			factorPairs,
			factors,
			perfectSquares,
			primeFactors,
			isPerfectSquare,
			abundance,
		});
	}

	// stats.sort(
	// 	(a, b) =>
	// 		b.perfectSquares.length - a.perfectSquares.length
	// );

	// stats.sort((a, b) => {
	// 	const diffSquares =
	// 		b.perfectSquares.length - a.perfectSquares.length;
	// 	if (diffSquares !== 0) return diffSquares;

	// 	const diffFactors =
	// 		b.factors.length - a.factors.length;
	// 	if (diffFactors !== 0) return diffFactors;

	// 	return b.n - a.n; // n descending
	// });

	stats.sort((a, b) => {
		const diffNumber = a.n - b.n;
		return diffNumber;
	});

	return stats;
};

export const logBasicStats = (
	stats: FactorStat[],
	range: Range
) => {
	logh("Stats");
	let c = 1;
	for (const stat of stats) {
		const primeFactorsStr = stat.primeFactors.join(", ");
		log(
			`${c}: n:${formatNum(stat.n)}:` +
				` factors: ${stat.factors.length}` +
				` – prime factors: [${primeFactorsStr}]` +
				` – perfect squares: ${stat.perfectSquares.length}`
			// ` – is perfect square?: ${stat.isPerfectSquare}` +
			// ` – abundance: ${formatNum(stat.abundance)}`
		);
		c++;
	}

	const percentage = (stats.length / range.length()) * 100;
	logh(
		`Stats: length: ${stats.length}: percentage: ${percentage.toFixed(2)}`
	);
};

export const doLogBasicStatsForMoon = () => {
	const range = Range.from(1, 384_400);
	const factorPairThreshold = 10;
	const perfectSquareThreshold = 12;
	const stats = getFactorStats(
		range,
		factorPairThreshold,
		perfectSquareThreshold
	).filter(stat => stat.isPerfectSquare);
	logBasicStats(stats, range);
	div();
	const moon = stats.find(stat => stat.n === 384_400);
	logobj(moon);
};
