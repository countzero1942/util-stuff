import { MatchBase } from "./match-base";
import { MatchAny } from "./match-any-all-opt";
import { MutMatchNav } from "./nav";
import { log } from "console";
import { StepNav } from "@/utils/operations";

/**
 * Defines the number of matches for a repeat matcher.
 */
export class NumberOfMatches {
	public readonly minNumber: number;
	public readonly maxNumber: number;

	/**
	 * @param minNumber The minimum number of matches.
	 * @param maxNumber The maximum number of matches.
	 * If -1 is passed for maxNumber, it is set to Number.MAX_SAFE_INTEGER.
	 */
	protected constructor(
		minNumber: number,
		maxNumber: number = -1
	) {
		this.minNumber = minNumber;
		this.maxNumber =
			maxNumber === -1
				? Number.MAX_SAFE_INTEGER
				: maxNumber;

		if (this.minNumber < 0) {
			throw new Error(
				"NumberOfMatches: minNumber must be >= 0" +
					` (${this.minNumber})`
			);
		}

		if (this.maxNumber < this.minNumber) {
			throw new Error(
				"NumberOfMatches: minNumber must be <= maxNumber" +
					` (${this.minNumber} > ${this.maxNumber})`
			);
		}
	}

	/**
	 * Matches one or more times. (Static getter)
	 */
	public static get oneOrMore(): NumberOfMatches {
		return new NumberOfMatches(1, -1);
	}

	/**
	 * Matches zero or more times. (Static getter)
	 */
	public static get zeroOrMore(): NumberOfMatches {
		return new NumberOfMatches(0, -1);
	}

	/**
	 * Matches exactly the given number of times.
	 */
	public static exactly(number: number): NumberOfMatches {
		return new NumberOfMatches(number, number);
	}

	/**
	 * Matches between the given number of times.
	 */
	public static between(
		minNumber: number,
		maxNumber: number
	): NumberOfMatches {
		return new NumberOfMatches(minNumber, maxNumber);
	}

	/**
	 * Matches at least the given number of times.
	 *
	 */
	public static atLeast(number: number): NumberOfMatches {
		return new NumberOfMatches(number);
	}
}

/**
 * Defines the first and last matchers for a repeat matcher.
 */
export class AltFirstLastMatchers {
	protected constructor(
		public readonly altFirstMatch: MatchBase | null = null,
		public readonly altLastMatch: MatchBase | null = null
	) {}

	/**
	 * Returns the first and next matchers for a repeat matcher.
	 *
	 * If altFirstMatch is not null, Start is a MatchAny with altFirstMatch
	 * as the first matcher and contentMatcher as the second matcher.
	 *
	 * If altLastMatch is not null, Next is a MatchAny with contentMatcher
	 * as the first matcher and altLastMatch as the second matcher.
	 *
	 * If both altFirstMatch and altLastMatch are null, Start and Next are
	 * contentMatcher.
	 *
	 * @param contentMatcher The matcher to use for the content.
	 * @returns The first and next matchers.
	 */
	public getStartAndNextMatcher(
		contentMatcher: MatchBase
	): [MatchBase, MatchBase] {
		const firstMatch =
			this.altFirstMatch !== null
				? MatchAny.from(
						this.altFirstMatch,
						contentMatcher
					)
				: contentMatcher;

		const nextMatch =
			this.altLastMatch !== null
				? MatchAny.from(
						contentMatcher,
						this.altLastMatch
					)
				: contentMatcher;

		return [firstMatch, nextMatch];
	}

	/**
	 * Creates a new AltFirstLastMatchers instance with the given matchers.
	 *
	 * @param altFirstMatch The first matcher.
	 * @param altLastMatch The last matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	public static from(
		altFirstMatch: MatchBase,
		altLastMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(
			altFirstMatch,
			altLastMatch
		);
	}

	/**
	 * Creates a new AltFirstLastMatchers instance with only the altFirstMatch.
	 *
	 * @param altFirstMatch The first matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	public static fromAltFirst(
		altFirstMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(altFirstMatch, null);
	}

	/**
	 * Creates a new AltFirstLastMatchers instance with only the altLastMatch.
	 *
	 * @param altLastMatch The last matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	public static fromAltLast(
		altLastMatch: MatchBase
	): AltFirstLastMatchers {
		return new AltFirstLastMatchers(null, altLastMatch);
	}

	/**
	 * Returns the default AltFirstLastMatchers instance.
	 *
	 * The default instance has null for both altFirstMatch and altLastMatch.
	 *
	 * @returns The default AltFirstLastMatchers instance.
	 */
	public static get default(): AltFirstLastMatchers {
		return AltFirstLastMatchers._default;
	}

