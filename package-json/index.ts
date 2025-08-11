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
import depend from 'eslint-plugin-depend'

import type { ConfigOptions } from '..'

export function packageJson(_config: ConfigOptions): Linter.Config {
  return {
    name: 'azat-io/package-json/rules',

    files: ['**/package.json'],

    plugins: {
      depend,
      'package-json': packageJsonPlugin,
    },

    languageOptions: {
      parser: jsoncParser,
    },

    rules: {
      /**
       * Bans a list of dependencies from being used.
       */
      'depend/ban-dependencies': 'error',

      /**
       * Verify that the values in `package.json` are not empty.
       */
      'package-json/no-empty-fields': 'error',
      /**
       * Checks that the `files` property of a `package.json` doesn't contain
       * any redundant or unnecessary file entries.
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
       * Enforce the presence of an `author` property in a `package.json` file.
       */
      'package-json/require-author': 'error',
      /**
       * Enforce the presence of a `description` property in a `package.json`
       * file.
       */
      'package-json/require-description': 'error',
      /**
       * Enforce the presence of an `engines` property in a `package.json` file.
       */
      'package-json/require-engines': 'error',
      /**
       * Enforce the presence of an `keywords` property in a `package.json`
       * file.
       */
      'package-json/require-keywords': 'error',
      /**
       * Enforce the presence of an `name` property in a `package.json` file.
       */
      'package-json/require-name': 'error',
      /**
       * Enforce the presence of a `type` property in a `package.json` file.
       */
      'package-json/require-type': 'error',
      /**
       * Enforce the presence of an `version` property in a `package.json` file.
       */
      'package-json/require-version': 'error',
      /**
       * Enforce a consistent order of dependencies in package.json.
       */
      'package-json/sort-collections': 'error',
      /**
       * Disallow duplicates in dependencies.
       */
      'package-json/unique-dependencies': 'error',
      /**
       * Validate the `author` property.
       */
      'package-json/valid-author': 'error',
      /**
       * Validate the `bin` property.
       */
      'package-json/valid-bin': 'error',
      /**
       * Validate the `dependencies` and `devDependencies` properties.
       */
      'package-json/valid-dependencies': 'error',
      /**
       * Validate the `description` property.
       */
      'package-json/valid-description': 'error',
      /**
       * Validate the `license` property.
       */
      'package-json/valid-license': 'error',
      /**
       * Validate the `name` property.
       */
      'package-json/valid-name': 'error',
      /**
       * Validate required properties in a `package.json`.
       */
      'package-json/valid-package-definition': 'error',
      /**
       * Validate the `scripts` property.
       */
      'package-json/valid-scripts': 'error',
      /**
       * Validate the `version` property.
       */
      'package-json/valid-version': 'error',
    },
  }
}
