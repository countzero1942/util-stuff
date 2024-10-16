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
	},
};