	private static _default = new AltFirstLastMatchers();
}

const matchRepeatSteps = [
	"First Matcher",
	"Content Matcher",
	"Last Matcher",
] as const;

type MatchRepeatStep = (typeof matchRepeatSteps)[number];

export const matchRepeatStepNav = new StepNav(
	matchRepeatSteps
);

/**
 * A repeat matcher.
 */
export class MatchRepeat extends MatchBase {
	/**
	 * Creates a new MatchRepeat instance.
	 *
	 * @param matcher The matcher to repeat.
	 * @param numberOfMatches The number of times to repeat.
	 * @param altFirstLastMatchers The altFirst and altLast matchers.
	 */
	public constructor(
		public readonly matcher: MatchBase,
		public readonly numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore,
		public readonly altFirstLastMatchers: AltFirstLastMatchers = AltFirstLastMatchers.default
	) {
		super();
	}

	/**
	 * Matches the repeat matcher according to the numberOfMatches
	 * and altFirstLastMatchers.
	 *
	 * If the number of matches is less than the minimum number of matches,
	 * the match fails.
	 *
	 * If the number of matches is greater than the maximum number of matches,
	 * the match fails.
	 *
	 * A succesful match will move the nav capture forward by the length of
	 * the match.
	 *
	 * If the match fails, the nav is invalidated and null returned.
	 *
	 * @param nav The navigation to match.
	 * @returns The navigation after matching, or null if no match.
	 */
	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		let count = 0;
		let currentNav = nav.copy();
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const beyondCount = max + 1;

		const firstMatcher =
			this.altFirstLastMatchers.altFirstMatch;
		const contentMatcher = this.matcher;
		const lastMatcher =
			this.altFirstLastMatchers.altLastMatch;

		const stepNav = matchRepeatStepNav.copyNew();

		let isFailedMatch = false;

		log(
			`>>> BEGIN: min: ${min} | max: ${max} | beyondCount: ${beyondCount}`
		);

		while (count < beyondCount && stepNav.isNotComplete) {
			log(
				`>>> DOING: min: ${min} | max: ${max} | beyondCount: ${beyondCount}`
			);

			/**
			 * The result of the current match.
			 *
			 * Will be null if the match fails.
			 * Will be null if firstMatcher or lastMatcher is null.
			 * So it is not a reliable indicator of failed match.
			 */
			let result: MutMatchNav | null = null;

			const isCurrentMatchEmpty = () => {
				if (result === null) {
					log(
						`>>> IS CURRENT MATCH EMPTY: TRUE: result is null`
					);
					return true;
				}

				const b =
					currentNav.captureIndex ===
					result.captureIndex;
				log(
					`>>> IS CURRENT MATCH EMPTY: ${b} | ${currentNav.captureIndex} === ${result.captureIndex}`
				);
				return b;
			};

			switch (stepNav.step) {
				case "First Matcher":
					log(
						`>>> ENTER First Matcher: exists: ${!!firstMatcher} | min: ${min} | max: ${max}`
					);
					if (firstMatcher) {
						result = firstMatcher.match(
							currentNav.copy()
						);
						log(
							`>>> firstMatcher result: ${result?.captureMatch.value}`
						);
						if (!result) {
							isFailedMatch = true;
						}
					}
					stepNav.next();
					break;
				case "Content Matcher":
					log(
						`>>> ENTER Content Matcher: min: ${min} | max: ${max}`
					);
					result = contentMatcher.match(
						currentNav.copy()
					);
					log(
						`>>> contentMatcher result: ${result?.captureMatch.value}`
					);
					if (!result) {
						isFailedMatch = true;
					}
					if (isCurrentMatchEmpty()) {
						stepNav.next();
					}
					break;
				case "Last Matcher":
					log(
						`>>> ENTER Last Matcher: exists: ${!!lastMatcher} | min: ${min} | max: ${max}`
					);
					if (lastMatcher) {
						result = lastMatcher.match(
							currentNav.copy()
						);
						log(
							`>>> lastMatcher result: ${result?.captureMatch.value}`
						);
						if (!result) {
							isFailedMatch = true;
						}
					}

					stepNav.next();
					break;
				default:
					throw "never";
			}

			if (isFailedMatch) {
				break;
			}

			if (isCurrentMatchEmpty() === false) {
				count++;
				log(
					`>>> count INC: ${count} | min: ${min} | max: ${max}`
				);
			} else {
				log(
					`>>> count NO INC: ${count} | min: ${min} | max: ${max}`
				);
			}

			if (result) {
				currentNav = result;
			}
		}

