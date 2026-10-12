import vitestPlugin from '@vitest/eslint-plugin'
import { describe, expect, it } from 'vitest'
import { Linter } from 'eslint'

import type { ConfigOptions } from '../../../index'

import { vitest as vitestConfig } from '../../../core/vitest'

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
  return { ...disabled, vitest: true, ...flags }
}

let javascript = [
  '**/test/*.js',
  '**/test/*.cjs',
  '**/test/*.mjs',
  '**/*.test.js',
  '**/*.test.cjs',
  '**/*.test.mjs',
]
let typescript = [
  '**/test/*.ts',
  '**/test/*.cts',
  '**/test/*.mts',
  '**/*.test.ts',
  '**/*.test.cts',
  '**/*.test.mts',
]
let jsx = ['**/test/*.jsx', '**/*.test.jsx']
let tsx = ['**/test/*.tsx', '**/*.test.tsx']

let source = [
  "import { describe, it } from 'vitest'",
  '',
  "describe('math', () => {",
  "  it('Adds', () => {})",
  '})',
  '',
].join('\n')

describe('vitest', () => {
  it('returns an empty config when vitest is disabled', async () => {
    await expect(
      vitestConfig({ ...enabled, vitest: false }),
    ).resolves.toStrictEqual({})
  })

  it('names the block, registers the plugin and enables typecheck', async () => {
    let config = await vitestConfig(options())

    expect(config.name).toBe('azat-io/vitest/rules')
    expect(config.plugins).toStrictEqual({ vitest: vitestPlugin })
    expect(config.settings).toStrictEqual({ vitest: { typecheck: true } })
  })

  it.each([
    { name: 'only javascript', files: javascript, flags: {} },
    {
      files: [...javascript, ...typescript],
      flags: { typescript: true },
      name: 'typescript',
    },
    {
      files: [...javascript, ...jsx],
      flags: { react: true },
      name: 'react',
    },
    {
      files: [...javascript, ...jsx],
      flags: { qwik: true },
      name: 'qwik',
    },
    {
      files: [...javascript, ...typescript, ...jsx, ...tsx],
      flags: { typescript: true, react: true },
      name: 'react with typescript',
    },
    {
      files: [...javascript, ...typescript, ...jsx, ...tsx],
      flags: { typescript: true, qwik: true },
      name: 'qwik with typescript',
    },
    {
      flags: {
        perfectionist: true,
        svelte: true,
        astro: true,
        node: true,
        vue: true,
      },
      name: 'options without their own test files',
      files: javascript,
    },
    {
      files: [...javascript, ...typescript, ...jsx, ...tsx],
      name: 'every option',
      flags: enabled,
    },
  ])('lints the test files of $name', async ({ files, flags }) => {
    let config = await vitestConfig(options(flags))

    expect(config.files).toStrictEqual(files)
  })

  it('enables the same valid plugin rules for every option', async () => {
    let config = await vitestConfig(options())
    let everyOption = await vitestConfig(enabled)
    let rules = Object.keys(config.rules ?? {})

    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(
        rule =>
          !Object.hasOwn(
            vitestPlugin.rules ?? {},
            rule.replace(/^vitest\//u, ''),
          ),
      ),
    ).toStrictEqual([])
    expect(everyOption.rules).toStrictEqual(config.rules)
    expect(everyOption.settings).toStrictEqual(config.settings)
  })

  it.each(['math.test.js', 'src/test/math.mjs'])(
    'reports vitest rules in %s',
    async filename => {
      let config = await vitestConfig(options())
      let linter = new Linter()

      expect(
        linter
          .verify(source, [config], filename)
          .map(message => message.ruleId),
      ).toStrictEqual(['vitest/prefer-lowercase-title'])
    },
  )
})
