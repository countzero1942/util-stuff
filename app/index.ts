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
} from "@/utils/log";
import { getFullType } from "@/utils/types";
import { logGeneratePassword } from "@/utils/password";
import {
	codePointSetArgs,
	codePointSetArgsTestExaustiveCheck,
	doTRexStuff,
	extractWordsWithGhostMatch,
	specificWordMatchTestWithGhostMatch,
	specificWordMatchTestWithLookAhead,
} from "./trex-stuff";
import { matchWordsTest } from "@/examples/trex/word-matching";
import { MatchCodePoint } from "@/trex";
import { getError, getErrorMessage } from "@/utils/error";
import { ArraySeq, MathProdSeq, Seq } from "@/utils/seq";
import { formatNum } from "@/utils/string";
import {
	FactorStat,
	flyMeToTheMoon,
	getFacorStats,
} from "@/my-tests/math/factors";

// logGeneratePassword();

// codePointSetArgs();
// codePointSetArgsTestExaustiveCheck();

// codePointSetArgsTestExaustiveCheck();

// flyMeToTheMoon();

// const n = 400_000;
const n = 384_400;
const factorPairThreshold = 23;
const perfectSquareThreshold = 12;

const logBasicStats = (stats: FactorStat[]) => {
	logh("Stats");
	let c = 1;
	for (const stat of stats) {
		log(
			`${c}: n:${formatNum(stat.n)}: factor pairs: ${stat.factorPairs.length}` +
				` factors: ${stat.factors.length}` +
				` perfect squares: ${stat.perfectSquares.length}`
		);
		c++;
	}

	const percentage = (stats.length / n) * 100;
	logh(
		`Stats: length: ${stats.length}: percentage: ${percentage.toFixed(2)}`
	);
};

const stats = getFacorStats(
	n,
	factorPairThreshold,
	perfectSquareThreshold
);
logBasicStats(stats);
