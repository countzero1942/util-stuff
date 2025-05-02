import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import {
	MatchStartSlice,
	MatchEndSlice,
} from "@/trex/match-position";

describe("MatchStartSlice", () => {
	

	beforeEach(() => {
		
	});

	it("matches at the beginning of the slice", () => {
		const nav = MutMatchNav.fromString("test string");

		const result = MatchStartSlice.default.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(0);
	});

	it("does not match when not at the beginning of the slice", () => {
		const nav = MutMatchNav.fromString("test string", 3);

		const result = MatchStartSlice.default.match(nav);

		expect(result).toBeNull();
	});

	it("works with empty string", () => {
		const nav = MutMatchNav.fromString("");

		const result = MatchStartSlice.default.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(0);
	});

	it("does not mutate the navigation state on success", () => {
		const nav = MutMatchNav.fromString("test string");
		const originalNavIndex = nav.navIndex;

		const result = MatchStartSlice.default.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(originalNavIndex);
	});
});

describe("MatchEndSlice", () => {
	

	beforeEach(() => {
		
	});

	it("matches at the end of the slice", () => {
		const nav = MutMatchNav.fromString("test string", 11);
		//                                  01234567890
		const result = MatchEndSlice.default.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(nav.source.length);
	});

	it("does not match when not at the end of the slice", () => {
		const nav = MutMatchNav.fromString("test string", 3);

		const result = MatchEndSlice.default.match(nav);

		expect(result).toBeNull();
	});

	it("works with empty string", () => {
		const nav = MutMatchNav.fromString("");

		const result = MatchEndSlice.default.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(0);
	});

	it("does not mutate the navigation state on success", () => {
		const nav = MutMatchNav.fromString("test string", 11);
		//                                  01234567890
		const originalNavIndex = nav.navIndex;

		const result = MatchEndSlice.default.match(nav);

		expect(result).not.toBeNull();
		expect(result?.navIndex).toBe(nav.source.length);
	});
});
