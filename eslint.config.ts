import type { Linter } from 'eslint'

import eslintPlugin from 'eslint-plugin-eslint-plugin'

import eslintConfig from '.'

/**
 * Lints the own rules of the config. The config inspector skips it, because the
 * site it builds documents only the published config.
 */
let ruleConfigs: Linter.Config[] =
  process.env['ESLINT_CONFIG_INSPECTOR'] ?
    []
  : [
      {
        ...eslintPlugin.configs.recommended,
        files: ['rules/**/*.ts'],
      },
    ]

export default eslintConfig({
  extends: ruleConfigs,
  perfectionist: true,
  typescript: true,
  svelte: true,
  vitest: true,
  astro: true,
  react: true,
  qwik: true,
  node: true,
  vue: true,
}) satisfies Promise<Linter.Config[]>
