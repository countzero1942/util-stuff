import { describe, it, expect } from "@jest/globals";
import {
	LineInfo,
	KeyValueBase,
	KeyValueDefinedSource,
	KeyValueRequiredSource,
	KeyBodyRequiredSource,
	KeyInvalidSource,
	EmptyLineNode,
	ParserErrNode,
	KeyTraitNode,
	KeyValueDefinedNode,
} from "@/parser/types/key-value";
import { StrSlice } from "@/utils/slice";
import { TypeValuePair } from "@/parser/types/parse-types";
import { RPrec, Str } from "@/parser/types/type-types";
import {
	ParserErrBase,
	ReportLine,
} from "@/parser/types/err-types";

describe("LineInfo", () => {
	it("creates LineInfo instance with correct properties", () => {
		const content = new StrSlice("test content");
		const lineInfo = new LineInfo(content, 2, 1);

		expect(lineInfo.content).toBe(content);
		expect(lineInfo.indent).toBe(2);
		expect(lineInfo.row).toBe(1);
	});
});

describe("KeyValDefHead", () => {
	const lineInfo = new LineInfo(
		new StrSlice("key: value"),
		0,
		1
	);
	const keyHead = new StrSlice("key");
	const valueHead = new StrSlice("value");

	it("creates KeyValDefHead instance with correct properties", () => {
		const head = new KeyValueDefinedSource(
			keyHead,
			valueHead,
			lineInfo
		);

		expect(head.keyHead).toBe(keyHead);
		expect(head.valueHead).toBe(valueHead);
		expect(head.lineInfo).toBe(lineInfo);
	});

	it("correctly checks key head", () => {
		const head = new KeyValueDefinedSource(
			keyHead,
			valueHead,
			lineInfo
		);

		expect(head.checkKeyHead("key")).toBe(true);
		expect(head.checkKeyHead("other")).toBe(false);
	});

	it("correctly checks value head", () => {
		const head = new KeyValueDefinedSource(
			keyHead,
			valueHead,
			lineInfo
		);

		expect(head.checkValueHead("value")).toBe(true);
		expect(head.checkValueHead("other")).toBe(false);
	});

	it("provides correct string representation", () => {
		const head = new KeyValueDefinedSource(
			keyHead,
			valueHead,
			lineInfo
		);
		expect(head.toString()).toBe(
			"<KeyValueDefinedHead> key: value"
		);
	});
});

describe("KeyValueRequiredHead", () => {
	const lineInfo = new LineInfo(new StrSlice("key"), 0, 1);
	const keyHead = new StrSlice("key");

	it("creates KeyValueRequiredHead instance with correct properties", () => {
		const head = new KeyValueRequiredSource(
			keyHead,
			lineInfo
		);

		expect(head.keyHead).toBe(keyHead);
		expect(head.lineInfo).toBe(lineInfo);
	});

	it("correctly checks key head", () => {
		const head = new KeyValueRequiredSource(
			keyHead,
			lineInfo
		);

		expect(head.checkKeyHead("key")).toBe(true);
		expect(head.checkKeyHead("other")).toBe(false);
	});

	it("provides correct string representation", () => {
		const head = new KeyValueRequiredSource(
			keyHead,
			lineInfo
		);
		expect(head.toString()).toBe(
			"<KeyValueRequiredHead> key"
		);
	});
});

describe("KeyBodyRequiredHead", () => {
	const lineInfo = new LineInfo(
		new StrSlice("key:"),
		0,
		1
	);
	const keyHead = new StrSlice("key");

	it("creates KeyBodyRequiredHead instance with correct properties", () => {
		const head = new KeyBodyRequiredSource(
			keyHead,
			lineInfo
		);

		expect(head.keyHead).toBe(keyHead);
		expect(head.lineInfo).toBe(lineInfo);
	});

	it("correctly checks key head", () => {
		const head = new KeyBodyRequiredSource(
			keyHead,
			lineInfo
		);

		expect(head.checkKeyHead("key")).toBe(true);
		expect(head.checkKeyHead("other")).toBe(false);
	});

	it("provides correct string representation", () => {
		const head = new KeyBodyRequiredSource(
			keyHead,
			lineInfo
		);
		expect(head.toString()).toBe(
			"<KeyBodyRequiredHead> key:"
		);
	});
});

describe("KeyInvalidHead", () => {
	const lineInfo = new LineInfo(
		new StrSlice("invalid:key"),
		0,
		1
	);
	const keyHead = new StrSlice("invalid:key");

	it("creates KeyInvalidHead instance with correct properties", () => {
		const head = new KeyInvalidSource(keyHead, lineInfo);

		expect(head.keyHead).toBe(keyHead);
		expect(head.lineInfo).toBe(lineInfo);
	});

	it("correctly checks key head", () => {
		const head = new KeyInvalidSource(keyHead, lineInfo);

		expect(head.checkKeyHead("invalid:key")).toBe(true);
		expect(head.checkKeyHead("other")).toBe(false);
	});
});

