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
	removeUnnamedBranches,
} from "@/trex";
import { ExamplesMenuItem, runExamplesMenu } from "@/utils/examples-menu";
import { div, log } from "@/utils/log";
import { logResults } from "./common";
import chalk from "chalk";

const abcNames = GroupNameSet.fromNames(
	"match-all",
	"repeat-match",
	"alt-first",
	"content",
	"alt-last"
);

const doBasicOptRepeatMatcherWithOptAltFirst = () => {
	const repeatMatcher = GroupMatchRepeat.fromNamed(
		abcNames.getName("repeat-match"),
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
		abcNames.getName("repeat-match"),
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
	const repeatMatcher = GroupMatchAll.fromNamed(
		abcNames.getName("match-all"),
		GroupMatchRepeat.fromNamed(
			abcNames.getName("repeat-match"),
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
		numberMatcher,
		{
			showPrunedTree: false,
			autoPrune: false,
		}
	);
};

const doDeeplyNamedNumberGroupRepeatMatchWithAltFirstLast = () => {
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
		numberMatcher,
		{
			showPrunedTree: false,
			autoPrune: false,
		}
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
		numberMatcher,
		{
			showPrunedTree: true,
			autoPrune: false,
		}
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
		numberMatcher,
		{
			showPrunedTree: true,
			autoPrune: false,
		}
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
		numberMatcher,
		{
			showPrunedTree: true,
			autoPrune: false,
		}
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
	"12a,1c:1e,45f",
	"12a,1c:1e,45f:78g",
	"12a,1c:1e,45f:78g,1h",
	"12a,1c:1e,45f:78g,1h:1j",
];

// const colonGroupFailStrings = [""];
const colonGroupFailStrings = [
	"",
	"12a,1c:1e,45f:78g,1h:1j:1k->colon group overmatch",
];

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
		colonGroupMatcher,
		{
			showPrunedTree: true,
			autoPrune: false,
		}
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
		colonGroupMatcher,
		{
			showPrunedTree: true,
			autoPrune: false,
		}
	);
};

const getDeepFlattenedGroupRepeatMatcher = () => {
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
	return colonGroupMatcher;
};

const colonGroupMatcher = getDeepFlattenedGroupRepeatMatcher();

const doDeepFlattenedGroupRepeatMatcher = () => {
	logResults(
		colonGroupSuccessStrings,
		colonGroupFailStrings,
		colonGroupMatcher,
		{
			showPrunedTree: true,
			autoPrune: false,
		}
	);
};

const doAutoPruneDeepFlattenedGroupRepeatMatcher = () => {
	logResults(
		colonGroupSuccessStrings,
		colonGroupFailStrings,
		colonGroupMatcher,
		{
			showPrunedTree: false,
			autoPrune: true,
		}
	);
};

const doTimedDeepFlattenedGroupRepeatMatcher = () => {
	const navs = colonGroupSuccessStrings.map(s =>
		MutMatchNav.fromString(s)
	);

	logResults(
		colonGroupSuccessStrings,
		colonGroupFailStrings,
		colonGroupMatcher,
		{
			showPrunedTree: true,
			autoPrune: false,
		}
	);

	let matchCount = 0;
	const repeatCount = 10000;

	const start = performance.now();
	for (let i = 0; i < repeatCount; i++) {
		for (const nav of navs) {
			const result = colonGroupMatcher.match(nav.copy(), null);
			if (!result) {
				log(
					chalk.red(
						`>>> FAILED TO MATCH SUCCESS CASE: ${nav.toString()} <<< `
					)
				);
				break;
			}

			const prunedResult = removeUnnamedBranches(result, null);
			// const b = hasUnnamedBranches(prunedResult);
			// if (b) {
			// 	log(chalk.red(`>>> FAILED TO REMOVE UNNAMED BRANCHES <<< `));
			// 	break;
			// }
			matchCount++;
		}
	}
	log(chalk.green(`Matched ${matchCount} success cases.`));
	const end = performance.now();
	log(chalk.green(`Took ${(end - start).toFixed(2)} ms.`));
};

