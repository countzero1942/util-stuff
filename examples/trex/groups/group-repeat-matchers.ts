import {
	AltFirstLastGroupMatchers,
	GroupMatch,
	GroupMatchAll,
	GroupMatchAny,
	GroupMatchOpt,
	GroupMatchRepeat,
	GroupName,
	GroupNameSet,
	MatchAll,
	MatchCodePoint,
	MatchCodePointCategories,
	MatchEndSlice,
	MatchRepeat,
	MutMatchNav,
	NumberOfMatches,
} from "@/trex";
import { ExamplesMenuItem, runExamplesMenu } from "@/utils/examples-menu";
import { div, log } from "@/utils/log";
import { logGroups, logGroupsRec, logResults } from "./common";
import chalk from "chalk";

const abcNames = GroupNameSet.fromNames(
	"group-match",
	"alt-first",
	"content",
	"alt-last"
);

const doBasicOptRepeatMatcherWithOptAltFirst = () => {
	const repeatMatcher = GroupMatchRepeat.fromNamed(
		abcNames.getName("group-match"),
		GroupMatchOpt.from(
			GroupMatch.fromNamed(
				abcNames.getName("content"),
				MatchCodePoint.fromString("B")
			)
		),
		NumberOfMatches.between(2, 3),
		AltFirstLastGroupMatchers.fromAltFirst(
			GroupMatchOpt.from(
				GroupMatch.fromNamed(
					abcNames.getName("alt-first"),
					MatchCodePoint.fromString("A")
				)
			)
		)
	);

	const succesfulNavStrs = ["BB", "AB", "BBB", "ABB", "BBBX", "ABBX"];
	const failedNavStrs = [
		"A",
		"B",
		"BA",
		"AA",
		"AAB",
		"BBBB->over match",
		"ABBB->over match",
	];

	logResults(succesfulNavStrs, failedNavStrs, repeatMatcher);
};

const doBasicOptRepeatMatcherWithOptAltLast = () => {
	const repeatMatcher = GroupMatchRepeat.fromNamed(
		abcNames.getName("group-match"),
		GroupMatchOpt.from(
			GroupMatch.fromNamed(
				abcNames.getName("content"),
				MatchCodePoint.fromString("B")
			)
		),
		NumberOfMatches.between(2, 3),
		AltFirstLastGroupMatchers.fromAltLast(
			GroupMatchOpt.from(
				GroupMatch.fromNamed(
					abcNames.getName("alt-last"),
					MatchCodePoint.fromString("C")
				)
			)
		)
	);

	const succesfulNavStrs = [
		"BB",
		"BC",
		"BBB",
		"BBC",
		"BBX",
		"BBBX",
		"BCX",
		"BBCX",
	];
	const failedNavStrs = [
		"B",
		"C",
		"CB",
		"CBB",
		"BBBB->over match",
		"BBBC->over match",
	];

	logResults(succesfulNavStrs, failedNavStrs, repeatMatcher);
};

const doBasicFullStringOptRepeatMatcherWithOptAltFirstOptAltLast = () => {
	const repeatMatcher = GroupMatchAll.fromUnnamed(
		GroupMatchRepeat.fromNamed(
			abcNames.getName("group-match"),
			GroupMatchOpt.from(
				GroupMatch.fromNamed(
					abcNames.getName("content"),
					MatchCodePoint.fromString("B")
				)
			),
			NumberOfMatches.between(2, 3),
			AltFirstLastGroupMatchers.fromBoth(
				GroupMatchOpt.from(
					GroupMatch.fromNamed(
						abcNames.getName("alt-first"),
						MatchCodePoint.fromString("A")
					)
				),
				GroupMatchOpt.from(
					GroupMatch.fromNamed(
						abcNames.getName("alt-last"),
						MatchCodePoint.fromString("C")
					)
				)
			)
		),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
	);

	const succesfulNavStrs = [
		"BB",
		"AB",
		"BC",
		"AC",
		"ABB",
		"ABC",
		"BBB",
		"BBC",
	];
	const failedNavStrs = [
		"A",
		"B",
		"BA",
		"AA",
		"AAB",
		"BBX->not full string",
		"ABX->not full string",
		"BCX->not full string",
		"ACX->not full string",
		"ABBX->not full string",
		"ABCX->not full string",
		"BBBX->not full string",
		"BBBC->over match",
		"BBBB->over match",
		"ABBB->over match",
		"ABBC->over match",
	];

	logResults(succesfulNavStrs, failedNavStrs, repeatMatcher);
};

