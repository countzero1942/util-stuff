import { StrSlice } from "@/utils/slice";
import {
	isLoneSurrogate,
	getCodePointCharLength,
} from "./string";

export type FindResult = {
	matchNav: MutMatchNav | null;
	fragmentNav: MutMatchNav;
};

export class MutMatchNav {
	private _startIndex: number;
	private _navIndex: number;
	private _captureIndex: number;
	private _isInvalidated: boolean = false;
	constructor(
		public readonly source: StrSlice,
		start: number = 0
	) {
		this._startIndex = start;
		this._navIndex = start;
		this._captureIndex = start;
	}

	public moveCaptureForwardOneCodePoint(): MutMatchNav {
		const currentCodePoint = this.getCodePoint();
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

	public moveCaptureForward(length: number): MutMatchNav {
		this._navIndex += length;
		this._captureIndex += length;
		return this;
	}

	public moveCaptureToEnd(): MutMatchNav {
		this._navIndex = this.source.length;
		this._captureIndex = this.source.length;
		return this;
	}

	public moveStartForward(length: number): MutMatchNav {
		this._startIndex += length;
		this._captureIndex = this._startIndex;
		this._navIndex = this._startIndex;
		return this;
	}

	public moveGhostCaptureForward(
		length: number
	): MutMatchNav {
		this._navIndex += length;
		return this;
	}

	public copy(): MutMatchNav {
		const nav = new MutMatchNav(
			this.source,
			this._startIndex
		);
		nav._navIndex = this._navIndex;
		nav._captureIndex = this._captureIndex;
		return nav;
	}

	public copyAndMoveStartToNavIndex(): MutMatchNav {
		const nav = new MutMatchNav(
			this.source,
			this._navIndex
		);
		return nav;
	}

	public splitFragmentAndMatch(
		matchStart: number,
		matchLength: number
	): FindResult {
		const matchNav = this.copy()
			.moveStartForward(matchStart)
			.moveCaptureForward(matchLength);
		const fragmentNav =
			this.copy().moveCaptureForward(matchStart);
		return { matchNav, fragmentNav };
	}

	public invalidate(): null {
		this._isInvalidated = true;
		return null;
	}

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

	public getCodePoint(): number | undefined {
		return this.source.codePointAt(this._navIndex);
	}

	public getBeforeCodePoint(): number | undefined {
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

	public get startIndex() {
		return this._startIndex;
	}

	public get navIndex() {
		return this._navIndex;
	}

	public get isInvalidated() {
		return this._isInvalidated;
	}

	public get isStartSlice() {
		return this._navIndex === 0;
	}

	public get isEndSlice() {
		return this._navIndex === this.source.length;
	}

	public get captureIndex() {
		return this._captureIndex;
	}

	public get captureLength(): number {
		return this._captureIndex - this._startIndex;
	}

	public get ghostCaptureLength(): number {
		return this._navIndex - this._captureIndex;
	}

	public get accumulatedMatch(): StrSlice {
		return this.source.slice(
			this._startIndex,
			this._captureIndex
		);
	}

	public get ghostMatch(): StrSlice {
		return this.source.slice(
			this._captureIndex,
			this._navIndex
		);
	}
}