		if (count >= min && count <= max) {
			log(
				`>>> SUCCESS: min: ${min} | max: ${max} | count: ${count}` +
					` | nav: '${currentNav.captureMatch.value}'`
			);
			return currentNav;
		} else {
			log(
				`>>> FAILURE: min: ${min} | max: ${max} | count: ${count}`
			);
			return nav.invalidate();
		}
	}

	public match3(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		let count = 0;
		let currentNav = nav.copy();
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const beyondMaxCount = max + 1;

		const firstMatch =
			this.altFirstLastMatchers.altFirstMatch;
		const contentMatch = this.matcher;
		const lastMatch =
			this.altFirstLastMatchers.altLastMatch;

		let isFirstMatch = true;
		let isContentMatch = false;
		let isLastMatch = false;
		let isLastMatchDone = false;
		let isFailedMatch = false;
		log(
			`>>> BEGIN: min: ${min} | max: ${max} | lastCount: ${beyondMaxCount}`
		);

		while (
			count < beyondMaxCount &&
			isLastMatchDone === false
		) {
			log(
				`>>> DOING: min: ${min} | max: ${max} | lastCount: ${beyondMaxCount}`
			);

			let result: MutMatchNav | null = null;

			const isCurrentMatchEmpty = () => {
				if (result === null) {
					log(
						`>>> IS CURRENT MATCH EMPTY: TRUE: result is null`
					);
					return true;
				}

				const b =
					currentNav.captureIndex ===
					result.captureIndex;
				log(
					`>>> IS CURRENT MATCH EMPTY: ${b} | ${currentNav.captureIndex} === ${result.captureIndex}`
				);
				return b;
			};

			switch (true) {
				case isFirstMatch:
					log(
						`>>> ENTER isFirstMatch: min: ${min} | max: ${max}`
					);
					if (firstMatch) {
						log(
							`>>> ENTER firstMatch: min: ${min} | max: ${max}`
						);
						result = firstMatch.match(
							currentNav.copy()
						);
						log(
							`>>> firstMatch: ${result?.captureMatch.value}`
						);
						if (!result) {
							isFailedMatch = true;
						}
					}
					isFirstMatch = false;
					isContentMatch = true;
					break;
				case isContentMatch:
					log(
						`>>> ENTER isContentMatch: min: ${min} | max: ${max}`
					);
					result = contentMatch.match(
						currentNav.copy()
					);
					log(
						`>>> contentMatch: ${result?.captureMatch.value}`
					);
					if (!result) {
						isFailedMatch = true;
					}
					if (isCurrentMatchEmpty()) {
						isContentMatch = false;
						isLastMatch = true;
					}
					break;
				case isLastMatch:
					log(
						`>>> ENTER isLastMatch: min: ${min} | max: ${max}`
					);
					if (lastMatch) {
						log(
							`>>> ENTER lastMatch: min: ${min} | max: ${max}`
						);
						result = lastMatch.match(
							currentNav.copy()
						);
						log(
							`>>> lastMatch: ${result?.captureMatch.value}`
						);
						if (!result) {
							isFailedMatch = true;
						}
					}
					isLastMatch = false;
					isLastMatchDone = true;
					break;
				default:
					throw "never";
			}

			if (isFailedMatch) {
				break;
			}

			if (isCurrentMatchEmpty() === false) {
				count++;
				log(
					`>>> count INC: ${count} | min: ${min} | max: ${max}`
				);
			} else {
				log(
					`>>> count NO INC: ${count} | min: ${min} | max: ${max}`
				);
			}

			if (result) {
				currentNav = result;
			}
		}

		if (count >= min && count <= max) {
			log(
				`>>> SUCCESS: min: ${min} | max: ${max} | count: ${count}` +
					` | nav: '${currentNav.captureMatch.value}'`
			);
			return currentNav;
		} else {
			log(
				`>>> FAILURE: min: ${min} | max: ${max} | count: ${count}`
			);
			return nav.invalidate();
		}
	}

	public match2(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();
		let count = 0;
		let currentNav = nav.copy();
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const lastCount = max + 1;

		const firstMatch =
			this.altFirstLastMatchers.altFirstMatch;
		const contentMatch = this.matcher;
		const lastMatch =
			this.altFirstLastMatchers.altLastMatch;

		let isFirstMatch = true;
		let isContentMatch = false;
		let isLastMatch = false;
		let isLastMatchDone = false;
		let isFailedMatch = false;
		log(
			`>>> BEGIN: min: ${min} | max: ${max} | lastCount: ${lastCount}`
		);

		while (
			count < lastCount &&
			isLastMatchDone === false
		) {
			log(
				`>>> DOING: min: ${min} | max: ${max} | lastCount: ${lastCount}`
			);

			let result: MutMatchNav | null = null;

			const isCurrentMatchEmpty = () => {
				if (result === null) {
					log(
						`>>> IS CURRENT MATCH EMPTY: TRUE: result is null`
					);
					return true;
				}

				const b =
					currentNav.captureIndex ===
					result.captureIndex;
				log(
					`>>> IS CURRENT MATCH EMPTY: ${b} | ${currentNav.captureIndex} === ${result.captureIndex}`
				);
				return b;
			};

			switch (true) {
				case isFirstMatch:
					log(
						`>>> ENTER isFirstMatch: min: ${min} | max: ${max}`
					);
					if (firstMatch) {
						log(
							`>>> ENTER firstMatch: min: ${min} | max: ${max}`
						);
						result = firstMatch.match(
							currentNav.copy()
						);
						log(
							`>>> firstMatch: ${result?.captureMatch.value}`
						);
						if (!result) {
							isFailedMatch = true;
						}
					}
					isFirstMatch = false;
					isContentMatch = true;
					break;
				case isContentMatch:
					log(
						`>>> ENTER isContentMatch: min: ${min} | max: ${max}`
					);
					result = contentMatch.match(
						currentNav.copy()
					);
					log(
						`>>> contentMatch: ${result?.captureMatch.value}`
					);
					if (!result) {
						isFailedMatch = true;
					}
					if (isCurrentMatchEmpty()) {
						isContentMatch = false;
						isLastMatch = true;
					}
					break;
				case isLastMatch:
					log(
						`>>> ENTER isLastMatch: min: ${min} | max: ${max}`
					);
					if (lastMatch) {
						log(
							`>>> ENTER lastMatch: min: ${min} | max: ${max}`
						);
						result = lastMatch.match(
							currentNav.copy()
						);
						log(
							`>>> lastMatch: ${result?.captureMatch.value}`
						);
						if (!result) {
							isFailedMatch = true;
						}
					}
					isLastMatch = false;
					isLastMatchDone = true;
					break;
				default:
					throw "never";
			}

			if (isFailedMatch) {
				break;
			}

			if (isCurrentMatchEmpty() === false) {
				count++;
				log(
					`>>> count INC: ${count} | min: ${min} | max: ${max}`
				);
			} else {
				log(
					`>>> count NO INC: ${count} | min: ${min} | max: ${max}`
				);
			}

			if (result) {
				currentNav = result;
			}
		}

		if (count >= min && count <= max) {
			log(
				`>>> SUCCESS: min: ${min} | max: ${max} | count: ${count}` +
					` | nav: '${currentNav.captureMatch.value}'`
			);
			return currentNav;
		} else {
			log(
				`>>> FAILURE: min: ${min} | max: ${max} | count: ${count}`
			);
			return nav.invalidate();
		}
	}

	/**
	 * Creates a new MatchRepeat instance.
	 *
	 * @param matcher The matcher to repeat.
	 * @param numberOfMatches The number of times to repeat.
	 * @param altFirstLastMatchers The altFirst and altLast matchers.
	 * @returns A new MatchRepeat instance.
	 */
	public static from(
		matcher: MatchBase,
		numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore,
		altFirstLastMatchers: AltFirstLastMatchers = AltFirstLastMatchers.default
	): MatchRepeat {
		return new MatchRepeat(
			matcher,
			numberOfMatches,
			altFirstLastMatchers
		);
	}
}
