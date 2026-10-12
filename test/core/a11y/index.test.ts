import type { Linter } from 'eslint'

import jsxA11yPlugin from 'eslint-plugin-jsx-a11y-x'
import { Linter as ESLintLinter } from 'eslint'
import { describe, expect, it } from 'vitest'

import type { ConfigOptions } from '../../../index'

import { a11y } from '../../../core/a11y/index'

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
  return { ...disabled, ...flags }
}

let jsxParser: Linter.Config = {
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  files: ['**/*.jsx', '**/*.tsx'],
}

describe('a11y', () => {
  it('returns an empty config without react and qwik', () => {
    expect(a11y({ ...enabled, react: false, qwik: false })).toStrictEqual({})
  })

  it.each([
    { flags: { react: true }, files: ['**/*.jsx'], name: 'react' },
    { flags: { qwik: true }, files: ['**/*.jsx'], name: 'qwik' },
    {
      flags: { typescript: true, react: true },
      files: ['**/*.jsx', '**/*.tsx'],
      name: 'react with typescript',
    },
    {
      flags: { typescript: true, qwik: true },
      files: ['**/*.jsx', '**/*.tsx'],
      name: 'qwik with typescript',
    },
    {
      files: ['**/*.jsx', '**/*.tsx'],
      name: 'every option',
      flags: enabled,
    },
  ])('names the block and lints the jsx files of $name', ({ flags, files }) => {
    let config = a11y(options(flags))

    expect(config.name).toBe('azat-io/a11y/rules')
    expect(config.files).toStrictEqual(files)
  })

  it('registers the plugin with the same existing rules for every option', () => {
    let config = a11y(options({ react: true }))
    let everyOption = a11y(enabled)
    let pluginRules = config.plugins?.['jsx-a11y']?.rules ?? {}
    let rules = Object.keys(config.rules ?? {})

    expect(config.plugins).toStrictEqual({ 'jsx-a11y': jsxA11yPlugin })
    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(
        rule => !Object.hasOwn(pluginRules, rule.replace(/^jsx-a11y\//u, '')),
      ),
    ).toStrictEqual([])
    expect(everyOption.plugins).toStrictEqual(config.plugins)
    expect(everyOption.rules).toStrictEqual(config.rules)
  })

  it.each([
    { rules: ['jsx-a11y/alt-text'], flags: { react: true }, file: 'a.jsx' },
    { rules: ['jsx-a11y/alt-text'], flags: { qwik: true }, file: 'a.jsx' },
    { flags: { react: true }, file: 'a.tsx', rules: [] },
    {
      flags: { typescript: true, react: true },
      rules: ['jsx-a11y/alt-text'],
      file: 'a.tsx',
    },
  ])(
    'reports an image without alt text in $file for $flags',
    ({ flags, rules, file }) => {
      let linter = new ESLintLinter()

      expect(
        linter
          .verify(
            'export let image = <img src="cat.png" />\n',
            [jsxParser, a11y(options(flags))],
            file,
          )
          .map(message => message.ruleId),
      ).toStrictEqual(rules)
    },
  )
})