const numberNames = GroupNameSet.fromNames(
	"number",
	"content-group",
	"start-group",
	"end-group",
	"digit-group",
	"group-separator",
	"digit"
);

const numberGroupSuccessStrings = [
	"123,12",
	"12,567",
	"1,567",
	"1,567,8",
	"1,567,89",
	"1,567,890",
	"123,567,890",
	"123,567,890,321",
	"1,567,890,321",
	"1,567,890,3",
	"123",
	"12",
	"1",
];

const numberGroupFailStrings = [
	"1234->unhandled case",
	"123,567,890,321,123->over match",
	"1,567,890,321,123->over match",
	"123,567,890,321,3->over match",
	"1,567,890,321,3->over match",
	"123,12,->incomplete match",
	"123,123,->incomplete match",
	"1234,123->sub group overmatch",
	"123,1234->sub group overmatch",
];

const doNumberGroupRepeatMatchWithAltFirstLast = () => {
	const groupSeparatorMatcher = MatchCodePoint.fromString(",");

	const startGroupMatcher = GroupMatchOpt.from(
		GroupMatch.fromNamed(
			numberNames.getName("start-group"),
			MatchAll.fromMatchers(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.between(1, 2)
				),
				groupSeparatorMatcher
			)
		)
	);

	const contentGroupMatcher = GroupMatchOpt.from(
		GroupMatch.fromNamed(
			numberNames.getName("content-group"),
			MatchAll.fromMatchers(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.exactly(3)
				),
				groupSeparatorMatcher
			)
		)
	);

	const endGroupMatcher = GroupMatch.fromNamed(
		numberNames.getName("end-group"),
		MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchCodePointCategories.fromString("Nd"),
				NumberOfMatches.between(1, 3)
			),
			MatchEndSlice.default
		)
	);

	const numberMatcher = GroupMatchRepeat.fromNamed(
		numberNames.getName("number"),
		contentGroupMatcher,
		NumberOfMatches.between(1, 4),
		AltFirstLastGroupMatchers.fromBoth(
			startGroupMatcher,
			endGroupMatcher
		)
	);

	logResults(
		numberGroupSuccessStrings,
		numberGroupFailStrings,
		numberMatcher
	);
};

const doRecursiveNumberGroupRepeatMatchWithAltFirstLast = () => {
	const groupSeparatorMatcher = GroupMatch.fromNamed(
		numberNames.getName("group-separator"),
		MatchCodePoint.fromString(",")
	);

	const startGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			numberNames.getName("start-group"),
			GroupMatchRepeat.fromNamed(
				numberNames.getName("digit-group"),
				GroupMatch.fromNamed(
					numberNames.getName("digit"),
					MatchCodePointCategories.fromString("Nd")
				),
				NumberOfMatches.between(1, 2)
			),
			groupSeparatorMatcher
		)
	);

	const contentGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			numberNames.getName("content-group"),
			GroupMatchRepeat.fromNamed(
				numberNames.getName("digit-group"),
				GroupMatch.fromNamed(
					numberNames.getName("digit"),
					MatchCodePointCategories.fromString("Nd")
				),
				NumberOfMatches.exactly(3)
			),
			groupSeparatorMatcher
		)
	);

	const endGroupMatcher = GroupMatchAll.fromNamed(
		numberNames.getName("end-group"),
		GroupMatchRepeat.fromNamed(
			numberNames.getName("digit-group"),
			GroupMatch.fromNamed(
				numberNames.getName("digit"),
				MatchCodePointCategories.fromString("Nd")
			),
			NumberOfMatches.between(1, 3)
		),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
	);

	const numberMatcher = GroupMatchRepeat.fromNamed(
		numberNames.getName("number"),
		contentGroupMatcher,
		NumberOfMatches.between(1, 4),
		AltFirstLastGroupMatchers.fromBoth(
			startGroupMatcher,
			endGroupMatcher
		)
	);

	logResults(
		numberGroupSuccessStrings,
		numberGroupFailStrings,
		numberMatcher
	);
};

