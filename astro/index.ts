import typescriptConfig from '@azat-io/eslint-config-typescript'
import typescriptParser from '@typescript-eslint/parser'
import { defineFlatConfig } from 'eslint-define-config'
import astroParser from 'astro-eslint-parser'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import astro from 'eslint-plugin-astro'

export default defineFlatConfig([
  ...typescriptConfig,

  {
    files: ['**/*.astro'],

    languageOptions: {
      parser: astroParser,
      parserOptions: {
        extraFileExtensions: ['.astro'],
        tsconfigRootDir: process.cwd(),
        project: ['./tsconfig.json'],
        parser: typescriptParser,
        sourceType: 'module',
      },
    },

    plugins: {
      'jsx-a11y': jsxA11y,
      astro,
    },

    rules: {
      'astro/no-conflict-set-directives': 'error',
      'astro/no-deprecated-astro-canonicalurl': 'error',
      'astro/no-deprecated-astro-fetchcontent': 'error',
      'astro/no-deprecated-astro-resolve': 'error',
      'astro/no-deprecated-getentrybyslug': 'error',
      'astro/no-set-text-directive': 'error',
      'astro/no-unused-css-selector': 'error',
      'astro/no-unused-define-vars-in-style': 'error',
      'astro/prefer-class-list-directive': 'error',
      'astro/prefer-object-class-list': 'error',
      'astro/prefer-split-class-list': 'error',
      'astro/valid-compile': 'error',

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
