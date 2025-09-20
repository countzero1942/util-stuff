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
	LookAheadAnyString,
	MatchAnyString,
	MatchCodePoint,
	MutMatchNav,
} from "@/trex";
import { getError, getErrorMessage } from "@/utils/error";
import {
	ArraySeq,
	MathProdSeq,
	Range,
	Seq,
} from "@/utils/seq";
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
import {
	areEqual,
	getLogForRelativeEpsilon,
	getRelativeEpsilonFromLog,
	precisionRound,
	safeAdd,
	safeAddMany,
} from "@/utils/math";
import { testAreEqualAndSafeAddAcrossExponents } from "@/my-tests/math/areEqual-and-safeAdd";
import { runRepeatMatcherExamples } from "@/examples/trex/matchers/repeat-matchers";
import { doStepNavTest } from "@/examples/utils/operations-stuff";
import chalk from "chalk";
import { runGroupRepeatMatcherExamples } from "@/examples/trex/groups/group-repeat-matchers";

// logGeneratePassword();

// codePointSetArgs();
// codePointSetArgsTestExaustiveCheck();

// codePointSetArgsTestExaustiveCheck();

// matchWordsTest();

await runRepeatMatcherExamples();
// await doGroupBasicsExamplesMenu();
// await runGroupRepeatMatcherExamples();

// let n = Number.MAX_SAFE_INTEGER - 1;

// for (let i = 0; i < 5; i++) {
// 	log(
// 		`i: ${i} | n: ${n} | isSafeInteger: ${Number.isSafeInteger(n)}`
// 	);
// 	n++;
// }
