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

import jsxA11y from 'eslint-plugin-jsx-a11y'

import type { ConfigOptions } from '..'

export let a11y = (config: ConfigOptions): Linter.Config => {
  if (!(config.react || config.qwik)) {
    return {}
  }

  let files = ['**/*.jsx']

  if (config.typescript) {
    files.push('**/*.tsx')
  }

  return {
    name: 'azat-io/a11y/rules',

    files,

    plugins: {
      'jsx-a11y': jsxA11y,
    },

    rules: {
      /**
       * Check if `<img>`, `<area>`, `<input type="image">`, and `<object>` has
       * alt attribute.
       */
      'jsx-a11y/alt-text': 'error',
      /**
       * Enforce that anchors have content.
       */
      'jsx-a11y/anchor-has-content': 'error',
      /**
       * Check if anchor has `href` attribute.
       */
      'jsx-a11y/anchor-is-valid': 'error',
      /**
       * Check if elements with `aria-activedescendant` are tabbable.
       */
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      /**
       * Validate that aria-* property is listed in WAI-ARIA States and
       * Properties spec.
       */
      'jsx-a11y/aria-props': 'error',
      /**
       * Validate aria state and property values.
       */
      'jsx-a11y/aria-proptypes': 'error',
      /**
       * Validate aria roles.
       */
      'jsx-a11y/aria-role': 'error',
      /**
       * Check if `meta`, `html`, `script`, `style`, etc. has no `aria-*`
       * attributes.
       */
      'jsx-a11y/aria-unsupported-elements': 'error',
      /**
       * Ensure the autocomplete attribute is correct and suitable for the form
       * field it is used with.
       */
      'jsx-a11y/autocomplete-valid': 'error',
      /**
       * Enforce that heading elements have content.
       */
      'jsx-a11y/heading-has-content': 'error',
      /**
       * Enforce that `<html>` element has `lang` attribute.
       */
      'jsx-a11y/html-has-lang': 'error',
      /**
       * Enforce that `<iframe>` element has `title` attribute.
       */
      'jsx-a11y/iframe-has-title': 'error',
      /**
       * Enforce image `alt` attribute does not contain the word "image",
       * "picture", or "photo". Screen readers already announce image elements
       * as an "image".
       */
      'jsx-a11y/img-redundant-alt': 'error',
      /**
       * Enforce that elements with interactive handlers like `onClick` must be
       * focusable.
       */
      'jsx-a11y/interactive-supports-focus': 'error',
      /**
       * Enforce that a label tag has a text label and an associated control.
       */
      'jsx-a11y/label-has-associated-control': 'error',
      /**
       * Validate that `lang` attribute has a valid value.
       */
      'jsx-a11y/lang': 'error',
      /**
       * Enforce that media elements has caption.
       */
      'jsx-a11y/media-has-caption': 'error',
      /**
       * Enforce `onmouseover`/`onmouseout` are accompanied by
       * `onfocus`/`onblur`.
       */
      'jsx-a11y/mouse-events-have-key-events': 'error',
      /**
       * Enforce no `accessKey` prop on element.
       */
      'jsx-a11y/no-access-key': 'error',
      /**
       * Enforce that `aria-hidden="true"` is not set on focusable elements.
       */
      'jsx-a11y/no-aria-hidden-on-focusable': 'error',
      /**
       * Enforce that `autoFocus` prop is not used on elements.
       */
      'jsx-a11y/no-autofocus': 'error',
      /**
       * Enforce that non-interactive elements have no interactive roles.
       */
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      /**
       * Enforce that non-interactive elements have no interactive handlers.
       */
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      /**
       * Enforce that non-interactive elements have no interactive role
       * assignment.
       */
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      /**
       * Enforce that non-interactive elements have no interactive tabindex.
       */
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      /**
       * Enforce that interactive elements have no redundant roles.
       */
      'jsx-a11y/no-redundant-roles': 'error',
      /**
       * Disallow interactive events on non-interactive elements.
       */
      'jsx-a11y/no-static-element-interactions': 'error',
      /**
       * Enforce to use semantic DOM elements over the ari role property.
       */
      'jsx-a11y/prefer-tag-over-role': 'error',
      /**
       * Enforce that elements with ARIA roles must have all required
       * attributes.
       */
      'jsx-a11y/role-has-required-aria-props': 'error',
      /**
       * Enforce that elements with explicit or implicit roles defined contain
       * only `aria-*` properties supported by that `role`.
       */
      'jsx-a11y/role-supports-aria-props': 'error',
      /**
       * Enforce that `scope` prop is only used on `<th>` elements.
       */
      'jsx-a11y/scope': 'error',
      /**
       * Avoid positive `tabIndex` property values to synchronize the flow of
       * the page with keyboard tab order.
       */
      'jsx-a11y/tabindex-no-positive': 'error',
    },
  }
}
