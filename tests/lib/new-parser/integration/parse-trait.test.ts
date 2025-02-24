import { describe, it, expect } from "@jest/globals";
import { Lexer } from "@/new-parser/lexer/lexer";
import { Parser } from "@/new-parser/parser/parser";
import { StrSlice } from "@/utils/slice";
import {
	ArrayNode,
	SetNode,
	TraitNode,
	TypedFieldNode,
} from "@/new-parser/types/ast";
import {
	ArrayType,
	NumberType,
	SetType,
	StringType,
	TypeValuePair,
} from "@/new-parser/types/types";

describe("Trait Parsing Integration", () => {
	const lexer = new Lexer();
	const parser = new Parser();

	it("parses a complete trait example", () => {
		const input = new StrSlice(`
person:
    name: John Doe
    age: 30
    address:
        street: 123 Main St
        city: Anytown
        zip: 12345
    hobbies[array<string>]:
        reading
        coding
        hiking
    skills[set<string>]:
        TypeScript
        JavaScript
        Python
`);

		const tokens = Array.from(lexer.tokenizeLines(input));
		expect(tokens).toHaveLength(15);

		const nodes = parser.parseNodes(tokens);
		expect(nodes).toHaveLength(1);

		const person = nodes[0];
		expect(person).toBeDefined();
		expect(person).toBeInstanceOf(TraitNode);
		const personTrait = person as TraitNode;
		expect(personTrait.key).toBe("person");
		expect(personTrait.children).toHaveLength(5);

		// Check basic fields
		const [name, age, address, hobbies, skills] =
			personTrait.children;

		expect(name).toBeDefined();
		expect(name).toBeInstanceOf(TypedFieldNode);
		const nameField = name as TypedFieldNode;
		expect(nameField.key).toBe("name");
		expect(nameField.value.value).toBe("John Doe");

		expect(age).toBeDefined();
		expect(age).toBeInstanceOf(TypedFieldNode);
		const ageField = age as TypedFieldNode;
		expect(ageField.key).toBe("age");
		expect(ageField.value.value).toBe("30");

		// Check nested trait
		expect(address).toBeDefined();
		expect(address).toBeInstanceOf(TraitNode);
		const addressTrait = address as TraitNode;
		expect(addressTrait.key).toBe("address");
		expect(addressTrait.children).toHaveLength(3);

		// Check array
		expect(hobbies).toBeDefined();
		expect(hobbies).toBeInstanceOf(ArrayNode);
		const hobbiesArray = hobbies as ArrayNode;
		expect(hobbiesArray.key).toBe("hobbies");
		expect(hobbiesArray.values).toHaveLength(3);

		// Check set
		expect(skills).toBeDefined();
		expect(skills).toBeInstanceOf(SetNode);
		const skillsSet = skills as SetNode;
		expect(skillsSet.key).toBe("skills");
		expect(skillsSet.values.size).toBe(3);
	});

	it("handles errors gracefully", () => {
		const input = new StrSlice(`
person:
name: John Doe  // Wrong indentation
    age: thirty   // Invalid number
    skills[unknown]:  // Unknown type
        TypeScript
`);

		const tokens = Array.from(lexer.tokenizeLines(input));
		const nodes = parser.parseNodes(tokens);

		expect(nodes).toHaveLength(1);
		const person = nodes[0];
		expect(person).toBeDefined();
		expect(person).toBeInstanceOf(TraitNode);
		const personTrait = person as TraitNode;
		expect(personTrait.children).toHaveLength(1); // Only age is properly indented
	});

	it("preserves source information", () => {
		const input = new StrSlice(`
root:
    key: value
`);

		const tokens = Array.from(lexer.tokenizeLines(input));
		const nodes = parser.parseNodes(tokens);

		const root = nodes[0];
		expect(root).toBeDefined();
		expect(root).toBeInstanceOf(TraitNode);
		const rootTrait = root as TraitNode;
		expect(rootTrait.sourceContext).toBeDefined();
		expect(rootTrait.sourceContext?.indent).toBe(0);
		expect(
			rootTrait.sourceContext?.range.start.line
		).toBe(1);

		const field = rootTrait.children[0];
		expect(field).toBeDefined();
		expect(field).toBeInstanceOf(TypedFieldNode);
		const fieldNode = field as TypedFieldNode;
		expect(fieldNode.sourceContext).toBeDefined();
		expect(fieldNode.sourceContext?.indent).toBe(1);
		expect(
			fieldNode.sourceContext?.range.start.line
		).toBe(2);
	});
});
