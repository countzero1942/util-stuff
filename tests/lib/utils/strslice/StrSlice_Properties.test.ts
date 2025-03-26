import { StrSlice } from "@/utils/slice";

describe("StrSlice Properties", () => {
	let strSlice: StrSlice;

	beforeEach(() => {
		strSlice = new StrSlice("hello");
	});

	it("returns the correct slice length", () => {
		expect(strSlice.length).toBe(5);
		expect(new StrSlice("").length).toBe(0);
		expect(StrSlice.empty().length).toBe(0);
	});

	it("returns true if the slice isEmpty property", () => {
		const emptyStrSlice = new StrSlice("");
		expect(emptyStrSlice.isEmpty).toBe(true);
		expect(StrSlice.empty().isEmpty).toBe(true);
	});

	it("returns false if the slice is not empty", () => {
		expect(strSlice.isEmpty).toBe(false);
	});

	it("returns the correct slice value from full source string", () => {
		expect(strSlice.value).toBe("hello");
	});

	it("returns the correct slice value from partial source string", () => {
		strSlice = new StrSlice("hello", 1, -1);
		expect(strSlice.value).toBe("ell");
	});

	it("sets 'sliceCache' to 'source' if slices entire source string", () => {
		// @ts-ignore
		expect(StrSlice.from("hello").sliceCache).toBe(
			"hello"
		);
		// @ts-ignore
		expect(StrSlice.all("hello").sliceCache).toBe(
			"hello"
		);
		// @ts-ignore
		expect(StrSlice.from("hello", 0, 3).sliceCache).toBe(
			undefined
		);
	});

	it("sets 'sliceCache' on call to 'value' computed property", () => {
		const slice = StrSlice.from("hello", 0, 3);
		// @ts-ignore
		expect(slice.sliceCache).toBe(undefined);
		const str = slice.value;
		// @ts-ignore
		expect(slice.sliceCache).toBe("hel");
	});
	it("sets 'sliceCache' on call to 'toString' method", () => {
		const slice = StrSlice.from("hello", 0, 3);
		// @ts-ignore
		expect(slice.sliceCache).toBe(undefined);
		const str = slice.value;
		// @ts-ignore
		expect(slice.sliceCache).toBe("hel");
	});
});

describe("slice and sliceByLength methods", () => {
	it("slice: returns a new StrSlice with the same properties as the original slice", () => {
		const originalSlice = StrSlice.from("hello");
		const newSlice = originalSlice.slice();
		expect(newSlice.source).toBe(originalSlice.source);
		expect(newSlice.startIncl).toBe(
			originalSlice.startIncl
		);
		expect(newSlice.endExcl).toBe(originalSlice.endExcl);
		expect(newSlice.length).toBe(originalSlice.length);
		expect(newSlice.value).toBe(originalSlice.value);
	});

	it("slice: using positive start index", () => {
		const originalSlice = StrSlice.from("hello");
		//                                   012345
		let newSlice: StrSlice;

		newSlice = originalSlice.slice(1);
		expect(newSlice.value).toBe("ello");

		newSlice = originalSlice.slice(4);
		expect(newSlice.value).toBe("o");

		newSlice = originalSlice.slice(5);
		expect(newSlice.value).toBe("");

		newSlice = originalSlice.slice(6);
		expect(newSlice.value).toBe("");
	});

	it("slice: using positive start and end index", () => {
		const originalSlice = StrSlice.from("hello");
		//                                   012345
		let newSlice: StrSlice;

		newSlice = originalSlice.slice(1, 3);
		expect(newSlice.value).toBe("el");

		newSlice = originalSlice.slice(4, 5);
		expect(newSlice.value).toBe("o");

		newSlice = originalSlice.slice(5, 6);
		expect(newSlice.value).toBe("");

		newSlice = originalSlice.slice(6, 7);
		expect(newSlice.value).toBe("");
	});

	it("slice: flips positive start and end index", () => {
		const originalSlice = StrSlice.from("hello");
		//                                   012345
		let newSlice: StrSlice;

		newSlice = originalSlice.slice(3, 1);
		expect(newSlice.value).toBe("el");

		newSlice = originalSlice.slice(5, 4);
		expect(newSlice.value).toBe("o");
	});

	it("slice: using negative start index", () => {
		const originalSlice = StrSlice.from("hello");
		//                                   012345
		//                                   54321
		let newSlice: StrSlice;

		newSlice = originalSlice.slice(-1);
		expect(newSlice.value).toBe("o");

		newSlice = originalSlice.slice(-4);
		expect(newSlice.value).toBe("ello");

		newSlice = originalSlice.slice(-5);
		expect(newSlice.value).toBe("hello");

		newSlice = originalSlice.slice(-6);
		expect(newSlice.value).toBe("hello");
	});

	it("slice: using negative start and end index", () => {
		const originalSlice = StrSlice.from("hello");
		//                                   012345
		//                                   54321
		let newSlice: StrSlice;

		newSlice = originalSlice.slice(-3, -1);
		expect(newSlice.value).toBe("ll");

		newSlice = originalSlice.slice(-4, -2);
		expect(newSlice.value).toBe("el");

		newSlice = originalSlice.slice(-5, -1);
		expect(newSlice.value).toBe("hell");

		newSlice = originalSlice.slice(-6, -2);
		expect(newSlice.value).toBe("hel");

		newSlice = originalSlice.slice(-6, -1);
		expect(newSlice.value).toBe("hell");
	});

	it("slice: flips negative start and end index", () => {
		const originalSlice = StrSlice.from("hello");
		//                                   012345
		//                                   54321
		let newSlice: StrSlice;

		newSlice = originalSlice.slice(-1, -3);
		expect(newSlice.value).toBe("ll");

		newSlice = originalSlice.slice(-2, -4);
		expect(newSlice.value).toBe("el");
	});

	it("sliceByLength: positive start index", () => {
		const originalSlice = StrSlice.from("hello");
		//                                   012345
		let newSlice: StrSlice;

		newSlice = originalSlice.sliceByLength(0, 3);
		expect(newSlice.value).toBe("hel");

		newSlice = originalSlice.sliceByLength(0, 5);
		expect(newSlice.value).toBe("hello");

		newSlice = originalSlice.sliceByLength(0, 6);
		expect(newSlice.value).toBe("hello");

		newSlice = originalSlice.sliceByLength(3, 2);
		expect(newSlice.value).toBe("lo");

		newSlice = originalSlice.sliceByLength(5, 1);
		expect(newSlice.value).toBe("");

		newSlice = originalSlice.sliceByLength(6, 1);
		expect(newSlice.value).toBe("");
	});

	it("sliceByLength: negative start index", () => {
		const originalSlice = StrSlice.from("hello");
		//                                   012345
		//                                   54321
		let newSlice: StrSlice;

		newSlice = originalSlice.sliceByLength(-5, 3);
		expect(newSlice.value).toBe("hel");

		newSlice = originalSlice.sliceByLength(-5, 5);
		expect(newSlice.value).toBe("hello");

		newSlice = originalSlice.sliceByLength(-5, 6);
		expect(newSlice.value).toBe("hello");

		newSlice = originalSlice.sliceByLength(-2, 2);
		expect(newSlice.value).toBe("lo");

		newSlice = originalSlice.sliceByLength(-1, 1);
		expect(newSlice.value).toBe("o");

		newSlice = originalSlice.sliceByLength(-1, 2);
		expect(newSlice.value).toBe("o");
	});
});
