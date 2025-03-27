import { StrSlice } from "@/utils/slice";
import {
	isLoneSurrogate,
	getCodePointCharLength,
} from "../utils/string";

/**
 * MutMatchNav (Mutable Match Navigator)
 *
 * A core component of the trait-tree parser system that implements a mutable
 * navigation state for parsing text. It maintains positional tracking using
 * a three-index model to support complex parsing operations.
 *
 * The class follows the parser combinator pattern where:
 * - Matchers receive a MutMatchNav object and may mutate it
 * - Successful matches return the modified nav
 * - Failed matches return null
 * - The caller is responsible for saving nav state if backtracking is needed
 */
export class MutMatchNav {
	/** Starting position of the current match attempt */
	private _startIndex: number;

	/** Current navigation position during parsing */
	private _navIndex: number;

	/** Position up to which text has been successfully captured */
	private _captureIndex: number;

	/** Flag indicating if this navigation state has been invalidated */
	private _isInvalidated: boolean = false;

	/**
	 * Creates a new navigation state for parsing
	 *
	 * @param source The source text to navigate through
	 * @param start Starting position in the source (default: 0)
	 */
	constructor(
		/**
		 * The source text being navigated
		 */
		public readonly source: StrSlice,
		/**
		 * Starting position in the source (default: 0)
		 */
		start: number = 0
	) {
		this._startIndex = start;
		this._navIndex = start;
		this._captureIndex = start;
	}

	/**
	 * Advances both navigation and capture indices by one code point
	 * Used when a single code point has been successfully matched
	 *
	 * @returns This navigator instance for method chaining
	 */
	public moveCaptureForwardOneCodePoint(): MutMatchNav {
		const currentCodePoint = this.peekCodePoint();
		if (currentCodePoint === undefined) {
			return this;
		}
		const length = getCodePointCharLength(
			currentCodePoint
		);
		this._navIndex += length;
		this._captureIndex += length;
		return this;
	}

	/**
	 * Advances both navigation and capture indices by the specified length
	 * Used when a string of known length has been successfully matched
	 *
	 * @param length Number of characters to advance
	 * @returns This navigator instance for method chaining
	 */
	public moveCaptureForward(length: number): MutMatchNav {
		this._navIndex += length;
		this._captureIndex += length;
		return this;
	}

	/**
	 * Moves both navigation and capture indices to the end of the source
	 * Used to consume all remaining input
	 *
	 * @returns This navigator instance for method chaining
	 */
	public moveCaptureToEnd(): MutMatchNav {
		this._navIndex = this.source.length;
		this._captureIndex = this.source.length;
		return this;
	}

	/**
	 * Advances the start index and resets both navigation and capture indices
	 * Used when committing a match and starting a new match attempt
	 *
	 * @param length Number of characters to advance the start position
	 * @returns This navigator instance for method chaining
	 */
	public moveStartForward(
		length: number = 0
	): MutMatchNav {
		this._startIndex = this._navIndex + length;
		this._captureIndex = this._startIndex;
		this._navIndex = this._startIndex;
		return this;
	}

	public moveStartForwardOneCodePoint(): MutMatchNav {
		const currentCodePoint = this.peekCodePoint();
		if (currentCodePoint === undefined) {
			return this;
		}
		const length = getCodePointCharLength(
			currentCodePoint
		);
		this._startIndex += length;
		this._navIndex = this._startIndex;
		this._captureIndex = this._startIndex;
		return this;
	}

	/**
	 * Advances only the navigation index, creating a "ghost capture" (lookahead)
	 * Used for positive lookahead assertions without consuming input
	 *
	 * @param length Number of characters to advance the navigation position
	 * @returns This navigator instance for method chaining
	 */
	public moveGhostCaptureForward(
		length: number
	): MutMatchNav {
		this._navIndex += length;
		return this;
	}

	/**
	 * Creates a deep copy of this navigation state
	 * Used for backtracking when a match attempt fails
	 *
	 * @returns A new MutMatchNav with the same state as this one
	 */
	public copy(): MutMatchNav {
		const nav = new MutMatchNav(
			this.source,
			this._startIndex
		);
		nav._navIndex = this._navIndex;
		nav._captureIndex = this._captureIndex;
		return nav;
	}

	/**
	 * Creates a new navigation state starting at the current navigation position
	 * Used when committing a partial match and starting a new match attempt
	 *
	 * @returns A fresh MutMatchNav starting at the current navigation position
	 */
	public copyAndMoveStartToNav(): MutMatchNav {
		return new MutMatchNav(this.source, this._navIndex);
	}

	public copyAndMoveStartToIndex(
		index: number
	): MutMatchNav {
		return new MutMatchNav(this.source, index);
	}

