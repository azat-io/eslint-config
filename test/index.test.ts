import type { Linter } from 'eslint'

import { describe, expect, it } from 'vitest'

import createConfig from '../index'

describe('index', () => {
  it('always adds the base and package.json configs', async () => {
    let configs = await createConfig()

    expect(configs.map(config => config.name).filter(Boolean)).toStrictEqual([
      'azat-io/gitignore',
      'azat-io/benchmark/ignores',
      'azat-io/base/rules',
      'azat-io/package-json/rules',
      'azat-io/custom-extends',
    ])
  })

  it('adds a config for every enabled option', async () => {
    let configs = await createConfig({
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

    expect(configs.map(config => config.name)).toStrictEqual([
      'azat-io/gitignore',
      'azat-io/benchmark/ignores',
      'azat-io/base/rules',
      'azat-io/a11y/rules',
      'azat-io/react/rules',
      'azat-io/node/rules',
      'azat-io/typescript/rules',
      'azat-io/vitest/rules',
      'azat-io/astro/rules',
      'azat-io/svelte/rules',
      'azat-io/qwik/rules',
      'azat-io/vue/rules',
      'azat-io/package-json/rules',
      'azat-io/perfectionist/rules',
      'azat-io/custom-extends',
    ])
  })

  it('gives custom configs the plugins of the enabled configs', async () => {
    let custom = { rules: { 'unicorn/no-null': 'off' } } as const
    let configs = await createConfig({ extends: [custom, custom] })
    let customConfigs = configs.filter(
      config => config.name === 'azat-io/custom-extends',
    )

    expect(customConfigs).toHaveLength(2)
    expect(customConfigs[0]).toMatchObject(custom)
    expect(customConfigs[0]?.plugins).toHaveProperty('unicorn')
  })

  it('keeps the name and plugins of a single custom config', async () => {
    let plugin = { rules: {} }
    let custom = {
      rules: { 'custom/rule': 'error' },
      plugins: { custom: plugin },
      name: 'custom/config',
    } as const
    let configs = await createConfig({ extends: custom })
    let lastConfig = configs.at(-1)

    expect(
      configs.filter(config => config.name === 'azat-io/custom-extends'),
    ).toStrictEqual([])
    expect(lastConfig).toMatchObject(custom)
    expect(lastConfig?.plugins).toHaveProperty('unicorn')
  })

  it.each([null, false])(
    'adds no custom config for %s extends from javascript configs',
    async customExtends => {
      let createJavaScriptConfig: (
        options: object,
      ) => Promise<Linter.Config[]> = createConfig
      let configs = await createJavaScriptConfig({ extends: customExtends })

      expect(configs.map(config => config.name).filter(Boolean)).toStrictEqual([
        'azat-io/gitignore',
        'azat-io/benchmark/ignores',
        'azat-io/base/rules',
        'azat-io/package-json/rules',
      ])
    },
  )
})
