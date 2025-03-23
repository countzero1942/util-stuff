import {
	MatchStartSlice,
	MatchEndSlice,
} from "@/trex/match-position";
import {
	CodePointRange,
	MatchCodePointCategories,
	MatchCodePointRange,
	MatchCodePointSet,
} from "@/trex/match-code-point";

export const matchStartSlice = new MatchStartSlice();

export const matchEndSlice = new MatchEndSlice();

export const matchUnicodeLetter =
	MatchCodePointCategories.fromString("Lu Lo Ll");

export const matchUnicodeDigit =
	MatchCodePointCategories.fromString("Nd");

export const matchUnicodeLetterOrDigit =
	MatchCodePointCategories.fromString("Lu Lo Ll Nd");

export const matchUnicodeLowerCase =
	MatchCodePointCategories.fromString("Ll");

export const matchUnicodeUpperCase =
	MatchCodePointCategories.fromString("Lu");

export const matchUnicodeTitleCase =
	MatchCodePointCategories.fromString("Lt");

export const matchUnicodeSpace =
	MatchCodePointCategories.fromString("Zs");

export const matchUnicodeWhiteSpace =
	MatchCodePointSet.fromArray([
		0x20, 0x0d, 0x0a, 0x09, 0x0c, 0x0b, 0xa0, 0x1680,
		0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005,
		0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x2028,
		0x2029, 0x202f, 0x205f, 0x3000, 0xfeff,
	]);

export const matchLatinLetter = new MatchCodePointRange(
	new CodePointRange(0x0041, 0x005a)
);

export const matchLatinDigit = new MatchCodePointRange(
	new CodePointRange(0x0030, 0x0039)
);

export const matchLatinLetterOrDigit =
	new MatchCodePointRange(
		new CodePointRange(0x0041, 0x005a)
	);

export const matchLatinLowerCase = new MatchCodePointRange(
	new CodePointRange(0x0061, 0x007a)
);

export const matchLatinUpperCase = new MatchCodePointRange(
	new CodePointRange(0x0041, 0x005a)
);
