/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
	testEnvironment: "node",
	preset: "ts-jest",
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
	},
	extensionsToTreatAsEsm: [".ts", ".tsx"],
	collectCoverage: false,
	coveragePathIgnorePatterns: ["/node_modules/"],
	coverageReporters: ["json", "html"],
	coverageDirectory: "coverage",
	moduleNameMapper: {
		"^@/utils/(.*)$": "<rootDir>/lib/utils/$1",
		"^@/parser/(.*)$": "<rootDir>/lib/parser/$1",
		"^@/trex": "<rootDir>/lib/trex",
		"^@/trex/(.*)$": "<rootDir>/lib/trex/$1",
		"^@/tests/(.*)$": "<rootDir>/tests/$1",
		"^@/app/(.*)$": "<rootDir>/app/$1",
		"^@/my-tests/(.*)$": "<rootDir>/my-test-stuff/$1",
		"^@/types/(.*)$": "<rootDir>/lib/types/$1",
	},
};
// "@/app/*": ["app/*"],
// "@/trex": ["lib/trex"],
// "@/trex/*": ["lib/trex/*"],
// "@/parser/*": ["lib/parser/*"],
// "@/utils/*": ["lib/utils/*"],
// "@/types/*": ["lib/types/*"],
// "@/tests/*": ["tests/*"],
// "@/my-tests/*": ["my-test-stuff/*"]
