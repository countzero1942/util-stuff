import {
	AltFirstLastGroupMatchers,
	AltFirstLastMatchers,
	GroupMatch,
	GroupName,
	MatchAll,
	MatchBase,
	MatchCodePoint,
	MatchCodePointCategories,
	MatchEndSlice,
	MatchOpt,
	MatchRepeat,
	MutMatchNav,
	NumberOfMatches,
} from "@/trex";
import { div, logh } from "@/utils/log";
import {
	TestMenuItem,
	runTestMenu,
} from "@/utils/test-menu";
import { doesNotMatch } from "assert";
import chalk from "chalk";
import { log } from "console";
import prompts from "prompts";

const matchSuccessfulNavStrings = (
	matcher: MatchBase,
	navStrings: string[]
) => {
	logh("Success cases");
	for (const pair of navStrings) {
		const [navStr, expected] = pair.split("->");
		const nav = MutMatchNav.fromString(navStr);
		const result = matcher.match(nav);
		if (!result) {
			log(chalk.red(">>> UNEXPECTED NO MATCH <<<"));
			log(`No match for navString: '${navStr}'`);
			div();
			continue;
		}
		if (result.captureMatch.value !== expected) {
			log(chalk.red(">>> RESULT !== EXPECTED <<<"));
		}
		log(
			`navString: '${chalk.green(navStr)}' |  ` +
				`result: '${chalk.cyan(result.captureMatch.value)}' | ` +
				`expected: '${chalk.cyan(expected)}'`
		);
		div();
	}
};

const matchFailedNavStrings = (
	matcher: MatchBase,
	navStrings: string[]
) => {
	logh("Failure cases");
	for (const pair of navStrings) {
		const [navStr, msg] = pair.split("->");
		const nav = MutMatchNav.fromString(navStr);
		const result = matcher.match(nav);

		const msgStr = msg ? `-> '${chalk.cyan(msg)}'` : "";

		if (!result) {
			log(
				`No match for navString: '${chalk.green(navStr)}' ${msgStr}`
			);
			div();
			continue;
		}

		log(chalk.red(">>> RESULT should NOT MATCH <<<"));
		log(
			`navString: '${chalk.green(navStr)}' | ` +
				`result: '${chalk.cyan(result.captureMatch.value)}'` +
				msgStr
		);
		div();
	}
};

export const doBasicOptRepeatMatcherWithOptAltFirst =
	() => {
		const repeatMatcher = MatchRepeat.from(
			MatchOpt.from(MatchCodePoint.fromString("B")),
			NumberOfMatches.between(2, 3),
			AltFirstLastMatchers.fromAltFirst(
				MatchOpt.from(MatchCodePoint.fromString("A"))
			)
		);

		const succesfulNavStrs = [
			"BB->BB",
			"AB->AB",
			"BBB->BBB",
			"ABB->ABB",
			"BBBA->BBB",
			"BBBC->BBB",
		];
		const failedNavStrs = [
			"A",
			"B",
			"BA",
			"AA",
			"AAB",
			"BBBB->over match",
			"ABBB->over match",
		];

		matchSuccessfulNavStrings(
			repeatMatcher,
			succesfulNavStrs
		);
		matchFailedNavStrings(repeatMatcher, failedNavStrs);
	};

export const doBasicOptRepeatMatcherWithOptAltLast = () => {
	const repeatMatcher = MatchRepeat.from(
		MatchOpt.from(MatchCodePoint.fromString("B")),
		NumberOfMatches.between(2, 3),
		AltFirstLastMatchers.fromAltLast(
			MatchOpt.from(MatchCodePoint.fromString("C"))
		)
	);

	const succesfulNavStrs = [
		"BB->BB",
		"BC->BC",
		"BBB->BBB",
		"BBC->BBC",
		"BBA->BB",
		"BBBA->BBB",
		"BCA->BC",
		"BBCA->BBC",
	];
	const failedNavStrs = [
		"B",
		"C",
		"CB",
		"CBB",
		"BBBB->over match",
		"BBBC->over match",
	];

	matchSuccessfulNavStrings(
		repeatMatcher,
		succesfulNavStrs
	);
	matchFailedNavStrings(repeatMatcher, failedNavStrs);
};

