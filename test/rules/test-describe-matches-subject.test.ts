import type { Linter } from 'eslint'

import { writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { createRuleTester } from 'eslint-vitest-rule-tester'
import typescriptEslint from 'typescript-eslint'
import { Linter as ESLintLinter } from 'eslint'
import { tmpdir } from 'node:os'
import path from 'node:path'
import dedent from 'dedent'

import rule from '../../rules/test-describe-matches-subject'

let typescriptParser = typescriptEslint.parser

/**
 * Project in which the tests write subjects and lint test files.
 */
let root = mkdtempSync(path.join(tmpdir(), 'test-describe-matches-subject-'))

/**
 * Lints a test file of the project with the rule. Its describe does not match
 * the export of its subject.
 *
 * @param filename - Path of the file in the project.
 * @param languageOptions - Language options of the file.
 * @returns Messages of the rule.
 */
function lint(
  filename: string,
  languageOptions: Linter.LanguageOptions = {},
): Linter.LintMessage[] {
  let linter = new ESLintLinter({ cwd: root })

  return linter.verify(
    "describe('wrong', () => {})",
    {
      plugins: {
        azat: {
          rules: {
            'test-describe-matches-subject': rule,
          },
        },
      },
      rules: {
        'azat/test-describe-matches-subject': 'error',
      },
      languageOptions,
      files: ['**'],
    },
    resolve(filename),
  )
}

/**
 * Writes files to the project.
 *
 * @param files - Contents of the files by their paths in the project.
 */
function write(files: Record<string, string>): void {
  for (let [name, content] of Object.entries(files)) {
    let filename = path.join(root, name)
    mkdirSync(path.dirname(filename), { recursive: true })
    writeFileSync(filename, content)
  }
}

/**
 * Turns a path in the project into an absolute path.
 *
 * @param name - Path in the project.
 * @returns Absolute path.
 */
function resolve(name: string): string {
  return path.join(root, name)
}

describe('test-describe-matches-subject', () => {
  let { invalid, valid } = createRuleTester({
    configs: {
      languageOptions: {
        parserOptions: {
          /**
           * The rule tester runs ESLint in the root directory of the TypeScript
           * project, which is the project of these tests.
           */
          tsconfigRootDir: root,
        },
        parser: typescriptParser,
      },
    },
    name: 'test-describe-matches-subject',
    rule,
  })

  afterAll(() => {
    rmSync(root, { recursive: true, force: true })
  })

  describe('reports top-level describes that do not name an export', () => {
    it('renames the only describe after the export', async () => {
      write({
        'utils/interop-default.ts':
          'export async function interopDefault(): Promise<void> {}',
      })

      await invalid({
        errors: [
          {
            message:
              'Describe `interop-default` does not match the export `interopDefault` of `utils/interop-default.ts`',
            endColumn: 27,
            column: 10,
            endLine: 1,
            line: 1,
          },
        ],
        output: dedent`
          describe('interopDefault', () => {
            it('works', () => {})
          })
        `,
        code: dedent`
          describe('interop-default', () => {
            it('works', () => {})
          })
        `,
        filename: resolve('test/utils/interop-default.test.ts'),
      })
    })

    it('compares names with case', async () => {
      write({ 'case/parse.ts': 'export function parse() {}' })

      await invalid({
        errors: [
          {
            message:
              'Describe `Parse` does not match the export `parse` of `case/parse.ts`',
          },
        ],
        filename: resolve('test/case/parse.test.ts'),
        output: "describe('parse', () => {})",
        code: "describe('Parse', () => {})",
      })
    })

    it('renames a describe that describes an aspect', async () => {
      write({
        'core/prompt-update-selection.ts':
          'export function promptUpdateSelection() {}',
      })

      await invalid({
        errors: [
          {
            message:
              'Describe `promptUpdateSelection on screen` does not match the export `promptUpdateSelection` of `core/prompt-update-selection.ts`',
          },
        ],
        code: dedent`
          import { promptUpdateSelection } from '../../core/prompt-update-selection'

          describe('promptUpdateSelection on screen', () => {})
        `,
        output: dedent`
          import { promptUpdateSelection } from '../../core/prompt-update-selection'

          describe('promptUpdateSelection', () => {})
        `,
        filename: resolve('test/core/prompt-update-selection.screens.test.ts'),
      })
    })

    it('lists the exports and renames the describe after the main one', async () => {
      write({
        'cli/colors.ts': dedent`
          export function createColors() {}

          export function isColorSupported() {
            return true
          }

          export let colors = createColors()
        `,
      })

      await invalid({
        errors: [
          {
            message:
              'Describe `terminal colors` does not match any of the exports `colors`, `createColors`, `isColorSupported` of `cli/colors.ts`',
          },
        ],
        code: "describe('terminal colors', () => {})",
        filename: resolve('test/cli/colors.test.ts'),
        output: "describe('colors', () => {})",
      })
    })

    it('reports several describes without a fix', async () => {
      write({
        'runtime/resolve-runtime-targets.ts': dedent`
          export interface ResolveOptions {}

          export const DEFAULT_NODE_FLOOR = '22.0.0'

          export function explainRuleSupport() {}

          export function resolveRuntimeTargets() {}

          export function compareVersions() {
            return 0
          }
        `,
      })

      let exports =
        '`resolveRuntimeTargets`, `explainRuleSupport`, `compareVersions` and 2 more'

      await invalid({
        errors: [
          {
            message: `Describe \`node targets\` does not match any of the exports ${exports} of \`runtime/resolve-runtime-targets.ts\``,
            line: 1,
          },
          {
            message: `Describe \`browser targets\` does not match any of the exports ${exports} of \`runtime/resolve-runtime-targets.ts\``,
            line: 3,
          },
        ],
        code: dedent`
          describe('node targets', () => {})

          describe('browser targets', () => {})
        `,
        filename: resolve('test/runtime/resolve-runtime-targets.test.ts'),
        output: null,
      })
    })

    it('does not fix a describe next to another one', async () => {
      write({ 'next/parse.ts': 'export function parse() {}' })

      await invalid({
        errors: [
          {
            message:
              'Describe `wrong` does not match the export `parse` of `next/parse.ts`',
            line: 3,
          },
        ],
        code: dedent`
          describe(name, () => {})

          describe('wrong', () => {})
        `,
        filename: resolve('test/next/parse.test.ts'),
        output: null,
      })
    })

    it('accepts a describe for every export', async () => {
      write({
        'runtime/create-runtime-configs.ts': dedent`
          export interface RuntimeGate {}

          export function createRuntimeConfigs() {}

          export function createRuntimeGate(): RuntimeGate {
            return {}
          }
        `,
      })

      await valid({
        code: dedent`
          describe('createRuntimeGate', () => {})

          describe('createRuntimeConfigs', () => {})

          describe('RuntimeGate', () => {})
        `,
        filename: resolve('test/runtime/create-runtime-configs.test.ts'),
      })
    })
  })

  describe('finds the module that a test file tests', () => {
    it.each([
      { filename: 'test/index.test.ts', subject: 'index.ts' },
      {
        filename: 'packages/app/test/api.test.ts',
        subject: 'packages/app/api.ts',
      },
      {
        filename: 'test/fixtures/app/test/greet.test.ts',
        subject: 'test/fixtures/app/greet.ts',
      },
      { filename: 'test/view/button.test.tsx', subject: 'view/button.tsx' },
      { filename: 'test/legacy/parse.test.ts', subject: 'legacy/parse.js' },
    ])('$subject for $filename', async ({ filename, subject }) => {
      write({ [subject]: 'export function subject() {}' })

      await invalid({
        errors: [
          {
            message: `Describe \`wrong\` does not match the export \`subject\` of \`${subject}\``,
          },
        ],
        output: "describe('subject', () => {})",
        code: "describe('wrong', () => {})",
        filename: resolve(filename),
      })
    })

    it.each([
      {
        filename: 'test/adapters/vitest/index.cache.test.ts',
        source: '../../../adapters/vitest/index',
        subject: 'adapters/vitest/index.ts',
      },
      {
        filename: 'test/prompt/select.windows.screens.test.ts',
        source: '../../prompt/select.js',
        subject: 'prompt/select.ts',
      },
      {
        filename: 'test/routes/index.cache.test.ts',
        subject: 'routes/index.ts',
        source: '../../routes',
      },
      {
        filename: 'test/chain/a.b.c.test.ts',
        source: '../../chain/a',
        subject: 'chain/a.ts',
      },
    ])(
      '$subject for $filename that imports $source',
      async ({ filename, subject, source }) => {
        write({
          'chain/a.b.ts': 'export function other() {}',
          [subject]: 'export function subject() {}',
        })

        await invalid({
          errors: [
            {
              message: `Describe \`wrong\` does not match the export \`subject\` of \`${subject}\``,
              line: 3,
            },
          ],
          output: `import { subject } from '${source}'\n\ndescribe('subject', () => {})`,
          code: `import { subject } from '${source}'\n\ndescribe('wrong', () => {})`,
          filename: resolve(filename),
        })
      },
    )

    it('finds an aspect that a test imports dynamically', async () => {
      write({ 'lazy/load.ts': 'export function load() {}' })

      await invalid({
        output: dedent`
          describe('load', () => {
            it('loads', async () => {
              await import('../../lazy/load')
            })
          })
        `,
        code: dedent`
          describe('wrong', () => {
            it('loads', async () => {
              await import('../../lazy/load')
            })
          })
        `,
        errors: [
          {
            message:
              'Describe `wrong` does not match the export `load` of `lazy/load.ts`',
          },
        ],
        filename: resolve('test/lazy/load.early.test.ts'),
      })
    })

    it.each([
      ['does not import', "import { describe } from 'vitest'"],
      ['imports through an alias', "import { config } from '~/core/config'"],
      [
        'imports with a computed path',
        "it('loads', async () => {\n  await import(modulePath)\n})",
      ],
      [
        'imports another module',
        "import { schema } from '../../core/config.schema.json'",
      ],
    ])('skips an aspect when the test %s', async (_situation, imports) => {
      write({
        'core/config.ts': 'export function config() {}',
        'core/config.schema.json': '{}',
      })

      await valid({
        code: `${imports}\n\ndescribe('config schema', () => {})`,
        filename: resolve('test/core/config.schema.test.ts'),
      })
    })

    it.each([
      {
        filename: 'test/both/parse.test.js',
        subject: 'both/parse.js',
        other: 'both/parse.ts',
      },
      {
        filename: 'test/services/user.service.test.ts',
        subject: 'services/user.service.ts',
        other: 'services/user.ts',
      },
      {
        filename: 'test/order/view.test.js',
        subject: 'order/view.ts',
        other: 'order/view.tsx',
      },
      {
        filename: 'test/long/a.b.test.ts',
        subject: 'long/a.b.js',
        other: 'long/a.ts',
      },
    ])('prefers $subject to $other', async ({ filename, subject, other }) => {
      write({
        [subject]: 'export function subject() {}',
        [other]: 'export function other() {}',
      })

      await invalid({
        errors: [
          {
            message: `Describe \`wrong\` does not match the export \`subject\` of \`${subject}\``,
          },
        ],
        output: "describe('subject', () => {})",
        code: "describe('wrong', () => {})",
        filename: resolve(filename),
      })
    })

    it.each<{
      files: Record<string, string>
      situation: string
      filename: string
    }>([
      {
        situation: 'a test file without a subject',
        filename: 'test/declarations.test.ts',
        files: {},
      },
      {
        files: { 'src/math.ts': 'export function math() {}' },
        situation: 'a test file outside a test directory',
        filename: 'src/math.test.ts',
      },
      {
        situation: 'a file in a test directory that is not a test',
        files: { 'helpers.ts': 'export function helpers() {}' },
        filename: 'test/helpers.ts',
      },
      {
        files: { 'math.ts': 'export function math() {}' },
        filename: 'test/math.spec.ts',
        situation: 'a spec file',
      },
      {
        files: { '.ts': 'export function nameless() {}' },
        situation: 'a test file without a name',
        filename: 'test/.test.ts',
      },
      {
        files: { 'notes.ts': 'export function notes() {}' },
        situation: 'a file that is not a module',
        filename: 'test/notes.test.md',
      },
      {
        files: { 'view/card.vue': 'export function card() {}' },
        situation: 'a test of a component',
        filename: 'test/view/card.test.ts',
      },
      {
        situation: 'a path through a file',
        files: { bin: 'console.log(1)' },
        filename: 'test/bin/cli.test.ts',
      },
      {
        files: {
          'nested/app/index.ts':
            'export function app() {}\nexport function helper() {}',
        },
        situation: 'an index next to test with several exports',
        filename: 'nested/app/test/index.test.ts',
      },
    ])('skips $situation', async ({ filename, files }) => {
      write(files)

      await valid({
        code: "describe('wrong', () => {})",
        filename: resolve(filename),
      })
    })

    it('skips code blocks that a processor extracts', () => {
      write({ 'blocks/parse.ts': 'export function parse() {}' })

      let linter = new ESLintLinter({ cwd: root })
      let code = "describe('wrong', () => {})"
      let filename = resolve('test/blocks/parse.test.ts')
      let processor: Linter.Processor = {
        postprocess: (messages: Linter.LintMessage[][]) => messages.flat(),
        preprocess: (text: string) => [{ filename: '0.js', text }],
      }
      let ruleConfig: Linter.Config = {
        plugins: {
          azat: {
            rules: {
              'test-describe-matches-subject': rule,
            },
          },
        },
        rules: {
          'azat/test-describe-matches-subject': 'error',
        },
        languageOptions: {
          parser: typescriptParser,
        },
        files: ['**/*.ts', '**/*.js'],
      }

      expect(
        linter.verify(
          code,
          [{ files: ['**/*.test.ts'], processor }, ruleConfig],
          filename,
        ),
      ).toStrictEqual([])
      expect(linter.verify(code, [ruleConfig], filename)).toHaveLength(1)
    })
  })

  describe('reads the exports of the subject', () => {
    it.each([
      ['a function', 'export function parse() {}', 'parse'],
      ['a class', 'export class Parser {}', 'Parser'],
      ['a constant', 'export const PARSE = 1', 'PARSE'],
      ['an enum', 'export enum Parse {}', 'Parse'],
      ['a type', 'export interface Parse {}', 'Parse'],
      ['a default function', 'export default function parse() {}', 'parse'],
      [
        'a function exported as default',
        'function parse() {}\nexport default parse',
        'parse',
      ],
      [
        'another export',
        'export function parse() {}\nexport function tokenize() {}',
        'tokenize',
      ],
      [
        'a type next to a value',
        'export interface Options {}\nexport function parse() {}',
        'Options',
      ],
      [
        'a named export next to a default one',
        'export default function parse() {}\nexport function tokenize() {}',
        'tokenize',
      ],
      [
        'a re-export',
        "export { tokenize } from './tokenize'\nexport function parse() {}",
        'tokenize',
      ],
    ])('accepts %s', async (_situation, subject, title) => {
      write({ 'reading/parse.ts': subject })

      await valid({
        filename: resolve('test/reading/parse.test.ts'),
        code: `describe('${title}', () => {})`,
      })
    })

    it.each([
      {
        subject:
          'export default function parse() {}\nexport function tokenize() {}',
        exports: 'any of the exports `parse`, `tokenize`',
        situation: 'the default function',
        main: 'parse',
      },
      {
        subject: 'export function tokenize() {}\nexport function parse() {}',
        exports: 'any of the exports `parse`, `tokenize`',
        situation: 'the value that the filename matches',
        main: 'parse',
      },
      {
        subject: "export const PARSE = 'parse'\nexport function parse() {}",
        situation: 'the strongest value that the filename matches',
        exports: 'any of the exports `parse`, `PARSE`',
        main: 'parse',
      },
      {
        subject: 'export interface Parse {}\nexport function createParser() {}',
        exports: 'any of the exports `createParser`, `Parse`',
        situation: 'the only value',
        main: 'createParser',
      },
      {
        situation: 'the type that the filename matches in a module of types',
        subject: 'export interface Options {}\nexport interface Parse {}',
        exports: 'any of the exports `Parse`, `Options`',
        main: 'Parse',
      },
      {
        subject: 'export type Options = Record<string, string>',
        exports: 'the export `Options`',
        situation: 'the only type',
        main: 'Options',
      },
      {
        subject:
          'function parse() {}\nexport default parse\nexport { parse }\nexport const VERSION = 1',
        situation: 'a name that the module exports twice',
        exports: 'any of the exports `parse`, `VERSION`',
        main: 'parse',
      },
    ])(
      'renames the describe after $situation',
      async ({ exports, subject, main }) => {
        write({ 'main/parse.ts': subject })

        await invalid({
          errors: [
            {
              message: `Describe \`wrong\` does not match ${exports} of \`main/parse.ts\``,
            },
          ],
          filename: resolve('test/main/parse.test.ts'),
          output: `describe('${main}', () => {})`,
          code: "describe('wrong', () => {})",
        })
      },
    )

    it('matches an index file by the name of its directory', async () => {
      write({
        'core/package-json/index.ts':
          'export function packageJson() {}\nexport function helper() {}',
      })

      await invalid({
        errors: [
          {
            message:
              'Describe `package-json` does not match any of the exports `packageJson`, `helper` of `core/package-json/index.ts`',
          },
        ],
        filename: resolve('test/core/package-json/index.test.ts'),
        output: "describe('packageJson', () => {})",
        code: "describe('package-json', () => {})",
      })
    })

    it('does not fix a title when the export name is not an identifier', async () => {
      write({
        'names/some-name.ts': "let value = 1\nexport { value as 'some-name' }",
      })

      await invalid({
        errors: [
          {
            message:
              'Describe `wrong` does not match the export `some-name` of `names/some-name.ts`',
          },
        ],
        filename: resolve('test/names/some-name.test.ts'),
        code: "describe('wrong', () => {})",
        output: null,
      })
    })

    it.each([
      ['a default export without a name', 'export default {}'],
      ['an anonymous default function', 'export default function () {}'],
      [
        'a re-export of every name',
        "export * from './tokenize'\nexport function parse() {}",
      ],
      [
        'several values that the filename does not match',
        'export function tokenize() {}\nexport function format() {}',
      ],
      [
        'several types that the filename does not match',
        'export interface Token {}\nexport interface Options {}',
      ],
      ['no exports', 'let parse = 1'],
      ['syntax errors', 'export function parse( {'],
    ])('skips a subject with %s', async (_situation, subject) => {
      write({ 'skipped/parse.ts': subject })

      await valid({
        filename: resolve('test/skipped/parse.test.ts'),
        code: "describe('wrong', () => {})",
      })
    })
  })

  describe('checks top-level describes', () => {
    let filename = resolve('test/calls/parse.test.ts')
    let message =
      'Describe `wrong` does not match the export `parse` of `calls/parse.ts`'

    beforeAll(() => {
      write({ 'calls/parse.ts': 'export function parse() {}' })
    })

    it.each([
      ["describe.only('wrong', () => {})", "describe.only('parse', () => {})"],
      ["describe.skip('wrong', () => {})", "describe.skip('parse', () => {})"],
      [
        "describe.concurrent.only('wrong', () => {})",
        "describe.concurrent.only('parse', () => {})",
      ],
      [
        "describe.skipIf(process.env['CI'])('wrong', () => {})",
        "describe.skipIf(process.env['CI'])('parse', () => {})",
      ],
      [
        "describe['only']('wrong', () => {})",
        "describe['only']('parse', () => {})",
      ],
      ['describe("wrong", () => {})', 'describe("parse", () => {})'],
      ['describe(`wrong`, () => {})', 'describe(`parse`, () => {})'],
      [
        "describe('wrong', { timeout: 1000 }, () => {})",
        "describe('parse', { timeout: 1000 }, () => {})",
      ],
      ["describe.todo('wrong')", "describe.todo('parse')"],
    ])('fixes %s', async (code, output) => {
      await invalid({
        errors: [{ message }],
        filename,
        output,
        code,
      })
    })

    it.each(['toMatchSnapshot', 'toThrowErrorMatchingSnapshot'])(
      'suggests the rename in a file that uses %s',
      async matcher => {
        await invalid({
          errors: [
            {
              suggestions: [
                {
                  fix: { text: "'parse'", range: [9, 16] },
                  desc: 'Rename the describe to `parse`',
                },
              ],
              message,
            },
          ],
          code: dedent`
            describe('wrong', () => {
              it('works', () => {
                expect(parse).${matcher}()
              })
            })
          `,
          output: null,
          filename,
        })
      },
    )

    it('fixes a file with inline snapshots', async () => {
      await invalid({
        output: dedent`
          describe('parse', () => {
            it('works', () => {
              expect(parse).toMatchInlineSnapshot()
            })
          })
        `,
        code: dedent`
          describe('wrong', () => {
            it('works', () => {
              expect(parse).toMatchInlineSnapshot()
            })
          })
        `,
        errors: [{ message }],
        filename,
      })
    })

    it.each([
      "describe.each([1, 2])('wrong', () => {})",
      "describe.for([1, 2])('wrong', () => {})",
      "describe.concurrent.each([1, 2])('wrong', () => {})",
      dedent`
        describe.each\`
          value
          \${1}
        \`('wrong', () => {})
      `,
    ])('reports %s without a fix', async code => {
      await invalid({
        errors: [{ message }],
        output: null,
        filename,
        code,
      })
    })

    it.each([
      [
        'nested describes',
        dedent`
          describe('parse', () => {
            describe('wrong', () => {})
          })
        `,
      ],
      ['a title with expressions', dedent`describe(\`\${title}\`, () => {})`],
      ['a variable as the title', 'describe(name, () => {})'],
      ['a number as the title', 'describe(1, () => {})'],
      ['a describe without arguments', 'describe()'],
      [
        'a parameterized describe named after the export',
        "describe.each([1, 2])('parse', () => {})",
      ],
      [
        'other calls',
        dedent`
          it('wrong', () => {})
          test.describe('wrong', () => {})
          suite('wrong', () => {})
          vi.mock('./parse')
          ;(() => {})()
        `,
      ],
      [
        'statements that are not calls',
        dedent`
          import { describe } from 'vitest'

          describe
          let title = 'wrong'
        `,
      ],
    ])('ignores %s', async (_situation, code) => {
      await valid({ filename, code })
    })
  })

  describe('parses the subject with the parser of the test file', () => {
    it('uses the default parser', () => {
      write({ 'espree/sum.js': 'export function sum() {}' })

      expect(lint('test/espree/sum.test.js')).toMatchObject([
        {
          message:
            'Describe `wrong` does not match the export `sum` of `espree/sum.js`',
        },
      ])
    })

    it('allows JSX in the subject', () => {
      write({
        'espree/card.jsx': 'export function Card() {\n  return <div />\n}',
      })

      expect(lint('test/espree/card.test.js')).toMatchObject([
        {
          message:
            'Describe `wrong` does not match the export `Card` of `espree/card.jsx`',
        },
      ])
    })

    it('skips a subject that the parser cannot read', () => {
      write({ 'espree/user.ts': 'export interface User {}' })

      expect(lint('test/espree/user.test.js')).toStrictEqual([])
    })

    it('parses the subject without type information', () => {
      write({ 'typed/parse.ts': 'export function parse(): void {}' })

      /**
       * The types of typescript-eslint declare no options of the parser.
       */
      let parseWithOptions = typescriptParser.parseForESLint as (
        code: string,
        options: object,
      ) => ReturnType<typeof typescriptParser.parseForESLint>
      let calls: unknown[] = []
      let parser = {
        parseForESLint: (code: string, options: Record<string, unknown>) => {
          calls.push(options)
          return parseWithOptions(code, {
            ...options,
            projectService: false,
          })
        },
      }

      expect(
        lint('test/typed/parse.test.ts', {
          parserOptions: {
            ecmaFeatures: {
              globalReturn: false,
            },
            tsconfigRootDir: root,
            projectService: true,
          },
          parser,
        }),
      ).toHaveLength(1)
      expect(calls.at(-1)).toStrictEqual({
        ecmaFeatures: {
          globalReturn: false,
          jsx: true,
        },
        filePath: resolve('typed/parse.ts'),
        projectService: false,
        tsconfigRootDir: root,
        ecmaVersion: 'latest',
        sourceType: 'module',
        programs: null,
        project: null,
        range: true,
        loc: true,
      })
    })
  })
})
