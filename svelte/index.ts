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

export let svelte = async (config: ConfigOptions): Promise<Linter.Config> => {
  if (!config.svelte) {
    return {}
  }

  let files = ['**/*.svelte']

  let [sveltePlugin, svelteParser] = await Promise.all([
    interopDefault(import('eslint-plugin-svelte')),
    interopDefault(import('svelte-eslint-parser')),
  ] as const)

  let additionalParserOptions = {}

  if (config.typescript) {
    let { parser: typescriptParser } = await interopDefault(
      import('typescript-eslint'),
    )

    additionalParserOptions = {
      ...additionalParserOptions,
      parser: typescriptParser,
      projectService: true,
      tsconfigRootDir: process.cwd(),
    }
  }

  return {
    name: 'azat-io/svelte/rules',

    files,

    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        ecmaVersion: 'latest',
        extraFileExtensions: ['.svelte'],
        sourceType: 'module',
        ...additionalParserOptions,
      },
    },

    plugins: {
      svelte: sveltePlugin,
    },

    rules: {
      /**
       * Disallow usage of languages other than those specified in the
       * configuration for the lang attribute of `<script>` and `<style>`
       * blocks.
       */
      'svelte/block-lang': [
        'error',
        {
          enforceScriptPresent: true,
          enforceStylePresent: false,
          script: ['ts', null],
        },
      ],
      /**
       * Disallow usage of button without an explicit type attribute.
       */
      'svelte/button-has-type': 'error',
      /**
       * Svelte plugin system rules.
       */
      'svelte/comment-directive': 'error',
      /**
       * Require that derived store use same variable names between values and
       * callback.
       */
      'svelte/derived-has-same-inputs-outputs': 'error',
      /**
       * Prevent calling the same reactive statement twice in a microtask.
       */
      'svelte/infinite-reactive-loop': 'error',
      /**
       * Disallow the use of `{@debug}`.
       */
      'svelte/no-at-debug-tags': 'error',
      /**
       * Disallow use of `{@html}` to prevent XSS attack.
       */
      'svelte/no-at-html-tags': 'error',
      /**
       * Disallow DOM manipulating.
       */
      'svelte/no-dom-manipulating': 'error',
      /**
       * Disallow duplicate conditions in `{#if}` / `{:else if}` chains.
       */
      'svelte/no-dupe-else-if-blocks': 'error',
      /**
       * Disallow duplicate on: directives.
       */
      'svelte/no-dupe-on-directives': 'error',
      /**
       * Disallow duplicate style properties.
       */
      'svelte/no-dupe-style-properties': 'error',
      /**
       * Disallow duplicate use: directives.
       */
      'svelte/no-dupe-use-directives': 'error',
      /**
       * Disallow dynamic slot name.
       */
      'svelte/no-dynamic-slot-name': 'error',
      /**
       * Disallow wrapping single reactive statements in curly braces.
       */
      'svelte/no-extra-reactive-curlies': 'error',
      /**
       * Disallow ignoring the unsubscribe method returned by the `subscribe()`
       * on Svelte stores.
       */
      'svelte/no-ignored-unsubscribe': 'error',
      /**
       * Disallow reactive statements that don’t reference reactive values.
       */
      'svelte/no-immutable-reactive-statements': 'error',
      /**
       * Disallow variable or `function` declarations in nested blocks.
       */
      'svelte/no-inner-declarations': 'error',
      /**
       * Warns against the use of `$inspect` directive.
       */
      'svelte/no-inspect': 'error',
      /**
       * Disallow objects in text mustache interpolation.
       */
      'svelte/no-object-in-text-mustaches': 'error',
      /**
       * Disallow define functions in reactive statements
       */
      'svelte/no-reactive-functions': 'error',
      /**
       * Disallow shorthand style properties that override related longhand
       * properties.
       */
      'svelte/no-shorthand-style-property-overrides': 'error',
      /**
       * Disallow import `svelte/internal`.
       */
      'svelte/no-svelte-internal': 'error',
      /**
       * Disallow `target="_blank"` attribute without
       * `rel="noopener noreferrer"`.
       */
      'svelte/no-target-blank': 'error',
      /**
       * Disallow unknown `style:property`.
       */
      'svelte/no-unknown-style-directive-property': 'error',
      /**
       * Disallow unused `svelte-ignore` comments.
       */
      'svelte/no-unused-svelte-ignore': 'error',
      /**
       * Disallow unnecessary mustache interpolations.
       */
      'svelte/no-useless-mustaches': 'error',
      /**
       * Require class directives instead of ternary expressions.
       */
      'svelte/prefer-class-directive': 'error',
      /**
       * Destructure values from object stores for better change tracking &
       * fewer redraws.
       */
      'svelte/prefer-destructured-store-props': 'error',
      /**
       * Require style directives instead of style attribute.
       */
      'svelte/prefer-style-directive': 'error',
      /**
       * Require keyed `{#each}` blocks.
       */
      'svelte/require-each-key': 'error',
      /**
       * Disallow to use of the store itself as an operand. Need to use $ prefix
       * or get function.
       */
      'svelte/require-store-reactive-access': 'error',
      /**
       * Require initial value in store.
       */
      'svelte/require-stores-init': 'error',
      /**
       * Enforce use of shorthand syntax in attribute.
       */
      'svelte/shorthand-attribute': 'error',
      /**
       * Enforce use of shorthand syntax in directives.
       */
      'svelte/shorthand-directive': 'error',
      'svelte/system': 'error',
      /**
       * Enforce keys to use variables defined in the `{#each}` block.
       */
      'svelte/valid-each-key': 'error',
    },
  }
}
