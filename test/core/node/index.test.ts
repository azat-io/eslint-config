import { describe, expect, it } from 'vitest'
import nodePlugin from 'eslint-plugin-n'
import { Linter } from 'eslint'

import type { ConfigOptions } from '../../../index'

import { node } from '../../../core/node'

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
  return { ...disabled, node: true, ...flags }
}

let javascript = ['**/*.js', '**/*.cjs', '**/*.mjs']
let typescript = ['**/*.ts', '**/*.cts', '**/*.mts']

describe('node', () => {
  it('returns an empty config when node is disabled', async () => {
    await expect(node({ ...enabled, node: false })).resolves.toStrictEqual({})
  })

  it('names the block and registers eslint-plugin-n as node', async () => {
    let config = await node(options())

    expect(config.name).toBe('azat-io/node/rules')
    expect(config.plugins).toStrictEqual({ node: nodePlugin })
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
      flags: { perfectionist: true, vitest: true },
      name: 'perfectionist and vitest',
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
    let config = await node(options(flags))

    expect(config.files).toStrictEqual(files)
  })

  it('enables the same valid plugin rules for every option', async () => {
    let config = await node(options())
    let rules = Object.keys(config.rules ?? {})

    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(
        rule =>
          !Object.hasOwn(nodePlugin.rules ?? {}, rule.replace(/^node\//u, '')),
      ),
    ).toStrictEqual([])
    expect((await node(enabled)).rules).toStrictEqual(config.rules)
  })

  it('reports node rules in matching files', async () => {
    let config = await node(options())
    let linter = new Linter()

    expect(
      linter.verify("import fs from 'node:fs'\n", [config], 'index.mjs'),
    ).toStrictEqual([])
    expect(
      linter
        .verify("import fs from 'fs'\n", [config], 'index.mjs')
        .map(message => message.ruleId),
    ).toStrictEqual(['node/prefer-node-protocol'])
  })
})
