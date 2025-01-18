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

export let qwik = async (config: ConfigOptions): Promise<Linter.Config> => {
  if (!config.qwik) {
    return {}
  }

  let qwikPlugin = await interopDefault(import('eslint-plugin-qwik'))

  let files = ['**/*.jsx']

  if (config.typescript) {
    files.push('**/*.tsx')
  }

  return {
    name: 'azat-io/qwik/rules',

    files,

    plugins: {
      qwik: qwikPlugin,
    },

    rules: {
      /**
       * Provide href attribute for `<a>` elements.
       */
      'qwik/jsx-a': 'error',
      /**
       * Provide `width` and `height` attributes for `<img>` elements.
       */
      'qwik/jsx-img': 'error',
      /**
       * Disallow missing `key` props in iterators/collection literals.
       */
      'qwik/jsx-key': 'error',
      /**
       * Detect declaration location of loader$.
       */
      'qwik/loader-location': 'error',
      /**
       * Disallow usage of React-specific `className`/`htmlFor` props.
       */
      'qwik/no-react-props': 'error',
      /**
       * Detect `useVisibleTask$()` functions.
       */
      'qwik/no-use-visible-task': 'error',
      /**
       * Enforce using the classlist prop over importing a classnames helper.
       */
      'qwik/prefer-classlist': 'error',
      /**
       * Detect unused `server$()` functions.
       */
      'qwik/unused-server': 'error',
      /**
       * Detect invalid use of use hooks.
       */
      'qwik/use-method-usage': 'error',
      /**
       * Use TSC typechecker to detect the capture of unserializable data in `$`
       * scopes.
       */
      'qwik/valid-lexical-scope': 'error',
    },
  }
}
