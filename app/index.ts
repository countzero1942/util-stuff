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
	doTRexStuff,
	extractWordsWithGhostMatch,
	specificWordMatchTestWithGhostMatch,
	specificWordMatchTestWithLookAhead,
} from "./trex-stuff";
import { matchWordsTest } from "@/examples/trex/word-matching";

// logGeneratePassword();

codePointSetArgs();
