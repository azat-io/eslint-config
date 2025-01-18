/*
  eslint perfectionist/sort-objects: [
    'error',
    {
      type: 'alphabetical',
      order: 'asc',
      partitionByNewLine: true
    }
  ]
*/

import type { Linter } from 'eslint'

import type { ConfigOptions } from '..'

import { interopDefault } from '../utils'

export let vitest = async (config: ConfigOptions): Promise<Linter.Config> => {
  if (!config.vitest) {
    return {}
  }

  let vitestPlugin = await interopDefault(import('@vitest/eslint-plugin'))

  let files = [
    '**/test/*.js',
    '**/test/*.cjs',
    '**/test/*.mjs',
    '**/*.test.js',
    '**/*.test.cjs',
    '**/*.test.mjs',
  ]

  if (config.typescript) {
    files.push(
      '**/test/*.ts',
      '**/test/*.cts',
      '**/test/*.mts',
      '**/*.test.ts',
      '**/*.test.cts',
      '**/*.test.mts',
    )
  }

  if (config.react || config.qwik) {
    files.push('**/test/*.jsx', '**/*.test.jsx')

    if (config.typescript) {
      files.push('**/test/*.tsx', '**/*.test.tsx')
    }
  }

  return {
    name: 'azat-io/vitest/rules',

    files,

    plugins: {
      vitest: vitestPlugin,
    },

    rules: {
      /**
       * Enforce using it but not test.
       */
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      /**
       * Disallow alias methods.
       */
      'vitest/no-alias-methods': 'error',
      /**
       * Disallow commented out tests.
       */
      'vitest/no-commented-out-tests': 'error',
      /**
       * Disallow conditional expects.
       */
      'vitest/no-conditional-expect': 'error',
      /**
       * Disallow conditional tests.
       */
      'vitest/no-conditional-in-test': 'error',
      /**
       * Disallow conditional tests.
       */
      'vitest/no-conditional-tests': 'error',
      /**
       * Disallow disabled tests.
       */
      'vitest/no-disabled-tests': 'error',
      /**
       * Disallow duplicate hooks and teardown hooks.
       */
      'vitest/no-duplicate-hooks': 'error',
      /**
       * Disallow focused tests.
       */
      'vitest/no-focused-tests': 'error',
      /**
       * Disallow identical titles.
       */
      'vitest/no-identical-title': 'error',
      /**
       * Disallow importing `node:test`.
       */
      'vitest/no-import-node-test': 'error',
      /**
       * Disallow string interpolation in snapshots.
       */
      'vitest/no-interpolation-in-snapshots': 'error',
      /**
       * Disallow using `expect` outside of `it` blocks.
       */
      'vitest/no-standalone-expect': 'error',
      /**
       * Disallow return statements in tests.
       */
      'vitest/no-test-return-statement': 'error',
      /**
       * Enforce using `toBeCalledWith()` or `toHaveBeenCalledWith()`.
       */
      'vitest/prefer-called-with': 'error',
      /**
       * Enforce using the built-in comparison matchers.
       */
      'vitest/prefer-comparison-matcher': 'error',
      /**
       * Enforce using `each` rather than manual loops.
       */
      'vitest/prefer-each': 'error',
      /**
       * Enforce using the built-in quality matchers.
       */
      'vitest/prefer-equality-matcher': 'error',
      /**
       * Enforce using `expect().resolves` over `expect(await ...)` syntax.
       */
      'vitest/prefer-expect-resolves': 'error',
      /**
       * Enforce having hooks in consistent order.
       */
      'vitest/prefer-hooks-in-order': 'error',
      /**
       * Enforce having hooks before any test cases.
       */
      'vitest/prefer-hooks-on-top': 'error',
      /**
       * Enforce lowercase titles.
       */
      'vitest/prefer-lowercase-title': 'error',
      /**
       * Enforce mock resolved/rejected shorthands for promises.
       */
      'vitest/prefer-mock-promise-shorthand': 'error',
      /**
       * Enforce using `vi.spyOn`.
       */
      'vitest/prefer-spy-on': 'error',
      /**
       * Enforce using `toBe()`.
       */
      'vitest/prefer-to-be': 'error',
      /**
       * Enforce using `toBeFalsy()`.
       */
      'vitest/prefer-to-be-falsy': 'error',
      /**
       * Enforce using `toBeObject()`.
       */
      'vitest/prefer-to-be-object': 'error',
      /**
       * Enforce using `toBeTruthy()`.
       */
      'vitest/prefer-to-be-truthy': 'error',
      /**
       * Enforce using `toContain()`.
       */
      'vitest/prefer-to-contain': 'error',
      /**
       * Enforce using `toHaveLength()`.
       */
      'vitest/prefer-to-have-length': 'error',
      /**
       * Prefer `vi.mocked()` over `fn as Mock`.
       */
      'vitest/prefer-vi-mocked': 'error',
      /**
       * Enforce that all tests are in a top-level describe.
       */
      'vitest/require-top-level-describe': 'error',
      /**
       * Enforce valid describe callback.
       */
      'vitest/valid-describe-callback': 'error',
      /**
       * Enforce valid `expect()` usage.
       */
      'vitest/valid-expect': 'error',
      /**
       * Require promises that have expectations in their chain to be valid.
       */
      'vitest/valid-expect-in-promise': 'error',
    },

    settings: {
      vitest: {
        typecheck: true,
      },
    },
  }
}