const doFlattenedNumberGroupRepeatMatchWithAltFirstLast = () => {
	const groupSeparatorMatcher = GroupMatch.fromUnnamed(
		MatchCodePoint.fromString(",")
	);

	const startGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromNamed(
				numberNames.getName("digit-group"),
				GroupMatch.fromUnnamed(
					MatchCodePointCategories.fromString("Nd")
				),
				NumberOfMatches.between(1, 2)
			),
			groupSeparatorMatcher
		)
	);

	const contentGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromNamed(
				numberNames.getName("digit-group"),
				GroupMatch.fromUnnamed(
					MatchCodePointCategories.fromString("Nd")
				),
				NumberOfMatches.exactly(3)
			),
			groupSeparatorMatcher
		)
	);

	const endGroupMatcher = GroupMatchAll.fromUnnamed(
		GroupMatchRepeat.fromNamed(
			numberNames.getName("digit-group"),
			GroupMatch.fromUnnamed(MatchCodePointCategories.fromString("Nd")),
			NumberOfMatches.between(1, 3)
		),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
	);

	const numberMatcher = GroupMatchRepeat.fromNamed(
		numberNames.getName("number"),
		contentGroupMatcher,
		NumberOfMatches.between(1, 4),
		AltFirstLastGroupMatchers.fromBoth(
			startGroupMatcher,
			endGroupMatcher
		)
	);

	logResults(
		numberGroupSuccessStrings,
		numberGroupFailStrings,
		numberMatcher
	);
};

const doAutoFlattenedNumberGroupRepeatMatchWithAltFirstLast = () => {
	const groupSeparatorMatcher = GroupMatch.fromUnnamed(
		MatchCodePoint.fromString(",")
	);

	const digitGroupMatcher = GroupMatch.fromNamed(
		numberNames.getName("digit"),
		MatchCodePointCategories.fromString("Nd")
	);

	const startGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromNamed(
				GroupName.empty,
				digitGroupMatcher,
				NumberOfMatches.between(1, 2)
			),
			groupSeparatorMatcher
		)
	);

	const contentGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromNamed(
				GroupName.empty,
				digitGroupMatcher,
				NumberOfMatches.exactly(3)
			),
			groupSeparatorMatcher
		)
	);

	const endGroupMatcher = GroupMatchAll.fromUnnamed(
		GroupMatchRepeat.fromNamed(
			GroupName.empty,
			digitGroupMatcher,
			NumberOfMatches.between(1, 3)
		),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
	);

	const numberMatcher = GroupMatchRepeat.fromNamed(
		numberNames.getName("number"),
		contentGroupMatcher,
		NumberOfMatches.between(1, 4),
		AltFirstLastGroupMatchers.fromBoth(
			startGroupMatcher,
			endGroupMatcher
		)
	);

	logResults(
		numberGroupSuccessStrings,
		numberGroupFailStrings,
		numberMatcher
	);
};

