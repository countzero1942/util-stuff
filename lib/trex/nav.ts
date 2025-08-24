import { StrSlice } from "@/utils/slice";
import {
	isCodePointLoneSurrogate,
	getCodePointCharLength,
} from "../utils/string";

/**
 * Move mode for navigation to safely move to next start index
 *
 * "MoveForward" checks for a capture to move beyond; otherwise
 * throws an error to prevent infinite loops.
 *
 * "LookForward" only looks ahead at start index or capture index.
 * So no worry about infinite loops.
 *
 * "MoveMatchAll" moves to the next match in a match-all expression.
 * Since matches can be optional with zero length, this move mode
 * is used after a successful match without checking capture length.
 */
export type NavMoveMode =
	| "MoveForward"
	| "LookForward"
	| "MoveMatchAll";

/**
 * MutMatchNav (Mutable Match Navigator)
 *
 * A core component of the trait-tree parser system that implements a mutable
 * navigation state for parsing text.
 *
 * The class follows the parser combinator pattern where:
 * - Matchers receive a MutMatchNav object and may mutate it
 * - Successful matches return the modified nav
 * - Failed matches return null
 * - The caller is responsible for saving nav state if backtracking is needed
 */
export class MutMatchNav {
	/** Starting position of the current match attempt */
	protected _startIndex: number;

	/** Position up to which text has been successfully captured */
	protected _captureIndex: number;

	/**
	 * Creates a new navigation state for parsing
	 *
	 * @param source The source text to navigate through
	 * @param startIndex Starting position in the source (default: 0)
	 */
	protected constructor(
		/**
		 * The source text being navigated
		 */
		public readonly source: StrSlice,
		/**
		 * Starting position in the source (default: 0)
		 */
		startIndex: number
	) {
		this.validateIndex(startIndex, "startIndex");
		this._startIndex = startIndex;
		this._captureIndex = startIndex;
	}

	/**
	 * Creates a new navigation state for parsing
	 *
	 * @param source The source text to navigate through
	 * @param startIndex Starting position in the source (default: 0)
	 */
	public static from(
		source: StrSlice,
		start: number = 0
	): MutMatchNav {
		return new MutMatchNav(source, start);
	}

	/**
	 * Creates a new navigation state for parsing from a first and last navigator
	 *
	 * @param first The first navigator
	 * @param last The last navigator
	 * @returns A new MutMatchNav with the same source and capture index as the first navigator
	 */
	public static fromFirstAndLast(
		first: MutMatchNav,
		last: MutMatchNav
	): MutMatchNav {
		first.assertNavIsValid();
		last.assertNavIsValid();
		if (first.source !== last.source) {
			throw new Error(
				"MutMatchNav.fromFirstAndLast: sources do not match"
			);
		}
		const nav = new MutMatchNav(
			first.source,
			first._startIndex
		);
		nav._captureIndex = last.captureIndex;
		return nav;
	}

	/**
	 * Creates a new navigation state for parsing from a string
	 *
	 * @param source The source text to navigate through
	 * @param startIndex Starting position in the source (default: 0)
	 */
	public static fromString(
		source: string,
		start: number = 0
	): MutMatchNav {
		return new MutMatchNav(StrSlice.from(source), start);
	}

	/**
	 * Advances both navigation and capture indices by one code point
	 * Used when a single code point has been successfully matched
	 *
	 * Throws if code point is undefined (beyond end of source)
	 *
	 * @returns This navigator instance for method chaining
	 */
	public moveCaptureForwardOneCodePoint(): MutMatchNav {
		this.assertNavIsValid();
		const currentCodePoint = this.peekCodePoint();
		if (currentCodePoint === undefined) {
			throw new Error(
				"moveCaptureForwardOneCodePoint: beyond end of source"
			);
		}
		const length = getCodePointCharLength(
			currentCodePoint
		);
		this._captureIndex += length;
		return this;
	}

