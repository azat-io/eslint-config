import type { Linter } from 'eslint'

import { writeFileSync, mkdtempSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import { ESLint } from 'eslint'
import path from 'node:path'

import createConfig from '../index'

function project(packageJson: object): string {
  let root = mkdtempSync(path.join(tmpdir(), 'config-runtime-'))
  writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson))
  return root
}

describe('index', () => {
  it('always adds the base and package.json configs', async () => {
    let configs = await createConfig()

    expect(configs.map(config => config.name).filter(Boolean)).toStrictEqual([
      'azat-io/gitignore',
      'azat-io/benchmark/ignores',
      'azat-io/base/rules',
      'azat-io/package-json/rules',
      'azat-io/runtime/rules',
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
      'azat-io/runtime/rules',
      'azat-io/custom-extends',
    ])
  }, 30_000)

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
        'azat-io/runtime/rules',
      ])
    },
  )

  it('automatically gates the public config against project engines', async () => {
    let root = project({ engines: { node: '>=18' } })
    let cwd = vi.spyOn(process, 'cwd').mockReturnValue(root)
    try {
      let configs = await createConfig({ quiet: true })
      let runtime = configs.find(
        config => config.name === 'azat-io/runtime/rules',
      )
      expect(runtime?.rules).toHaveProperty('unicorn/prefer-set-methods', 'off')
      expect(runtime?.rules).not.toHaveProperty('unicorn/prefer-at')
      expect(runtime?.settings?.['azat-io/runtime']).toMatchObject({
        sources: expect.arrayContaining([
          `node: ${path.join(root, 'package.json')} engines.node ">=18"`,
        ]),
      })
    } finally {
      cwd.mockRestore()
    }
  })

  it('accepts explicit runtime targets and a file URL as root', async () => {
    let root = project({ engines: { node: '>=18' } })
    let configs = await createConfig({
      targets: { browsers: false, node: '24' },
      root: pathToFileURL(root),
      quiet: true,
    })
    let runtime = configs.find(
      config => config.name === 'azat-io/runtime/rules',
    )
    expect(runtime?.rules).not.toHaveProperty('unicorn/prefer-set-methods')
    expect(runtime?.settings).toHaveProperty('node.version', '>=24.0.0')
  })

  it.each([
    [{}, ['js', 'cjs', 'mjs']],
    [{ typescript: true }, ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts']],
    [
      { typescript: true, react: true },
      ['js', 'cjs', 'mjs', 'jsx', 'ts', 'cts', 'mts', 'tsx'],
    ],
  ] as const)(
    'limits tooling to enabled extensions for %j',
    async (flags, extensions) => {
      let configs = await createConfig({
        targets: { browsers: 'chrome 130', node: false },
        root: project({ engines: { node: '>=18' } }),
        toolingNode: '24',
        quiet: true,
        ...flags,
      })
      let tooling = configs.find(
        config => config.name === 'azat-io/runtime/tooling',
      )
      expect(tooling?.files).toContain(`**/*.config.{${extensions.join(',')}}`)
      expect(tooling?.settings).toHaveProperty('node.version', '>=24.0.0')
    },
  )

  it('keeps runtime rules off JSON files and lets custom extends win', async () => {
    let root = project({ engines: { node: '>=18' } })
    let configs = await createConfig({
      extends: { rules: { 'unicorn/prefer-set-methods': 'warn' } },
      targets: { browsers: false },
      quiet: true,
      root,
    })
    let eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: configs,
      cwd: root,
    })
    let javascript = (await eslint.calculateConfigForFile(
      path.join(root, 'index.js'),
    )) as Linter.Config
    let packageJson = (await eslint.calculateConfigForFile(
      path.join(root, 'package.json'),
    )) as Linter.Config
    expect(javascript.rules?.['unicorn/prefer-set-methods']).toStrictEqual([1])
    expect(packageJson.settings ?? {}).not.toHaveProperty('azat-io/runtime')
    expect(packageJson.rules).not.toHaveProperty('unicorn/prefer-at')
  })

  it('forwards browser policies to runtime target resolution', async () => {
    let configs = await createConfig({
      root: project({ engines: { node: '>=24' } }),
      missingBrowsers: 'off',
      quiet: true,
    })
    let runtime = configs.find(
      config => config.name === 'azat-io/runtime/rules',
    )
    expect(runtime?.rules).toHaveProperty('unicorn/prefer-at', 'off')
  })
})
