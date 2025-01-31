import { describe, it, expect } from "@jest/globals";
import { splitHead } from "@/parser/utils/lines-to-heads";
import { StrSlice } from "@/utils/slice";
import { LineInfo } from "@/parser/types/heads";
import {
	KeyValueDefinedHead,
	KeyValueRequiredHead,
	KeyBodyRequiredHead,
	EmptyLine,
} from "@/parser/types/heads";

describe("splitHead - Success Cases", () => {
	const createLineInfo = (content: string): LineInfo =>
		new LineInfo(
			StrSlice.from(content),
			0, // indent
			1 // row
		);

	it("handles empty lines", () => {
		const result = splitHead(createLineInfo(""));
		expect(result).toBeInstanceOf(EmptyLine);
		expect((result as EmptyLine).isColon).toBe(false);
	});

	it("handles single colon lines", () => {
		const result = splitHead(createLineInfo(":"));
		expect(result).toBeInstanceOf(EmptyLine);
		expect((result as EmptyLine).isColon).toBe(true);
	});

	it("parses key-value definition (key: value)", () => {
		{
			const result = splitHead(
				createLineInfo("name: John")
			);
			expect(result).toBeInstanceOf(KeyValueDefinedHead);
			expect(
				(
					result as KeyValueDefinedHead
				).keyHead.toString()
			).toBe("name");
			expect(
				(
					result as KeyValueDefinedHead
				).valueHead.toString()
			).toBe("John");
		}
		{
			const result = splitHead(
				createLineInfo("value .in .R:6:9: 1.23456")
			);
			expect(result).toBeInstanceOf(KeyValueDefinedHead);
			expect(
				(
					result as KeyValueDefinedHead
				).keyHead.toString()
			).toBe("value .in .R:6:9");
			expect(
				(
					result as KeyValueDefinedHead
				).valueHead.toString()
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
					KeyValueDefinedHead
				);
				expect(
					(
						result as KeyValueDefinedHead
					).keyHead.toString()
				).toBe("value");
				expect(
					(
						result as KeyValueDefinedHead
					).valueHead.toString()
				).toBe("thing: stuff");
			}
		}
	);

	it("parses key value requirement (key)", () => {
		{
			const result = splitHead(createLineInfo("age"));
			expect(result).toBeInstanceOf(
				KeyValueRequiredHead
			);
			expect(
				(
					result as KeyValueRequiredHead
				).keyHead.toString()
			).toBe("age");
		}
		{
			const result = splitHead(
				createLineInfo("a4 in .Z")
			);
			expect(result).toBeInstanceOf(
				KeyValueRequiredHead
			);
			expect(
				(
					result as KeyValueRequiredHead
				).keyHead.toString()
			).toBe("a4 in .Z");
		}
	});

	it("parses key body requirement (key:)", () => {
		{
			const result = splitHead(
				createLineInfo("person:")
			);
			expect(result).toBeInstanceOf(KeyBodyRequiredHead);
			expect(
				(
					result as KeyBodyRequiredHead
				).keyHead.toString()
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
					KeyBodyRequiredHead
				);
				expect(
					(
						result as KeyBodyRequiredHead
					).keyHead.toString()
				).toBe("x R:6:9");
			}
			{
				const result = splitHead(
					createLineInfo("a2 .in .trait:")
				);
				expect(result).toBeInstanceOf(
					KeyBodyRequiredHead
				);
				expect(
					(
						result as KeyBodyRequiredHead
					).keyHead.toString()
				).toBe("a2 .in .trait");
			}
		}
	);
});
