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

import { interopDefault } from '../utilities'

export async function node(config: ConfigOptions): Promise<Linter.Config> {
  if (!config.node) {
    return {}
  }

  let nodePlugin = await interopDefault(import('eslint-plugin-n'))

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
    name: 'azat-io/node/rules',

    files,

    plugins: {
      node: nodePlugin,
    },

    rules: {
      /**
       * Require error handling in callbacks.
       */
      'node/handle-callback-err': ['error', 'error'],
      /**
       * Require correct usage of hashbang comments.
       */
      'node/hashbang': 'error',
      /**
       * Disallow deprecated APIs.
       */
      'node/no-deprecated-api': 'error',
      /**
       * Disallow the assignment to exports.
       */
      'node/no-exports-assign': 'error',
      /**
       * Disallow `require()` expressions which import extraneous modules.
       */
      'node/no-extraneous-require': 'error',
      /**
       * Disallow `new` operators with calls to `require`.
       */
      'node/no-new-require': 'error',
      /**
       * Disallow string concatenation with __dirname and __filename.
       */
      'node/no-path-concat': 'error',
      /**
       * Disallow `bin` files that npm ignores.
       */
      'node/no-unpublished-bin': 'error',
      /**
       * Disallow unsupported ECMAScript built-ins on the specified version.
       */
      'node/no-unsupported-features/es-builtins': 'error',
      /**
       * Prefer global `Buffer` over `require("buffer").Buffer`.
       */
      'node/prefer-global/buffer': ['error', 'always'],
      /**
       * Prefer global `console` over `require("console")`.
       */
      'node/prefer-global/console': ['error', 'always'],
      /**
       * Prefer global `crypto` over `require("crypto")`.
       */
      'node/prefer-global/crypto': ['error', 'always'],
      /**
       * Prefer global `process` over `require("process")`.
       */
      'node/prefer-global/process': ['error', 'always'],
      /**
       * Prefer global `TextDecoder` over `require("util").TextDecoder`.
       */
      'node/prefer-global/text-decoder': ['error', 'always'],
      /**
       * Prefer global `TextEncoder` over `require("util").TextEncoder`.
       */
      'node/prefer-global/text-encoder': ['error', 'always'],
      /**
       * Prefer global `URL` over `require("url").URL`.
       */
      'node/prefer-global/url': ['error', 'always'],
      /**
       * Prefer global `URLSearchParams` over `require("url").URLSearchParams`.
       */
      'node/prefer-global/url-search-params': ['error', 'always'],
      /**
       * Enforce using the `node:` protocol when importing Node.js builtin
       * modules.
       */
      'node/prefer-node-protocol': 'error',
      /**
       * Enforce `require("fs").promises`.
       */
      'node/prefer-promises/fs': 'error',
      /**
       * Require that `process.exit()` expressions use the same code path as
       * throw.
       */
      'node/process-exit-as-throw': 'error',
    },
  }
}
