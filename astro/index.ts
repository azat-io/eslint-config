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

import path from 'node:path'

import type { ConfigOptions } from '..'

import { interopDefault } from '../utils'

export let astro = async (config: ConfigOptions): Promise<Linter.Config> => {
  if (!config.astro) {
    return {}
  }

  let [astroPlugin, astroParser] = await Promise.all([
    interopDefault(import('eslint-plugin-astro')),
    interopDefault(import('astro-eslint-parser')),
  ] as const)

  let files = ['**/*.astro']
  let additionalParserOptions = {}

  if (config.typescript) {
    let { parser: typescriptParser } = await interopDefault(
      import('typescript-eslint'),
    )

    additionalParserOptions = {
      ...additionalParserOptions,
      parser: typescriptParser,
      project: path.join(process.cwd(), 'tsconfig.json'),
      projectService: false,
      tsconfigRootDir: process.cwd(),
    }
  }

  return {
    name: 'azat-io/astro/rules',

    files,

    languageOptions: {
      parser: astroParser,
      parserOptions: {
        ecmaVersion: 'latest',
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
        ...additionalParserOptions,
      },
    },

    plugins: {
      astro: astroPlugin,
    },

    rules: {
      /**
       * Check if `<img>`, `<area>`, `<input type="image">`, and `<object>` has
       * alt attribute.
       */
      'astro/jsx-a11y/alt-text': 'error',
      /**
       * Enforce that anchors have content.
       */
      'astro/jsx-a11y/anchor-has-content': 'error',
      /**
       * Check if anchor has `href` attribute.
       */
      'astro/jsx-a11y/anchor-is-valid': 'error',
      /**
       * Check if elements with `aria-activedescendant` are tabbable.
       */
      'astro/jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      /**
       * Validate that aria-* property is listed in WAI-ARIA States and
       * Properties spec.
       */
      'astro/jsx-a11y/aria-props': 'error',
      /**
       * Validate aria state and property values.
       */
      'astro/jsx-a11y/aria-proptypes': 'error',
      /**
       * Validate aria roles.
       */
      'astro/jsx-a11y/aria-role': 'error',
      /**
       * Check if `meta`, `html`, `script`, `style`, etc. has no `aria-*`
       * attributes.
       */
      'astro/jsx-a11y/aria-unsupported-elements': 'error',
      /**
       * Ensure the autocomplete attribute is correct and suitable for the form
       * field it is used with.
       */
      'astro/jsx-a11y/autocomplete-valid': 'error',
      /**
       * Enforce that heading elements have content.
       */
      'astro/jsx-a11y/heading-has-content': 'error',
      /**
       * Enforce that `<html>` element has `lang` attribute.
       */
      'astro/jsx-a11y/html-has-lang': 'error',
      /**
       * Enforce that `<iframe>` element has `title` attribute.
       */
      'astro/jsx-a11y/iframe-has-title': 'error',
      /**
       * Enforce image `alt` attribute does not contain the word "image",
       * "picture", or "photo". Screen readers already announce image elements
       * as an "image".
       */
      'astro/jsx-a11y/img-redundant-alt': 'error',
      /**
       * Enforce that elements with interactive handlers like `onClick` must be
       * focusable.
       */
      'astro/jsx-a11y/interactive-supports-focus': 'error',
      /**
       * Enforce that a label tag has a text label and an associated control.
       */
      'astro/jsx-a11y/label-has-associated-control': 'error',
      /**
       * Validate that `lang` attribute has a valid value.
       */
      'astro/jsx-a11y/lang': 'error',
      /**
       * Enforce that media elements has caption.
       */
      'astro/jsx-a11y/media-has-caption': 'error',
      /**
       * Enforce `onmouseover`/`onmouseout` are accompanied by
       * `onfocus`/`onblur`.
       */
      'astro/jsx-a11y/mouse-events-have-key-events': 'error',
      /**
       * Enforce no `accessKey` prop on element.
       */
      'astro/jsx-a11y/no-access-key': 'error',
      /**
       * Enforce that `aria-hidden="true"` is not set on focusable elements.
       */
      'astro/jsx-a11y/no-aria-hidden-on-focusable': 'error',
      /**
       * Enforce that `autoFocus` prop is not used on elements.
       */
      'astro/jsx-a11y/no-autofocus': 'error',
      /**
       * Enforce that non-interactive elements have no interactive roles.
       */
      'astro/jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      /**
       * Enforce that non-interactive elements have no interactive handlers.
       */
      'astro/jsx-a11y/no-noninteractive-element-interactions': 'error',
      /**
       * Enforce that non-interactive elements have no interactive role
       * assignment.
       */
      'astro/jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      /**
       * Enforce that non-interactive elements have no interactive tabindex.
       */
      'astro/jsx-a11y/no-noninteractive-tabindex': 'error',
      /**
       * Enforce that interactive elements have no redundant roles.
       */
      'astro/jsx-a11y/no-redundant-roles': 'error',
      /**
       * Disallow interactive events on non-interactive elements.
       */
      'astro/jsx-a11y/no-static-element-interactions': 'error',
      /**
       * Enforce to use semantic DOM elements over the ari role property.
       */
      'astro/jsx-a11y/prefer-tag-over-role': 'error',
      /**
       * Enforce that elements with ARIA roles must have all required
       * attributes.
       */
      'astro/jsx-a11y/role-has-required-aria-props': 'error',
      /**
       * Enforce that elements with explicit or implicit roles defined contain
       * only `aria-*` properties supported by that `role`.
       */
      'astro/jsx-a11y/role-supports-aria-props': 'error',
      /**
       * Enforce that `scope` prop is only used on `<th>` elements.
       */
      'astro/jsx-a11y/scope': 'error',
      /**
       * Avoid positive `tabIndex` property values to synchronize the flow of
       * the page with keyboard tab order.
       */
      'astro/jsx-a11y/tabindex-no-positive': 'error',
      /**
       * Enforce using value with `client:only` directive.
       */
      'astro/missing-client-only-directive-value': 'error',
      /**
       * Disallow conflicting set directives and child contents.
       */
      'astro/no-conflict-set-directives': 'error',
      /**
       * Disallow using deprecated `Astro.canonicalURL`.
       */
      'astro/no-deprecated-astro-canonicalurl': 'error',
      /**
       * Disallow using deprecated `Astro.fetchContent()`.
       */
      'astro/no-deprecated-astro-fetchcontent': 'error',
      /**
       * Disallow using deprecated `Astro.resolve()`.
       */
      'astro/no-deprecated-astro-resolve': 'error',
      /**
       * Disallow using deprecated `getEntryBySlug()`.
       */
      'astro/no-deprecated-getentrybyslug': 'error',
      /**
       * Disallow value export from Astro component.
       */
      'astro/no-exports-from-components': 'error',
      /**
       * Disallow use of `set:text`.
       */
      'astro/no-set-text-directive': 'error',
      /**
       * Disallow unused `define:vars={...}` in style tag.
       */
      'astro/no-unused-define-vars-in-style': 'error',
      /**
       * Require `class:list` directives instead of class with expressions.
       */
      'astro/prefer-class-list-directive': 'error',
      /**
       * Require use object instead of ternary expression in `class:list`.
       */
      'astro/prefer-object-class-list': 'error',
      /**
       * Require use split array elements in `class:list`.
       */
      'astro/prefer-split-class-list': 'error',
      /**
       * Enforce sorted Astro attributes.
       */
      'astro/sort-attributes': [
        'error',
        {
          ignoreCase: true,
          order: 'desc',
          type: 'line-length',
        },
      ],
      /**
       * Disallow warnings when compiling.
       */
      'astro/valid-compile': 'error',
    },
  }
}
