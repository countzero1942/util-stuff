import { StrSlice } from "@/utils/slice";

export class CodePointPrefixIndex<TElement> {
	private readonly dict: Record<number, TElement[]> = {};
	private readonly keyExtractor: (
		element: TElement
	) => string;

	/**
	 * Creates an index that groups elements by their first code point
	 * for efficient prefix-based lookups.
	 *
	 * @param elements Array of elements to index
	 * @param keyExtractor Function to extract the first code point from each element
	 */
	constructor(
		elements: TElement[] = [],
		keyExtractor: (element: TElement) => string
	) {
		this.keyExtractor = keyExtractor;
		if (elements.length > 0) {
			this.addAll(elements);
		}
	}

	/**
	 * Add all elements to the index
	 */
	public addAll(elements: TElement[]): void {
		for (const element of elements) {
			this.add(element);
		}
	}

	/**
	 * Add a single element to the index
	 */
	public add(element: TElement): void {
		const key = this.keyExtractor(element);
		if (key === undefined || key.length === 0) return;

		const codePoint = key.codePointAt(0) as number;

		if (this.dict[codePoint] === undefined) {
			this.dict[codePoint] = [];
		}
		this.dict[codePoint].push(element);
	}

	/**
	 * Remove an element from the index
	 * @returns true if the element was found and removed, false otherwise
	 */
	public remove(element: TElement): boolean {
		const key = this.keyExtractor(element);
		if (key === undefined || key.length === 0)
			return false;

		const codePoint = key.codePointAt(0) as number;
		if (!this.dict[codePoint]) {
			return false;
		}

		const array = this.dict[codePoint];
		const index = array.indexOf(element);
		if (index === -1) {
			return false;
		}

		array.splice(index, 1);
		if (array.length === 0) {
			delete this.dict[codePoint];
		}
		return true;
	}

	/**
	 * Get all elements that start with the given code point
	 */
	public getElementsByCodePoint(
		codePoint: number
	): TElement[] {
		return this.dict[codePoint] || [];
	}

	/**
	 * Get all elements that start with the first code point of the given string
	 */
	public getElementsByString(str: string): TElement[] {
		if (!str || str.length === 0) return [];
		const codePoint = str.codePointAt(0) as number;
		return this.getElementsByCodePoint(codePoint);
	}

	public getElementsBySlice(slice: StrSlice): TElement[] {
		const codePoint = slice.codePointAt(0) as number;
		return this.getElementsByCodePoint(codePoint);
	}

	/**
	 * Get all code points that have at least one element
	 */
	public getAllCodePoints(): number[] {
		return Object.keys(this.dict).map(key =>
			parseInt(key, 10)
		);
	}

	private allElements: TElement[] | undefined;
	/**
	 * Get all elements in the index
	 */
	public getAllElements(): TElement[] {
		if (this.allElements) return this.allElements;
		this.allElements = Object.values(this.dict).flat();
		return this.allElements;
	}

	private allKeyLengths: number[] | undefined;

	/**
	 * Get all unique key lengths sorted from lowest to highest
	 * Useful for lookbehind operations to determine how far back to check
	 */
	public getAllKeyLengths(): number[] {
		if (this.allKeyLengths) return this.allKeyLengths;
		const lengths = new Set<number>();

		for (const element of this.getAllElements()) {
			const key = this.keyExtractor(element);
			if (key && key.length > 0) {
				lengths.add(key.length);
			}
		}

		this.allKeyLengths = Array.from(lengths).sort(
			(a, b) => a - b
		);
		return this.allKeyLengths;
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

	/**
	 * Clear the index
	 */
	public clear(): void {
		for (const key in this.dict) {
			delete this.dict[key];
		}
		this.allElements = undefined;
		this.allKeyLengths = undefined;
	}

	/**
	 * Get the total number of elements in the index
	 */
	public get size(): number {
		return this.getAllElements().length;
	}
}