const doAutoFlattenedBNumberGroupRepeatMatchWithAltFirstLast = () => {
	const groupSeparatorMatcher = GroupMatch.fromUnnamed(
		MatchCodePoint.fromString(",")
	);
	const digitGroupMatcher = GroupMatch.fromNamed(
		numberNames.getName("digit"),
		MatchCodePointCategories.fromString("Nd")
	);

	const startGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromNamed(
				GroupName.empty,
				digitGroupMatcher,
				NumberOfMatches.between(1, 2)
			),
			groupSeparatorMatcher
		)
	);

	const contentGroupMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromNamed(
				GroupName.empty,
				digitGroupMatcher,
				NumberOfMatches.exactly(3)
			),
			groupSeparatorMatcher
		)
	);

	const endGroupMatcher = GroupMatchRepeat.fromUnnamed(
		GroupMatch.fromNamed(
			numberNames.getName("digit"),
			MatchCodePointCategories.fromString("Nd")
		),
		NumberOfMatches.between(1, 3)
	);

	const numberMatcher = GroupMatchAll.fromUnnamed(
		GroupMatchRepeat.fromUnnamed(
			contentGroupMatcher,
			NumberOfMatches.between(1, 4),
			AltFirstLastGroupMatchers.fromBoth(
				startGroupMatcher,
				endGroupMatcher
			)
		),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
	);

	logResults(
		numberGroupSuccessStrings,
		numberGroupFailStrings,
		numberMatcher
	);
};

const charEntitySuccessStrings = [
	"123",
	"1a3,1d",
	"1a,4d6",
	"1a,4d6,78e",
	"12,456,789,12",
	"12,456,789,1",
	"1,456,789,12",
	"1,456,789,1",
];

const charEntityFailStrings = [""];

const colonGroupSuccessStrings = [
	"1a3:4d6",
	// "12a,1c:1e,45f",
	// "12a,1c:1e,45f:78g",
	// "12a,1c:1e,45f:78g,1h",
	// "12a,1c:1e,45f:78g,1h:1j",
];

const colonGroupFailStrings = [""];
// const colonGroupFailStrings = ["", "12a,1c:1e,45f:78g,1h:1j:1k"];

const deepNames = GroupNameSet.fromNames(
	"",
	"digit",
	"letter",
	"separator",
	"char-entity",
	"char-entity-group",
	"char-first",
	"char-content",
	"char-last",
	"inner-first",
	"inner-content",
	"inner-last",
	"char-group",
	"colon-separator",
	"foobar"
);

const deepSecretNames = GroupNameSet.fromNames(
	"",
	"digit",
	"letter",
	"@separator",
	"@char-entity",
	"@char-entity-group",
	"@char-first",
	"@char-content",
	"@char-last",
	"@inner-first",
	"@inner-content",
	"@inner-last",
	"@char-group",
	"@colon-separator",
	"foobar"
);

const doDeepNamedGroupRepeatMatcher = () => {
	const digitOrLetterMatcher = GroupMatchAny.fromMatchers(
		GroupMatch.fromNamed(
			deepNames.getName("digit"),
			MatchCodePointCategories.fromString("Nd")
		),
		GroupMatch.fromNamed(
			deepNames.getName("letter"),
			MatchCodePointCategories.fromString("Ll")
		)
	);

	const separatorMatcher = GroupMatch.fromNamed(
		deepNames.getName("separator"),
		MatchCodePoint.fromString(",")
	);

	const charFirstMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			deepNames.getName("char-first"),
			GroupMatchRepeat.fromNamed(
				deepNames.getName("inner-first"),
				digitOrLetterMatcher,
				NumberOfMatches.between(1, 2)
			),
			separatorMatcher
		)
	);

	const charContentMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			deepNames.getName("char-content"),
			GroupMatchRepeat.fromNamed(
				deepNames.getName("inner-content"),
				digitOrLetterMatcher,
				NumberOfMatches.exactly(3)
			),
			separatorMatcher
		)
	);

	const charLastMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			deepNames.getName("char-last"),
			GroupMatchRepeat.fromNamed(
				deepNames.getName("inner-last"),
				digitOrLetterMatcher,
				NumberOfMatches.between(1, 3)
			)
		)
	);

	const charEntityMatcher = GroupMatchRepeat.fromNamed(
		deepNames.getName("char-entity"),
		charContentMatcher,
		NumberOfMatches.between(1, 4),
		AltFirstLastGroupMatchers.fromBoth(charFirstMatcher, charLastMatcher)
	);

	const colonSeparatorMatcher = GroupMatchAny.fromMatchers(
		GroupMatch.fromNamed(
			deepNames.getName("colon-separator"),
			MatchCodePoint.fromString(":")
		),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
	);

	const colonGroupMatcher = GroupMatchRepeat.fromNamed(
		deepNames.getName("foobar"),
		GroupMatchAll.fromNamed(
			deepNames.getName("char-entity-group"),
			charEntityMatcher,
			colonSeparatorMatcher
		),
		NumberOfMatches.between(1, 4)
	);

	logResults(
		colonGroupSuccessStrings,
		colonGroupFailStrings,
		colonGroupMatcher
	);
};

