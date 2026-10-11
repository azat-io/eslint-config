import type { Linter } from 'eslint'

import { builtinRules } from 'eslint/use-at-your-own-risk'
import { describe, expect, it } from 'vitest'

import type { ConfigOptions } from '../../../index'

import { base } from '../../../core/base/index'

function findUnknownRules(config: Linter.Config): string[] {
  let plugins = config.plugins ?? {}
  return Object.keys(config.rules ?? {}).filter(name => {
    let separator = name.indexOf('/')
    if (separator === -1) {
      return !builtinRules.has(name)
    }
    let rules = plugins[name.slice(0, separator)]?.rules ?? {}
    return !Object.hasOwn(rules, name.slice(separator + 1))
  })
}

function options(enabled: Partial<ConfigOptions> = {}): ConfigOptions {
  return {
    perfectionist: false,
    typescript: false,
    svelte: false,
    vitest: false,
    astro: false,
    react: false,
    qwik: false,
    node: false,
    vue: false,
    ...enabled,
  }
}

let allOptions = options({
  perfectionist: true,
  typescript: true,
  svelte: true,
  vitest: true,
  astro: true,
  react: true,
  qwik: true,
  node: true,
  vue: true,
})

let javascriptFiles = ['**/*.js', '**/*.cjs', '**/*.mjs']
let typescriptFiles = ['**/*.ts', '**/*.cts', '**/*.mts']

describe('base', () => {
  it('names the config', () => {
    expect(base(options()).name).toBe('azat-io/base/rules')
  })

  it.each([
    [{}, javascriptFiles],
    [{ perfectionist: true, vitest: true, node: true }, javascriptFiles],
    [{ typescript: true }, [...javascriptFiles, ...typescriptFiles]],
    [{ react: true }, [...javascriptFiles, '**/*.jsx']],
    [{ qwik: true }, [...javascriptFiles, '**/*.jsx']],
    [
      { typescript: true, react: true },
      [...javascriptFiles, ...typescriptFiles, '**/*.jsx', '**/*.tsx'],
    ],
    [
      { typescript: true, qwik: true },
      [...javascriptFiles, ...typescriptFiles, '**/*.jsx', '**/*.tsx'],
    ],
    [{ astro: true }, [...javascriptFiles, '**/*.astro']],
    [{ svelte: true }, [...javascriptFiles, '**/*.svelte']],
    [{ vue: true }, [...javascriptFiles, '**/*.vue']],
    [
      allOptions,
      [
        ...javascriptFiles,
        ...typescriptFiles,
        '**/*.jsx',
        '**/*.tsx',
        '**/*.astro',
        '**/*.svelte',
        '**/*.vue',
      ],
    ],
  ])('lints the files of the enabled configs %o', (enabled, files) => {
    expect(base(options(enabled)).files).toStrictEqual(files)
  })

  it.each([
    [{}, 'error'],
    [{ typescript: true, svelte: true, vue: true }, 'error'],
    [{ astro: true }, 'off'],
    [{ react: true }, 'off'],
    [{ qwik: true }, 'off'],
  ])(
    'sets no-useless-assignment for the configs %o to %s',
    (enabled, severity) => {
      expect(base(options(enabled)).rules?.['no-useless-assignment']).toBe(
        severity,
      )
    },
  )

  it.each([
    [{}, false, false],
    [{ typescript: true, qwik: true, node: true }, false, false],
    [{ astro: true }, true, true],
    [{ react: true }, false, true],
    [{ svelte: true }, false, true],
    [{ vue: true }, false, true],
  ])(
    'allows framework names for the configs %o (env: %s, rel: %s)',
    (enabled, env, rel) => {
      expect(
        base(options(enabled)).rules?.['unicorn/name-replacements'],
      ).toMatchObject(['error', { allowList: { env, rel } }])
    },
  )

  it('keeps globals, plugins and settings independent of the flags', () => {
    let defaultConfig = base(options())
    let fullConfig = base(allOptions)

    expect(defaultConfig.languageOptions?.['globals']).toMatchObject({
      Promise: false,
      process: false,
      window: false,
    })
    expect(defaultConfig.settings).toStrictEqual({ jsdoc: { mode: 'jsdoc' } })
    expect(fullConfig.languageOptions).toStrictEqual(
      defaultConfig.languageOptions,
    )
    expect(fullConfig.plugins).toStrictEqual(defaultConfig.plugins)
    expect(fullConfig.settings).toStrictEqual(defaultConfig.settings)
  })

  it('only enables rules that ESLint or its plugins define', () => {
    expect(findUnknownRules(base(allOptions))).toStrictEqual([])
  })
})