const exampleItems: ExamplesMenuItem[] = [
	{
		func: doBasicOptRepeatMatcherWithOptAltFirst,
		name: "Basic Opt Repeat Matcher With Opt Alt First",
		description: [
			"Match 'B' between 2 and 3 times with 'A'",
			"as an optional alt-first match.",
		],
	},
	{
		func: doBasicOptRepeatMatcherWithOptAltLast,
		name: "Basic Opt Repeat Matcher With Opt Alt Last",
		description: [
			"Match 'B' between 2 and 3 times with 'C' as",
			"an optional alt-last match.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherWithOptAltFirstOptAltLast,
		name: "Basic Full String Opt Repeat Matcher With Opt Alt First Opt Alt Last",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as an optional",
			"alt-first match and 'C' as an optional alt-last match.",
			"Full string match.",
		],
	},
	{
		func: doNumberGroupRepeatMatchWithAltFirstLast,
		name: "Number Group Repeat Match With AltFirst and AltLast",
		description: [
			"Do number repeat matcher with alt-first and alt-last.",
			"Start group has 1 to 2 numbers with comma.",
			"Content group has exactly 3 numbers with comma.",
			"End group has 1 to 3 numbers.",
			"All groups are named.",
		],
	},
	{
		func: doDeeplyNamedNumberGroupRepeatMatchWithAltFirstLast,
		name: "Deeply Named Number Group Repeat Match With AltFirstLast",
		description: [
			"Comma separated funky numbers.",
			"All groups are named. Deeper level than previous example.",
		],
	},
	{
		func: doFlattenedNumberGroupRepeatMatchWithAltFirstLast,
		name: "Flattened Number Group Repeat Match With AltFirstLast",
		description: [
			"Comma separated funky numbers.",
			"Only root and digits are named.",
		],
	},
	{
		func: doAutoFlattenedNumberGroupRepeatMatchWithAltFirstLast,
		name: "Auto Flattened Number Group Repeat Match With AltFirstLast",
		description: [
			"Comma separated funky numbers.",
			"Only root and digits are named.",
		],
	},
	{
		func: doAutoFlattenedBNumberGroupRepeatMatchWithAltFirstLast,
		name: "Auto Flattened B Number Group Repeat Match With AltFirstLast",
		description: [
			"Comma separated funky numbers.",
			"Root is unnamed (but acts like a named group.)",
			"Digits are named. All other groups are unnamed.",
		],
	},
	{
		func: doDeepNamedGroupRepeatMatcher,
		name: "Deep Named Group Repeat Matcher",
		description: [
			"Comma separated funky numbers separated by colons.",
			"All groups are named.",
		],
	},
	{
		func: doDeepSecretNamedGroupRepeatMatcher,
		name: "Deep Secret Named Group Repeat Matcher",
		description: [
			"Comma separated funky numbers separated by colons.",
			"Only root and digits are named.",
			"But unnamed branches have secret names for debugging.",
		],
	},
	{
		func: doDeepFlattenedGroupRepeatMatcher,
		name: "Deep Flattened Group Repeat Matcher",
		description: [
			"Comma separated funky numbers separated by colons.",
			"Only root and digits are named.",
		],
	},
	{
		func: doAutoPruneDeepFlattenedGroupRepeatMatcher,
		name: "Auto Prune Deep Flattened Group Repeat Matcher",
		description: [
			"Comma separated funky numbers separated by colons.",
			"Only root and digits are named.",
			"Unnamed branches are automatically pruned.",
		],
	},
	{
		func: doTimedDeepFlattenedGroupRepeatMatcher,
		name: "Timed Deep Flattened Group Repeat Matcher",
		description: [
			"Comma separated funky numbers separated by colons.",
			"Only root and digits are named.",
		],
	},
];

export const runGroupRepeatMatcherExamples = async () => {
	await runExamplesMenu("Group Repeat Matchers", exampleItems);
};
