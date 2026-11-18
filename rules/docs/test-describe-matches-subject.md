# test-describe-matches-subject

Require top-level describes to name exports of the module under test.

## Rule Details

Tests in a `test` directory repeat the paths of the modules they test:
`test/x/y.test.ts` tests `x/y.ts`. Every top-level `describe` of the test file
is named after an export of that module, as it is written in the code. Then the
test report shows what is tested, and a search for the name finds its tests.

Names are compared exactly, with case.

Incorrect:

```ts
// test/utils/interop-default.test.ts
describe('interop-default', () => {})
```

```ts
// test/runtime/resolve-runtime-targets.test.ts
describe('node targets', () => {})

describe('browser targets', () => {})
```

Correct:

```ts
// test/utils/interop-default.test.ts
describe('interopDefault', () => {})
```

```ts
// test/runtime/resolve-runtime-targets.test.ts
describe('resolveRuntimeTargets', () => {
  describe('node targets', () => {})

  describe('browser targets', () => {})
})
```

A module with several exports may have a describe for each of them:

```ts
// test/runtime/create-runtime-configs.test.ts
describe('createRuntimeGate', () => {})

describe('createRuntimeConfigs', () => {})
```

## Module Under Test

The rule checks test files named `<name>.test.<extension>` in a `test`
directory. The module has the same path relative to the directory that holds
`test`:

| Test file                          | Module                   |
| ---------------------------------- | ------------------------ |
| `test/core/cli.test.ts`            | `core/cli.ts`            |
| `test/index.test.ts`               | `index.ts`               |
| `packages/app/test/api.test.ts`    | `packages/app/api.ts`    |
| `test/fixtures/app/test/a.test.ts` | `test/fixtures/app/a.ts` |

The nearest `test` directory counts, so fixture projects with their own tests
work. The module may be a JavaScript or TypeScript module with any extension:
the extension of the test file is tried first, then `.ts`, `.tsx`, `.mts`,
`.cts`, `.js`, `.jsx`, `.mjs` and `.cjs`.

A test file may test one aspect of the module: `<name>.<aspect>.test.ts` tests
`<name>.ts`. So `index.cache.test.ts` tests `index.ts`, and both
`prompt.screens.test.ts` and `prompt.windows.screens.test.ts` test `prompt.ts`.
The longest name of an existing module wins: `user.service.test.ts` tests
`user.service.ts` when it exists. The aspect is in the filename, so the describe
is still named after the export:

```ts
// test/core/prompt-update-selection.screens.test.ts
import { promptUpdateSelection } from '../../core/prompt-update-selection'

describe('promptUpdateSelection', () => {})
```

A shorter name counts only when the test file imports the module by a relative
path, with `import` or `import()`, with or without an extension. An index file
may be imported by its directory. Otherwise `config.schema.test.ts`, which tests
`config.schema.json`, would be checked against `config.ts`. A test that imports
the module through an alias, such as `~/core/prompt`, is skipped.

These files are skipped:

- Test files without a module, such as `test/declarations.test.ts` that checks
  the build.
- Tests of components: `.vue`, `.svelte` and `.astro` files are not looked for.
- Test files outside a `test` directory, such as `src/math.test.ts`, and files
  in it that are not tests, such as `test/helpers.ts`.
- Code blocks in other files, such as Markdown.

## Exports

Every export of the module counts: functions, classes, constants and types. A
default function or class counts by its own name, such as `parse` in
`export default function parse() {}`.

The main export is the name that the fix gives a describe:

1. The default function or class.
2. Otherwise, the value that the filename matches, as in
   [filename-matches-export](filename-matches-export.md): `colors` in
   `colors.ts`. An index file is matched by its directory: `packageJson` in
   `package-json/index.ts`. An index file next to `test` is not, since the name
   of the project directory depends on the checkout.
3. Otherwise, the only value, such as `createLintClient` next to the
   `LintClient` interface.
4. In a module of types, the same for types.

Modules without a main export are skipped:

- A default export without a name: an object, an anonymous function or a call,
  as in ESLint rules that `export default createRule({})`.
- A module with `export * from`, whose exports are not known.
- Several values that the filename does not match, such as a collection of
  constants or an index file with re-exports.

The rule reads the module with the parser of the test file, without type
information. A module that does not parse is skipped. With `--cache`, ESLint
does not lint a test file again when only its module changes.

## Describes

Every top-level call of `describe` is checked, including `describe.only`,
`describe.skip`, `describe.skipIf(condition)` and parameterized describes, such
as `describe.each(cases)`. Nested describes are not checked.

Only titles that are strings or template literals without expressions are
checked. Other titles, such as a variable, are skipped.

## Autofix

The fix renames the describe after the main export and keeps its quotes. It is
applied only when the file has a single top-level describe. These describes are
reported without a fix:

- A describe next to other top-level describes, since the new title could repeat
  another one. Nest the describe in one named after the export, or move it to a
  file of its aspect.
- A parameterized describe, such as `describe.each(cases)('on %s', …)`. Its
  title is a template for every case, so the export name would repeat the same
  title. Nest it in a describe named after the export.
- A describe of a module whose main export is not an identifier, as in
  `export { value as 'some-name' }`.

Snapshots of `toMatchSnapshot()` and `toThrowErrorMatchingSnapshot()` are stored
under the titles of their tests, which include the titles of describes. In a
file with these matchers, the rename is a suggestion instead of a fix, so that
`eslint --fix` does not leave the snapshots behind: apply it in the editor and
update the snapshots with `vitest -u`. Inline snapshots and
`toMatchFileSnapshot()` do not depend on titles, and such files are fixed.

Export names may start with a capital letter, such as `HostRunner`. The config
turns off `vitest/prefer-lowercase-title` for describes with
`ignore: ['describe']`, so that the two rules do not fix the same title back and
forth. Its `ignoreTopLevelDescribe` option is not enough: it checks a top-level
describe that follows a describe with a variable title.

## Options

This rule has no options.

## Resources

- [Rule Source](https://github.com/azat-io/eslint-config/blob/main/rules/test-describe-matches-subject.ts)
- [Test Source](https://github.com/azat-io/eslint-config/blob/main/test/rules/test-describe-matches-subject.test.ts)
