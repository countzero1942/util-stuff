import { MatchBase } from "./match-base";
import { MatchAny } from "./match-any-all-opt";
import { MutMatchNav } from "./nav";
import { log } from "console";
import { StepNav } from "@/utils/operations";
import chalk from "chalk";

/**
 * Defines the number of matches for a repeat matcher.
 */
export class NumberOfMatches {
	readonly minNumber: number;
	readonly maxNumber: number;

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
	static get oneOrMore(): NumberOfMatches {
		return new NumberOfMatches(1, -1);
	}

	/**
	 * Matches zero or more times. (Static getter)
	 */
	static get zeroOrMore(): NumberOfMatches {
		return new NumberOfMatches(0, -1);
	}

	/**
	 * Matches exactly the given number of times.
	 */
	static exactly(number: number): NumberOfMatches {
		return new NumberOfMatches(number, number);
	}

	/**
	 * Matches between the given number of times.
	 */
	static between(
		minNumber: number,
		maxNumber: number
	): NumberOfMatches {
		return new NumberOfMatches(minNumber, maxNumber);
	}

	/**
	 * Matches at least the given number of times.
	 *
	 */
	static atLeast(number: number): NumberOfMatches {
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
	 * Creates a new AltFirstLastMatchers instance with the given matchers.
	 *
	 * @param altFirstMatch The first matcher.
	 * @param altLastMatch The last matcher.
	 * @returns A new AltFirstLastMatchers instance.
	 */
	static fromBoth(
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
	static fromAltFirst(
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
	static fromAltLast(
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
	static get default(): AltFirstLastMatchers {
		return AltFirstLastMatchers._default;
	}

	private static _default = new AltFirstLastMatchers();
}

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
	private constructor(
		public readonly matcher: MatchBase,
		public readonly numberOfMatches: NumberOfMatches = NumberOfMatches.oneOrMore,
		public readonly altFirstLastMatchers: AltFirstLastMatchers = AltFirstLastMatchers.default
	) {
		super();
	}

	/**
	 * Creates a new MatchRepeat instance.
	 *
	 * @param matcher The matcher to repeat.
	 * @param numberOfMatches The number of times to repeat.
	 * @param altFirstLastMatchers The altFirst and altLast matchers.
	 * @returns A new MatchRepeat instance.
	 */
	static from(
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

	static #_matchRepeatStepNav = StepNav.fromSteps(
		"First Matcher",
		"Content Matcher",
		"Last Matcher"
	);

	/**
	 * Returns a new copy of the match repeat step nav.
	 */
	static getMatchRepeatStepNav() {
		return this.#_matchRepeatStepNav.copyNew();
	}

	matchContentOnly(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();

		let count = 0;
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const beyondCount = max + 1;

		let currentNav = nav.copy();

		const contentMatcher = this.matcher;

		while (count < beyondCount) {
			const isCurrentMatchEmpty = () => {
				if (result === null) {
					return true;
				}
				return (
					result.captureIndex ===
					currentNav.captureIndex
				);
			};

			const result = contentMatcher.match(
				currentNav.copy()
			);
			if (isCurrentMatchEmpty()) {
				break;
			}

			count++;

			if (result) {
				currentNav = result;
			}
		} // while (count < beyondCount)

		if (count >= min && count <= max) {
			return currentNav;
		} else {
			return nav.invalidate();
		}
	} // match

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
	match(nav: MutMatchNav): MutMatchNav | null {
		const firstMatcher =
			this.altFirstLastMatchers.altFirstMatch;
		const lastMatcher =
			this.altFirstLastMatchers.altLastMatch;

		if (!firstMatcher && !lastMatcher) {
			return this.matchContentOnly(nav);
		}

		nav.assertNavIsValid();

		const contentMatcher = this.matcher;

		let count = 0;
		const min = this.numberOfMatches.minNumber;
		const max = this.numberOfMatches.maxNumber;
		const beyondCount = max + 1;

		let currentNav = nav.copy();

		const stepNav = MatchRepeat.getMatchRepeatStepNav();

		let isFailedMatch = false;
		let didContentMatch = false;

		while (count < beyondCount && stepNav.isNotComplete) {
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
					return true;
				}
				return (
					result.captureIndex ===
					currentNav.captureIndex
				);
			};

			const doAltMatcher = (
				altMatcher: MatchBase | null
			) => {
				if (altMatcher) {
					result = altMatcher.match(currentNav.copy());
					if (!result) {
						isFailedMatch = true;
					}
				}
				stepNav.next();
			};

			switch (stepNav.step) {
				case "First Matcher":
					doAltMatcher(firstMatcher);
					break;
				case "Content Matcher":
					result = contentMatcher.match(
						currentNav.copy()
					);
					if (result) {
						didContentMatch = true;
					}
					if (!result && didContentMatch === false) {
						isFailedMatch = true;
					}
					if (isCurrentMatchEmpty()) {
						stepNav.next();
					}
					break;
				case "Last Matcher":
					doAltMatcher(lastMatcher);
					break;
				default:
					throw "never";
			}

			// note: result will also be null on failed match
			if (isFailedMatch) {
				break;
			}

			if (isCurrentMatchEmpty() === false) {
				count++;
			}

			// note: result here is only null if altMatcher is null
			// and no matching took place
			if (result) {
				currentNav = result;
			}
		} // while (count < beyondCount && stepNav.isNotComplete)

		// case: successful match in range
		if (
			isFailedMatch === false &&
			count >= min &&
			count <= max
		) {
			return currentNav;
			// case: failed match with zero matches allowed
		} else if (
			isFailedMatch === true &&
			count === 0 &&
			min === 0
		) {
			return nav;
			// case: failed match
		} else {
			return nav.invalidate();
		}
	} // match
}