	/**
	 * Marks this navigation state as invalid and returns null
	 * Used to signal a failed match attempt
	 *
	 * @returns Always null, to be returned by the calling matcher
	 */
	public invalidate(): null {
		this._isInvalidated = true;
		return null;
	}

	/**
	 * Ensures this navigation state is valid for matching
	 *
	 * Throws an error if the state has been invalidated or has an illegal ghost capture
	 *
	 * @throws Error if the navigation state is invalid
	 */
	public assertValid(): void {
		if (this._isInvalidated) {
			throw new Error("Illegal use of invalidated Nav");
		}
		if (this._navIndex > this._captureIndex) {
			throw new Error(
				"Nav has ghost capture at end: cannot match further"
			);
		}
	}

	/**
	 * Verifies the navigation is at its starting position
	 *
	 * Used to ensure a matcher is being applied to a fresh navigation state
	 *
	 * @throws Error if the navigation has been moved from its start position
	 */
	public assertFresh(): void {
		if (
			this._navIndex !== this._startIndex ||
			this._captureIndex !== this._startIndex
		) {
			throw new Error(
				"Nav is not fresh: it contains some form of match"
			);
		}
	}

	/**
	 * Examines the current code point without advancing
	 *
	 * @returns The code point at the current navigation position, or undefined if at end
	 */
	public peekCodePoint(): number | undefined {
		return this.source.codePointAt(this._navIndex);
	}

	/**
	 * Looks at the previous code point (for lookbehind operations)
	 * Handles surrogate pairs correctly by navigating back at most 2 positions
	 *
	 * @returns The code point before the current position, or undefined if at start
	 */
	public peekBeforeCodePoint(): number | undefined {
		// this navigates backwards to extract the code point
		// before the current position; navigating back at most 2 times
		let index = this._navIndex - 1;
		let minIndex = this._navIndex - 2;
		while (index >= 0 && index >= minIndex) {
			const codePoint = this.source.codePointAt(index);
			if (codePoint === undefined) {
				return undefined;
			}
			if (isLoneSurrogate(codePoint)) {
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
	public peekBeforeSliceByLength(
		length: number
	): StrSlice | undefined {
		const index = this._navIndex - length;
		if (index < 0) return undefined;
		return this.source.slice(index, this._navIndex);
	}

	/**
	 * Examines the next code point (for lookahead operations)
	 * Handles surrogate pairs correctly
	 *
	 * @returns The code point after the current position, or undefined if at end
	 */
	public peekAfterCodePoint(): number | undefined {
		// this navigates forwards to extract the code point
		// after the current position; navigating forward at most 2 times

		const codePoint = this.source.codePointAt(
			this._navIndex
		);
		if (codePoint === undefined) {
			return undefined;
		}
		const codePointLength =
			getCodePointCharLength(codePoint);

		let index = this._navIndex + codePointLength;
		if (index < this.source.length) {
			return this.source.codePointAt(index);
		}
		return undefined;
	}

	/**
	 * Gets the starting position of the current match attempt
	 */
	public get startIndex(): number {
		return this._startIndex;
	}

	/**
	 * Gets the current navigation position
	 */
	public get navIndex(): number {
		return this._navIndex;
	}

	/**
	 * Checks if this navigation state has been invalidated
	 */
	public get isInvalidated(): boolean {
		return this._isInvalidated;
	}

	/**
	 * Checks if at the beginning of the source text
	 */
	public get isStartSlice(): boolean {
		return this._navIndex === 0;
	}

	/**
	 * Checks if at the end of the source text
	 */
	public get isEndSlice(): boolean {
		return this._navIndex === this.source.length;
	}

	/**
	 * Gets the position up to which text has been successfully captured
	 */
	public get captureIndex(): number {
		return this._captureIndex;
	}

	/**
	 * Gets the length of the current match (from start to capture position)
	 */
	public get captureLength(): number {
		return this._captureIndex - this._startIndex;
	}

	/**
	 * Gets the length of the lookahead portion (from capture to navigation position)
	 */
	public get ghostCaptureLength(): number {
		return this._navIndex - this._captureIndex;
	}

	/**
	 * Gets the successfully matched portion of the source text
	 */
	public get captureMatch(): StrSlice {
		return this.source.slice(
			this._startIndex,
			this._captureIndex
		);
	}

	/**
	 * Gets the ghost capture portion of the source text.
	 * This is the portion between _captureIndex and _navIndex,
	 * representing text that has been navigated but not yet committed to the capture.
	 */
	public get ghostMatch(): StrSlice {
		return this.source.slice(
			this._captureIndex,
			this._navIndex
		);
	}
}
