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

// logGeneratePassword();

// codePointSetArgs();
// codePointSetArgsTestExaustiveCheck();

// codePointSetArgsTestExaustiveCheck();

const getBufferByteSize = (
	slices: readonly StrSlice[],
	sep = ""
) => {
	const getSlicesCharLength = (
		slices: readonly StrSlice[]
	) => {
		let totalBytes = 0;
		for (const slice of slices) {
			totalBytes += slice.length;
		}
		return totalBytes;
	};
	let totalBytes = 0;
	totalBytes += getSlicesCharLength(slices) * 2;
	totalBytes += sep.length * 2 * (slices.length - 1);
	return totalBytes;
};

const cachedBufferLength = 1024 * 10;
const cachedBuffer = Buffer.allocUnsafe(cachedBufferLength);

const joinStrSlices = (
	slices: readonly StrSlice[],
	sep = ""
) => {
	const byteSize = getBufferByteSize(slices, sep);
	let buf =
		byteSize <= cachedBufferLength
			? cachedBuffer
			: Buffer.allocUnsafe(byteSize);

	// if (byteSize <= cachedBufferLength) {
	// 	log("Using cached buffer");
	// } else {
	// 	log("Allocating new buffer");
	// }
	const last = slices.length - 1;
	let offset = 0;
	const slicesLength = slices.length;
	for (let i = 0; i < slicesLength; i++) {
		const slice = slices[i];
		const source = slice.source;
		const endExcl = slice.endExcl;
		for (
			let i_slice = slice.startIncl;
			i_slice < endExcl;
			i_slice++
		) {
			buf.writeUInt16LE(
				source.charCodeAt(i_slice),
				offset
			);
			offset += 2;
		}
		if (sep && i < last) {
			const sepLength = sep.length;
			for (let i_sep = 0; i_sep < sepLength; i_sep++) {
				buf.writeUInt16LE(
					sep.charCodeAt(i_sep),
					offset
				);
				offset += 2;
			}
		}
	}
	return buf.toString("utf16le", 0, offset);
};

const getStrs = () => {
	const orgStrs = [
		"abc",
		"def",
		"ghi",
		"jkl",
		"mno",
		"pqr",
		"xyz",
	];
	let strs: string[] = [];
	for (let i = 0; i < 10; i++) {
		strs.push(...orgStrs);
	}
	return strs;
};

const timeStrSlicesJoin = (
	slices: readonly StrSlice[],
	sep = "",
	count = 100
) => {
	const start = performance.now();
	for (let i = 0; i < count; i++) {
		joinStrSlices(slices, sep);
	}
	const end = performance.now();
	return end - start;
};

const timeStrJoin = (
	strs: readonly string[],
	sep = "",
	count = 100
) => {
	const start = performance.now();
	for (let i = 0; i < count; i++) {
		strs.join(sep);
	}
	const end = performance.now();
	return end - start;
};

const count = 100_000;
const strs = getStrs();
const slices = strs.map(str => new StrSlice(str));
const joined = joinStrSlices(slices, ", ");
log(`Joined: '${joined}'`);
log(
	`Joined length: ${joined.length}, byte length: ${joined.length * 2}`
);
div();
const strSliceTime = timeStrSlicesJoin(slices, ", ", count);
const strTime = timeStrJoin(strs, ", ", count);
log(`Count: ${count}`);
log(`StrSlice join time: ${strSliceTime.toFixed(2)} ms`);
log(`String join time: ${strTime.toFixed(2)} ms`);
log(`Ratio: ${(strSliceTime / strTime).toFixed(2)}`);
div();
const test = "";
log(test ? "test" : "not test");
div();