export const doBasicOptRepeatMatcherWithOptAltFirstOptAltLast =
	() => {
		const repeatMatcher = MatchRepeat.from(
			MatchOpt.from(MatchCodePoint.fromString("B")),
			NumberOfMatches.between(2, 3),
			AltFirstLastMatchers.fromBoth(
				MatchOpt.from(MatchCodePoint.fromString("A")),
				MatchOpt.from(MatchCodePoint.fromString("C"))
			)
		);

		const succesfulNavStrs = [
			"BB->BB",
			"AB->AB",
			"BC->BC",
			"AC->AC",
			"ABB->ABB",
			"ABC->ABC",
			"BBB->BBB",
			"BBC->BBC",
			"ABA->AB",
			"ACC->AC",
			"BCC->BC",
			"BBA->BB",
			"ABBA->ABB",
			"ABCA->ABC",
			"BBBA->BBB",
		];
		const failedNavStrs = [
			"A",
			"B",
			"BA",
			"AA",
			"AAB",
			"BBBC->over match",
			"BBBB->over match",
			"ABBB->over match",
			"ABBC->over match",
		];

		matchSuccessfulNavStrings(
			repeatMatcher,
			succesfulNavStrs
		);
		matchFailedNavStrings(repeatMatcher, failedNavStrs);
	};

export const doBasicFullStringOptRepeatMatcherWithOptAltFirstOptAltLast =
	() => {
		const repeatMatcher = MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchOpt.from(MatchCodePoint.fromString("B")),
				NumberOfMatches.between(2, 3),
				AltFirstLastMatchers.fromBoth(
					MatchOpt.from(
						MatchCodePoint.fromString("A")
					),
					MatchOpt.from(MatchCodePoint.fromString("C"))
				)
			),
			MatchEndSlice.default
		);

		const succesfulNavStrs = [
			"BB->BB",
			"AB->AB",
			"BC->BC",
			"AC->AC",
			"ABB->ABB",
			"ABC->ABC",
			"BBB->BBB",
			"BBC->BBC",
		];
		const failedNavStrs = [
			"A",
			"B",
			"BA",
			"AA",
			"AAB",
			"ABA->not full match",
			"ACC->not full match",
			"BCC->not full match",
			"BBA->not full match",
			"ABBA->not full match",
			"ABCA->not full match",
			"BBBA->not full match",
			"BBCA->not full match",
			"BBBC->over match",
			"BBBB->over match",
			"ABBB->over match",
			"ABBC->over match",
		];

		matchSuccessfulNavStrings(
			repeatMatcher,
			succesfulNavStrs
		);
		matchFailedNavStrings(repeatMatcher, failedNavStrs);
	};

export const doBasicFullStringOptRepeatMatcherReqAltLast =
	() => {
		const repeatMatcher = MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchOpt.from(MatchCodePoint.fromString("B")),
				NumberOfMatches.between(2, 3),
				AltFirstLastMatchers.fromAltLast(
					MatchCodePoint.fromString("C")
				)
			),
			MatchEndSlice.default
		);

		const succesfulNavStrs = ["BC->BC", "BBC->BBC"];
		const failedNavStrs = [
			"B",
			"C",
			"BB->no end match",
			"BBB->no end match",
			"BCA->not full match",
			"BBCA->not full match",
			"BBBC->over match",
		];

		matchSuccessfulNavStrings(
			repeatMatcher,
			succesfulNavStrs
		);
		matchFailedNavStrings(repeatMatcher, failedNavStrs);
	};

export const doBasicFullStringOptRepeatMatcherReqAltFirst =
	() => {
		const repeatMatcher = MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchOpt.from(MatchCodePoint.fromString("B")),
				NumberOfMatches.between(2, 3),
				AltFirstLastMatchers.fromAltFirst(
					MatchCodePoint.fromString("A")
				)
			),
			MatchEndSlice.default
		);

		const succesfulNavStrs = ["AB->AB", "ABB->ABB"];
		const failedNavStrs = [
			"A",
			"B",
			"BB->no first match",
			"BBB->no first match",
			"ABC->not full match",
			"ABBC->not full match",
			"ABBB->over match",
		];

		matchSuccessfulNavStrings(
			repeatMatcher,
			succesfulNavStrs
		);
		matchFailedNavStrings(repeatMatcher, failedNavStrs);
	};