const doDeepSecretNamedGroupRepeatMatcher = () => {
	const digitOrLetterMatcher = GroupMatchAny.fromMatchers(
		GroupMatch.fromNamed(
			deepSecretNames.getName("digit"),
			MatchCodePointCategories.fromString("Nd")
		),
		GroupMatch.fromNamed(
			deepSecretNames.getName("letter"),
			MatchCodePointCategories.fromString("Ll")
		)
	);

	const separatorMatcher = GroupMatch.fromNamed(
		deepSecretNames.getName("@separator"),
		MatchCodePoint.fromString(",")
	);

	const charFirstMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			deepSecretNames.getName("@char-first"),
			GroupMatchRepeat.fromNamed(
				deepSecretNames.getName("@inner-first"),
				digitOrLetterMatcher,
				NumberOfMatches.between(1, 2)
			),
			separatorMatcher
		)
	);

	const charContentMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			deepSecretNames.getName("@char-content"),
			GroupMatchRepeat.fromNamed(
				deepSecretNames.getName("@inner-content"),
				digitOrLetterMatcher,
				NumberOfMatches.exactly(3)
			),
			separatorMatcher
		)
	);

	const charLastMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromNamed(
			deepSecretNames.getName("@char-last"),
			GroupMatchRepeat.fromNamed(
				deepSecretNames.getName("@inner-last"),
				digitOrLetterMatcher,
				NumberOfMatches.between(1, 3)
			)
		)
	);

	const charEntityMatcher = GroupMatchRepeat.fromNamed(
		deepSecretNames.getName("@char-entity"),
		charContentMatcher,
		NumberOfMatches.between(1, 4),
		AltFirstLastGroupMatchers.fromBoth(charFirstMatcher, charLastMatcher)
	);

	const colonSeparatorMatcher = GroupMatchAny.fromMatchers(
		GroupMatch.fromNamed(
			deepSecretNames.getName("@colon-separator"),
			MatchCodePoint.fromString(":")
		),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
	);

	const colonGroupMatcher = GroupMatchRepeat.fromNamed(
		deepSecretNames.getName("foobar"),
		GroupMatchAll.fromNamed(
			deepSecretNames.getName("@char-entity-group"),
			charEntityMatcher,
			colonSeparatorMatcher
		),
		NumberOfMatches.between(1, 4)
	);

	logResults(
		colonGroupSuccessStrings,
		colonGroupFailStrings,
		colonGroupMatcher
	);
};

