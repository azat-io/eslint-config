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

import nPlugin from 'eslint-plugin-n'

import type { ConfigOptions } from '..'

export let node = (config: ConfigOptions): Linter.Config => {
  if (!config.node) {
    return {}
  }

  let files = ['**/*.js', '**/*.cjs', '**/*.mjs']

  if (config.typescript) {
    files.push('**/*.ts', '**/*.cts', '**/*.mts')
  }

  if (config.react || config.qwik) {
    files.push('**/*.jsx')

    if (config.typescript) {
      files.push('**/*.tsx')
    }
  }

  if (config.astro) {
    files.push('**/*.astro')
  }

  if (config.svelte) {
    files.push('**/*.svelte')
  }

  if (config.vue) {
    files.push('**/*.vue')
  }

  return {
    files,

    plugins: {
      n: nPlugin,
    },

    rules: {
      /**
       * Require error handling in callbacks.
       */
      'n/handle-callback-err': ['error', '^(err|error)$'],
      /**
       * Require correct usage of hashbang comments.
       */
      'n/hashbang': 'error',
      /**
       * Disallow deprecated APIs.
       */
      'n/no-deprecated-api': 'error',
      /**
       * Disallow the assignment to exports.
       */
      'n/no-exports-assign': 'error',
      /**
       * Disallow `require()` expressions which import extraneous modules.
       */
      'n/no-extraneous-require': 'error',
      /**
       * Disallow `new` operators with calls to `require`.
       */
      'n/no-new-require': 'error',
      /**
       * Disallow string concatenation with __dirname and __filename.
       */
      'n/no-path-concat': 'error',
      /**
       * Disallow `bin` files that npm ignores.
       */
      'n/no-unpublished-bin': 'error',
      /**
       * Disallow unsupported ECMAScript built-ins on the specified version.
       */
      'n/no-unsupported-features/es-builtins': 'error',
      /**
       * Enforce either `Buffer` or `require("buffer").Buffer`
       */
      'n/prefer-global/buffer': ['error', 'always'],
      /**
       * Enforce either `console` or `require("console")`.
       */
      'n/prefer-global/console': ['error', 'always'],
      /**
       * Enforce either `process` or `require("process")`.
       */
      'n/prefer-global/process': ['error', 'always'],
      /**
       * Enforce either `TextDecoder` or `require("util").TextDecoder`.
       */
      'n/prefer-global/text-decoder': ['error', 'always'],
      /**
       * Enforce either `TextEncoder` or `require("util").TextEncoder`.
       */
      'n/prefer-global/text-encoder': ['error', 'always'],
      /**
       * Enforce either `URL` or `require("url").URL`.
       */
      'n/prefer-global/url': ['error', 'always'],
      /**
       * Enforce either `URLSearchParams` or `require("url").URLSearchParams`.
       */
      'n/prefer-global/url-search-params': ['error', 'always'],
      /**
       * Enforce using the `node:` protocol when importing Node.js builtin
       * modules.
       */
      'n/prefer-node-protocol': 'error',
      /**
       * Enforce `require("fs").promises`.
       */
      'n/prefer-promises/fs': 'error',
      /**
       * Require that `process.exit()` expressions use the same code path as
       * throw.
       */
      'n/process-exit-as-throw': 'error',
    },
  }
}
