import { StrSlice } from "@/utils/slice";
import {
	isCodePointLoneSurrogate,
	getCodePointCharLength,
} from "../utils/string";
import chalk from "chalk";

/**
 * Move mode for navigation to safely move to next start index
 *
 * "MustMoveForward": checks for a capture to move beyond; otherwise
 * throws an error to prevent infinite loops.
 *
 * "OptMoveForward": used in cases where matches can be zero-length
 * or look matches. This move mode does not check for a capture to move beyond.
 *
 */
export type NavMoveMode = "MustMoveForward" | "OptMoveForward";

export class MatchNav {
	/**
	 * Creates a new navigation state for parsing
	 *
	 * @param source The source text to navigate through
	 * @param startIndex Starting position in the source (default: 0)
	 */
	protected constructor(
		/**
		 * The source string view being navigated
		 */
		public readonly source: StrSlice,
		public readonly startIndex: number,
		public readonly captureIndex: number
	) {
		this.validateIndex(startIndex, "startIndex");
		this.validateIndex(captureIndex, "captureIndex");
	}

	/**
	 * Creates a new navigation state for parsing
	 *
	 * Sets both start and capture indices to 0.
	 *
	 * @param source The source text to navigate through
	 */
	static fromNew(source: StrSlice): MatchNav {
		return new MatchNav(source, 0, 0);
	}

	/**
	 * Creates a new navigation state for parsing
	 *
	 * Sets the start and capture indices to the given start index.
	 *
	 * @param source The source text to navigate through
	 * @param startIndex Starting position in the source
	 */
	static fromStart(source: StrSlice, startIndex: number): MatchNav {
		return new MatchNav(source, startIndex, startIndex);
	}

	/**
	 * Creates a new navigation state for parsing
	 *
	 * Sets the start index to the given start index
	 * and the capture index to the given capture index.
	 *
	 * @param source The source text to navigate through
	 * @param startIndex Starting position in the source
	 * @param captureIndex Capture position in the source
	 */
	static fromCapture(
		source: StrSlice,
		startIndex: number,
		captureIndex: number
	): MatchNav {
		return new MatchNav(source, startIndex, captureIndex);
	}

	/**
	 * Creates a new navigation state for parsing from a first and last navigator
	 *
	 * Sets the start index to the start index of the first navigator
	 * and the capture index to the capture index of the last navigator.
	 *
	 * @param first The first navigator
	 * @param last The last navigator
	 * @returns A new MatchNav with the same source and capture index as the first navigator
	 */
	static fromFirstAndLast(first: MatchNav, last: MatchNav): MatchNav {
		if (first.source !== last.source) {
			throw new Error(
				"MatchNav.fromFirstAndLast: sources do not match"
			);
		}
		return MatchNav.fromCapture(
			first.source,
			first.startIndex,
			last.captureIndex
		);
	}

	/**
	 * Creates a new navigation state for parsing from a string
	 *
	 * @param source The source text to navigate through
	 * @param start Starting position in the source (default: 0)
	 */
	static fromString(source: string, start: number = 0): MatchNav {
		return MatchNav.fromStart(StrSlice.from(source), start);
	}

	/**
	 * Advances both navigation and capture indices by one code point
	 * Used when a single code point has been successfully matched
	 *
	 * @throws Error if code point is undefined (beyond end of source)
	 *
	 * @returns A new MatchNav advanced by one code point
	 */
	moveCaptureForwardOneCodePoint(): MatchNav {
		const currentCodePoint = this.peekCodePoint();
		if (currentCodePoint === undefined) {
			throw new Error(
				"moveCaptureForwardOneCodePoint: beyond end of source"
			);
		}
		const length = getCodePointCharLength(currentCodePoint);
		return MatchNav.fromCapture(
			this.source,
			this.startIndex,
			this.captureIndex + length
		);
	}

