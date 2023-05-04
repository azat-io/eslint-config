import typescriptConfig from '@azat-io/eslint-config-typescript'
import typescriptParser from '@typescript-eslint/parser'
import { defineFlatConfig } from 'eslint-define-config'
import vueParser from 'vue-eslint-parser'
import vue from 'eslint-plugin-vue'

export default defineFlatConfig([
  ...typescriptConfig,

  {
    files: ['**/*.vue'],

    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        sourceType: 'module',
      },
    },

    plugins: {
      vue,
    },

    rules: {
      'vue/comment-directive': 'error',
      'vue/multi-word-component-names': 'error',
      'vue/no-async-in-computed-properties': 'error',
      'vue/no-child-content': 'error',
      'vue/no-computed-properties-in-data': 'error',
      'vue/no-dupe-v-else-if': 'error',
      'vue/no-duplicate-attributes': 'error',
      'vue/no-export-in-script-setup': 'error',
      'vue/no-mutating-props': 'error',
      'vue/no-parsing-error': 'error',
      'vue/no-ref-as-operand': 'error',
      'vue/no-reserved-component-names': 'error',
      'vue/no-reserved-keys': 'error',
      'vue/no-reserved-props': [
        'error',
        {
          vueVersion: 3,
        },
      ],
      'vue/no-setup-props-destructure': 'error',
      'vue/no-shared-component-data': 'error',
      'vue/no-side-effects-in-computed-properties': 'error',
      'vue/no-template-key': 'error',
      'vue/no-textarea-mustache': 'error',
      'vue/no-unused-components': 'error',
      'vue/no-unused-vars': [
        'error',
        {
          ignorePattern: '^_',
        },
      ],
      'vue/no-use-computed-property-like-method': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/no-useless-template-attributes': 'error',
      'vue/no-v-text-v-html-on-component': 'error',
      'vue/require-component-is': 'error',
      'vue/require-render-return': 'error',
      'vue/require-v-for-key': 'error',
      'vue/require-valid-default-prop': 'error',
      'vue/return-in-computed-property': 'error',
      'vue/return-in-emits-validator': 'error',
      'vue/use-v-on-exact': 'error',
      'vue/valid-attribute-name': 'error',
      'vue/valid-define-emits': 'error',
      'vue/valid-define-props': 'error',
      'vue/valid-next-tick': 'error',
      'vue/valid-template-root': 'error',
      'vue/valid-v-bind': 'error',
      'vue/valid-v-cloak': 'error',
      'vue/valid-v-else-if': 'error',
      'vue/valid-v-else': 'error',
      'vue/valid-v-for': 'error',
      'vue/valid-v-html': 'error',
      'vue/valid-v-if': 'error',
      'vue/valid-v-model': 'error',
    },
  },
])
