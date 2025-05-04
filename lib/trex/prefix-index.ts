import { StrSlice } from "@/utils/slice";

export class CodePointPrefixIndex<TElement> {
	private readonly dict: Record<number, TElement[]> = {};
	private readonly keyExtractor: (
		element: TElement
	) => string;

	private addAll(elements: TElement[]): void {
		for (const element of elements) {
			this.add(element);
		}
	}

	private add(element: TElement): void {
		const key = this.keyExtractor(element);
		if (key === undefined || key.length === 0) return;

		const codePoint = key.codePointAt(0) as number;

		if (this.dict[codePoint] === undefined) {
			this.dict[codePoint] = [];
		}
		this.dict[codePoint].push(element);
	}

	/**
	 * Creates an index that groups elements by their first code point
	 * for efficient prefix-based lookups.
	 *
	 * This object is immutable and its state is cached for performance.
	 *
	 * @param elements Array of elements to index
	 * @param keyExtractor Function to extract the first code point from each element
	 */
	private constructor(
		elements: TElement[],
		keyExtractor: (element: TElement) => string
	) {
		this.keyExtractor = keyExtractor;
		if (elements.length > 0) {
			this.addAll(elements);
		}
	}

	public static from<TElement>(
		elements: TElement[],
		keyExtractor: (element: TElement) => string
	): CodePointPrefixIndex<TElement> {
		return new CodePointPrefixIndex(
			elements,
			keyExtractor
		);
	}

	public static fromStrings(
		strings: string[]
	): CodePointPrefixIndex<string> {
		return CodePointPrefixIndex.from(strings, str => str);
	}

	/**
	 * Get all elements that start with the given code point
	 */
	public getElementsByCodePoint(
		codePoint: number
	): TElement[] {
		return this.dict[codePoint] ?? [];
	}

	/**
	 * Get all elements that start with the first code point of the given string
	 */
	public getElementsByString(str: string): TElement[] {
		if (!str || str.length === 0) return [];
		const codePoint = str.codePointAt(0) as number;
		return this.getElementsByCodePoint(codePoint);
	}

	/**
	 * Get all elements that start with the first code point of the given slice
	 */
	public getElementsBySlice(slice: StrSlice): TElement[] {
		const codePoint = slice.codePointAt(0) as number;
		return this.getElementsByCodePoint(codePoint);
	}

	/**
	 * Get all code points that have at least one element
	 *
	 * This method is not cached
	 */
	public getAllCodePoints(): number[] {
		return Object.keys(this.dict).map(key =>
			parseInt(key, 10)
		);
	}

	/**
	 * Get all elements in the index
	 *
	 * This method is not cached
	 */
	public getAllElements(): TElement[] {
		return Object.values(this.dict).flat();
	}

	private _allKeyLengths: number[] | undefined;

	/**
	 * Get all unique key lengths sorted from lowest to highest
	 *
	 * Useful for lookbehind operations to determine how far back to check
	 *
	 * This method is cached
	 */
	public getAllKeyLengths(): number[] {
		if (this._allKeyLengths) return this._allKeyLengths;

		const lengths = new Set<number>();

		for (const element of this.getAllElements()) {
			const key = this.keyExtractor(element);
			if (key !== undefined && key.length > 0) {
				lengths.add(key.length);
			}
		}

		this._allKeyLengths = Array.from(lengths).sort(
			(a, b) => a - b
		);
		return this._allKeyLengths;
	}

	/**
	 * Check if the index contains any elements for the given code point
	 */
	public hasCodePoint(codePoint: number): boolean {
		return (
			this.dict[codePoint] !== undefined &&
			this.dict[codePoint].length > 0
		);
	}

	/**
	 * Check if the index contains the element whose key matches the given string
	 */
	public hasString(str: string): boolean {
		const elements = this.getElementsByString(str);
		return elements.some(
			element => this.keyExtractor(element) === str
		);
	}

	/**
	 * Check if the index contains the element whose key matches the given slice
	 */
	public hasSlice(slice: StrSlice): boolean {
		const elements = this.getElementsBySlice(slice);
		return elements.some(element =>
			slice.equals(this.keyExtractor(element))
		);
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
