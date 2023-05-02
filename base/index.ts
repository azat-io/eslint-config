import { defineFlatConfig } from 'eslint-define-config'
import preferArrow from 'eslint-plugin-prefer-arrow'
import preferLet from 'eslint-plugin-prefer-let'
import eslintImport from 'eslint-plugin-import'
import promise from 'eslint-plugin-promise'
import unicorn from 'eslint-plugin-unicorn'
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
      'prefer-let': preferLet,
      import: eslintImport,
      promise,
      unicorn,
      vitest,
      n,
    },

    rules: {
      'array-bracket-spacing': ['error', 'never'],
      'array-callback-return': [
        'error',
        {
          allowImplicit: false,
          checkForEach: false,
        },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-spacing': [
        'error',
        {
          before: true,
          after: true,
        },
      ],
      'block-spacing': ['error', 'always'],
      'brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true,
        },
      ],
      camelcase: [
        'error',
        {
          properties: 'always',
          ignoreGlobals: true,
        },
      ],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
      'comma-spacing': [
        'error',
        {
          before: false,
          after: true,
        },
      ],
      'comma-style': ['error', 'last'],
      'computed-property-spacing': [
        'error',
        'never',
        {
          enforceForClassMembers: true,
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
      'func-call-spacing': ['error', 'never'],
      'generator-star-spacing': [
        'error',
        {
          before: true,
          after: true,
        },
      ],
      indent: ['error', 2],
      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true,
        },
      ],
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      'new-cap': [
        'error',
        {
          newIsCap: true,
          capIsNew: false,
          properties: true,
        },
      ],
      'new-parens': 'error',
      'no-array-constructor': 'error',
      'no-async-promise-executor': 'error',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-console': 'error',
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
      'no-extra-parens': ['error', 'functions'],
      'no-fallthrough': 'error',
      'no-floating-decimal': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-implied-eval': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-iterator': 'error',
      'no-labels': [
        'error',
        {
          allowLoop: false,
          allowSwitch: false,
        },
      ],
      'no-mixed-operators': [
        'error',
        {
          groups: [
            ['===', '!==', '>', '>=', '<', '<='],
            ['&&', '||', '??'],
            ['in', 'instanceof'],
          ],
          allowSamePrecedence: true,
        },
      ],
      'no-multi-spaces': 'error',
      'no-multi-str': 'error',
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxBOF: 0,
          maxEOF: 0,
        },
      ],
      'no-nested-ternary': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-object': 'error',
      'no-new-symbol': 'error',
      'no-new-wrappers': 'error',
      'no-obj-calls': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',
      'no-regex-spaces': 'error',
      'no-return-assign': ['error', 'except-parens'],
      'no-self-assign': [
        'error',
        {
          props: true,
        },
      ],
      'no-self-compare': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-tabs': 'error',
      'no-template-curly-in-string': 'error',
      'no-trailing-spaces': 'error',
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
          args: 'after-used',
          vars: 'all',
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
      'no-whitespace-before-property': 'error',
      'no-with': 'error',
      'object-curly-spacing': ['error', 'always'],
      'object-property-newline': [
        'error',
        {
          allowMultiplePropertiesPerLine: true,
        },
      ],
      'object-shorthand': ['error', 'always'],
      'one-var': [
        'error',
        {
          initialized: 'never',
        },
      ],
      'operator-linebreak': [
        'error',
        'after',
        {
          overrides: {
            '?': 'before',
            ':': 'before',
            '|>': 'before',
          },
        },
      ],
      'padded-blocks': [
        'error',
        {
          blocks: 'never',
          switches: 'never',
          classes: 'never',
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
      'quote-props': ['error', 'as-needed'],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],
      'rest-spread-spacing': ['error', 'never'],
      semi: ['error', 'never'],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': ['error', 'always'],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': [
        'error',
        {
          words: true,
          nonwords: false,
        },
      ],
      'spaced-comment': [
        'error',
        'always',
        {
          line: {
            markers: ['*package', '!', '/', ',', '='],
          },
          block: {
            balanced: true,
            markers: ['*package', '!', ',', ':', '::', 'flow-include'],
            exceptions: ['*'],
          },
        },
      ],
      'template-curly-spacing': ['error', 'never'],
      'template-tag-spacing': ['error', 'never'],
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
      'wrap-iife': [
        'error',
        'any',
        {
          functionPrototypeMethods: true,
        },
      ],
      yoda: ['error', 'never'],

      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/export': 'error',
      'import/first': 'error',
      'import/named': 'error',
      'import/no-anonymous-default-export': 'error',
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
      'import/order': [
        'error',
        {
          groups: [
            ['type'],
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            {
              pattern: '~/**',
              group: 'internal',
            },
          ],
          'newlines-between': 'always',
        },
      ],

      'n/handle-callback-err': ['error', '^(err|error)$'],
      'n/no-deprecated-api': 'error',
      'n/no-exports-assign': 'error',
      'n/no-path-concat': 'error',
      'n/process-exit-as-throw': 'error',

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
      'promise/prefer-await-to-callbacks': 'error',
      'promise/prefer-await-to-then': 'error',
      'promise/valid-params': 'error',

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
      'unicorn/no-useless-undefined': 'error',
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

      'vitest/consistent-test-filename': 'error',
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/expect-expect': 'error',
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
])
