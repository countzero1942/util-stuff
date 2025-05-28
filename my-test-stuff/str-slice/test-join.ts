import { div, log } from "@/utils/log";
import { StrSlice } from "@/utils/slice";

const getStrs = (strsCount: number = 10) => {
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
	for (let i = 0; i < strsCount; i++) {
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
		StrSlice.join(slices, sep);
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

export function testStrSliceJoin(
	testCount: number = 100_000,
	strsCount: number = 10
) {
	const strs = getStrs(strsCount);
	const slices = strs.map(str => new StrSlice(str));
	const joined = StrSlice.join(slices, ", ");
	log(`Joined: '${joined}'`);
	log(
		`Joined length: ${joined.length}, byte length: ${joined.length * 2}`
	);
	div();
	const strSliceTime = timeStrSlicesJoin(
		slices,
		", ",
		testCount
	);
	const strTime = timeStrJoin(strs, ", ", testCount);
	log(`Count: ${testCount}`);
	log(`StrSlice join time: ${strSliceTime.toFixed(2)} ms`);
	log(`String join time: ${strTime.toFixed(2)} ms`);
	log(`Ratio: ${(strSliceTime / strTime).toFixed(2)}`);
	div();
}
