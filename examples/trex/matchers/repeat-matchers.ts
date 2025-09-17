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
import { div, logh, loghn } from "@/utils/log";
import { NumSeq } from "@/utils/seq";
import {
	TestMenuItem,
	runExamplesMenu,
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

const doBasicOptRepeatMatcherWithOptAltFirst = () => {
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
		"ABBC->ABB",
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

const doBasicOptRepeatMatcherWithOptAltLast = () => {
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

const doBasicOptRepeatMatcherWithOptAltFirstOptAltLast =
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

const doBasicFullStringOptRepeatMatcherWithOptAltFirstOptAltLast =
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

const doBasicFullStringOptRepeatMatcherReqAltLast = () => {
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

const doBasicFullStringOptRepeatMatcherReqAltFirst = () => {
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

const doBasicFullStringOptRepeatMatcherReqAltFirstOptAltLast =
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

const doBasicFullStringOptRepeatMatcherOptAltFirstReqAltLast =
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

const doBasicFullStringReqRepeatMatcherReqAltFirstReqAltLast =
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

const doNumberRepeatMatcherWithAltFirstAltLast = () => {
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
	matchFailedNavStrings(numberMatcher, failedNavStrings);
};

const doBasicRepeatMatcherZeroOrMore = () => {
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

const doTimedRepeatMatcherTestContentOnlyEfficiency =
	() => {
		const repeatMatcher = MatchRepeat.from(
			MatchCodePointCategories.fromString("Nd"),
			NumberOfMatches.between(4, 16)
		);
		const baseString = "12345678901234567890";

		const succesfulNavStrings = NumSeq.from(4, 16)
			.map(len => baseString.slice(0, len))
			.toArray();

		const failedNavStringsA = NumSeq.from(1, 2)
			.map(len => baseString.slice(0, len))
			.toArray();

		const failedNavStringsB = NumSeq.from(17, 20)
			.map(len => baseString.slice(0, len))
			.toArray();

		const failedNavStrings = [
			...failedNavStringsA,
			...failedNavStringsB,
		];

		const succesfulNavs = succesfulNavStrings.map(
			navStr => MutMatchNav.fromString(navStr)
		);

		const failedNavs = failedNavStrings.map(navStr =>
			MutMatchNav.fromString(navStr)
		);

		const checkResults = (
			title: string,
			matchfn: (nav: MutMatchNav) => MutMatchNav | null
		) => {
			loghn(title);
			for (const nav of succesfulNavs) {
				const result = matchfn(nav.copy());
				if (!result) {
					log(
						chalk.red(
							`No match for navString: ${nav}`
						)
					);
					continue;
				} else if (
					result.captureLength !== nav.source.length
				) {
					log(
						chalk.red(
							`Match lengths do not match for navString: ${nav}`
						)
					);
					continue;
				} else {
					log(
						chalk.green(
							`Match: '${result.captureMatch.value}'`
						)
					);
				}
			}

			for (const nav of failedNavs) {
				const result = matchfn(nav.copy());
				if (result) {
					log(
						chalk.red(
							`Should not match navString: ${nav}`
						)
					);
					continue;
				} else {
					log(
						chalk.green(
							`No match (as expected) for navString: ${nav.source.value}`
						)
					);
				}
			}
		};

		const repeatCount = 10000;

		const doRepeatMatch = (
			title: string,
			matchfn: (nav: MutMatchNav) => MutMatchNav | null
		) => {
			loghn(title);

			const start = performance.now();

			for (let i = 0; i < repeatCount; i++) {
				for (const nav of succesfulNavs) {
					const result = matchfn(nav.copy());
					if (!result) throw "never";
					else if (
						result.captureLength !== nav.source.length
					)
						throw "never";
				}
				for (const nav of failedNavs) {
					const result = matchfn(nav.copy());
					if (result) throw "never";
				}
			}

			const end = performance.now();

			const time = end - start;
			log(`Time: ${time.toFixed(2)} ms`);
			return time;
		};

		checkResults("Normal Repeat Match", nav =>
			repeatMatcher.match(nav)
		);
		div();
		checkResults("Content Only Repeat Match", nav =>
			repeatMatcher.matchContentOnly(nav)
		);
		// checkResultsMatchContentOnly();
		div();
		const normalTime = doRepeatMatch(
			"Normal Repeat Match",
			nav => repeatMatcher.match(nav)
		);
		div();
		const contentOnlyTime = doRepeatMatch(
			"Content Only Repeat Match",
			nav => repeatMatcher.matchContentOnly(nav)
		);
		div();
		const ratio = (contentOnlyTime / normalTime) * 100;
		const faster = (1.0 / ratio) * 100;
		log();
		log(
			`${chalk.magentaBright("Result")}: ${chalk.cyan("matchContentOnly")} takes ` +
				`${chalk.green(ratio.toFixed(2) + "%")} of the time of ${chalk.cyan("match")} and ` +
				`is ${chalk.green(faster.toFixed(2) + "X")} faster.`
		);
	};

const doStuffItems: TestMenuItem[] = [
	{
		func: doBasicOptRepeatMatcherWithOptAltFirst,
		name: "Basic Opt Repeat Matcher With Opt AltFirst",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an optional alt first match.",
		],
	},
	{
		func: doBasicOptRepeatMatcherWithOptAltLast,
		name: "Basic Opt Repeat Matcher With Opt AltLast",
		description: [
			"Match 'B' between 2 and 3 times with 'C' as",
			"an optional alt last match.",
		],
	},
	{
		func: doBasicOptRepeatMatcherWithOptAltFirstOptAltLast,
		name: "Basic Opt Repeat Matcher With Opt AltFirst and Opt AltLast",
		description: [
			"Match 'B' optionally between 2 and 3 times with 'A' as",
			"an optional alt first match and 'C' as an optional alt last match.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherWithOptAltFirstOptAltLast,
		name: "Basic Opt Repeat Matcher With Opt AltFirst and Opt AltLast: Full String",
		description: [
			"Match 'B' optionally between 2 and 3 times with 'A' as",
			"an optional alt first match and 'C' as an optional alt last match.",
			"Must match entire string view.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherReqAltLast,
		name: "Basic Full String Opt Repeat Matcher Req AltLast",
		description: [
			"Match 'B' optionally between 2 and 3 times with 'C' as a required alt last match.",
			"Must match 'C'. Must match entire string view.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherReqAltFirst,
		name: "Basic Full String Opt Repeat Matcher Req AltFirst",
		description: [
			"Match 'B' optionally between 2 and 3 times with 'A' as a required alt first match.",
			"Must match 'A'.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherReqAltFirstOptAltLast,
		name: "Basic Full String Opt Repeat Matcher Req AltFirst Opt AltLast",
		description: [
			"Match 'B' optionally between 2 and 3 times with 'A' as a required alt first match",
			"and 'C' as an optional alt last match. Must match 'A'.",
		],
	},
	{
		func: doBasicFullStringOptRepeatMatcherOptAltFirstReqAltLast,
		name: "Basic Full String Opt Repeat Matcher Opt AltFirst Req AltLast",
		description: [
			"Match 'B' optionally between 2 and 3 times with 'A' as an optional alt first match",
			"and 'C' as a required alt last match. Must match 'C'.",
		],
	},
	{
		func: doBasicFullStringReqRepeatMatcherReqAltFirstReqAltLast,
		name: "Basic Full String Req Repeat Matcher Req AltFirst Req AltLast",
		description: [
			"Match 'B' between 3 and 4 times with 'A' as a required alt first match",
			"and 'C' as a required alt last match. Must match 'A', 'B' and 'C'.",
		],
	},
	{
		func: doNumberRepeatMatcherWithAltFirstAltLast,
		name: "Number Repeat Matcher With AltFirst and AltLast",
		description: [
			"Do number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers. The final end must be between 1 and 3 numbers.",
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
	{
		func: doTimedRepeatMatcherTestContentOnlyEfficiency,
		name: "Timed Repeat Matcher Test Content-Only Matcher Efficiency",
		description: [
			"This checks the efficiency of writing a separate content-only match function.",
			"Since 'match' will call this function 'matchContentOnly' when there are no",
			"altFirst and altLast matchers, this logic must be commented out in order",
			"for the test to work. (Efficiency is around 2x faster.)",
		],
	},
];

export const runRepeatMatcherExamples = async () => {
	await runExamplesMenu("Repeat Matchers", doStuffItems);
};
