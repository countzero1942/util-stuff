import { describe, it, expect } from "@jest/globals";
import {
	TypeBase,
	Str,
	NoNum,
	RPrec,
	RFixed,
	ZNum,
	WNum,
	NNum,
	TypeInfo,
} from "@/parser/types/type-types";

describe("TypeBase", () => {
	// Create a concrete implementation for testing
	class TestType extends TypeBase {
		constructor(
			typeInfo: TypeInfo,
			uniqueKeyMembers?: string[]
		) {
			super(typeInfo, uniqueKeyMembers);
		}
	}

	it("creates type with basic type info", () => {
		const type = new TestType({ type: "test" });
		expect(type.type).toBe("test");
		expect(type.uniqueKey).toBe("|{T}test|");
	});

	it("creates type with parent type", () => {
		const type = new TestType({
			type: "child",
			parentType: "parent",
		});
		expect(type.type).toBe("child");
		expect(type.uniqueKey).toBe("|{T}child|{PT}parent|");
	});

	it("creates type with variant type", () => {
		const type = new TestType({
			type: "base",
			variantType: "variant",
		});
		expect(type.type).toBe("base");
		expect(type.uniqueKey).toBe("|{T}base|{VT}variant|");
	});

	it("creates type with additional unique key members", () => {
		const type = new TestType({ type: "test" }, [
			"extra1",
			"extra2",
		]);
		expect(type.uniqueKey).toBe(
			"|{T}test|extra1|extra2|"
		);
	});

	it("correctly checks equality", () => {
		const type1 = new TestType({ type: "test" });
		const type2 = new TestType({ type: "test" });
		const type3 = new TestType({ type: "different" });

		expect(type1.equals(type2)).toBe(true);
		expect(type1.equals(type3)).toBe(false);
	});

	it("provides parsable string representation", () => {
		const type = new TestType({ type: "test" });
		expect(type.toParsableString()).toBe("test");
	});
});

describe("Str", () => {
	it("creates string type with correct properties", () => {
		const str = new Str();
		expect(str.type).toBe(".$");
		expect(str.uniqueKey).toBe("|{T}.$|");
		expect(str.toParsableString()).toBe(".$");
	});

	it("correctly checks equality", () => {
		const str1 = new Str();
		const str2 = new Str();
		expect(str1.equals(str2)).toBe(true);
	});
});

describe("NoNum", () => {
	it("creates NoNum type with correct properties", () => {
		const noNum = new NoNum();
		expect(noNum.type).toBe(".NoNum");
		expect(noNum.uniqueKey).toBe("|{T}.NoNum|");
		expect(noNum.toParsableString()).toBe(".NoNum");
	});

	it("correctly checks equality", () => {
		const noNum1 = new NoNum();
		const noNum2 = new NoNum();
		expect(noNum1.equals(noNum2)).toBe(true);
	});
});

describe("RPrec", () => {
	it("creates RPrec type with default values", () => {
		const rPrec = new RPrec();
		expect(rPrec.type).toBe(".R");
		expect(rPrec.precision).toBe(15);
		expect(rPrec.UseEngineeringNotation).toBe(false);
		expect(rPrec.SciNotPower).toBe(9);
		expect(rPrec.uniqueKey).toBe(
			"|{T}.R|{VT}:Prec|{Prec}15|{G}false|{Pow}9|"
		);

		expect(rPrec.toParsableString()).toBe(".R:15:9");
	});

	it("creates RPrec type with custom values", () => {
		const rPrec = new RPrec(4, true, 6);
		expect(rPrec.precision).toBe(4);
		expect(rPrec.UseEngineeringNotation).toBe(true);
		expect(rPrec.SciNotPower).toBe(6);
		expect(rPrec.uniqueKey).toBe(
			"|{T}.R|{VT}:Prec|{Prec}4|{G}true|{Pow}6|"
		);
	});

	it("provides correct parsable string with engineering notation", () => {
		const rPrec = new RPrec(4, true, 6);
		expect(rPrec.toParsableString()).toBe(".R:4:6 %g");
	});

	it("provides correct parsable string without engineering notation", () => {
		const rPrec = new RPrec(4, false, 6);
		expect(rPrec.toParsableString()).toBe(".R:4:6");
	});

	it("correctly checks equality", () => {
		const rPrec1 = new RPrec(4, true, 6);
		const rPrec2 = new RPrec(4, true, 6);
		const rPrec3 = new RPrec(5, true, 6);
		expect(rPrec1.equals(rPrec2)).toBe(true);
		expect(rPrec1.equals(rPrec3)).toBe(false);
	});
});