export const doBasicFullStringOptRepeatMatcherReqAltFirstOptAltLast =
	() => {
		const repeatMatcher = MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchOpt.from(MatchCodePoint.fromString("B")),
				NumberOfMatches.between(2, 3),
				AltFirstLastMatchers.fromBoth(
					MatchCodePoint.fromString("A"),
					MatchOpt.from(MatchCodePoint.fromString("C"))
				)
			),
			MatchEndSlice.default
		);

		const succesfulNavStrs = [
			"AB->AB",
			"AC->AC",
			"ABB->ABB",
			"ABC->ABC",
		];
		const failedNavStrs = [
			"AA",
			"BA",
			"AAB",
			"AAC",
			"BBB",
			"ABBB->over match",
			"ABBC->over match",
		];

		matchSuccessfulNavStrings(
			repeatMatcher,
			succesfulNavStrs
		);
		matchFailedNavStrings(repeatMatcher, failedNavStrs);
	};

export const doBasicFullStringOptRepeatMatcherOptAltFirstReqAltLast =
	() => {
		const repeatMatcher = MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchOpt.from(MatchCodePoint.fromString("B")),
				NumberOfMatches.between(2, 3),
				AltFirstLastMatchers.fromBoth(
					MatchOpt.from(
						MatchCodePoint.fromString("A")
					),
					MatchCodePoint.fromString("C")
				)
			),
			MatchEndSlice.default
		);

		const succesfulNavStrs = [
			"BC->BC",
			"AC->AC",
			"ABC->ABC",
			"BBC->BBC",
		];
		const failedNavStrs = [
			"AB",
			"BB",
			"ABB",
			"BBB",
			"BCA->not full match",
			"ACA->not full match",
			"ABCA->not full match",
			"BBCA->not full match",
			"BBBC->over match",
			"ABBC->over match",
		];

		matchSuccessfulNavStrings(
			repeatMatcher,
			succesfulNavStrs
		);
		matchFailedNavStrings(repeatMatcher, failedNavStrs);
	};

export const doBasicFullStringReqRepeatMatcherReqAltFirstReqAltLast =
	() => {
		const repeatMatcher = MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchCodePoint.fromString("B"),
				NumberOfMatches.between(3, 4),
				AltFirstLastMatchers.fromBoth(
					MatchCodePoint.fromString("A"),
					MatchCodePoint.fromString("C")
				)
			),
			MatchEndSlice.default
		);

		const succesfulNavStrs = ["ABC->ABC", "ABBC->ABBC"];
		const failedNavStrs = [
			"ABB",
			"ACC",
			"BBB",
			"BBC",
			"CAB",
			"AABC",
			"ABBBC->over match",
		];

		matchSuccessfulNavStrings(
			repeatMatcher,
			succesfulNavStrs
		);
		matchFailedNavStrings(repeatMatcher, failedNavStrs);
	};

export const doNumberRepeatMatcherWithAltFirstAltLast =
	() => {
		const groupSeparatorMatcher =
			MatchCodePoint.fromString(",");

		const startGroupMatcher = MatchOpt.from(
			MatchAll.fromMatchers(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.between(1, 2)
				),
				groupSeparatorMatcher
			)
		);

		const contentGroupMatcher = MatchOpt.from(
			MatchAll.fromMatchers(
				MatchRepeat.from(
					MatchCodePointCategories.fromString("Nd"),
					NumberOfMatches.exactly(3)
				),
				groupSeparatorMatcher
			)
		);

		const endGroupMatcher = MatchAll.fromMatchers(
			MatchRepeat.from(
				MatchCodePointCategories.fromString("Nd"),
				NumberOfMatches.between(1, 3)
			),
			MatchEndSlice.default
		);

		const numberMatcher = MatchRepeat.from(
			contentGroupMatcher,
			NumberOfMatches.between(1, 4),
			AltFirstLastMatchers.fromBoth(
				startGroupMatcher,
				endGroupMatcher
			)
		);

		const succesfulNavStrings = [
			"123,12->123,12",
			"12,567->12,567",
			"1,567->1,567",
			"1,567,8->1,567,8",
			"1,567,89->1,567,89",
			"1,567,890->1,567,890",
			"123,567,890->123,567,890",
			"123,567,890,321->123,567,890,321",
			"1,567,890,321->1,567,890,321",
			"1,567,890,3->1,567,890,3",
			"123->123",
			"12->12",
			"1->1",
		];
		const failedNavStrings = [
			"12,->incomplete",
			"12,123,->incomplete",
			"123,567,890,321,123->over match",
			"1,567,890,321,123->over match",
			"123,567,890,321,3->over match",
			"1,567,890,321,3->over match",
			"1234->not handled",
		];

		matchSuccessfulNavStrings(
			numberMatcher,
			succesfulNavStrings
		);
		matchFailedNavStrings(
			numberMatcher,
			failedNavStrings
		);
	};

