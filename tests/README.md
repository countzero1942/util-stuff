# Tests: Jest + Chalk (ESM) Workaround

This project uses `chalk` for colorizing output in `toString()` methods across the TRex codebase (e.g., `lib/trex/nav.ts`). Chalk v5+ is ESM-only, which can cause parse errors in Jest because Jest does not transform `node_modules` by default.

Example error:

```
SyntaxError: Cannot use import statement outside a module

/home/.../node_modules/chalk/source/index.js:1
import ansiStyles from '#ansi-styles';
^^^^^^
```

## Solution: Map `chalk` to a test stub

We avoid transforming ESM in `node_modules` by mapping `chalk` to a simple no-op stub during tests. This keeps production code unchanged while ensuring tests run smoothly and quickly.

- `jest.config.js` mapping:

```js
module.exports = {
  // ...existing config...
  moduleNameMapper: {
    // ...existing mappings...
    '^chalk$': '<rootDir>/tests/mocks/chalk.ts',
  },
};
```

- Stub file: `tests/mocks/chalk.ts`
  - Default export compatible with `import chalk from 'chalk'`
  - Callable: `chalk('text')` and template tag: `` chalk`Hello ${x}` ``
  - Chainable, common style methods: `.bold`, `.dim`, `.gray`, `.red`, `.green`, `.yellow`, `.blue`, `.cyan`, `.magenta`, `.underline`, and a few `bg*` variants
  - All operations are no-ops that return plain strings

This approach allows tests to call code that references `chalk` without pulling in the ESM module.

## Rationale

- Keeps production behavior (real `chalk`) intact outside tests.
- Avoids adding costly `transformIgnorePatterns` rules for `node_modules` or custom Babel transforms.
- Stable across Node/Jest versions and simple to maintain.

## Alternatives

- Transform ESM in `node_modules` (e.g., allow-list `chalk`):
  - Add `transformIgnorePatterns: ['/node_modules/(?!chalk/)']` and a suitable transformer.
  - Heavier and potentially brittle; not recommended unless you need colored output in tests.

- Conditional import of `chalk` in source code:
  - Dynamically load only outside test environment.
  - Leaks environment concerns into production code; we prefer keeping test-only logic in the test environment.

## Notes

- The project uses `ts-jest` with ESM support (`useESM: true`), but that does not automatically handle ESM inside `node_modules`.
- If you add other ESM-only libraries that are used in test code paths, consider adding similar stubs or an allow-list transform strategy.
