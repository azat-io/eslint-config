import reactNamingConventionPlugin from 'eslint-plugin-react-naming-convention'
import reactPerformancePlugin from 'eslint-plugin-react-perf'
import reactWebApiPlugin from 'eslint-plugin-react-web-api'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactDomPlugin from 'eslint-plugin-react-dom'
import reactJsxPlugin from 'eslint-plugin-react-jsx'
import reactXPlugin from 'eslint-plugin-react-x'
import { describe, expect, it } from 'vitest'

import type { ConfigOptions } from '../../../index'

import { react } from '../../../core/react/index'

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
  return { ...disabled, react: true, ...flags }
}

describe('react', () => {
  it('returns an empty config when react is disabled', async () => {
    await expect(react({ ...enabled, react: false })).resolves.toStrictEqual({})
  })

  it.each([
    { name: 'react alone', files: ['**/*.jsx'], flags: {} },
    {
      flags: { astro: true, qwik: true, vue: true },
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
      let config = await react(options(flags))

      expect(config.name).toBe('azat-io/react/rules')
      expect(config.files).toStrictEqual(files)
    },
  )

  it('registers the react plugins and detects the react version', async () => {
    let config = await react(options())

    expect(config.plugins).toStrictEqual({
      'react-naming-convention': reactNamingConventionPlugin,
      'react-perf': reactPerformancePlugin,
      'react-web-api': reactWebApiPlugin,
      'react-hooks': reactHooksPlugin,
      'react-dom': reactDomPlugin,
      'react-jsx': reactJsxPlugin,
      'react-x': reactXPlugin,
    })
    expect(config.settings).toStrictEqual({
      react: { fragment: 'Fragment', version: 'detect', pragma: 'React' },
    })
  })

  it('enables the same rules of the registered plugins for every option', async () => {
    let config = await react(options())
    let everyOption = await react(enabled)
    let rules = Object.keys(config.rules ?? {})
    let plugins = Object.keys(config.plugins ?? {})

    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(rule => !plugins.includes(rule.slice(0, rule.indexOf('/')))),
    ).toStrictEqual([])
    expect(everyOption.plugins).toStrictEqual(config.plugins)
    expect(everyOption.settings).toStrictEqual(config.settings)
    expect(everyOption.rules).toStrictEqual(config.rules)
  })
})
