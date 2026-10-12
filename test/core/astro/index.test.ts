import { afterEach, describe, expect, it, vi } from 'vitest'
import * as astroParser from 'astro-eslint-parser'
import typescriptEslint from 'typescript-eslint'
import astroPlugin from 'eslint-plugin-astro'
import { tmpdir } from 'node:os'
import { Linter } from 'eslint'
import path from 'node:path'

import type { ConfigOptions } from '../../../index'

import { astro } from '../../../core/astro/index'

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
  return { ...disabled, astro: true, ...flags }
}

describe('astro', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty config when astro is disabled', async () => {
    await expect(astro({ ...enabled, astro: false })).resolves.toStrictEqual({})
  })

  it.each([
    { name: 'astro alone', flags: {} },
    { name: 'every option', flags: enabled },
  ])(
    'names the block and wires the plugin and parser for $name',
    async ({ flags }) => {
      let config = await astro(options(flags))

      expect(config.name).toBe('azat-io/astro/rules')
      expect(config.files).toStrictEqual(['**/*.astro'])
      expect(config.plugins).toStrictEqual({ astro: astroPlugin })
      expect(config.languageOptions?.['parser']).toBe(astroParser)
    },
  )

  it.each([
    { name: 'astro alone', flags: {} },
    {
      flags: { ...enabled, typescript: false },
      name: 'every option except typescript',
    },
  ])('parses scripts with the default parser for $name', async ({ flags }) => {
    let config = await astro(options(flags))

    expect(config.languageOptions?.['parserOptions']).toStrictEqual({
      extraFileExtensions: ['.astro'],
      ecmaVersion: 'latest',
      sourceType: 'module',
    })
  })

  it('parses scripts with the typescript project of the working directory', async () => {
    let root = path.join(tmpdir(), 'astro-project')
    vi.spyOn(process, 'cwd').mockReturnValue(root)

    let config = await astro(options({ typescript: true }))

    expect(config.languageOptions?.['parserOptions']).toStrictEqual({
      project: path.join(root, 'tsconfig.json'),
      parser: typescriptEslint.parser,
      extraFileExtensions: ['.astro'],
      ecmaVersion: 'latest',
      projectService: false,
      tsconfigRootDir: root,
      sourceType: 'module',
    })
  })

  it('enables the same existing plugin rules for every option', async () => {
    let config = await astro(options())
    let everyOption = await astro(enabled)
    let rules = Object.keys(config.rules ?? {})

    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(
        rule =>
          !Object.hasOwn(astroPlugin.rules, rule.replace(/^astro\//u, '')),
      ),
    ).toStrictEqual([])
    expect(everyOption.rules).toStrictEqual(config.rules)
  })

  it.each([
    {
      code: [
        '---',
        "let title = 'Cats'",
        '---',
        '',
        '<h1 set:text={title}></h1>',
        '<img src="cat.png">',
        '',
      ].join('\n'),
      rules: ['astro/no-set-text-directive', 'astro/jsx-a11y/alt-text'],
      name: 'a component with text directive and image without alt',
    },
    {
      name: 'attributes not sorted from longest to shortest',
      code: '<img alt="Cat" src="cat.png">\n',
      rules: ['astro/sort-attributes'],
    },
    {
      code: [
        '---',
        "let title = 'Cats'",
        '---',
        '',
        '<h1>{title}</h1>',
        '<img src="cat.png" alt="Cat">',
        '',
      ].join('\n'),
      name: 'a valid component',
      rules: [],
    },
  ])('reports astro rules in $name', async ({ rules, code }) => {
    let config = await astro(options())
    let linter = new Linter()

    expect(
      linter
        .verify(code, [config], 'Component.astro')
        .map(message => message.ruleId),
    ).toStrictEqual(rules)
  })
})
