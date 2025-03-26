import { describe, it, expect } from "@jest/globals";
import { splitHead } from "@/parser/utils/lines-to-heads";
import { StrSlice } from "@/utils/slice";
import { LineInfo } from "@/parser/types/key-value";
import {
	KeyValueDefinedSource,
	KeyValueRequiredSource,
	KeyBodyRequiredSource,
	EmptyLineNode,
} from "@/parser/types/key-value";

describe("splitHead - Success Cases", () => {
	const createLineInfo = (content: string): LineInfo =>
		new LineInfo(
			StrSlice.from(content),
			0, // indent
			1 // row
		);

	it("handles empty lines", () => {
		const result = splitHead(createLineInfo(""));
		expect(result).toBeInstanceOf(EmptyLineNode);
		expect((result as EmptyLineNode).isColon).toBe(false);
	});

	it("handles single colon lines", () => {
		const result = splitHead(createLineInfo(":"));
		expect(result).toBeInstanceOf(EmptyLineNode);
		expect((result as EmptyLineNode).isColon).toBe(true);
	});

	it("parses key-value definition (key: value)", () => {
		{
			const result = splitHead(
				createLineInfo("name: John")
			);
			expect(result).toBeInstanceOf(
				KeyValueDefinedSource
			);
			expect(
				(
					result as KeyValueDefinedSource
				).keyHead.value
			).toBe("name");
			expect(
				(
					result as KeyValueDefinedSource
				).valueHead.value
			).toBe("John");
		}
		{
			const result = splitHead(
				createLineInfo("value .in .R:6:9: 1.23456")
			);
			expect(result).toBeInstanceOf(
				KeyValueDefinedSource
			);
			expect(
				(
					result as KeyValueDefinedSource
				).keyHead.value
			).toBe("value .in .R:6:9");
			expect(
				(
					result as KeyValueDefinedSource
				).valueHead.value
			).toBe("1.23456");
		}
	});

	it(
		"parses funky key-value definition" +
			" (key: value1: value2)",
		() => {
			{
				const result = splitHead(
					createLineInfo("value: thing: stuff")
				);
				expect(result).toBeInstanceOf(
					KeyValueDefinedSource
				);
				expect(
					(
						result as KeyValueDefinedSource
					).keyHead.value
				).toBe("value");
				expect(
					(
						result as KeyValueDefinedSource
					).valueHead.value
				).toBe("thing: stuff");
			}
		}
	);

	it("parses key value requirement (key)", () => {
		{
			const result = splitHead(createLineInfo("age"));
			expect(result).toBeInstanceOf(
				KeyValueRequiredSource
			);
			expect(
				(
					result as KeyValueRequiredSource
				).keyHead.value
			).toBe("age");
		}
		{
			const result = splitHead(
				createLineInfo("a4 in .Z")
			);
			expect(result).toBeInstanceOf(
				KeyValueRequiredSource
			);
			expect(
				(
					result as KeyValueRequiredSource
				).keyHead.value
			).toBe("a4 in .Z");
		}
	});

	it("parses key body requirement (key:)", () => {
		{
			const result = splitHead(
				createLineInfo("person:")
			);
			expect(result).toBeInstanceOf(
				KeyBodyRequiredSource
			);
			expect(
				(
					result as KeyBodyRequiredSource
				).keyHead.value
			).toBe("person");
		}
	});

	it(
		"parses key body requirement" +
			" with type (key type:a:b:)",
		() => {
			{
				const result = splitHead(
					createLineInfo("x R:6:9:")
				);
				expect(result).toBeInstanceOf(
					KeyBodyRequiredSource
				);
				expect(
					(
						result as KeyBodyRequiredSource
					).keyHead.value
				).toBe("x R:6:9");
			}
			{
				const result = splitHead(
					createLineInfo("a2 .in .trait:")
				);
				expect(result).toBeInstanceOf(
					KeyBodyRequiredSource
				);
				expect(
					(
						result as KeyBodyRequiredSource
					).keyHead.value
				).toBe("a2 .in .trait");
			}
		}
	);
});