const doDeepFlattenedGroupRepeatMatcher = () => {
	const digitOrLetterMatcher = GroupMatchAny.fromMatchers(
		GroupMatch.fromNamed(
			deepNames.getName("digit"),
			MatchCodePointCategories.fromString("Nd")
		),
		GroupMatch.fromNamed(
			deepNames.getName("letter"),
			MatchCodePointCategories.fromString("Ll")
		)
	);

	const separatorMatcher = GroupMatch.fromUnnamed(
		MatchCodePoint.fromString(",")
	);

	const charFirstMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromUnnamed(
				digitOrLetterMatcher,
				NumberOfMatches.between(1, 2)
			),
			separatorMatcher
		)
	);

	const charContentMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromUnnamed(
				digitOrLetterMatcher,
				NumberOfMatches.exactly(3)
			),
			separatorMatcher
		)
	);

	const charLastMatcher = GroupMatchOpt.from(
		GroupMatchAll.fromUnnamed(
			GroupMatchRepeat.fromUnnamed(
				digitOrLetterMatcher,
				NumberOfMatches.between(1, 3)
			)
		)
	);

	const charEntityMatcher = GroupMatchRepeat.fromUnnamed(
		charContentMatcher,
		NumberOfMatches.between(1, 4),
		AltFirstLastGroupMatchers.fromBoth(charFirstMatcher, charLastMatcher)
	);

	const colonSeparatorMatcher = GroupMatchAny.fromMatchers(
		GroupMatch.fromUnnamed(MatchCodePoint.fromString(":")),
		GroupMatch.fromUnnamed(MatchEndSlice.default)
	);

	const colonGroupMatcher = GroupMatchRepeat.fromNamed(
		deepNames.getName("foobar"),
		GroupMatchAll.fromUnnamed(charEntityMatcher, colonSeparatorMatcher),
		NumberOfMatches.between(1, 4)
	);

	logResults(
		colonGroupSuccessStrings,
		colonGroupFailStrings,
		colonGroupMatcher
	);
};

const exampleItems: ExamplesMenuItem[] = [
	{
		func: doBasicOptRepeatMatcherWithOptAltFirst,
		name: "Basic Opt Repeat Matcher With Opt Alt First",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an optional alt first match.",
		],
	},
	{
		func: doBasicOptRepeatMatcherWithOptAltLast,
		name: "Basic Opt Repeat Matcher With Opt Alt Last",
		description: [
			"Match 'B' between 2 and 3 times with 'C' as",
			"an optional alt last match.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherWithOptAltFirstOptAltLast,
		name: "Basic Full String Opt Repeat Matcher With Opt Alt First Opt Alt Last",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an optional alt first match and 'C' as an optional alt last match.",
		],
	},
	{
		func: doNumberGroupRepeatMatchWithAltFirstLast,
		name: "Number Group Repeat Match With AltFirstLast",
		description: [
			"Do number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
	{
		func: doRecursiveNumberGroupRepeatMatchWithAltFirstLast,
		name: "Recursive Number Group Repeat Match With AltFirstLast",
		description: [
			"Do recursive number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
	{
		func: doFlattenedNumberGroupRepeatMatchWithAltFirstLast,
		name: "Flattened Number Group Repeat Match With AltFirstLast",
		description: [
			"Do flattened number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
	{
		func: doAutoFlattenedNumberGroupRepeatMatchWithAltFirstLast,
		name: "Auto Flattened Number Group Repeat Match With AltFirstLast",
		description: [
			"Do auto flattened number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
	{
		func: doAutoFlattenedBNumberGroupRepeatMatchWithAltFirstLast,
		name: "Auto Flattened B Number Group Repeat Match With AltFirstLast",
		description: [
			"Do auto flattened number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
	{
		func: doDeepNamedGroupRepeatMatcher,
		name: "Deep Named Group Repeat Matcher",
		description: [
			"Do deep named group repeat matcher.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
	{
		func: doDeepSecretNamedGroupRepeatMatcher,
		name: "Deep Secret Named Group Repeat Matcher",
		description: [
			"Do deep secret named group repeat matcher.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
	{
		func: doDeepFlattenedGroupRepeatMatcher,
		name: "Deep Flattened Group Repeat Matcher",
		description: [
			"Do deep flattened group repeat matcher.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
		],
	},
];

export const runGroupRepeatMatcherExamples = async () => {
	await runExamplesMenu("Group Repeat Matchers", exampleItems);
};
