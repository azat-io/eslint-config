import type { Linter } from 'eslint'

import { createRuleTester } from 'eslint-vitest-rule-tester'
import * as astroParser from 'astro-eslint-parser'
import typescriptEslint from 'typescript-eslint'
import svelteParser from 'svelte-eslint-parser'
import { Linter as ESLintLinter } from 'eslint'
import { describe, expect, it } from 'vitest'
import vueParser from 'vue-eslint-parser'
import dedent from 'dedent'

import type { ConfigOptions } from '../../index'

import rule from '../../rules/filename-matches-export'
import { base } from '../../core/base/index'

let typescriptParser = typescriptEslint.parser

/**
 * Reads the options that the base config gives the rule.
 *
 * @param enabled - Config options to enable.
 * @returns Options of the rule in the base config.
 */
function getConfigOptions(enabled: Partial<ConfigOptions>): unknown[] {
  let ruleEntry = base({
    perfectionist: false,
    typescript: true,
    svelte: false,
    vitest: false,
    astro: false,
    react: false,
    qwik: false,
    node: false,
    vue: false,
    ...enabled,
  }).rules?.['azat-io/filename-matches-export'] as unknown[]
  return ruleEntry.slice(1)
}

describe('filename-matches-export', () => {
  let { invalid, valid } = createRuleTester({
    configs: {
      languageOptions: {
        parser: typescriptParser,
      },
    },
    name: 'filename-matches-export',
    rule,
  })

  let javascript = createRuleTester({
    configs: {
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    name: 'filename-matches-export',
    rule,
  })

  describe('reports the violations from the request', () => {
    it.each([
      {
        message:
          'Filename `internal-rate-limit-error.ts` does not match the export `GitHubRateLimitError`',
        code: 'export class GitHubRateLimitError extends Error {}',
        filename: 'core/api/internal-rate-limit-error.ts',
        column: 14,
        line: 1,
      },
      {
        code: dedent`
          export function getLineNumberForKey(content: string): number {
            return content.length
          }
        `,
        message:
          'Filename `get-line-number.ts` does not match the export `getLineNumberForKey`',
        filename: 'core/ast/utils/get-line-number.ts',
        column: 17,
        line: 1,
      },
      {
        code: dedent`
          export interface RunnerImage {
            label: string
          }

          export type RunnerFamily = 'windows' | 'ubuntu' | 'macos'

          export const KNOWN_RUNNER_IMAGES: Record<RunnerFamily, RunnerImage[]> = {
            windows: [],
            ubuntu: [],
            macos: [],
          }
        `,
        message:
          'Filename `known-runner-labels.ts` does not match any of the exports `KNOWN_RUNNER_IMAGES`, `RunnerImage`, `RunnerFamily`',
        filename: 'core/runners/known-runner-labels.ts',
        endColumn: 33,
        column: 14,
        endLine: 7,
        line: 7,
      },
      {
        message:
          'Filename `runner.ts` does not match the default export `HostRunner`',
        code: 'export default class HostRunner {}',
        filename: 'adapters/jest/runner.ts',
        column: 22,
        line: 1,
      },
      {
        code: dedent`
          export function getBuiltInAdapters(): string[] {
            return []
          }
        `,
        message:
          'Filename `built-in-adapters.ts` does not match the export `getBuiltInAdapters`',
        filename: 'cli/built-in-adapters.ts',
        column: 17,
        line: 1,
      },
    ])(
      '$filename',
      async ({ filename, message, column, code, line, ...end }) => {
        await invalid({
          errors: [{ message, column, line, ...end }],
          filename,
          code,
        })
      },
    )
  })

  describe('compares names without case and separators', () => {
    it.each([
      ['github.ts', 'export class GitHub {}'],
      ['common-js.ts', 'export function CommonJs(): void {}'],
      ['known-runner-images.ts', 'export const KNOWN_RUNNER_IMAGES = []'],
      ['url-parser.ts', 'export class URLParser {}'],
      ['get_user.ts', 'export function getUser(): void {}'],
      ['base64.ts', 'export function base64(): void {}'],
      ['Button.tsx', 'export function Button() { return <button /> }'],
      ['use-media-query.ts', 'export function useMediaQuery(): void {}'],
      ['$store.ts', 'export let $store = 1'],
      // cspell:disable-next-line
      ['привет-мир.ts', 'export function приветМир(): void {}'],
      ['café.ts', 'export function café(): void {}'],
    ])('%s', async (filename, code) => {
      await valid({ filename, code })
    })

    it('does not fold plurals', async () => {
      await invalid({
        errors: [
          {
            message:
              'Filename `adapters.ts` does not match the export `adapter`',
          },
        ],
        code: 'export function adapter(): void {}',
        filename: 'adapters.ts',
      })
    })
  })

  describe('lets the filename carry dot suffixes', () => {
    it.each([
      ['user.service.ts', 'export class UserService {}'],
      ['user.entity.ts', 'export class User {}'],
      ['logger.node.ts', 'export function logger(): void {}'],
      ['counter.svelte.ts', 'export function counter(): number { return 0 }'],
      ['next.config.ts', 'export function nextConfig(): void {}'],
    ])('%s', async (filename, code) => {
      await valid({ filename, code })
    })

    it('still reports a name that matches no prefix', async () => {
      await invalid({
        errors: [
          {
            message:
              'Filename `counter.svelte.ts` does not match the export `createCounter`',
          },
        ],
        code: 'export function createCounter(): number { return 0 }',
        filename: 'src/lib/counter.svelte.ts',
      })
    })
  })

  describe('default export', () => {
    it.each([
      ['runner.ts', 'export default class Runner extends Base {}'],
      ['runner.ts', 'export default abstract class Runner {}'],
      ['parse.js', 'export default async function* parse() {}'],
      ['parse.js', 'export default (function parse() {})'],
      ['parse.js', 'export default (class Parse {})'],
      ['parse.ts', 'function parse(): void {}\nexport default parse'],
      ['parse.ts', 'let parse = (): void => {}\nexport default parse'],
      ['parse.ts', 'class Parse {}\nexport default Parse'],
      [
        'parse.ts',
        'function parse(): void {}\nexport default parse as unknown as Parser',
      ],
      ['parse.ts', 'function parse(): void {}\nexport { parse as default }'],
      ['parse.ts', 'declare function parse(): void\nexport = parse'],
    ])('accepts a matching default export in %s', async (filename, code) => {
      await valid({ filename, code })
    })

    it.each([
      {
        code: 'export default (function bar() {})',
        situation: 'a named function expression',
        filename: 'foo.js',
      },
      {
        situation: 'an arrow function assigned to a name',
        code: 'let bar = () => {}\nexport default bar',
        filename: 'foo.js',
      },
      {
        situation: 'a class expression assigned to a name',
        code: 'let Bar = class {}\nexport default Bar',
        filename: 'foo.js',
      },
      {
        code: 'let parse = ((): void => {}) as Parser\nexport default parse',
        situation: 'a typed arrow function assigned to a name',
        filename: 'foo.ts',
      },
      {
        code: dedent`
          function bar<T>(value: T): T {
            return value
          }

          export default bar<string>
        `,
        situation: 'an instantiation expression',
        filename: 'foo.ts',
      },
      {
        code: dedent`
          function bar(): void {}

          export default (bar satisfies Function as Function)!
        `,
        situation: 'type wrappers',
        filename: 'foo.ts',
      },
      {
        code: 'function bar(): void {}\nexport default <Function>bar',
        situation: 'a type assertion',
        filename: 'foo.ts',
      },
    ])('reports $situation', async ({ filename, code }) => {
      await invalid({
        errors: [{ messageId: 'defaultMismatch' }],
        filename,
        code,
      })
    })

    it('reports an export assignment', async () => {
      await invalid({
        errors: [
          {
            message:
              'Filename `foo.ts` does not match the default export `bar`',
            column: 10,
            line: 2,
          },
        ],
        code: 'declare function bar(): void\nexport = bar',
        filename: 'foo.ts',
      })
    })

    it('reports the local name of a renamed default export', async () => {
      await invalid({
        errors: [
          {
            message:
              'Filename `formatter.ts` does not match the default export `format`',
            column: 10,
            line: 3,
          },
        ],
        code: dedent`
          function format(): void {}

          export { format as default }
        `,
        filename: 'formatter.ts',
      })
    })

    it('reads a default export named by a string literal', async () => {
      await javascript.invalid({
        code: 'function bar() {}\nexport { bar as "default" }',
        errors: [{ messageId: 'defaultMismatch' }],
        filename: 'foo.js',
      })
    })

    it('reports overloads of a default export once', async () => {
      await invalid({
        code: dedent`
          export default function bar(value: string): void
          export default function bar(value: number): void
          export default function bar(value: unknown): void {}
        `,
        errors: [
          {
            message:
              'Filename `foo.ts` does not match the default export `bar`',
          },
        ],
        filename: 'foo.ts',
      })
    })

    it('takes precedence over named exports', async () => {
      await invalid({
        code: dedent`
          export function Button() {
            return <button />
          }

          export default function ThemedButton() {
            return <Button />
          }
        `,
        errors: [
          {
            message:
              'Filename `button.tsx` does not match the default export `ThemedButton`',
          },
        ],
        filename: 'button.tsx',
      })
    })

    it('stays the only candidate when named exports are allowed', async () => {
      await invalid({
        code: dedent`
          export let metadata = {}

          export default function BlogPost() {
            return null
          }
        `,
        errors: [{ messageId: 'defaultMismatch' }],
        options: [{ allow: ['metadata'] }],
        filename: 'page.tsx',
      })
    })

    it.each([
      {
        code: 'export default { name: "Other" }\nexport let helper = 1',
        situation: 'an object',
      },
      {
        code: dedent`
          export default createEslintRule<Options>({ name: 'other' })
          export let jsonSchema = {}
        `,
        situation: 'a call',
      },
      {
        code: dedent`
          import type { Config } from 'prettier'

          const config: Config = { semi: false }

          export default config
        `,
        situation: 'an object behind a name',
      },
      {
        code: 'import bar from "./bar"\nexport default bar',
        situation: 'an imported binding',
      },
      {
        code: 'export default function () {}\nexport let helper = 1',
        situation: 'an anonymous function',
      },
      {
        code: dedent`
          export default function (value: string): void
          export default function (value: unknown): void {}
        `,
        situation: 'an anonymous overload',
      },
      {
        code: 'export default class extends Base {}\nexport let helper = 1',
        situation: 'an anonymous class',
      },
      {
        code: 'export default (): void => {}',
        situation: 'an arrow function',
      },
      {
        code: 'export default interface Other {}',
        situation: 'an interface',
      },
      {
        code: 'function Other() {}\nexport default memo(Other)',
        situation: 'a wrapped call',
      },
      {
        code: 'export { default } from "./other"\nexport function helper() {}',
        situation: 'a default re-export',
      },
      {
        code: dedent`
          export function format(): void {}

          export { format as default } from './legacy-format'
        `,
        situation: 'a renamed default re-export',
      },
      {
        code: 'export * as default from "./other"\nexport function helper() {}',
        situation: 'a namespace re-export',
      },
      {
        situation: 'an export assignment of an object',
        code: 'export = { other: 1 }',
      },
      {
        code: 'let other = {}\nexport default other satisfies object',
        situation: 'an object with a type wrapper',
      },
      {
        code: 'class User {}\nexport type { User as default }',
        situation: 'a class exported as a type',
      },
      {
        code: 'class User {}\nexport { type User as default }',
        situation: 'a class exported with a type specifier',
      },
    ])('skips the file for $situation', async ({ code }) => {
      await valid({ filename: 'foo.tsx', code })
    })

    it('is still checked next to `export *`', async () => {
      await invalid({
        code: dedent`
          export * from './card-props'

          export default function Button() {
            return null
          }
        `,
        errors: [{ messageId: 'defaultMismatch' }],
        filename: 'card.ts',
      })
    })
  })

  describe('named exports', () => {
    it.each([
      {
        code: dedent`
          export interface LintClient {
            lint(): void
          }

          export function createLintClient(): LintClient {
            return { lint: () => {} }
          }
        `,
        filename: 'lint-client.ts',
        situation: 'a type',
      },
      {
        code: dedent`
          export function createColors(): void {}

          export function isColorSupported(): boolean {
            return true
          }

          export let colors = createColors()
        `,
        situation: 'one of several values',
        filename: 'colors.ts',
      },
      {
        code: 'let value = 1\nexport { value as "foo-bar" }',
        situation: 'a string literal name',
        filename: 'foo-bar.js',
      },
      {
        code: 'export * as ns from "./ns"',
        situation: 'a namespace re-export',
        filename: 'ns.js',
      },
      {
        code: 'export { formatDate } from "./format-date"',
        filename: 'format-date.js',
        situation: 'a re-export',
      },
    ])('accepts a match with $situation', async ({ filename, code }) => {
      await valid({ filename, code })
    })

    it('reports a single constant', async () => {
      await invalid({
        errors: [
          {
            message:
              'Filename `code-theme.ts` does not match the export `colorTheme`',
          },
        ],
        code: 'export let colorTheme = { name: "dark" }',
        filename: 'docs/utils/code-theme.ts',
      })
    })

    it('reports several functions', async () => {
      await invalid({
        code: dedent`
          export type ColorName = 'green' | 'red'

          export type Color = (input: string) => string

          export function createColors(): Record<ColorName, Color> {
            return { green: input => input, red: input => input }
          }

          export function isColorSupported(): boolean {
            return true
          }
        `,
        errors: [
          {
            message:
              'Filename `colors.ts` does not match any of the exports `createColors`, `isColorSupported`, `ColorName`, `Color`',
            column: 17,
            line: 5,
          },
        ],
        filename: 'cli/terminal/colors.ts',
      })
    })

    it('reports a function next to constants on the function', async () => {
      await invalid({
        code: dedent`
          export const GUIDE_ORDER = ['introduction']

          export const CONFIG_ORDER = ['recommended']

          export function orderIndex(order: string[], id: string): number {
            return order.indexOf(id)
          }
        `,
        errors: [
          {
            message:
              'Filename `collections.ts` does not match any of the exports `orderIndex`, `GUIDE_ORDER`, `CONFIG_ORDER`',
            column: 17,
            line: 5,
          },
        ],
        filename: 'docs/data/collections.ts',
      })
    })

    it('shortens long lists of names', async () => {
      await invalid({
        code: dedent`
          export function a(): void {}
          export function b(): void {}
          export function c(): void {}
          export function d(): void {}
          export function e(): void {}
        `,
        errors: [
          {
            message:
              'Filename `helpers.ts` does not match any of the exports `a`, `b`, `c` and 2 more',
          },
        ],
        filename: 'helpers.ts',
      })
    })

    it.each([
      {
        code: dedent`
          export const GITHUB_DIRECTORY = '.github'
          export const WORKFLOWS_DIRECTORY = 'workflows'
          export const LOCKFILE_NAME = 'actions.lock'
        `,
        filename: 'core/constants.ts',
        situation: 'constants',
      },
      {
        code: dedent`
          export type Options = Record<string, unknown>

          export const ORDER_ERROR_ID = 'unexpectedOrder'

          export let allSelectors = ['method', 'property']
        `,
        filename: 'rules/sort-classes/types.ts',
        situation: 'constants and types',
      },
      {
        code: dedent`
          import { workspace as vscodeWorkspace } from './vscode'

          export let workspace = vscodeWorkspace

          export const { languages, window } = createApi()
        `,
        situation: 'aliases and destructured values',
        filename: 'docs/mocks/vscode-api.ts',
      },
      {
        code: dedent`
          export { Button } from './button'
          export { Card } from './card'
        `,
        filename: 'public-api.ts',
        situation: 're-exports',
      },
      {
        code: 'export enum Direction { Up }\nexport enum Side { Left }',
        filename: 'enums.ts',
        situation: 'enums',
      },
    ])('skips a collection of $situation', async ({ filename, code }) => {
      await valid({ filename, code })
    })

    it.each([
      {
        filename: 'rules/sort-sets/types.ts',
        code: 'export type Options = []',
      },
      {
        code: dedent`
          export interface VitestHeartbeat {
            time: number
          }

          export type VitestOutLine = string
        `,
        filename: 'vitest-worker.ts',
      },
      {
        code: 'export type * from "./types"',
        filename: 'shared.ts',
      },
      {
        code: 'import type { Options } from "./options"\nexport { Options }',
        filename: 'config.ts',
      },
      {
        code: 'import { type Options } from "./options"\nexport { Options }',
        filename: 'config.ts',
      },
      {
        code: 'type Options = []\nexport type { Options }',
        filename: 'config.ts',
      },
      {
        code: 'type Options = []\nexport { type Options }',
        filename: 'config.ts',
      },
      {
        code: 'export type * as types from "./types"',
        filename: 'shared.ts',
      },
      {
        code: 'import type Foo = require("foo")\nexport { Foo }',
        filename: 'shared.ts',
      },
      {
        code: dedent`
          export namespace Api {
            export interface User {}
          }

          export type Id = string
        `,
        filename: 'src/models.ts',
      },
      {
        code: dedent`
          export type StandardSchemaV1 = { version: 1 }

          export declare namespace StandardSchemaV1 {
            export interface Props {}
            export type Result = string
            export {}
          }
        `,
        filename: 'src/vendor/schema.ts',
      },
      {
        code: dedent`
          export namespace Outer {
            export namespace Inner {
              type Hidden = 1
              export type Value = Hidden
            }
          }
        `,
        filename: 'src/models.ts',
      },
      {
        code: 'export namespace Empty {}',
        filename: 'src/models.ts',
      },
    ])('skips a module of types: $filename', async ({ filename, code }) => {
      await valid({ filename, code })
    })

    it('ignores ambient modules without a body', async () => {
      await invalid({
        errors: [
          {
            message: 'Filename `icons.ts` does not match the export `other`',
          },
        ],
        code: 'declare module "virtual:icons"\nexport function other(): void {}',
        filename: 'src/icons.ts',
      })
    })

    it.each([
      {
        code: "export const GITHUB_DIRECTORY = '.github'",
        filename: 'core/constants.ts',
      },
      {
        code: "export type Options = []\nexport let allSelectors = ['method']",
        filename: 'rules/sort-sets/types.ts',
      },
      {
        code: 'export const API_URL = "https://example.com"',
        filename: 'src/api.constants.ts',
      },
    ])(
      'skips a collection file with one constant: $filename',
      async ({ filename, code }) => {
        await valid({ filename, code })
      },
    )

    it.each([
      {
        code: "export function getDirectory(): string {\n  return '.github'\n}",
        filename: 'core/constants.ts',
      },
      {
        code: 'export const USER_ROLES = ["admin"]',
        filename: 'src/user-types.ts',
      },
    ])(
      'checks $filename, which is no collection file',
      async ({ filename, code }) => {
        await invalid({
          errors: [{ messageId: 'namedMismatch' }],
          filename,
          code,
        })
      },
    )

    it('skips a module that re-exports all names of another one', async () => {
      await valid({
        code: 'export * from "./a"\nexport const b = 1',
        filename: 'utils.ts',
      })
    })

    it.each([
      {
        code: 'export function bar(value: string): void\nexport function bar(value: unknown): void {}',
        message: 'Filename `foo.ts` does not match the export `bar`',
        situation: 'overloads',
      },
      {
        code: 'export let bar = (): void => {}\nexport type bar = () => void',
        message: 'Filename `foo.ts` does not match the export `bar`',
        situation: 'a value and a type with one name',
      },
      {
        message: 'Filename `foo.ts` does not match the export `Bar`',
        code: 'export interface Bar {}\nexport class Bar {}',
        situation: 'a type merged with a later class',
      },
      {
        code: 'export type Bar = { a: 1 }\nexport const Bar = { a: 1 }',
        message: 'Filename `foo.ts` does not match the export `Bar`',
        situation: 'a type merged with a later constant',
      },
    ])('counts $situation as one export', async ({ message, code }) => {
      await invalid({
        errors: [{ message }],
        filename: 'foo.ts',
        code,
      })
    })

    it('reports a merged name on its value', async () => {
      await invalid({
        errors: [
          {
            message:
              'Filename `other.ts` does not match any of the exports `foo`, `Bar`',
            column: 17,
            line: 2,
          },
        ],
        code: dedent`
          export interface Bar {}
          export function foo(): void {}
          export class Bar {}
        `,
        filename: 'other.ts',
      })
    })

    it('ranks a function above a namespace merged with it', async () => {
      await invalid({
        code: dedent`
          function foo(): void {}

          namespace foo {
            export const value = 1
          }

          export { foo }

          export const BAR = 1
        `,
        errors: [{ messageId: 'namedMismatchAny' }],
        filename: 'other.ts',
      })
    })

    it.each([
      {
        code: 'export const { a = 1, b: { c }, ...rest } = createValues()',
        names: '`createValues`, `a`, `c`, `rest`',
      },
      {
        code: 'export const [, a, [b], ...rest] = createValues()',
        names: '`createValues`, `a`, `b`, `rest`',
      },
    ])('reads the names of $names', async ({ names, code }) => {
      await invalid({
        errors: [
          {
            message: `Filename \`values.ts\` does not match any of the exports ${names}`,
          },
        ],
        code: `${code}\nexport function createValues(): void {}`,
        filename: 'values.ts',
      })
    })

    it('reads the names of destructured values', async () => {
      await valid({
        code: 'export const { values } = createApi()\nexport function other(): void {}',
        filename: 'values.ts',
      })
    })

    it.each([
      {
        code: 'export namespace Foo.Bar.Baz {\n  export const a = 1\n}',
        situation: 'a dotted namespace',
        name: 'Foo',
      },
      {
        code: 'export declare namespace Foo {\n  const a: 1\n}',
        situation: 'a namespace',
        name: 'Foo',
      },
      {
        code: 'export enum Foo { A }',
        situation: 'an enum',
        name: 'Foo',
      },
      {
        code: 'export declare const enum Foo { A }',
        situation: 'a declared const enum',
        name: 'Foo',
      },
      {
        code: 'export import Foo = require("foo")',
        situation: 'an import alias',
        name: 'Foo',
      },
      {
        code: 'export declare const foo: () => void',
        situation: 'a declared constant',
        name: 'foo',
      },
      {
        situation: 'a variable without a value',
        code: 'export let foo',
        name: 'foo',
      },
      {
        code: 'export declare function foo(): void',
        situation: 'a declared function',
        name: 'foo',
      },
      {
        code: '@decorate\nexport class Foo {}',
        situation: 'a decorated class',
        name: 'Foo',
      },
    ])('reads $situation', async ({ name, code }) => {
      await invalid({
        errors: [
          {
            message: `Filename \`other.ts\` does not match the export \`${name}\``,
          },
        ],
        filename: 'other.ts',
        code,
      })
    })

    it.each([
      {
        code: 'export declare global {\n  interface Window {}\n}',
        situation: 'a global augmentation',
      },
      {
        code: 'declare global {\n  interface Window {}\n}\nexport {}',
        situation: 'a module marker',
      },
      {
        code: 'export declare module "x" {\n  export const other: 1\n}',
        situation: 'an ambient module',
      },
      {
        code: 'declare module "x" {\n  export default other\n}',
        situation: 'a default export in an ambient module',
      },
    ])('ignores $situation', async ({ code }) => {
      await valid({ filename: 'foo.ts', code })
    })

    it('ignores exports nested in a namespace', async () => {
      await invalid({
        errors: [
          {
            message: 'Filename `bar.ts` does not match the export `NS`',
          },
        ],
        code: 'namespace NS {\n  export const bar = 1\n}\nexport { NS }',
        filename: 'bar.ts',
      })
    })

    it.each([
      {
        code: 'function bar(): void {}\nexport { bar }',
        messageId: 'namedMismatch',
        situation: 'a function',
      },
      {
        code: 'let bar = function (): void {}\nexport { bar }',
        situation: 'a function expression',
        messageId: 'namedMismatch',
      },
      {
        code: 'let bar = 1\nlet baz = (): void => {}\nexport { bar, baz }',
        situation: 'a constant and a function',
        messageId: 'namedMismatchAny',
      },
    ])(
      'resolves an export list with $situation',
      async ({ messageId, code }) => {
        await invalid({
          errors: [{ messageId }],
          filename: 'foo.ts',
          code,
        })
      },
    )

    it('reports on the exported name of an export list', async () => {
      await invalid({
        errors: [
          {
            message: 'Filename `route.ts` does not match the export `handler`',
            column: 17,
            line: 2,
          },
        ],
        code: 'function GET(): void {}\nexport { GET as handler }',
        filename: 'route.ts',
      })
    })

    it('treats bindings declared in nested blocks as constants', async () => {
      await javascript.valid({
        code: '{\n  var bar = () => {}\n}\nexport { bar }\nexport const BAZ = 1',
        filename: 'foo.js',
      })
    })

    it.each([
      {
        code: "import * as path from 'node:path'\nexport { path }",
        name: 'path',
      },
      {
        code: "import url from 'node:url'\nexport { url }",
        name: 'url',
      },
    ])('reads the import of $name as a value', async ({ name, code }) => {
      await javascript.invalid({
        errors: [
          {
            message: `Filename \`paths.js\` does not match the export \`${name}\``,
          },
        ],
        filename: 'paths.js',
        code,
      })
    })
  })

  describe('allow', () => {
    it('skips a module whose exports are all allowed', async () => {
      await valid({
        code: dedent`
          export async function initialize(data: unknown): Promise<void> {}

          export async function load(url: string): Promise<unknown> {
            return url
          }
        `,
        options: [{ allow: ['initialize', 'load', 'resolve'] }],
        filename: 'adapters/node-test/preload/hooks.ts',
      })
    })

    it('needs the names that the module exports', async () => {
      await invalid({
        code: dedent`
          export async function initialize(data: unknown): Promise<void> {}

          export async function load(url: string): Promise<unknown> {
            return url
          }
        `,
        errors: [
          {
            message:
              'Filename `hooks.ts` does not match any of the exports `initialize`, `load`',
            column: 23,
            line: 1,
          },
        ],
        filename: 'adapters/node-test/preload/hooks.ts',
      })
    })

    it('matches the filename before it applies the names', async () => {
      await valid({
        code: dedent`
          export interface SetupOptions {
            force?: boolean
          }

          export function setup(options: SetupOptions): void {}
        `,
        options: [{ allow: ['setup', 'teardown'] }],
        filename: 'test/setup.ts',
      })
    })

    it('reports only the names that are not allowed', async () => {
      await invalid({
        errors: [
          {
            message: 'Filename `users.ts` does not match the export `getUsers`',
            column: 17,
            line: 3,
          },
        ],
        code: dedent`
          export let GET = (): Response => new Response()

          export function getUsers(): string[] {
            return []
          }
        `,
        options: [{ allow: ['GET'] }],
        filename: 'pages/users.ts',
      })
    })

    it.each([
      {
        code: dedent`
          export const runtime = 'nodejs'

          export function GET(): Response {
            return Response.json([])
          }
        `,
        filename: 'app/api/users/route.ts',
        situation: 'a Next.js route',
      },
      {
        code: dedent`
          export const dynamic = 'force-dynamic'
          export const maxDuration = 30
          export const revalidate = false

          export async function GET(): Promise<Response> {
            return Response.json([])
          }

          export async function POST(): Promise<Response> {
            return Response.json([])
          }
        `,
        situation: 'a Next.js route with several handlers',
        filename: 'app/api/users/route.ts',
      },
      {
        code: 'export const prerender = false\nexport const GET = (): Response => new Response()',
        situation: 'an Astro endpoint',
        filename: 'pages/rss.xml.ts',
      },
    ])(
      'skips constants that configure allowed exports in $situation',
      async ({ filename, code }) => {
        await valid({
          options: [{ allow: ['GET', 'POST'] }],
          filename,
          code,
        })
      },
    )

    it('reports functions next to allowed exports', async () => {
      await invalid({
        code: dedent`
          export const runtime = 'nodejs'

          export function toUser(row: string): string {
            return row
          }

          export function GET(): Response {
            return Response.json([])
          }
        `,
        errors: [
          {
            message: 'Filename `route.ts` does not match the export `toUser`',
            column: 17,
            line: 3,
          },
        ],
        filename: 'app/api/users/route.ts',
        options: [{ allow: ['GET'] }],
      })
    })

    it('skips types next to allowed functions', async () => {
      await valid({
        code: 'export function GET(): void {}\nexport type Props = {}',
        options: [{ allow: ['GET'] }],
        filename: 'pages/rss.xml.ts',
      })
    })

    it('allows only values', async () => {
      await invalid({
        errors: [
          {
            message:
              'Filename `navigation.ts` does not match any of the exports `routes`, `Route`',
            column: 14,
            line: 5,
          },
        ],
        code: dedent`
          export interface Route {
            path: string
          }

          export const routes: Route[] = []
        `,
        options: [{ allow: ['Route'] }],
        filename: 'src/navigation.ts',
      })
    })

    it('compares the exported name, not the local one', async () => {
      await valid({
        code: 'function handler(): void {}\nexport { handler as GET }',
        filename: 'pages/search-index.json.ts',
        options: [{ allow: ['GET'] }],
      })

      await invalid({
        code: 'function handler(): void {}\nexport { handler as GET }',
        errors: [{ messageId: 'namedMismatch' }],
        filename: 'pages/search-index.json.ts',
        options: [{ allow: ['handler'] }],
      })
    })

    it('compares the own name of a default export', async () => {
      await valid({
        code: 'export default function setup(): void {}',
        filename: 'vitest.global-setup.ts',
        options: [{ allow: ['setup'] }],
      })
    })

    it('compares names with case', async () => {
      await invalid({
        errors: [{ messageId: 'namedMismatch' }],
        code: 'export function get(): void {}',
        options: [{ allow: ['GET'] }],
        filename: 'endpoint.ts',
      })
    })
  })

  describe('with the names that the config allows', () => {
    it.each([
      {
        code: dedent`
          export function generateStaticParams(): { id: string }[] {
            return [{ id: '1' }]
          }

          export function GET(): Response {
            return Response.json({})
          }
        `,
        filename: 'app/api/users/[id]/route.ts',
      },
      {
        code: dedent`
          export const runtime = 'nodejs'
          export const maxDuration = 30

          export async function GET(): Promise<Response> {
            return Response.json([])
          }
        `,
        filename: 'app/api/users/route.ts',
      },
      {
        code: dedent`
          export async function register(): Promise<void> {}

          export let onRequestError = async (error: unknown): Promise<void> => {}
        `,
        filename: 'instrumentation.ts',
      },
      {
        code: 'export function onRouterTransitionStart(url: string): void {}',
        filename: 'src/instrumentation-client.ts',
      },
      {
        code: dedent`
          export function useMDXComponents(components: object): object {
            return components
          }
        `,
        filename: 'mdx-components.tsx',
      },
      {
        code: dedent`
          export const Route = createRootRoute({
            component: Root,
          })

          function Root() {
            return null
          }
        `,
        filename: 'src/routes/__root.tsx',
      },
      {
        code: "export const Route = createFileRoute('/posts/$postId')({})",
        filename: 'src/routes/posts.$postId.tsx',
      },
      {
        code: dedent`
          export async function loader(): Promise<Response> {
            return new Response('')
          }
        `,
        filename: 'app/routes/reports.$id.pdf.ts',
      },
    ])('accepts $filename with react', async ({ filename, code }) => {
      await valid({
        options: getConfigOptions({ react: true }),
        filename,
        code,
      })
    })

    it('reports Next.js names without react', async () => {
      await invalid({
        code: dedent`
          export function generateStaticParams(): { id: string }[] {
            return [{ id: '1' }]
          }

          export function GET(): Response {
            return Response.json({})
          }
        `,
        errors: [{ messageId: 'namedMismatch' }],
        filename: 'app/api/users/[id]/route.ts',
        options: getConfigOptions({}),
      })
    })

    it.each([
      {
        code: dedent`
          export async function initialize(data: unknown): Promise<void> {}

          export async function load(url: string): Promise<unknown> {
            return url
          }
        `,
        filename: 'adapters/node-test/preload/hooks.ts',
        enabled: { node: true },
      },
      {
        code: dedent`
          export function getStaticPaths(): object[] {
            return []
          }

          export function GET(): Response {
            return new Response('')
          }
        `,
        filename: 'src/pages/rss.xml.ts',
        enabled: { astro: true },
      },
      {
        code: dedent`
          import { defineCollection } from 'astro:content'

          export const collections = {
            blog: defineCollection({}),
          }
        `,
        filename: 'src/content.config.ts',
        enabled: { astro: true },
      },
      {
        code: 'export function onRequest(): void {}',
        filename: 'src/routes/plugin@auth.ts',
        enabled: { qwik: true },
      },
      {
        code: dedent`
          export async function handle(): Promise<Response> {
            return new Response('')
          }

          export function handleError(): void {}
        `,
        filename: 'src/hooks.server.ts',
        enabled: { svelte: true },
      },
      {
        code: 'export function setup(): void {}\nexport function teardown(): void {}',
        filename: 'test/global-setup.ts',
        enabled: { vitest: true },
      },
    ])('accepts $filename', async ({ filename, enabled, code }) => {
      await valid({
        options: getConfigOptions(enabled),
        filename,
        code,
      })
    })
  })

  describe('skips files', () => {
    it.each([
      'index.ts',
      'src/index.tsx',
      'src/Index.tsx',
      'src/index.server.ts',
      'src/routes/index@narrow.tsx',
      'src/routes/+page.ts',
      'src/routes/+page.server.ts',
      'src/routes/api/+server.ts',
      'types/foo.d.ts',
      'types/foo.d.mts',
      'types/foo.d.cts',
      'src/styles.d.css.ts',
      'test/__mocks__/vscode.ts',
      '__mocks__/fs.ts',
      '__placeholder__.js',
      '_.ts',
      '$.ts',
      '-.ts',
      'pages/_app.tsx',
      'app/_layout.tsx',
      'app/routes/_index.tsx',
      'pages/blog/[slug].tsx',
      'app/routes/users.$id.tsx',
      'app/page.tsx',
      'src/app/(marketing)/about/layout.tsx',
      'app/opengraph-image.tsx',
      'pages/api/users.ts',
      'src/pages/api/auth/callback.ts',
      'app/root.tsx',
      'app/entry.server.tsx',
      'src/readme.md',
      'src/components/user-card.vue',
      'src/lib/counter.svelte',
      'src/pages/[slug].astro',
    ])('%s', async filename => {
      await valid({
        code: 'export function other(): void {}',
        filename,
      })
    })

    it.each([
      'src/layout.tsx',
      'app/components/user-card.tsx',
      'app/lib/root.ts',
      'pages/api.ts',
      'src/indexer.ts',
      'src/foo.mjs',
      'src/foo.cjs',
      'src/foo.mts',
      'src/foo.cts',
      'src/foo.jsx',
    ])('checks %s', async filename => {
      await invalid({
        languageOptions: {
          sourceType: 'module',
        },
        errors: [{ messageId: 'namedMismatch' }],
        code: 'export function other(): void {}',
        filename,
      })
    })

    it('finds directories relative to the working directory', () => {
      let config: Linter.Config = {
        plugins: {
          azat: {
            rules: {
              'filename-matches-export': rule,
            },
          },
        },
        rules: {
          'azat/filename-matches-export': 'error',
        },
      }
      let code = 'export function other() {}'
      let mocksProject = new ESLintLinter({ cwd: '/projects/__mocks__/app' })
      let project = new ESLintLinter({ cwd: '/projects/app' })

      expect(
        mocksProject.verify(code, config, '/projects/__mocks__/app/src/foo.js'),
      ).toHaveLength(1)
      expect(
        project.verify(code, config, '/projects/app/src/__mocks__/foo.js'),
      ).toStrictEqual([])
      expect(
        project.verify(code, config, '/projects/app/src/page.js'),
      ).toHaveLength(1)
      expect(
        project.verify(code, config, '/projects/app/app/page.js'),
      ).toStrictEqual([])
    })

    it.each([
      {
        code: dedent`
          <script lang="ts">
          export const helper = 1
          </script>

          <template><div /></template>
        `,
        filename: 'src/components/user-card.vue',
        parser: vueParser,
      },
      {
        code: dedent`
          <script module>
            export const other = 1
          </script>

          <p>counter</p>
        `,
        filename: 'src/lib/counter.svelte',
        parser: svelteParser,
      },
      {
        code: dedent`
          ---
          export const prerender = true
          export function getStaticPaths() { return [] }
          ---

          <div />
        `,
        filename: 'src/pages/[slug].astro',
        parser: astroParser,
      },
    ])('component $filename', async ({ filename, parser, code }) => {
      await valid({
        languageOptions: {
          parserOptions: {
            parser: typescriptParser,
          },
          parser,
        },
        filename,
        code,
      })
    })

    it('a CommonJS module', async () => {
      await javascript.valid({
        code: 'module.exports = function bar() {}',
        filename: 'src/foo.cjs',
      })
    })

    it('code blocks of a processor', () => {
      let linter = new ESLintLinter()
      let code = 'export function other() {}'
      let processor: Linter.Processor = {
        postprocess: (messages: Linter.LintMessage[][]) => messages.flat(),
        preprocess: (text: string) => [{ filename: '0.js', text }],
      }
      let ruleConfig: Linter.Config = {
        plugins: {
          azat: {
            rules: {
              'filename-matches-export': rule,
            },
          },
        },
        rules: {
          'azat/filename-matches-export': 'error',
        },
        files: ['**/*.js', '**/*.md'],
      }

      expect(
        linter.verify(
          code,
          [{ files: ['**/*.md'], processor }, ruleConfig],
          'docs/readme.md',
        ),
      ).toStrictEqual([])
      expect(
        linter.verify(
          code,
          [{ files: ['**/*.js'], processor }, ruleConfig],
          'src/thing.js',
        ),
      ).toStrictEqual([])
      expect(linter.verify(code, [ruleConfig], 'src/thing.js')).toHaveLength(1)
    })

    it('text without a filename', () => {
      let linter = new ESLintLinter()

      expect(
        linter.verify('export function other() {}', {
          plugins: {
            azat: {
              rules: {
                'filename-matches-export': rule,
              },
            },
          },
          rules: {
            'azat/filename-matches-export': 'error',
          },
        }),
      ).toStrictEqual([])
    })
  })

  describe('options', () => {
    function verify(options: unknown): void {
      let linter = new ESLintLinter()
      linter.verify(
        'export function other() {}',
        {
          plugins: {
            azat: {
              rules: {
                'filename-matches-export': rule,
              },
            },
          },
          rules: {
            'azat/filename-matches-export': ['error', options],
          },
        },
        'foo.js',
      )
    }

    it('rejects unknown options', () => {
      expect(() => {
        verify({ ignore: ['other'] })
      }).toThrow(/should NOT have additional properties/u)
    })

    it('rejects duplicate names', () => {
      expect(() => {
        verify({ allow: ['other', 'other'] })
      }).toThrow(/duplicate items/u)
    })
  })
})
