import packageJsonPlugin from 'eslint-plugin-package-json'
import * as jsoncParser from 'jsonc-eslint-parser'
import dependPlugin from 'eslint-plugin-depend'
import { describe, expect, it } from 'vitest'
import { Linter } from 'eslint'

import type { ConfigOptions } from '../../../index'

import { packageJson } from '../../../core/package-json'

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

/**
 * Built from entries because `package-json/order-properties` checks the key
 * order of the manifest.
 */
let validPackage: Record<string, unknown> = Object.fromEntries([
  ['name', 'demo'],
  ['version', '1.0.0'],
  ['description', 'Demo package'],
  ['keywords', ['demo']],
  ['homepage', 'https://example.com'],
  ['repository', 'github:demo/demo'],
  ['license', 'MIT'],
  ['author', 'Demo <demo@example.com>'],
  ['type', 'module'],
  ['exports', { '.': './index.js' }],
  ['scripts', { test: 'vitest' }],
  ['dependencies', { semver: '^7.0.0' }],
  ['engines', { node: '>=18.0.0' }],
])

let packageWithoutDescription = Object.fromEntries(
  Object.entries(validPackage).filter(([key]) => key !== 'description'),
)

describe('package-json', () => {
  it.each([
    { name: 'every option', flags: enabled },
    { flags: { typescript: true, node: true }, name: 'some options' },
  ])('ignores the options for $name', ({ flags }) => {
    expect(packageJson({ ...disabled, ...flags })).toStrictEqual(
      packageJson(disabled),
    )
  })

  it('names the block and lints package.json files with the json parser', () => {
    let config = packageJson(disabled)

    expect(config.name).toBe('azat-io/package-json/rules')
    expect(config.files).toStrictEqual(['**/package.json'])
    expect(config.languageOptions).toStrictEqual({ parser: jsoncParser })
    expect(config.plugins).toStrictEqual({
      'package-json': packageJsonPlugin,
      depend: dependPlugin,
    })
  })

  it('enables only rules that exist in its plugins', () => {
    let config = packageJson(disabled)
    let plugins = config.plugins ?? {}
    let rules = Object.keys(config.rules ?? {})

    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(rule => {
        let [plugin = '', name = ''] = rule.split('/', 2)
        return !Object.hasOwn(plugins[plugin]?.rules ?? {}, name)
      }),
    ).toStrictEqual([])
  })

  it.each([
    { name: 'a valid manifest', manifest: validPackage, rules: [] },
    {
      manifest: { ...validPackage, dependencies: { moment: '^2.0.0' } },
      rules: ['depend/ban-dependencies'],
      name: 'a banned dependency',
    },
    {
      manifest: {
        ...validPackage,
        repository: { url: 'https://github.com/demo/demo', type: 'git' },
      },
      rules: ['package-json/repository-shorthand'],
      name: 'a repository object',
    },
    {
      manifest: { ...validPackage, exports: './index.js' },
      rules: ['package-json/exports-subpaths-style'],
      name: 'a root export without a subpath',
    },
    {
      manifest: { ...validPackage, scripts: { buildDocs: 'vitest' } },
      rules: ['package-json/scripts-name-casing'],
      name: 'a camel case script name',
    },
    {
      manifest: {
        ...validPackage,
        dependencies: { semver: '^7.0.0', ansi: '^1.0.0' },
      },
      rules: ['package-json/sort-collections'],
      name: 'unsorted dependencies',
    },
    {
      rules: ['package-json/require-description'],
      name: 'a manifest without a description',
      manifest: packageWithoutDescription,
    },
  ])('lints $name', ({ manifest, rules }) => {
    let linter = new Linter()

    expect(
      linter
        .verify(
          JSON.stringify(manifest, null, 2),
          [packageJson(disabled)],
          'package.json',
        )
        .map(message => message.ruleId),
    ).toStrictEqual(rules)
  })
})
