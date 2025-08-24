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
} from "@/utils/math";
import { testAreEqualAndSafeAddAcrossExponents } from "@/my-tests/math/areEqual-and-safeAdd";

// logGeneratePassword();

// codePointSetArgs();
// codePointSetArgsTestExaustiveCheck();

// codePointSetArgsTestExaustiveCheck();

// matchWordsTest();

testAreEqualAndSafeAddAcrossExponents();

div();

//doGroupBasicsCurrentTest();

// log(0.1 + 0.2);

// 300000000000000070000
// 3000000000000000500
// 4.440892098500626e-271
//            3e+306
// 123456789012345678901234567890

const n1 = 4.440892098500626e-271;
const marker = "123456789012345678901234567890";
const n2 = 3e306;

const s1 = alignRight(n1, 24);
const l1 = s1.length;
const s2 = alignRight(n2, 24);
const l2 = s2.length;

log(s1);
log(marker);
log(s2);
log(marker);

div();
