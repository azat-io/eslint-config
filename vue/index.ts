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

export let vue = async (config: ConfigOptions): Promise<Linter.Config> => {
  if (!config.vue) {
    return {}
  }

  let [vuePlugin, vueParser] = await Promise.all([
    interopDefault(import('eslint-plugin-vue')),
    interopDefault(import('vue-eslint-parser')),
  ] as const)

  let files = ['**/*.vue']
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
    name: 'azat-io/vue/rules',

    files,

    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
        ...additionalParserOptions,
      },
    },

    plugins: {
      vue: vuePlugin,
    },

    rules: {
      /**
       * Enforce attribute naming style on custom components in template.
       */
      'vue/attribute-hyphenation': ['error', 'always'],
      /**
       * Enforce order of component top-level elements.
       */
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      /**
       * Support comment-directives in `<template>`.
       */
      'vue/comment-directive': 'error',
      /**
       * Enforce component API style.
       */
      'vue/component-api-style': 'error',
      /**
       * Enforce specific casing for component definition name.
       */
      'vue/component-definition-name-casing': ['error', 'kebab-case'],
      /**
       * Enforce specific casing for the component naming style in template.
       */
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      /**
       * Enforce the casing of component name in components options.
       */
      'vue/component-options-name-casing': ['error', 'kebab-case'],
      /**
       * Enforce specific casing for custom event name.
       */
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      /**
       * Enforce declaration style of `defineEmits`.
       */
      'vue/define-emits-declaration': 'error',
      /**
       * Enforce declaration style of `defineProps`.
       */
      'vue/define-props-declaration': 'error',
      /**
       * Enforce or forbid the use of the `scoped` attribute in SFC top level
       * style tags.
       */
      'vue/enforce-style-attribute': [
        'error',
        {
          allow: ['scoped', 'plain'],
        },
      ],
      /**
       * Disallow usage of button without an explicit type attribute.
       */
      'vue/html-button-has-type': 'error',
      /**
       * Enforce end tag style.
       */
      'vue/html-end-tags': 'error',
      /**
       * Prevent variables used in JSX to be marked as unused.
       */
      'vue/jsx-uses-vars': 'error',
      /**
       * Disallow asynchronous actions in computed properties
       */
      'vue/no-async-in-computed-properties': 'error',
      /**
       * Disallow element's child contents which would be overwritten by a
       * directive like `v-html` or `v-text`.
       */
      'vue/no-child-content': 'error',
      /**
       * Disallow accessing computed properties in `data`.
       */
      'vue/no-computed-properties-in-data': 'error',
      /**
       * Disallow using deprecated object declaration on data (in Vue.js
       * 3.0.0+).
       */
      'vue/no-deprecated-data-object-declaration': 'error',
      /**
       * Disallow using deprecated `$delete` and `$set` (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-delete-set': 'error',
      /**
       * Disallow using deprecated `destroyed` and `beforeDestroy` lifecycle
       * hooks (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-destroyed-lifecycle': 'error',
      /**
       * Disallow using deprecated $listeners (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-dollar-listeners-api': 'error',
      /**
       * Disallow using deprecated $scopedSlots (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-dollar-scopedslots-api': 'error',
      /**
       * Disallow using deprecated events api (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-events-api': 'error',
      /**
       * Disallow using deprecated filters syntax (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-filter': 'error',
      /**
       * Disallow using deprecated the functional template (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-functional-template': 'error',
      /**
       * Disallow using deprecated the `is` attribute on HTML elements (in
       * Vue.js 3.0.0+).
       */
      'vue/no-deprecated-html-element-is': 'error',
      /**
       * Disallow using deprecated `inline-template` attribute (in Vue.js
       * 3.0.0+).
       */
      'vue/no-deprecated-inline-template': 'error',
      /**
       * Disallow deprecated `model` definition (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-model-definition': 'error',
      /**
       * Disallow deprecated this access in props default function (in Vue.js
       * 3.0.0+).
       */
      'vue/no-deprecated-props-default-this': 'error',
      /**
       * Disallow using deprecated `tag` property on `RouterLink` (in Vue.js
       * 3.0.0+).
       */
      'vue/no-deprecated-router-link-tag-prop': 'error',
      /**
       * Disallow deprecated `scope` attribute (in Vue.js 2.5.0+).
       */
      'vue/no-deprecated-scope-attribute': 'error',
      /**
       * Disallow deprecated `slot` attribute (in Vue.js 2.6.0+).
       */
      'vue/no-deprecated-slot-attribute': 'error',
      /**
       * Disallow deprecated `slot-scope` attribute (in Vue.js 2.6.0+).
       */
      'vue/no-deprecated-slot-scope-attribute': 'error',
      /**
       * Disallow use of deprecated `.sync` modifier on `v-bind` directive (in
       * Vue.js 3.0.0+).
       */
      'vue/no-deprecated-v-bind-sync': 'error',
      /**
       * Disallow deprecated `v-is` directive (in Vue.js 3.1.0+).
       */
      'vue/no-deprecated-v-is': 'error',
      /**
       * Disallow using deprecated `.native` modifiers (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-v-on-native-modifier': 'error',
      /**
       * Disallow using deprecated number (keycode) modifiers (in Vue.js
       * 3.0.0+).
       */
      'vue/no-deprecated-v-on-number-modifiers': 'error',
      /**
       * Disallow using deprecated `Vue.config.keyCodes` (in Vue.js 3.0.0+).
       */
      'vue/no-deprecated-vue-config-keycodes': 'error',
      /**
       * Disallow duplication of field names.
       */
      'vue/no-dupe-keys': 'error',
      /**
       * Disallow duplicate conditions in `v-if` / `v-else-if` chains.
       */
      'vue/no-dupe-v-else-if': 'error',
      /**
       * Enforce `inheritAttrs` to be set to `false` when using
       * `v-bind="$attrs"`.
       */
      'vue/no-duplicate-attr-inheritance': 'error',
      /**
       * Disallow duplication of attributes.
       */
      'vue/no-duplicate-attributes': 'error',
      /**
       * Disallow the `<template>`, `<script>`, `<style>` block to be empty.
       */
      'vue/no-empty-component-block': 'error',
      /**
       * Disallow `export` in `<script setup>`.
       */
      'vue/no-export-in-script-setup': 'error',
      /**
       * Disallow asynchronously registered `expose`.
       */
      'vue/no-expose-after-await': 'error',
      /**
       * Disallow asynchronously registered lifecycle hooks.
       */
      'vue/no-lifecycle-after-await': 'error',
      /**
       * Disallow unnecessary `<template>`.
       */
      'vue/no-lone-template': 'error',
      /**
       * Disallow to pass multiple objects into array to class.
       */
      'vue/no-multiple-objects-in-class': 'error',
      /**
       * Disallow to pass multiple arguments to scoped slots.
       */
      'vue/no-multiple-slot-args': 'error',
      /**
       * Disallow mutation of component props.
       */
      'vue/no-mutating-props': 'error',
      /**
       * Disallow parsing errors in `<template>`.
       */
      'vue/no-parsing-error': 'error',
      /**
       * Disallow a potential typo in your component property.
       */
      'vue/no-potential-component-option-typo': 'error',
      /**
       * Disallow use of value wrapped by `ref()` (Composition API) as an
       * operand.
       */
      'vue/no-ref-as-operand': 'error',
      /**
       * Disallow usages of ref objects that can lead to loss of reactivity.
       */
      'vue/no-ref-object-reactivity-loss': 'error',
      /**
       * Enforce props with default values to be optional.
       */
      'vue/no-required-prop-with-default': 'error',
      /**
       * Disallow the use of reserved names in component definitions.
       */
      'vue/no-reserved-component-names': 'error',
      /**
       * Disallow overwriting reserved keys.
       */
      'vue/no-reserved-keys': 'error',
      /**
       * Disallow reserved names in props.
       */
      'vue/no-reserved-props': 'error',
      /**
       * Disallow usages that lose the reactivity of `props` passed to `setup`.
       */
      'vue/no-setup-props-reactivity-loss': 'error',
      /**
       * Enforce component's data property to be a function.
       */
      'vue/no-shared-component-data': 'error',
      /**
       * Disallow side effects in computed properties.
       */
      'vue/no-side-effects-in-computed-properties': 'error',
      /**
       * Disallow `key` attribute on `<template>`.
       */
      'vue/no-template-key': 'error',
      /**
       * Disallow variable declarations from shadowing variables declared in the
       * outer scope.
       */
      'vue/no-template-shadow': 'error',
      /**
       * Disallow `target="_blank"` attribute without
       * `rel="noopener noreferrer"`.
       */
      'vue/no-template-target-blank': 'error',
      /**
       * Disallow mustaches in `<textarea>`.
       */
      'vue/no-textarea-mustache': 'error',
      /**
       * Disallow `this` usage in a `beforeRouteEnter` method
       */
      'vue/no-this-in-before-route-enter': 'error',
      /**
       * Disallow use of `undefined` components in `<template>`.
       */
      'vue/no-undef-components': 'error',
      /**
       * Disallow undefined properties.
       */
      'vue/no-undef-properties': 'error',
      /**
       * Disallow registering components that are not used inside templates.
       */
      'vue/no-unused-components': 'error',
      /**
       * Disallow unused emit declarations.
       */
      'vue/no-unused-emit-declarations': 'error',
      /**
       * Disallow unused variable definitions of v-for directives or scope
       * attributes.
       */
      'vue/no-unused-vars': 'error',
      /**
       * Disallow use computed property like method.
       */
      'vue/no-use-computed-property-like-method': 'error',
      /**
       * Disallow using `v-else-if` / `v-else` on the same element as `v-for`.
       */
      'vue/no-use-v-else-with-v-for': 'error',
      /**
       * Disallow using `v-if` on the same element as `v-for`.
       */
      'vue/no-use-v-if-with-v-for': 'error',
      /**
       * Disallow unnecessary mustache interpolations.
       */
      'vue/no-useless-mustaches': 'error',
      /**
       * Disallow useless attribute on `<template>`.
       */
      'vue/no-useless-template-attributes': 'error',
      /**
       * Disallow unnecessary `v-bind` directives.
       */
      'vue/no-useless-v-bind': 'error',
      /**
       * Disallow key of `<template v-for>` placed on child elements.
       */
      'vue/no-v-for-template-key-on-child': 'error',
      /**
       * Disallow use of v-html to prevent XSS attack.
       */
      'vue/no-v-html': 'error',
      /**
       * Disallow `v-text` / `v-html` on component.
       */
      'vue/no-v-text-v-html-on-component': 'error',
      /**
       * Disallow asynchronously registered `watch`.
       */
      'vue/no-watch-after-await': 'error',
      /**
       * Enforce use of `defineOptions` instead of default export.
       */
      'vue/prefer-define-options': 'error',
      /**
       * Enforce import from `'vue'` instead of import from `'@vue/*'`.
       */
      'vue/prefer-import-from-vue': 'error',
      /**
       * Require static class names in template to be in a separate `class`
       * attribute.
       */
      'vue/prefer-separate-static-class': 'error',
      /**
       * Require shorthand form attribute when `v-bind` value is `true`.
       */
      'vue/prefer-true-attribute-shorthand': 'error',
      /**
       * Enforce specific casing for the Prop name in Vue components.
       */
      'vue/prop-name-casing': ['error', 'camelCase'],
      /**
       * Require `v-bind:is` of `<component>` elements.
       */
      'vue/require-component-is': 'error',
      /**
       * Require default value for props.
       */
      'vue/require-default-prop': 'error',
      /**
       * Require type definitions in emits.
       */
      'vue/require-emit-validator': 'error',
      /**
       * Require `emits` option with name triggered by `$emit()`.
       */
      'vue/require-explicit-emits': 'error',
      /**
       * Require slots to be explicitly defined.
       */
      'vue/require-explicit-slots': 'error',
      /**
       * Require a certain macro variable name.
       */
      'vue/require-macro-variable-name': [
        'error',
        {
          defineEmits: 'emit',
          defineProps: 'props',
          defineSlots: 'slots',
          useAttrs: 'attrs',
          useSlots: 'slots',
        },
      ],
      /**
       * Require a name property in Vue components.
       */
      'vue/require-name-property': 'error',
      /**
       * Require prop type to be a constructor.
       */
      'vue/require-prop-type-constructor': 'error',
      /**
       * Enforce render function to always return value.
       */
      'vue/require-render-return': 'error',
      /**
       * Enforce properties of `$slots` to be used as a function.
       */
      'vue/require-slots-as-functions': 'error',
      /**
       * Require control the display of the content inside `<transition>`.
       */
      'vue/require-toggle-inside-transition': 'error',
      /**
       * Require `ref` and `shallowRef` functions to be strongly typed.
       */
      'vue/require-typed-ref': 'error',
      /**
       * Require `v-bind:key` with `v-for` directives.
       */
      'vue/require-v-for-key': 'error',
      /**
       * Enforce props default values to be valid.
       */
      'vue/require-valid-default-prop': 'error',
      /**
       * Enforce that a return statement is present in computed property.
       */
      'vue/return-in-computed-property': 'error',
      /**
       * Enforce that a return statement is present in emits validator.
       */
      'vue/return-in-emits-validator': 'error',
      /**
       * Disallow usage of `this` in template.
       */
      'vue/this-in-template': 'error',
      /**
       * Enforce usage of `exact` modifier on `v-on`.
       */
      'vue/use-v-on-exact': 'error',
      /**
       * Enforce `v-bind` directive style.
       */
      'vue/v-bind-style': 'error',
      /**
       * Enforce v-on event naming style on custom components in template.
       */
      'vue/v-on-event-hyphenation': 'error',
      /**
       * Enforce `v-on` directive style.
       */
      'vue/v-on-style': 'error',
      /**
       * Enforce `v-slot` directive style.
       */
      'vue/v-slot-style': 'error',
      /**
       * Require valid attribute names.
       */
      'vue/valid-attribute-name': 'error',
      /**
       * Enforce valid `defineEmits` compiler macro.
       */
      'vue/valid-define-emits': 'error',
      /**
       * Enforce valid `defineOptions` compiler macro.
       */
      'vue/valid-define-options': 'error',
      /**
       * Enforce valid `defineProps` compiler macro.
       */
      'vue/valid-define-props': 'error',
      /**
       * Enforce valid `nextTick` function calls.
       */
      'vue/valid-next-tick': 'error',
      /**
       * Enforce valid template root.
       */
      'vue/valid-template-root': 'error',
      /**
       * Enforce valid `v-bind` directives.
       */
      'vue/valid-v-bind': 'error',
      /**
       * Enforce valid `v-cloak` directives.
       */
      'vue/valid-v-cloak': 'error',
      /**
       * Enforce valid `v-else` directives.
       */
      'vue/valid-v-else': 'error',
      /**
       * Enforce valid `v-else-if` directives.
       */
      'vue/valid-v-else-if': 'error',
      /**
       * Enforce valid `v-for` directives.
       */
      'vue/valid-v-for': 'error',
      /**
       * Enforce valid `v-html` directives.
       */
      'vue/valid-v-html': 'error',
      /**
       * Enforce valid `v-if` directives.
       */
      'vue/valid-v-if': 'error',
      /**
       * Enforce valid `v-is` directives.
       */
      'vue/valid-v-is': 'error',
      /**
       * Enforce valid `v-memo` directives.
       */
      'vue/valid-v-memo': 'error',
      /**
       * Enforce valid `v-model` directives.
       */
      'vue/valid-v-model': 'error',
      /**
       * Enforce valid `v-on` directives.
       */
      'vue/valid-v-on': 'error',
      /**
       * Enforce valid `v-once` directives.
       */
      'vue/valid-v-once': 'error',
      /**
       * Enforce valid `v-pre` directives.
       */
      'vue/valid-v-pre': 'error',
      /**
       * Enforce valid `v-show` directives.
       */
      'vue/valid-v-show': 'error',
      /**
       * Enforce valid `v-slot` directives.
       */
      'vue/valid-v-slot': 'error',
      /**
       * Enforce valid `v-text` directives.
       */
      'vue/valid-v-text': 'error',
    },

    processor: vuePlugin.processors['.vue'] as Linter.Processor,
  }
}
