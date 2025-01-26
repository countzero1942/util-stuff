import { RecordSeq, RecordValueSeq } from "@/utils/seq";

class TestClass {
	constructor(public value: number) {}
}

class SubTestClass extends TestClass {}

describe("Record Sequences", () => {
	describe("RecordSeq", () => {
		const testObj = {
			a: 1,
			b: "two",
			c: new TestClass(3),
			d: new SubTestClass(4),
		};

		describe("fromGeneric()", () => {
			it("iterates over key-value pairs without type constraints", () => {
				const seq = RecordSeq.fromGeneric(testObj);
				const result = seq.toArray();
				expect(result).toHaveLength(4);
				expect(result[0]).toEqual({ key: "a", value: 1 });
				expect(result[1]).toEqual({ key: "b", value: "two" });
			});
		});

		describe("fromType()", () => {
			it("filters values by type", () => {
				const seq = RecordSeq.fromType(testObj, "Number");
				const result = seq.toArray();
				expect(result).toHaveLength(1);
				const firstItem = result[0];
				expect(firstItem?.key).toBe("a");
				expect(firstItem?.value).toBe(1);
			});
		});

		describe("fromClass()", () => {
			it("filters values by exact class match", () => {
				const seq = RecordSeq.fromClass(testObj, "TestClass");
				const result = seq.toArray();
				expect(result).toHaveLength(1);
				const firstItem = result[0];
				expect(firstItem?.key).toBe("c");
				expect(firstItem?.value).toBeInstanceOf(TestClass);
			});
		});

		describe("fromHasClass()", () => {
			it("filters values by class inheritance", () => {
				const seq = RecordSeq.fromHasClass(testObj, "TestClass");
				const result = seq.toArray();
				expect(result).toHaveLength(2); // Both TestClass and SubTestClass
				const [first, second] = result;
				expect(first?.value).toBeInstanceOf(TestClass);
				expect(second?.value).toBeInstanceOf(SubTestClass);
			});
		});
	});

	describe("RecordValueSeq", () => {
		const testObj = {
			a: 1,
			b: "two",
			c: new TestClass(3),
			d: new SubTestClass(4),
		};

		describe("fromGeneric()", () => {
			it("iterates over values without type constraints", () => {
				const seq = RecordValueSeq.fromGeneric(testObj);
				const result = seq.toArray();
				expect(result).toHaveLength(4);
				expect(result).toContain(1);
				expect(result).toContain("two");
			});
		});

		describe("fromType()", () => {
			it("filters by value type", () => {
				const seq = RecordValueSeq.fromType(testObj, "Number");
				const result = seq.toArray();
				expect(result).toHaveLength(1);
				expect(result[0]).toBe(1);
			});
		});

		describe("fromClass()", () => {
			it("filters by exact class match", () => {
				const seq = RecordValueSeq.fromClass(
					testObj,
					"TestClass"
				);
				const result = seq.toArray();
				expect(result).toHaveLength(1);
				expect(result[0]).toBeInstanceOf(TestClass);
				expect(result[0]).not.toBeInstanceOf(SubTestClass);
			});
		});

		describe("fromHasClass()", () => {
			it("filters by class inheritance", () => {
				const seq = RecordValueSeq.fromHasClass(
					testObj,
					"TestClass"
				);
				const result = seq.toArray();
				expect(result).toHaveLength(2);
				expect(result[0]).toBeInstanceOf(TestClass);
				expect(result[1]).toBeInstanceOf(SubTestClass);
			});
		});
	});
});