	/**
	 * Advances capture index by the specified length
	 * Used when a string of known length has been successfully matched
	 *
	 * @throws Error if length goes beyond end of source
	 * @throws Error if length is negative
	 *
	 * @param length Number of characters to advance
	 * @returns A new MatchNav with advanced capture index
	 */
	moveCaptureForward(length: number): MatchNav {
		if (length < 0) {
			throw new Error("moveCaptureForward: length cannot be negative");
		}
		const newCaptureIndex = this.captureIndex + length;
		if (newCaptureIndex > this.source.length) {
			throw new Error(
				"moveCaptureForward: capture index beyond end of source"
			);
		}
		return MatchNav.fromCapture(
			this.source,
			this.startIndex,
			newCaptureIndex
		);
	}

	/**
	 * Moves capture to the end of the source
	 *
	 * @returns A new MatchNav at source end
	 */
	moveCaptureToSourceEnd(): MatchNav {
		return MatchNav.fromCapture(
			this.source,
			this.startIndex,
			this.source.length
		);
	}

	/**
	 * Advances start and capture by one code point (commit one code point)
	 *
	 * @throws Error if code point is undefined (beyond end of source)
	 *
	 * @returns A new MatchNav advanced by one code point for both indices
	 */
	moveNextOneCodePoint(): MatchNav {
		const currentCodePoint = this.peekCodePoint();
		if (currentCodePoint === undefined) {
			throw new Error("moveNextOneCodePoint: beyond end of source");
		}
		const length = getCodePointCharLength(currentCodePoint);
		return MatchNav.fromCapture(
			this.source,
			this.startIndex + length,
			this.captureIndex + length
		);
	}

	/**
	 * Moves both start and capture to the end of the source
	 *
	 * @returns A new MatchNav at source end
	 */
	moveNextToSourceEnd(): MatchNav {
		return MatchNav.fromCapture(
			this.source,
			this.source.length,
			this.source.length
		);
	}

	/**
	 * Commits the current capture (start = capture)
	 *
	 * @throws Error if navigation is caught in an infinite loop
	 * depending on NavMoveMode ("MustMoveForward" or "OptMoveForward")
	 *
	 * @param moveMode Move mode (defaults to "MustMoveForward")
	 * @returns A new MatchNav with start set to capture
	 */
	moveNext(moveMode: NavMoveMode = "MustMoveForward"): MatchNav {
		this.assertIsMovable(moveMode);
		return MatchNav.fromCapture(
			this.source,
			this.captureIndex,
			this.captureIndex
		);
	}

	/**
	 * Creates a copy of this navigator with the capture index
	 * shrunk by the specified length
	 *
	 * @throws Error if the capture index would become less than the start index
	 * @throws Error if the length is negative
	 *
	 * @param length Number of characters to shrink the capture index by
	 * @returns A new MatchNav with the capture index shrunk
	 */
	shrinkCapture(length: number): MatchNav {
		if (length < 0) {
			throw new Error(
				"MatchNav.shrinkCapture: length cannot be negative"
			);
		}

		const newCaptureIndex = this.captureIndex - length;
		if (newCaptureIndex < this.startIndex) {
			throw new Error(
				"MatchNav.shrinkCapture: capture index cannot be less than start index"
			);
		}

		return MatchNav.fromCapture(
			this.source,
			this.startIndex,
			newCaptureIndex
		);
	}

	/**
	 * Verifies the capture index is equal to start index
	 *
	 * Used to ensure a matcher is being applied to a fresh navigation state
	 *
	 * @throws Error if the nav holds a capture
	 */
	assertNavIsNew(): void {
		if (this.captureIndex !== this.startIndex) {
			throw new Error("Navigator is not new: it contains a capture");
		}
	}

	/**
	 * Verifies the navigation is movable based on the move mode:
	 * "MoveForward" or "LookForward"
	 *
	 * This is to prevent a navigation from getting caught in an infinite loop
	 * when moving forward.
	 *
	 * (When looking forward, the capture doesn't matter.)
	 *
	 * @throws Error if the navigation is caught in an infinite loop
	 */
	assertIsMovable(moveMode: NavMoveMode): void {
		switch (moveMode) {
			case "MustMoveForward":
				if (this.startIndex === this.captureIndex) {
					throw new Error(
						"move-next infinite loop error: startIndex equals captureIndex " +
							"so it can never move forward!"
					);
				}
				break;
			case "OptMoveForward":
				return;
			default:
				throw new Error(
					`MatchNav.assertIsMovable: Invalid move mode: ${moveMode}`
				);
		}
	}

