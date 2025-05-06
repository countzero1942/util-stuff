import { StrSlice } from "@/utils/slice";

/**
 * Creates an index that groups elements by their first code point
 * for efficient prefix-based lookups.
 *
 * This object is immutable and its state is cached for performance.
 *
 * @param elements Array of elements to index
 * @param keyExtractor Function to extract the first code point from each element
 */
export class CodePointPrefixIndex<TElement> {
	#prefixIndex: Map<number, readonly TElement[]>;
	#keyExtractor: (element: TElement) => string;

	private static createPrefixIndex<TElement>(
		elements: readonly TElement[],
		keyExtractor: (element: TElement) => string
	): Map<number, readonly TElement[]> {
		// create mutable prefix index
		const mutPrefixIndex = new Map<number, TElement[]>();
		for (const element of elements) {
			const key = keyExtractor(element);
			if (key === undefined || key.length === 0)
				continue;

			const codePoint = key.codePointAt(0) as number;

			if (!mutPrefixIndex.has(codePoint)) {
				mutPrefixIndex.set(codePoint, []);
			}
			mutPrefixIndex.get(codePoint)!.push(element);
		}

		// create immutable prefix index
		const prefixIndex = new Map<
			number,
			readonly TElement[]
		>();
		for (const [codePoint, elements] of mutPrefixIndex) {
			prefixIndex.set(codePoint, elements.slice());
		}
		return prefixIndex;
	}

	/**
	 * Creates an index that groups elements by their first code point
	 * for efficient prefix-based lookups.
	 *
	 * This object is immutable and parts of its state are cached for performance.
	 *
	 * @param elements Array of elements to index
	 * @param keyExtractor Function to extract the first code point from each element
	 */
	private constructor(
		prefixIndex: Map<number, readonly TElement[]>,
		keyExtractor: (element: TElement) => string
	) {
		this.#prefixIndex = prefixIndex;
		this.#keyExtractor = keyExtractor;
	}

	/**
	 * Creates an index that groups elements by their first code point
	 * for efficient prefix-based lookups.
	 *
	 * This object is immutable and parts of its state are cached for performance.
	 *
	 * @param elements Array of elements to index
	 * @param keyExtractor Function to extract the first code point from each element
	 */
	public static fromElements<TElement>(
		elements: readonly TElement[],
		keyExtractor: (element: TElement) => string
	): CodePointPrefixIndex<TElement> {
		return new CodePointPrefixIndex(
			CodePointPrefixIndex.createPrefixIndex(
				elements,
				keyExtractor
			),
			keyExtractor
		);
	}

	/**
	 * Creates an index that groups strings by their first code point
	 * for efficient prefix-based lookups.
	 *
	 * This object is immutable and parts of its state are cached for performance.
	 *
	 * @param strings Array of strings to index
	 */
	public static fromStrings(
		strings: readonly string[]
	): CodePointPrefixIndex<string> {
		return CodePointPrefixIndex.fromElements(
			strings,
			str => str
		);
	}

	/**
	 * Get all elements that start with the given code point
	 */
	public getElementsByCodePoint(
		codePoint: number
	): readonly TElement[] {
		return this.#prefixIndex.get(codePoint) ?? [];
	}

	/**
	 * Get all elements that start with the first code point of the given string
	 */
	public getElementsByString(
		str: string
	): readonly TElement[] {
		if (!str || str.length === 0) return [];
		const codePoint = str.codePointAt(0) as number;
		return this.getElementsByCodePoint(codePoint);
	}

	/**
	 * Get all elements that start with the first code point of the given slice
	 */
	public getElementsBySlice(
		slice: StrSlice
	): readonly TElement[] {
		if (!slice || slice.isEmpty) return [];
		const codePoint = slice.codePointAt(0) as number;
		return this.getElementsByCodePoint(codePoint);
	}

	/**
	 * Get all code points that have at least one element
	 *
	 * This method is not cached
	 */
	public getAllCodePoints(): readonly number[] {
		return Array.from(this.#prefixIndex.keys());
	}

	/**
	 * Get all elements in the index
	 *
	 * This method is not cached
	 */
	public getAllElements(): readonly TElement[] {
		return Array.from(this.#prefixIndex.values()).flat();
	}

	private _allKeyLengths: readonly number[] | undefined;

	/**
	 * Get all unique key lengths sorted from lowest to highest
	 *
	 * Useful for lookbehind operations to determine how far back to check
	 *
	 * This method is cached
	 */
	public getAllKeyLengths(): readonly number[] {
		if (this._allKeyLengths) return this._allKeyLengths;

		const lengths = new Set<number>();

		for (const element of this.getAllElements()) {
			const key = this.#keyExtractor(element);
			if (key !== undefined && key.length > 0) {
				lengths.add(key.length);
			}
		}

		this._allKeyLengths = Array.from(lengths).sort(
			(a, b) => a - b
		) as readonly number[];
		return this._allKeyLengths;
	}

	/**
	 * Check if the index contains any elements for the given code point
	 */
	public hasCodePoint(codePoint: number): boolean {
		return (
			this.#prefixIndex.has(codePoint) &&
			this.#prefixIndex.get(codePoint)!.length > 0
		);
	}

	/**
	 * Check if the index contains the element whose key matches the given string
	 */
	public hasString(str: string): boolean {
		const elements = this.getElementsByString(str);
		return elements.some(
			element => this.#keyExtractor(element) === str
		) as boolean;
	}

	/**
	 * Check if the index contains the element whose key matches the given slice
	 */
	public hasSlice(slice: StrSlice): boolean {
		const elements = this.getElementsBySlice(slice);
		return elements.some(element =>
			slice.equals(this.#keyExtractor(element))
		) as boolean;
	}

	private _size: number | undefined;
	/**
	 * Get the total number of elements in the index
	 *
	 * This method is cached
	 */
	public get size(): number {
		if (this._size === undefined) {
			this._size = this.getAllElements().length;
		}
		return this._size;
	}
}
