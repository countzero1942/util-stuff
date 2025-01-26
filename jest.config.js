/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
	preset: "ts-jest",
	testEnvironment: "node",
	transform: {
		"^.+.tsx?$": ["ts-jest", {}],
	},
	coveragePathIgnorePatterns: ["/node_modules/"],
	coverageReporters: ["json", "html"],
	coverageDirectory: "coverage",
	moduleNameMapper: {
		"^@/utils/(.*)$": "<rootDir>/lib/utils/$1",
		"^@/parser/(.*)$": "<rootDir>/lib/parser/$1",
	},
};
// "@/app/*": ["app/*"],
// "@/parser/*": ["lib/parser/*"],
// "@/utils/*": ["lib/utils/*"],
// "@/types/*": ["lib/types/*"],
// "@/my-tests/*": ["my-test-stuff/*"]