	/**
	 * Validates that the given index is within the bounds of the source slice
	 *
	 * @throws Error if the index is negative or beyond the end of the source
	 */
	protected validateIndex(index: number, indexName: string): void {
		if (index < 0) {
			throw new Error(`MatchNav: ${indexName} cannot be negative`);
		}
		if (index > this.source.length) {
			throw new Error(
				`MatchNav: ${indexName} cannot be beyond end of source`
			);
		}
	}

	/**
	 * Examines the current code point without advancing
	 *
	 * @returns The code point at the current navigation position, or undefined if at end
	 */
	peekCodePoint(): number | undefined {
		return this.source.codePointAt(this.captureIndex);
	}

	/**
	 * Looks at the previous code point (for lookbehind operations)
	 * Handles surrogate pairs correctly by navigating back at most 2 positions
	 *
	 * @returns The code point before the current position, or undefined if at start
	 */
	peekBehindCodePoint(): number | undefined {
		// this looks backwards to extract the code point
		// before the current position; navigating back at most 2 times
		let index = this.captureIndex - 1;
		let minIndex = this.captureIndex - 2;
		while (index >= 0 && index >= minIndex) {
			const codePoint = this.source.codePointAt(index);
			if (
				codePoint !== undefined &&
				isCodePointLoneSurrogate(codePoint)
			) {
				index--;
				continue;
			}
			return codePoint;
		}
		return undefined;
	}

	/**
	 * Gets a slice of specified length before the current position
	 * Used for string-based lookbehind operations
	 *
	 * @param length Number of characters to look behind
	 * @returns A StrSlice containing the characters before the current position, or undefined if at start
	 */
	peekBehindSliceByLength(length: number): StrSlice | undefined {
		const index = this.captureIndex - length;
		if (index < 0) return undefined;
		return this.source.slice(index, this.captureIndex);
	}

	/**
	 * Examines the next code point (for lookahead operations)
	 * Handles surrogate pairs correctly
	 *
	 * @returns The code point after the current position, or undefined if at end
	 */
	peekAheadCodePoint(): number | undefined {
		return this.source.codePointAt(this.captureIndex);
	}

	/**
	 * Checks if nav index is at the beginning of the source slice
	 */
	get isCaptureIndexAtSourceStart(): boolean {
		return this.captureIndex === 0;
	}

	/**
	 * Checks if at the end of the source text
	 */
	get isCaptureIndexAtSourceEnd(): boolean {
		return this.captureIndex === this.source.length;
	}

	/**
	 * Gets the length of the current match (from start to capture position)
	 */
	get captureLength(): number {
		return this.captureIndex - this.startIndex;
	}

	/**
	 * Gets the successfully matched portion of the source text
	 */
	get captureMatch(): StrSlice {
		return this.source.slice(this.startIndex, this.captureIndex);
	}

	/**
	 * Checks if the current match is empty
	 */
	get isEmptyMatch(): boolean {
		return this.startIndex === this.captureIndex;
	}

	get fullView(): StrSlice {
		return this.source.slice(this.startIndex);
	}

	static #_empty: MatchNav = MatchNav.fromString("");
	static get empty(): MatchNav {
		return MatchNav.#_empty;
	}

	/**
	 * Creates a new navigation state for validation.
	 *
	 * Uses the capture match as the source slice for a new navigation state.
	 *
	 * @returns A new MatchNav with the same source and capture index
	 */
	toValidatorNav(): MatchNav {
		return MatchNav.fromNew(this.captureMatch);
	}

	/**
	 * Gets a string representation of the navigation state
	 */
	toString(): string {
		const navStr = chalk.magentaBright("Nav");
		return (
			`${navStr}: [${chalk.cyan(this.startIndex)}` +
			`..${chalk.cyan(this.captureIndex)}], ` +
			`'${chalk.green(this.captureMatch.value)}'`
		);
	}
}