describe("RFixed", () => {
	it("creates RFixed type with default value", () => {
		const rFixed = new RFixed();
		expect(rFixed.type).toBe(".R");
		expect(rFixed.fixed).toBe(2);
		expect(rFixed.uniqueKey).toBe(
			"|{T}.R|{VT}:Fixed|{Places}2|"
		);
	});

	it("creates RFixed type with custom value", () => {
		const rFixed = new RFixed(4);
		expect(rFixed.fixed).toBe(4);
		expect(rFixed.uniqueKey).toBe(
			"|{T}.R|{VT}:Fixed|{Places}4|"
		);
	});

	it("provides correct parsable string", () => {
		const rFixed = new RFixed(4);
		expect(rFixed.toParsableString()).toBe(".R.4");
	});

	it("correctly checks equality", () => {
		const rFixed1 = new RFixed(4);
		const rFixed2 = new RFixed(4);
		const rFixed3 = new RFixed(5);
		expect(rFixed1.equals(rFixed2)).toBe(true);
		expect(rFixed1.equals(rFixed3)).toBe(false);
	});
});

describe("ZNum", () => {
	it("creates ZNum type with default values", () => {
		const zNum = new ZNum();
		expect(zNum.type).toBe(".Z");
		expect(zNum.min).toBe(Number.MIN_SAFE_INTEGER);
		expect(zNum.max).toBe(Number.MAX_SAFE_INTEGER);
		expect(zNum.uniqueKey).toBe(
			"|{T}.Z|(min)-MAX|(max)+MAX|"
		);
	});

	it("creates ZNum type with custom values", () => {
		const zNum = new ZNum({ type: ".Z" }, -100, 100);
		expect(zNum.min).toBe(-100);
		expect(zNum.max).toBe(100);
		expect(zNum.uniqueKey).toBe(
			"|{T}.Z|(min)-100|(max)100|"
		);
	});

	it("provides correct parsable string", () => {
		const zNum = new ZNum();
		expect(zNum.toParsableString()).toBe(".Z");
	});

	it("correctly checks equality", () => {
		const zNum1 = new ZNum({ type: ".Z" }, -100, 100);
		const zNum2 = new ZNum({ type: ".Z" }, -100, 100);
		const zNum3 = new ZNum({ type: ".Z" }, -200, 200);
		expect(zNum1.equals(zNum2)).toBe(true);
		expect(zNum1.equals(zNum3)).toBe(false);
	});
});

describe("WNum", () => {
	it("creates WNum type with correct properties", () => {
		const wNum = new WNum();
		expect(wNum.type).toBe(".W");
		expect(wNum.min).toBe(0);
		expect(wNum.max).toBe(Number.MAX_SAFE_INTEGER);
		expect(wNum.uniqueKey).toBe(
			"|{T}.W|{PT}.Z|(min)0|(max)+MAX|"
		);
	});

	it("provides correct parsable string", () => {
		const wNum = new WNum();
		expect(wNum.toParsableString()).toBe(".W");
	});

	it("correctly checks equality", () => {
		const wNum1 = new WNum();
		const wNum2 = new WNum();
		expect(wNum1.equals(wNum2)).toBe(true);
	});
});

describe("NNum", () => {
	it("creates NNum type with correct properties", () => {
		const nNum = new NNum();
		expect(nNum.type).toBe(".N");
		expect(nNum.min).toBe(1);
		expect(nNum.max).toBe(Number.MAX_SAFE_INTEGER);
		expect(nNum.uniqueKey).toBe(
			"|{T}.N|{PT}.Z|(min)1|(max)+MAX|"
		);
	});

	it("provides correct parsable string", () => {
		const nNum = new NNum();
		expect(nNum.toParsableString()).toBe(".N");
	});

	it("correctly checks equality", () => {
		const nNum1 = new NNum();
		const nNum2 = new NNum();
		expect(nNum1.equals(nNum2)).toBe(true);
	});
});
