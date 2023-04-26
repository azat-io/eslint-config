import typescriptConfig from '@azat-io/eslint-config-typescript'
import { defineFlatConfig } from 'eslint-define-config'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'

export default defineFlatConfig([
  ...typescriptConfig,
  {
    files: ['**/*.jsx', '**/*.tsx'],

    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      react,
    },

    rules: {
      'jsx-quotes': 'double',

      'react/boolean-prop-naming': [
        'error',
        {
          rule: '^(is|has)[A-Z]([A-Za-z0-9]?)+',
        },
      ],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
        },
      ],
      'react/hook-use-state': [
        'error',
        {
          allowDestructuredState: true,
        },
      ],
      'react/jsx-boolean-value': 'error',
      'react/jsx-child-element-spacing': 'error',
      'react/jsx-closing-bracket-location': 'error',
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'never',
          propElementValues: 'always',
        },
      ],
      'react/jsx-curly-spacing': ['error', 'never'],
      'react/jsx-equals-spacing': ['error', 'never'],
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.jsx', '.tsx'],
        },
      ],
      'react/jsx-fragments': 'error',
      'react/jsx-handler-names': 'error',
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-indent': ['error', 2],
      'react/jsx-key': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-props-no-multi-spaces': 'error',
      'react/jsx-space-before-closing': 'error',
      'react/jsx-tag-spacing': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-children-prop': 'error',
      'react/no-deprecated': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      'react/style-prop-object': 'error',
      'react/void-dom-elements-no-children': 'error',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/no-aria-hidden-on-focusable': 'error',
      'jsx-a11y/prefer-tag-over-role': 'error',
    },
  },
])
