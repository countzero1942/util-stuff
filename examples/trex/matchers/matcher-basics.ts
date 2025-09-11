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
			log(`No match for navString: '${navStr}'`);
			div();
			continue;
		}
		if (result.captureMatch.value !== expected) {
			log(">>> RESULT !== EXPECTED <<<");
		}
		log(
			`navString: '${navStr}' |  ` +
				`result: '${result.captureMatch.value}' | ` +
				`expected: '${expected}'`
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

		const msgStr = msg ? `-> '${msg}'` : "";

		if (!result) {
			log(
				`No match for navString: '${navStr}' ${msgStr}`
			);
			div();
			continue;
		}

		log(
			`navString: '${navStr}' | ` +
				`result: '${result.captureMatch.value}'` +
				msgStr
		);
		div();
	}
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

export const doBasicOptRepeatMatcherWithAltFirst = () => {
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

export const doBasicOptRepeatMatcherWithAltLast = () => {
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

export const doBasicOptRepeatMatcherWithAltFirstAltLast =
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

export const doBasicExactRepeatMatcherWithAltFirstAltLast =
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
			// "A",
			// "B",
			// "BA",
			// "AA",
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

const doStuffItems: TestMenuItem[] = [
	{
		func: doBasicOptRepeatMatcherWithAltFirst,
		name: "Basic Optional Repeat Matcher With AltFirst",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an alt first match.",
		],
		index: 1,
	},
	{
		func: doBasicOptRepeatMatcherWithAltLast,
		name: "Basic Optional Repeat Matcher With AltLast",
		description: [
			"Match 'B' between 2 and 3 times with 'C' as",
			"an alt last match.",
		],
		index: 2,
	},
	{
		func: doBasicOptRepeatMatcherWithAltFirstAltLast,
		name: "Basic Optional Repeat Matcher With AltFirst and AltLast",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an alt first match and 'C' as an alt last match.",
		],
		index: 3,
	},
	{
		func: doBasicExactRepeatMatcherWithAltFirstAltLast,
		name: "Basic Optional Repeat Matcher With AltFirst and AltLast: Full String",
		description: [
			"Match 'B' between 2 and 3 times with 'A' as",
			"an alt first match and 'C' as an alt last match.",
			"Must match entire string view.",
		],
		index: 4,
	},
	{
		func: doNumberRepeatMatcherWithAltFirstAltLast,
		name: "Number Repeat Matcher With AltFirst and AltLast",
		description: [
			"Do number repeat matcher with alt first and alt last.",
			"Groups of 3 numbers separated by commas. Both ends can have",
			"between 1 and 2 numbers.",
		],
		index: 5,
	},
];

export const runMatcherBasicsTests = async () => {
	await runTestMenu(doStuffItems);
};
