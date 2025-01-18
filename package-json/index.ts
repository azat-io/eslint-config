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

import packageJsonPlugin from 'eslint-plugin-package-json'
import jsoncParser from 'jsonc-eslint-parser'

import type { ConfigOptions } from '..'

export let packageJson = (_config: ConfigOptions): Linter.Config => ({
  name: 'azat-io/package-json/rules',

  files: ['**/package.json'],

  plugins: {
    'package-json': packageJsonPlugin,
  },

  languageOptions: {
    parser: jsoncParser,
  },

  rules: {
    /**
     * Checks that the `files` property of a `package.json` doesn't contain any
     * redundant or unnecessary file entries.
     */
    'package-json/no-redundant-files': 'error',
    /**
     * Enforce the package.json ordering convention.
     */
    'package-json/order-properties': [
      'error',
      {
        order: 'sort-package-json',
      },
    ],
    /**
     * Enforces that `repository` entries in a package.json use shorthand
     * notation.
     */
    'package-json/repository-shorthand': [
      'error',
      {
        form: 'shorthand',
      },
    ],
    /**
     * Enforce a consistent order of dependencies in package.json.
     */
    'package-json/sort-collections': 'error',
    /**
     * Disallow duplicates in dependencies.
     */
    'package-json/unique-dependencies': 'error',
    /**
     * Validate the path for `file:` and `link:` dependencies in a
     * `package.json`.
     */
    'package-json/valid-local-dependency': 'error',
    /**
     * Validate the `name` property.
     */
    'package-json/valid-name': 'error',
    /**
     * Validate required properties in a `package.json`.
     */
    'package-json/valid-package-definition': 'error',
    /**
     * Validate the `version` property.
     */
    'package-json/valid-version': 'error',
  },
})
