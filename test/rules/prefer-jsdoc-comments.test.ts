import { createRuleTester } from 'eslint-vitest-rule-tester'
import * as astroParser from 'astro-eslint-parser'
import typescriptEslint from 'typescript-eslint'
import svelteParser from 'svelte-eslint-parser'
import vueParser from 'vue-eslint-parser'
import { describe, it } from 'vitest'
import dedent from 'dedent'

import rule from '../../rules/prefer-jsdoc-comments'

let typescriptParser = typescriptEslint.parser

describe('prefer-jsdoc-comments', () => {
  let { invalid, valid } = createRuleTester({
    configs: {
      languageOptions: {
        parser: typescriptParser,
      },
    },
    name: 'prefer-jsdoc-comments',
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
    name: 'prefer-jsdoc-comments',
    rule,
  })

  describe('turns line comments into JSDoc comments', () => {
    it('a comment on its own line', async () => {
      await invalid({
        output: dedent`
          function wait(): void {
            /**
             * Nothing may be listening when the host dies.
             */
            void died.catch(() => {})
          }
        `,
        errors: [
          {
            messageId: 'preferJsdoc',
            endColumn: 50,
            endLine: 2,
            column: 3,
            line: 2,
          },
        ],
        code: dedent`
          function wait(): void {
            // Nothing may be listening when the host dies.
            void died.catch(() => {})
          }
        `,
        filename: 'src/run.ts',
      })
    })

    it('consecutive comments as one comment', async () => {
      await invalid({
        output: dedent`
          if (real === null) {
            /**
             * A clone, since the transformer changes its options in place:
             * that changes the project copy.
             */
            let clone = structuredClone(config)
          }
        `,
        code: dedent`
          if (real === null) {
            // A clone, since the transformer changes its options in place:
            // that changes the project copy.
            let clone = structuredClone(config)
          }
        `,
        errors: [
          {
            messageId: 'preferJsdoc',
            endColumn: 36,
            endLine: 3,
            column: 3,
            line: 2,
          },
        ],
        filename: 'src/run.ts',
      })
    })

    it('comments in an array', async () => {
      await invalid({
        output: dedent`
          let names = [
            /**
             * The setup file reached it.
             */
            'after-env',
            /**
             * No test is left.
             */
            'cases',
          ]
        `,
        code: dedent`
          let names = [
            // The setup file reached it.
            'after-env',
            // No test is left.
            'cases',
          ]
        `,
        errors: [{ messageId: 'preferJsdoc' }, { messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('a comment at the top of the file', async () => {
      await invalid({
        output: dedent`
          /**
           * Loads the config.
           */
          export let config = {}
        `,
        code: dedent`
          // Loads the config.
          export let config = {}
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('a file without a line break', async () => {
      await invalid({
        output: '/**\n * Compilation check only.\n */',
        errors: [{ messageId: 'preferJsdoc' }],
        code: '// Compilation check only.',
        filename: 'src/run.ts',
      })
    })

    it('with the line breaks of the file', async () => {
      await invalid({
        output:
          'let a = 1\r\n/**\r\n * First.\r\n * Second.\r\n */\r\nlet b = 2\r\n',
        code: 'let a = 1\r\n// First.\r\n// Second.\r\nlet b = 2\r\n',
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('with the line breaks after the comment', async () => {
      await invalid({
        output: 'let a = 1\n/**\r\n * First.\r\n * Second.\r\n */\r\nrun()\r\n',
        code: 'let a = 1\n// First.\r\n// Second.\r\nrun()\r\n',
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('with carriage returns', async () => {
      await invalid({
        output: 'run()\r/**\r * Text.\r */\rrun()',
        errors: [{ messageId: 'preferJsdoc' }],
        code: 'run()\r// Text.\rrun()',
        filename: 'src/run.ts',
      })
    })

    it('at the end of a file without a line break', async () => {
      await invalid({
        output: 'run()\r\n/**\r\n * Last.\r\n */',
        errors: [{ messageId: 'preferJsdoc' }],
        code: 'run()\r\n// Last.',
        filename: 'src/run.ts',
      })
    })

    it('a comment with three slashes', async () => {
      await invalid({
        output: '/**\n * Explains the next line.\n */\nrun()',
        code: '/// Explains the next line.\nrun()',
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('a JSDoc tag', async () => {
      await invalid({
        output: dedent`
          /**
           * @see https://github.com/withastro/compiler/issues/554
           */
          run()
        `,
        code: dedent`
          // @see https://github.com/withastro/compiler/issues/554
          run()
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('a decorator in a code example', async () => {
      await invalid({
        output: dedent`
          /**
           * Decorate the class:
           *   @Injectable()
           * Then register it.
           */
          run()
        `,
        code: dedent`
          // Decorate the class:
          //   @Injectable()
          // Then register it.
          run()
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('with tabs', async () => {
      await invalid({
        output: 'function run() {\n\t/**\n\t * Waits.\n\t */\n\twait()\n}',
        code: 'function run() {\n\t// Waits.\n\twait()\n}',
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('without a space after the slashes', async () => {
      await invalid({
        output: dedent`
          /**
           * Compilation check only.
           */
          check()
        `,
        code: dedent`
          //Compilation check only.
          check()
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('keeps the indentation of code in a comment', async () => {
      await invalid({
        output: dedent`
          /**
           * For example:
           *   let total = 1 + 2
           * keeps its shape.
           */
          run(value)
        `,
        code: dedent`
          // For example:
          //   let total = 1 + 2
          // keeps its shape.
          run(value)
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('removes whitespace at the end of lines', async () => {
      await invalid({
        errors: [{ messageId: 'preferJsdoc' }],
        output: '/**\n * Waits.\n */\nwait()',
        code: '// Waits.   \nwait()',
        filename: 'src/run.ts',
      })
    })

    it('keeps empty lines inside the comment', async () => {
      await invalid({
        output: dedent`
          /**
           * First paragraph.
           *
           * Second paragraph.
           */
          run()
        `,
        code: dedent`
          // First paragraph.
          //
          // Second paragraph.
          run()
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('removes empty lines at the edges of the comment', async () => {
      await invalid({
        output: dedent`
          /**
           * Waits.
           */
          wait()
        `,
        code: dedent`
          //
          // Waits.
          //
          wait()
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('a comment in JSX', async () => {
      await javascript.invalid({
        output: dedent`
          let element = (
            <div>
              {
                /**
                 * The label is optional.
                 */
                label
              }
            </div>
          )
        `,
        code: dedent`
          let element = (
            <div>
              {
                // The label is optional.
                label
              }
            </div>
          )
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/element.jsx',
      })
    })
  })

  describe('fixes comments near other comments', () => {
    it('below a comment after code in another column', async () => {
      await invalid({
        errors: [
          { messageId: 'preferJsdocOnOwnLine', line: 1 },
          { messageId: 'preferJsdoc', line: 2 },
        ],
        output: dedent`
          let limit = 1 // Note.
          /**
           * Text.
           */
          run()
        `,
        code: dedent`
          let limit = 1 // Note.
          // Text.
          run()
        `,
        filename: 'src/run.ts',
        verifyAfterFix: false,
      })
    })

    it('below a comment after code with an empty line between', async () => {
      await invalid({
        output: dedent`
          let limit = 1 // Note.

                        /**
                         * Text.
                         */
          run()
        `,
        errors: [
          { messageId: 'preferJsdocOnOwnLine', line: 1 },
          { messageId: 'preferJsdoc', line: 3 },
        ],
        code: dedent`
          let limit = 1 // Note.

                        // Text.
          run()
        `,
        filename: 'src/run.ts',
        verifyAfterFix: false,
      })
    })

    it('below a TypeScript directive with code between', async () => {
      await invalid({
        output: dedent`
          // @ts-expect-error
          let value: number = 'text'
          /**
           * Text.
           */
          run()
        `,
        code: dedent`
          // @ts-expect-error
          let value: number = 'text'
          // Text.
          run()
        `,
        errors: [{ messageId: 'preferJsdoc', line: 3 }],
        filename: 'src/run.ts',
      })
    })
  })

  describe('splits groups of comments', () => {
    it('at an empty line', async () => {
      await invalid({
        output: dedent`
          /**
           * First.
           */

          /**
           * Second.
           */
          run()
        `,
        errors: [
          { messageId: 'preferJsdoc', line: 1 },
          { messageId: 'preferJsdoc', line: 3 },
        ],
        code: dedent`
          // First.

          // Second.
          run()
        `,
        filename: 'src/run.ts',
      })
    })

    it('at a change of the column', async () => {
      await invalid({
        output: dedent`
          if (ready) {
            run()
            /**
             * Inside.
             */
          /**
           * Outside.
           */
          }
        `,
        code: dedent`
          if (ready) {
            run()
            // Inside.
          // Outside.
          }
        `,
        errors: [
          { messageId: 'preferJsdoc', line: 3 },
          { messageId: 'preferJsdoc', line: 4 },
        ],
        filename: 'src/run.ts',
      })
    })

    it('at a directive', async () => {
      await invalid({
        output: dedent`
          /**
           * The hook is missing in older versions.
           */
          // eslint-disable-next-line no-unused-expressions
          hooks.onEnd
        `,
        code: dedent`
          // The hook is missing in older versions.
          // eslint-disable-next-line no-unused-expressions
          hooks.onEnd
        `,
        linterOptions: {
          reportUnusedDisableDirectives: 'off',
        },
        errors: [{ messageId: 'preferJsdoc', endLine: 1, line: 1 }],
        filename: 'src/run.ts',
      })
    })

    it('at a block comment', async () => {
      await invalid({
        output: dedent`
          /**
           * First.
           */
          /* Second. */
          /**
           * Third.
           */
          run()
        `,
        errors: [
          { messageId: 'preferJsdoc', line: 1 },
          { messageId: 'preferJsdoc', line: 3 },
        ],
        code: dedent`
          // First.
          /* Second. */
          // Third.
          run()
        `,
        filename: 'src/run.ts',
      })
    })
  })

  describe('reports without a fix', () => {
    it('a comment after code', async () => {
      await invalid({
        errors: [
          {
            messageId: 'preferJsdocOnOwnLine',
            endColumn: 43,
            column: 16,
            endLine: 1,
            line: 1,
          },
        ],
        code: 'let chunks = 1 // Makes the build quieter.',
        filename: 'src/run.ts',
        output: null,
      })
    })

    it('a comment after a block comment', async () => {
      await invalid({
        errors: [{ messageId: 'preferJsdocOnOwnLine' }],
        code: '/* First. */ // Second.\nrun()',
        filename: 'src/run.ts',
        output: null,
      })
    })

    it('a comment after code before a comment on its own line', async () => {
      await invalid({
        output: dedent`
          let chunks = 1 // Makes the build quieter.
          /**
           * Next.
           */
          run()
        `,
        errors: [
          { messageId: 'preferJsdocOnOwnLine', line: 1 },
          { messageId: 'preferJsdoc', line: 2 },
        ],
        code: dedent`
          let chunks = 1 // Makes the build quieter.
          // Next.
          run()
        `,
        filename: 'src/run.ts',
        verifyAfterFix: false,
      })
    })

    it.each([
      ["// 'module',", 'a value of an array'],
      ['// console.log(value)', 'a call'],
      ['// if (ready) {\n//   run()\n// }', 'a block'],
      ['// Steps:\n// * Build.\n// * Test.', 'a list marked with asterisks'],
    ])('commented-out code or a list: %s (%s)', async comment => {
      await invalid({
        errors: [{ messageId: 'preferJsdoc' }],
        code: `${comment}\nrun()`,
        filename: 'src/run.ts',
        output: null,
      })
    })

    it('a comment between a TypeScript directive and its code', async () => {
      await invalid({
        code: dedent`
          // @ts-expect-error
          // The types are wrong upstream.
          let value: number = 'text'
        `,
        errors: [{ messageId: 'preferJsdoc', line: 2 }],
        filename: 'src/run.ts',
        output: null,
      })
    })

    it('comments after a TypeScript directive through empty lines', async () => {
      await invalid({
        code: dedent`
          run() // @ts-ignore
          // First.

          // Second.
          let value: number = 'text'
        `,
        errors: [
          { messageId: 'preferJsdoc', line: 2 },
          { messageId: 'preferJsdoc', line: 4 },
        ],
        filename: 'src/run.ts',
        output: null,
      })
    })

    it('the continuation of a comment after code', async () => {
      await invalid({
        code: dedent`
          let limit = 1 // The first part of the note
                        // and the second part.
          run()
        `,
        errors: [
          { messageId: 'preferJsdocOnOwnLine', line: 1 },
          { messageId: 'preferJsdoc', line: 2 },
        ],
        filename: 'src/run.ts',
        output: null,
      })
    })

    it('a comment that would end the JSDoc comment early', async () => {
      await invalid({
        code: dedent`
          // Matches src/**/*.ts.
          let pattern = 'src/**/*.ts'
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
        output: null,
      })
    })

    it.each([
      '// https://github.com/withastro/compiler/issues/554',
      '// Fixed upstream. https://github.com/withastro/compiler/issues/554',
      '// See the issue:\n// https://github.com/withastro/compiler/issues/554',
    ])('a link that a JSDoc rule would capitalize: %s', async comment => {
      await invalid({
        errors: [{ messageId: 'preferJsdoc' }],
        code: `${comment}\nrun()`,
        filename: 'src/run.ts',
        output: null,
      })
    })

    it('an empty comment', async () => {
      await invalid({
        code: dedent`
          //
          //
          run()
        `,
        errors: [{ messageId: 'preferJsdoc', endLine: 2, line: 1 }],
        filename: 'src/run.ts',
        output: null,
      })
    })
  })

  describe('keeps directives as line comments', () => {
    it.each([
      '// eslint-disable-next-line no-console',
      '// eslint-disable-line no-console',
      '// @ts-expect-error: The types are wrong.',
      '// @ts-ignore',
      '//@ts-nocheck',
      '// @vitest-environment node',
      '// @jest-environment node',
      '// spell-checker:ignore FFFD',
      '// spell-checker: disable-next-line',
      '// spellchecker: disable-next-line',
      '// cspell:disable-next-line',
      '// CSpell:ignore gitdir worktrees',
      '// prettier-ignore',
      '// v8 ignore next',
      '// v8 ignore if -- @preserve',
      '// c8 ignore start',
      '// istanbul ignore else',
      '// node:coverage ignore next',
      '/// <reference types="node" />',
      '/// <reference path=".astro/types.d.ts" />',
      '// biome-ignore lint/suspicious/noExplicitAny: legacy code',
      '// oxlint-disable-next-line no-console',
      '// stylelint-disable-next-line color-no-hex',
      '// tslint:disable-next-line',
      '// noinspection JSUnusedGlobalSymbols',
      '// language=SQL',
      '// webpackChunkName: "editor"',
      '// turbopackIgnore: true',
      '/// @ts-expect-error',
      '//    @ts-ignore',
      '// @jsxImportSource preact',
      '// @refresh reset',
      '// svelte-ignore a11y_click_events_have_key_events',
      '// spell: disable-next-line',
      '// #region Helpers',
      '//#endregion',
      '//# sourceMappingURL=index.js.map',
      '//@ sourceURL=index.js',
      '//! Copyright 2026',
    ])('%s', async directive => {
      await valid({
        linterOptions: {
          reportUnusedDisableDirectives: 'off',
        },
        code: `${directive}\nrun()`,
        filename: 'src/run.ts',
      })
    })

    it('after code', async () => {
      await valid({
        linterOptions: {
          reportUnusedDisableDirectives: 'off',
        },
        code: 'let a = b // eslint-disable-line no-console',
        filename: 'src/run.ts',
      })
    })

    it.each(['// No default', '// no default', '//   No default  '])(
      '%s for default-case',
      async comment => {
        await valid({
          code: dedent`
            switch (kind) {
              case 'a':
                break
              ${comment}
            }
          `,
          filename: 'src/run.ts',
        })
      },
    )

    it('a link inside a sentence', async () => {
      await invalid({
        output: dedent`
          /**
           * See https://github.com/withastro/compiler/issues/554 for details.
           */
          run()
        `,
        code: dedent`
          // See https://github.com/withastro/compiler/issues/554 for details.
          run()
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })

    it('reports text that starts like a directive', async () => {
      await invalid({
        output: dedent`
          /**
           * No default case is needed.
           * Prettier ignores nothing here.
           */
          run()
        `,
        code: dedent`
          // No default case is needed.
          // Prettier ignores nothing here.
          run()
        `,
        errors: [{ messageId: 'preferJsdoc' }],
        filename: 'src/run.ts',
      })
    })
  })

  describe('ignores other comments', () => {
    it.each([
      '/**\n * Waits.\n */\nwait()',
      '/* Waits. */\nwait()',
      '/*\n * Waits.\n */\nwait()',
      'let url = "https://example.com"',
      'let pattern = /\\/\\//u',
      'let text = `\n// Not a comment.\n`',
    ])('%s', async code => {
      await valid({ filename: 'src/run.ts', code })
    })
  })

  describe('in components', () => {
    it.each([
      {
        output: dedent`
          <script setup lang="ts">
          /**
           * Loads the user.
           */
          let user = load()
          </script>

          <template><div /></template>
        `,
        code: dedent`
          <script setup lang="ts">
          // Loads the user.
          let user = load()
          </script>

          <template><div /></template>
        `,
        filename: 'src/components/user-card.vue',
        parser: vueParser,
      },
      {
        output: dedent`
          <script lang="ts">
            /**
             * Loads the user.
             */
            let user = load()
          </script>

          <p>{user}</p>
        `,
        code: dedent`
          <script lang="ts">
            // Loads the user.
            let user = load()
          </script>

          <p>{user}</p>
        `,
        filename: 'src/lib/user-card.svelte',
        parser: svelteParser,
      },
      {
        output: dedent`
          ---
          /**
           * Loads the user.
           */
          let user = await load()
          ---

          <div>{user}</div>
        `,
        code: dedent`
          ---
          // Loads the user.
          let user = await load()
          ---

          <div>{user}</div>
        `,
        filename: 'src/pages/user.astro',
        parser: astroParser,
      },
    ])('$filename', async ({ filename, parser, output, code }) => {
      await invalid({
        languageOptions: {
          parserOptions: {
            parser: typescriptParser,
          },
          parser,
        },
        errors: [{ messageId: 'preferJsdoc' }],
        filename,
        output,
        code,
      })
    })
  })
})
