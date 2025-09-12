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
import { doGroupBasicsCurrentTest } from "@/examples/trex/groups/group-basics";
import {
	areEqual,
	getLogForRelativeEpsilon,
	getRelativeEpsilonFromLog,
	precisionRound,
	safeAdd,
	safeAddMany,
} from "@/utils/math";
import { testAreEqualAndSafeAddAcrossExponents } from "@/my-tests/math/areEqual-and-safeAdd";
import {
	runMatcherBasicsTests,
	doNumberRepeatMatcherWithAltFirstAltLast,
} from "@/examples/trex/matchers/repeat-matchers";
import { doStepNavTest } from "@/examples/utils/operations-stuff";

// logGeneratePassword();

// codePointSetArgs();
// codePointSetArgsTestExaustiveCheck();

// codePointSetArgsTestExaustiveCheck();

// matchWordsTest();

// doGroupBasicsCurrentTest();

await runMatcherBasicsTests();