export const doBasicRepeatMatcherZeroOrMore = () => {
	const repeatMatcher = MatchRepeat.from(
		MatchCodePoint.fromString("A"),
		NumberOfMatches.zeroOrMore
	);
	const succesfulNavStrs = [
		"A->A",
		"AA->AA",
		"AAB->AA",
		"->",
		"B->",
		"BB->",
	];

	matchSuccessfulNavStrings(
		repeatMatcher,
		succesfulNavStrs
	);
};

const doStuffItems: TestMenuItem[] = [
	{
		func: doBasicOptRepeatMatcherWithOptAltFirst,
		name: "Basic Opt Repeat Matcher With Opt AltFirst",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an alt first match.",
		],
	},
	{
		func: doBasicOptRepeatMatcherWithOptAltLast,
		name: "Basic Opt Repeat Matcher With Opt AltLast",
		description: [
			"Match 'B' between 2 and 3 times with 'C' as",
			"an alt last match.",
		],
	},
	{
		func: doBasicOptRepeatMatcherWithOptAltFirstOptAltLast,
		name: "Basic Opt Repeat Matcher With Opt AltFirst and Opt AltLast",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an alt first match and 'C' as an alt last match.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherWithOptAltFirstOptAltLast,
		name: "Basic Opt Repeat Matcher With Opt AltFirst and Opt AltLast: Full String",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an alt first match and 'C' as an alt last match.",
			"Must match entire string view.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherReqAltLast,
		name: "Basic Full String Opt Repeat Matcher Req AltLast",
		description: [
			"Match 'B' between 2 and 3 times with 'C' as an alt last match.",
			"Must match 'C'. Must match entire string view.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherReqAltFirst,
		name: "Basic Full String Opt Repeat Matcher Req AltFirst",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as an alt first match.",
			"Must match 'A'.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherReqAltFirstOptAltLast,
		name: "Basic Full String Opt Repeat Matcher Req AltFirst Opt AltLast",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as an alt first match",
			"and 'C' as an alt last match. Must match 'A'.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherOptAltFirstReqAltLast,
		name: "Basic Full String Opt Repeat Matcher Opt AltFirst Req AltLast",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as an alt first match",
			"and 'C' as an alt last match. Must match 'C'.",
		],
	},
	{
		func: doBasicFullStringReqRepeatMatcherReqAltFirstReqAltLast,
		name: "Basic Full String Req Repeat Matcher Req AltFirst Req AltLast",
		description: [
			"Match 'B' between 3 and 4 times with 'A' as an alt first match",
			"and 'C' as an alt last match. Must match 'A', 'B' and 'C'.",
		],
	},
	{
		func: doNumberRepeatMatcherWithAltFirstAltLast,
		name: "Number Repeat Matcher With AltFirst and AltLast",
		description: [
			"Do number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers.",
		],
	},
	{
		func: doBasicRepeatMatcherZeroOrMore,
		name: "Basic Repeat Matcher Zero Or More",
		description: [
			"Do basic repeat matcher zero or more.",
			"Matches 'A' zero or more times.",
		],
	},
];

export const runMatcherBasicsTests = async () => {
	// doBasicFullStringOptRepeatMatcherReqAltFirst();
	await runTestMenu(doStuffItems);
};
