import {
	MatchBase,
	MatchStringBase,
} from "@/trex/match-base";
import { MutMatchNav } from "@/trex/nav";
import { CodePointPrefixIndex } from "@/trex/prefix-index";

export class MatchAnyString extends MatchStringBase {
	protected constructor(
		public readonly index: CodePointPrefixIndex<string>
	) {
		super();
	}

	public match(nav: MutMatchNav): MutMatchNav | null {
		nav.assertNavIsValid();

		// Get the first code point from the current position
		const codePoint = nav.source.codePointAt(
			nav.navIndex
		);
		if (codePoint === undefined) return nav.invalidate();

		// Use the index to find potential matches
		const candidates =
			this.index.getElementsByCodePoint(codePoint);
		if (candidates.length === 0) return nav.invalidate();

		// Check each candidate string
		for (const matchValue of candidates) {
			if (
				nav.source.startsWith(matchValue, nav.navIndex)
			) {
				nav.moveCaptureForward(matchValue.length);
				return nav;
			}
		}

		return nav.invalidate();
	}

	public matchString(string: string): boolean {
		return this.index.hasString(string);
	}

	/**
	 * Factory method to create a MatchAnyString from an array of strings
	 */
	public static fromStrings(
		...matchValues: string[]
	): MatchAnyString {
		const index =
			CodePointPrefixIndex.fromStrings(matchValues);
		return new MatchAnyString(index);
	}
}
