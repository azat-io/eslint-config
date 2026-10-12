import perfectionistPlugin from 'eslint-plugin-perfectionist'
import { describe, expect, it } from 'vitest'
import { Linter } from 'eslint'

import type { ConfigOptions } from '../../../index'

import { perfectionist } from '../../../core/perfectionist'

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
  return { ...disabled, perfectionist: true, ...flags }
}

let javascript = ['**/*.js', '**/*.cjs', '**/*.mjs']
let typescript = ['**/*.ts', '**/*.cts', '**/*.mts']

describe('perfectionist', () => {
  it('returns an empty config when perfectionist is disabled', async () => {
    await expect(
      perfectionist({ ...enabled, perfectionist: false }),
    ).resolves.toStrictEqual({})
  })

  it('names the block and registers the plugin', async () => {
    let config = await perfectionist(options())

    expect(config.name).toBe('azat-io/perfectionist/rules')
    expect(config.plugins).toStrictEqual({ perfectionist: perfectionistPlugin })
  })

  it.each([
    { name: 'only javascript', files: javascript, flags: {} },
    {
      files: [...javascript, ...typescript],
      flags: { typescript: true },
      name: 'typescript',
    },
    {
      files: [...javascript, '**/*.jsx'],
      flags: { react: true },
      name: 'react',
    },
    {
      files: [...javascript, '**/*.jsx'],
      flags: { qwik: true },
      name: 'qwik',
    },
    {
      files: [...javascript, ...typescript, '**/*.jsx', '**/*.tsx'],
      flags: { typescript: true, react: true },
      name: 'react with typescript',
    },
    {
      files: [...javascript, ...typescript, '**/*.jsx', '**/*.tsx'],
      flags: { typescript: true, qwik: true },
      name: 'qwik with typescript',
    },
    {
      files: [...javascript, '**/*.astro'],
      flags: { astro: true },
      name: 'astro',
    },
    {
      files: [...javascript, '**/*.svelte'],
      flags: { svelte: true },
      name: 'svelte',
    },
    {
      files: [...javascript, '**/*.vue'],
      flags: { vue: true },
      name: 'vue',
    },
    {
      flags: { vitest: true, node: true },
      name: 'node and vitest',
      files: javascript,
    },
    {
      files: [
        ...javascript,
        ...typescript,
        '**/*.jsx',
        '**/*.tsx',
        '**/*.astro',
        '**/*.svelte',
        '**/*.vue',
      ],
      name: 'every option',
      flags: enabled,
    },
  ])('lints the files of $name', async ({ files, flags }) => {
    let config = await perfectionist(options(flags))

    expect(config.files).toStrictEqual(files)
  })

  it('enables the same valid plugin rules for every option', async () => {
    let config = await perfectionist(options())
    let everyOption = await perfectionist(enabled)
    let rules = Object.keys(config.rules ?? {})

    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(
        rule =>
          !Object.hasOwn(
            perfectionistPlugin.rules ?? {},
            rule.replace(/^perfectionist\//u, ''),
          ),
      ),
    ).toStrictEqual([])
    expect(everyOption.rules).toStrictEqual(config.rules)
    expect(everyOption.settings).toStrictEqual(config.settings)
  })

  it('sorts by line length in descending order', async () => {
    let config = await perfectionist(options())
    let linter = new Linter()

    expect(config.settings).toStrictEqual({
      perfectionist: { type: 'line-length', order: 'desc' },
    })
    expect(
      linter
        .verify('let value = { a: 1, bbb: 2 }\n', [config], 'index.js')
        .map(message => message.ruleId),
    ).toStrictEqual(['perfectionist/sort-objects'])
    expect(
      linter.verify('let value = { bbb: 2, a: 1 }\n', [config], 'index.js'),
    ).toStrictEqual([])
  })
})
