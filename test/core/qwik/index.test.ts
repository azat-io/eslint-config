import type { Linter } from 'eslint'

import { Linter as ESLintLinter } from 'eslint'
import { describe, expect, it } from 'vitest'
import qwikPlugin from 'eslint-plugin-qwik'

import type { ConfigOptions } from '../../../index'

import { qwik } from '../../../core/qwik/index'

let disabled: ConfigOptions = {
  perfectionist: false,
  typescript: false,
  svelte: false,
  vitest: false,
  astro: false,
  react: false,
  qwik: false,
  node: false,
  vue: false,
}

let enabled: ConfigOptions = {
  perfectionist: true,
  typescript: true,
  svelte: true,
  vitest: true,
  astro: true,
  react: true,
  qwik: true,
  node: true,
  vue: true,
}

function options(flags: Partial<ConfigOptions> = {}): ConfigOptions {
  return { ...disabled, qwik: true, ...flags }
}

let jsxParser: Linter.Config = {
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  files: ['**/*.jsx', '**/*.tsx'],
}

describe('qwik', () => {
  it('returns an empty config when qwik is disabled', async () => {
    await expect(qwik({ ...enabled, qwik: false })).resolves.toStrictEqual({})
  })

  it.each([
    { files: ['**/*.jsx'], name: 'qwik alone', flags: {} },
    {
      flags: { react: true, astro: true, vue: true },
      name: 'other jsx and component options',
      files: ['**/*.jsx'],
    },
    {
      files: ['**/*.jsx', '**/*.tsx'],
      flags: { typescript: true },
      name: 'typescript',
    },
    {
      files: ['**/*.jsx', '**/*.tsx'],
      name: 'every option',
      flags: enabled,
    },
  ])(
    'names the block and lints the jsx files of $name',
    async ({ flags, files }) => {
      let config = await qwik(options(flags))

      expect(config.name).toBe('azat-io/qwik/rules')
      expect(config.files).toStrictEqual(files)
    },
  )

  it('registers the plugin with the same existing rules for every option', async () => {
    let config = await qwik(options())
    let everyOption = await qwik(enabled)
    let rules = Object.keys(config.rules ?? {})

    expect(config.plugins).toStrictEqual({ qwik: qwikPlugin })
    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(
        rule =>
          !Object.hasOwn(qwikPlugin.rules ?? {}, rule.replace(/^qwik\//u, '')),
      ),
    ).toStrictEqual([])
    expect(everyOption.plugins).toStrictEqual(config.plugins)
    expect(everyOption.rules).toStrictEqual(config.rules)
  })

  it.each([
    {
      code: 'export let image = <img src="cat.png" className="photo" />\n',
      rules: ['qwik/jsx-img', 'qwik/no-react-props'],
      name: 'an image with react props and no size',
    },
    {
      code: 'export let image = <img src="cat.png" width={4} height={3} />\n',
      name: 'a sized image',
      rules: [],
    },
  ])('reports qwik rules in $name', async ({ rules, code }) => {
    let linter = new ESLintLinter()
    let config = await qwik(options())

    expect(
      linter
        .verify(
          code,
          [
            jsxParser,
            config,
            /**
             * The rule needs type information from the typescript config, which
             * this test does not load.
             */
            { rules: { 'qwik/valid-lexical-scope': 'off' } },
          ],
          'image.jsx',
        )
        .map(message => message.ruleId),
    ).toStrictEqual(rules)
  })
})
