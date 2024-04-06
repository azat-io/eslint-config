import perfectionistLineLength from 'eslint-plugin-perfectionist/configs/recommended-line-length'
import { defineFlatConfig } from 'eslint-define-config'
import preferArrow from 'eslint-plugin-prefer-arrow'
import nodeImport from 'eslint-plugin-node-import'
import preferLet from 'eslint-plugin-prefer-let'
import eslintImport from 'eslint-plugin-import'
import promise from 'eslint-plugin-promise'
import unicorn from 'eslint-plugin-unicorn'
import sonarjs from 'eslint-plugin-sonarjs'
import vitest from 'eslint-plugin-vitest'
import n from 'eslint-plugin-n'
import globals from 'globals'

export default defineFlatConfig([
  {
    ignores: ['**/node_modules/**', '**/dist/**', '.git/**'],
  },
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },

    plugins: {
      'prefer-arrow': preferArrow,
      'node-import': nodeImport,
      'prefer-let': preferLet,
      import: eslintImport,
      promise,
      sonarjs,
      unicorn,
      vitest,
      n,
    },

    rules: {
      'array-callback-return': [
        'error',
        {
          allowImplicit: false,
          checkForEach: false,
        },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      camelcase: [
        'error',
        {
          properties: 'always',
          ignoreGlobals: true,
        },
      ],
      'consistent-return': 'error',
      'constructor-super': 'error',
      curly: ['error', 'all'],
      'default-case-last': 'error',
      'dot-notation': [
        'error',
        {
          allowKeywords: true,
        },
      ],
      eqeqeq: 'error',
      'new-cap': [
        'error',
        {
          newIsCap: true,
          capIsNew: false,
          properties: true,
        },
      ],
      'no-array-constructor': 'error',
      'no-async-promise-executor': 'error',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-const-assign': 'error',
      'no-constant-condition': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-else-return': 'error',
      'no-empty': [
        'error',
        {
          allowEmptyCatch: true,
        },
      ],
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-eval': 'error',
      'no-ex-assign': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-implied-eval': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': [
        'error',
        {
          skipComments: true,
          skipJSXText: true,
          skipRegExps: true,
          skipStrings: true,
          skipTemplates: true,
        },
      ],
      'no-iterator': 'error',
      'no-labels': [
        'error',
        {
          allowLoop: false,
          allowSwitch: false,
        },
      ],
      'no-multi-str': 'error',
      'no-nested-ternary': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-obj-calls': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-return-assign': ['error', 'except-parens'],
      'no-self-assign': [
        'error',
        {
          props: true,
        },
      ],
      'no-self-compare': 'error',
      'no-shadow': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-undef': 'error',
      'no-undef-init': 'error',
      'no-unexpected-multiline': 'error',
      'no-unneeded-ternary': [
        'error',
        {
          defaultAssignment: false,
        },
      ],
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
          variables: false,
        },
      ],
      'no-useless-backreference': 'error',
      'no-useless-call': 'error',
      'no-useless-catch': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-constructor': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-void': 'error',
      'no-with': 'error',
      'object-shorthand': ['error', 'always'],
      'one-var': [
        'error',
        {
          initialized: 'never',
        },
      ],
      'prefer-destructuring': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-regex-literals': [
        'error',
        {
          disallowRedundantWrapping: true,
        },
      ],
      'prefer-rest-params': 'error',
      'use-isnan': [
        'error',
        {
          enforceForSwitchCase: true,
          enforceForIndexOf: true,
        },
      ],
      'valid-typeof': [
        'error',
        {
          requireStringLiterals: true,
        },
      ],
      yoda: ['error', 'never'],

      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/export': 'error',
      'import/first': 'error',
      'import/named': 'error',
      'import/no-duplicates': 'error',
      'import/no-empty-named-blocks': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
      'import/no-named-default': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-webpack-loader-syntax': 'error',

      'n/handle-callback-err': ['error', '^(err|error)$'],
      'n/no-deprecated-api': 'error',
      'n/no-exports-assign': 'error',
      'n/no-path-concat': 'error',
      'n/process-exit-as-throw': 'error',

      'node-import/prefer-node-protocol': 'error',

      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],

      'prefer-let/prefer-let': 'error',

      'promise/no-multiple-resolved': 'error',
      'promise/no-nesting': 'error',
      'promise/no-promise-in-callback': 'error',
      'promise/param-names': 'error',
      'promise/prefer-await-to-then': 'error',
      'promise/valid-params': 'error',

      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-extra-arguments': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-ignored-return': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-same-line-conditional': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': 'error',
      'unicorn/custom-error-definition': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-typeof-undefined': 'error',
      'unicorn/no-unnecessary-await': 'error',
      'unicorn/no-unused-properties': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-undefined': [
        'error',
        {
          checkArguments: false,
        },
      ],
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-at': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-keyboard-event-key': 'error',
      'unicorn/prefer-logical-operator-over-ternary': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
    },
  },

  {
    files: [
      '**/test/*.js',
      '**/test/*.ts',
      '**/test/*.jsx',
      '**/test/*.tsx',
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.jsx',
      '**/*.test.tsx',
    ],

    plugins: {
      vitest,
    },

    rules: {
      'vitest/consistent-test-filename': 'error',
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/no-alias-methods': 'error',
      'vitest/no-commented-out-tests': 'error',
      'vitest/no-conditional-expect': 'error',
      'vitest/no-conditional-in-test': 'error',
      'vitest/no-conditional-tests': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
      'vitest/no-standalone-expect': 'error',
      'vitest/no-test-return-statement': 'error',
      'vitest/prefer-comparison-matcher': 'error',
      'vitest/prefer-expect-resolves': 'error',
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/prefer-hooks-on-top': 'error',
      'vitest/prefer-lowercase-title': 'error',
      'vitest/prefer-spy-on': 'error',
      'vitest/prefer-to-be-falsy': 'error',
      'vitest/prefer-to-be-truthy': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-contain': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/require-top-level-describe': 'error',
      'vitest/valid-describe-callback': 'error',
      'vitest/valid-expect': 'error',
    },
  },
  perfectionistLineLength,
])