	/**
	 * Advances both navigation and capture indices by the specified length
	 * Used when a string of known length has been successfully matched
	 *
	 * Throws if length goes beyond end of source
	 *
	 * @param length Number of characters to advance
	 * @returns This navigator instance for method chaining
	 */
	public moveCaptureForward(length: number): MutMatchNav {
		this.assertNavIsValid();
		if (length < 0) {
			throw new Error(
				"moveCaptureForward: length cannot be negative"
			);
		}
		this._captureIndex += length;
		if (this._captureIndex > this.source.length) {
			throw new Error(
				"moveCaptureForward: beyond end of source"
			);
		}
		return this;
	}

	/**
	 * Moves both navigation and capture indices to the end of the source
	 * Used to consume all remaining input
	 *
	 * No throw
	 *
	 * @returns This navigator instance for method chaining
	 */
	public moveCaptureToSourceEnd(): MutMatchNav {
		this.assertNavIsValid();
		this._captureIndex = this.source.length;
		return this;
	}

	/**
	 * Advances the start index and resets both navigation and capture indices
	 * Used when committing a match and starting a new match attempt
	 *
	 * Throws if code point is undefined (beyond end of source)
	 *
	 * @returns This navigator instance for method chaining
	 */
	public moveNextOneCodePoint(): MutMatchNav {
		this.assertNavIsValid();
		const currentCodePoint = this.peekCodePoint();
		if (currentCodePoint === undefined) {
			throw new Error(
				"moveNextOneCodePoint: beyond end of source"
			);
		}
		const length = getCodePointCharLength(
			currentCodePoint
		);
		this._startIndex += length;
		this._captureIndex = this._startIndex;
		return this;
	}

	/**
	 * Moves both navigation and capture indices to the end of the source
	 *
	 * @returns This navigator instance for method chaining
	 */
	public moveNextToSourceEnd(): MutMatchNav {
		this.assertNavIsValid();
		this._startIndex = this.source.length;
		this._captureIndex = this.source.length;
		return this;
	}

	/**
	 * Moves the start index to the navigation index
	 *
	 * @returns This navigator instance for method chaining
	 */
	public moveNext(
		moveMode: NavMoveMode = "MoveForward"
	): MutMatchNav {
		this.assertNavIsValid();
		this.assertIsMovable(moveMode);
		this._startIndex = this._captureIndex;
		return this;
	}

	/**
	 * Creates a deep copy of this navigation state
	 * Used for backtracking when a match attempt fails
	 *
	 * @returns A new MutMatchNav with the same state as this one
	 */
	public copy(): MutMatchNav {
		this.assertNavIsValid();
		const nav = new MutMatchNav(
			this.source,
			this._startIndex
		);
		nav._captureIndex = this._captureIndex;
		return nav;
	}

	/**
	 * Creates a new navigation state starting at the current capture index
	 * Used when committing a partial match and starting a new match attempt
	 *
	 * @returns A fresh MutMatchNav starting at the current capture index
	 */
	public copyAndMoveNext(
		moveMode: NavMoveMode = "MoveForward"
	): MutMatchNav {
		this.assertNavIsValid();
		this.assertIsMovable(moveMode);
		return new MutMatchNav(
			this.source,
			this._captureIndex
		);
	}

	/**
	 * Marks this navigation state as invalid and returns null
	 * Used to signal a failed match attempt
	 *
	 * @returns Always null, to be returned by the calling matcher
	 */
	public invalidate(): null {
		this._startIndex = -1;
		return null;
	}