describe("EmptyLine", () => {
	it("creates EmptyLine instance for empty content", () => {
		const lineInfo = new LineInfo(new StrSlice(""), 0, 1);
		const emptyLine = new EmptyLineNode(lineInfo);

		expect(emptyLine.lineInfo).toBe(lineInfo);
		expect(emptyLine.isColon).toBe(false);
	});

	it("creates EmptyLine instance for colon content", () => {
		const lineInfo = new LineInfo(
			new StrSlice(":"),
			0,
			1
		);
		const emptyLine = new EmptyLineNode(lineInfo);

		expect(emptyLine.lineInfo).toBe(lineInfo);
		expect(emptyLine.isColon).toBe(true);
	});
});

describe("KeyTrait", () => {
	const lineInfo = new LineInfo(
		new StrSlice("parent"),
		0,
		1
	);
	const key = new StrSlice("parent");
	const childLineInfo = new LineInfo(
		new StrSlice("child: value"),
		1,
		2
	);
	const childHead = new KeyValueDefinedSource(
		new StrSlice("child"),
		new StrSlice("value"),
		childLineInfo
	);

	it("creates KeyTrait instance with correct properties", () => {
		const trait = new KeyTraitNode(
			key,
			[childHead],
			lineInfo
		);

		expect(trait.key).toBe(key);
		expect(trait.children).toEqual([childHead]);
		expect(trait.lineInfo).toBe(lineInfo);
	});

	it("correctly checks key", () => {
		const trait = new KeyTraitNode(
			key,
			[childHead],
			lineInfo
		);

		expect(trait.checkKey("parent")).toBe(true);
		expect(trait.checkKey("other")).toBe(false);
	});

	it("provides correct string representation", () => {
		const trait = new KeyTraitNode(
			key,
			[childHead],
			lineInfo
		);
		expect(trait.toString()).toBe("<KeyTrait> parent:");
	});
});

describe("KeyValueDefinedPair with string value", () => {
	const lineInfo = new LineInfo(
		new StrSlice("key: value"),
		0,
		1
	);
	const key = new StrSlice("key");
	const strType = new Str();
	const value = new TypeValuePair(strType, "value");

	it("creates KeyValueDefinedPair instance with correct properties", () => {
		const def = new KeyValueDefinedNode(
			key,
			value,
			lineInfo
		);

		expect(def.key).toBe(key);
		expect(def.value).toBe(value);
		expect(def.lineInfo).toBe(lineInfo);
	});

	it("correctly checks key", () => {
		const def = new KeyValueDefinedNode(
			key,
			value,
			lineInfo
		);

		expect(def.checkKey("key")).toBe(true);
		expect(def.checkKey("other")).toBe(false);
	});

	it("correctly checks value", () => {
		const def = new KeyValueDefinedNode(
			key,
			value,
			lineInfo
		);

		expect(def.checkValue("value", strType)).toBe(true);
		expect(def.checkValue("other", strType)).toBe(false);
	});

	it("provides correct string representation", () => {
		const def = new KeyValueDefinedNode(
			key,
			value,
			lineInfo
		);
		expect(def.toString()).toBe(
			"<KeyValueDefinedPair> key: value"
		);
	});
});

describe("KeyValueDefinedPair with RPrec value", () => {
	const lineInfo = new LineInfo(
		new StrSlice("key: 123.4"),
		0,
		1
	);
	const key = new StrSlice("key");
	const valueType = new RPrec(4);
	const value = new TypeValuePair(valueType, 123.4);

	it("creates KeyValueDefinedPair instance with correct properties", () => {
		const def = new KeyValueDefinedNode(
			key,
			value,
			lineInfo
		);

		expect(def.key).toBe(key);
		expect(def.value).toBe(value);
		expect(def.lineInfo).toBe(lineInfo);
	});

	it("correctly checks key", () => {
		const def = new KeyValueDefinedNode(
			key,
			value,
			lineInfo
		);

		expect(def.checkKey("key")).toBe(true);
		expect(def.checkKey("other")).toBe(false);
	});

	it("correctly checks value", () => {
		const def = new KeyValueDefinedNode(
			key,
			value,
			lineInfo
		);

		expect(def.checkValue(123.4, valueType)).toBe(true);
		expect(def.checkValue(123.4, new RPrec(5))).toBe(
			false
		);
		expect(def.checkValue(12.34, valueType)).toBe(false);
	});

	it("provides correct string representation", () => {
		const def = new KeyValueDefinedNode(
			key,
			value,
			lineInfo
		);
		expect(def.toString()).toBe(
			"<KeyValueDefinedPair> key: 123.4"
		);
	});
});

// Concrete implementation for testing
class TestParserError extends ParserErrBase {
	private message: string;

	constructor(message: string) {
		super();
		this.message = message;
	}

	toMessage(): string {
		return this.message;
	}

	toReport(): ReportLine[] {
		return [new ReportLine(this.message, 0)];
	}
}

describe("ParserErrHead", () => {
	const lineInfo = new LineInfo(
		new StrSlice("error line"),
		0,
		1
	);
	const err = new TestParserError("Test error");

	it("creates ParserErrHead instance with correct properties", () => {
		const parserErr = new ParserErrNode(err, lineInfo);

		expect(parserErr.err).toBe(err);
		expect(parserErr.lineInfo).toBe(lineInfo);
	});
});
