/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
	testEnvironment: "node",
	preset: "ts-jest",
	transform: {
		"^.+\\.tsx?$": ["ts-jest", {
			useESM: true,
		}]
	},
	extensionsToTreatAsEsm: [".ts", ".tsx"],
	coveragePathIgnorePatterns: ["/node_modules/"],
	coverageReporters: ["json", "html"],
	coverageDirectory: "coverage",
	moduleNameMapper: {
		"^@/utils/(.*)$": "<rootDir>/lib/utils/$1",
		"^@/parser/(.*)$": "<rootDir>/lib/parser/$1",
		"^@/new-parser/(.*)$": "<rootDir>/lib/new-parser/$1",
		"^@/tests/(.*)$": "<rootDir>/tests/$1",
	},
};
// "@/app/*": ["app/*"],
// "@/parser/*": ["lib/parser/*"],
// "@/utils/*": ["lib/utils/*"],
// "@/types/*": ["lib/types/*"],
// "@/my-tests/*": ["my-test-stuff/*"]