	/**
	 * Ensures this navigation state is valid for looking
	 * at match results
	 *
	 * @throws Error if the navigation state is invalid
	 */
	public assertNavIsValid(): void {
		if (this._startIndex === -1) {
			throw new Error(
				"Illegal use of invalidated navigator"
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
	public assertNavIsNew(): void {
		if (this._captureIndex !== this._startIndex) {
			throw new Error(
				"Navigator is not new: it contains a match"
			);
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
	public assertIsMovable(moveMode: NavMoveMode): void {
		switch (moveMode) {
			case "MoveForward":
				if (this._startIndex === this._captureIndex) {
					throw new Error(
						"move-next infinite loop error: startIndex equals captureIndex " +
							"so it can never move forward!"
					);
				}
				break;
			case "LookForward":
			case "MoveMatchAll":
				return;
			default:
				throw new Error(
					`MutMatchNav.assertIsMovable: Invalid move mode: ${moveMode}`
				);
		}
	}

	/**
	 * Validates that the given index is within the bounds of the source slice
	 *
	 * @throws Error if the index is negative or beyond the end of the source
	 */
	protected validateIndex(
		index: number,
		indexName: string
	): void {
		if (index < 0) {
			throw new Error(
				`MutMatchNav: ${indexName} cannot be negative`
			);
		}
		if (index > this.source.length) {
			throw new Error(
				`MutMatchNav: ${indexName} cannot be beyond end of source`
			);
		}
	}

	/**
	 * Examines the current code point without advancing
	 *
	 * @returns The code point at the current navigation position, or undefined if at end
	 */
	public peekCodePoint(): number | undefined {
		this.assertNavIsValid();
		return this.source.codePointAt(this._captureIndex);
	}

	/**
	 * Looks at the previous code point (for lookbehind operations)
	 * Handles surrogate pairs correctly by navigating back at most 2 positions
	 *
	 * @returns The code point before the current position, or undefined if at start
	 */
	public peekBehindCodePoint(): number | undefined {
		this.assertNavIsValid();
		// this looks backwards to extract the code point
		// before the current position; navigating back at most 2 times
		let index = this._captureIndex - 1;
		let minIndex = this._captureIndex - 2;
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
	public peekBehindSliceByLength(
		length: number
	): StrSlice | undefined {
		this.assertNavIsValid();
		const index = this._captureIndex - length;
		if (index < 0) return undefined;
		return this.source.slice(index, this._captureIndex);
	}

	/**
	 * Examines the next code point (for lookahead operations)
	 * Handles surrogate pairs correctly
	 *
	 * @returns The code point after the current position, or undefined if at end
	 */
	public peekAheadCodePoint(): number | undefined {
		this.assertNavIsValid();
		return this.source.codePointAt(this._captureIndex);
	}

	/**
	 * Gets the starting position of the current match attempt
	 */
	public get startIndex(): number {
		this.assertNavIsValid();
		return this._startIndex;
	}

	/**
	 * Checks if this navigation state has been invalidated
	 */
	public get isInvalidated(): boolean {
		return this._startIndex === -1;
	}

	/**
	 * Checks if nav index is at the beginning of the source slice
	 */
	public get isNavIndexAtSourceStart(): boolean {
		this.assertNavIsValid();
		return this._captureIndex === 0;
	}

	/**
	 * Checks if at the end of the source text
	 */
	public get isNavIndexAtSourceEnd(): boolean {
		this.assertNavIsValid();
		return this._captureIndex === this.source.length;
	}

	/**
	 * Gets the position up to which text has been successfully captured
	 */
	public get captureIndex(): number {
		this.assertNavIsValid();
		return this._captureIndex;
	}

	/**
	 * Gets the length of the current match (from start to capture position)
	 */
	public get captureLength(): number {
		this.assertNavIsValid();
		return this._captureIndex - this._startIndex;
	}

	/**
	 * Gets the successfully matched portion of the source text
	 */
	public get captureMatch(): StrSlice {
		this.assertNavIsValid();
		return this.source.slice(
			this._startIndex,
			this._captureIndex
		);
	}

	/**
	 * Checks if the current match is empty
	 */
	public get isEmptyMatch(): boolean {
		this.assertNavIsValid();
		return this._startIndex === this._captureIndex;
	}

	/**
	 * Gets a string representation of the navigation state
	 */
	public toString(): string {
		return this.isInvalidated
			? "Nav: INVALIDATED"
			: `Nav: [${this._startIndex}..${this._captureIndex}], length: ${this.source.length}`;
	}
}
