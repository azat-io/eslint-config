import { afterEach, describe, expect, it, vi } from 'vitest'
import unicornPlugin from 'eslint-plugin-unicorn'
import typescriptEslint from 'typescript-eslint'
import svelteParser from 'svelte-eslint-parser'
import sveltePlugin from 'eslint-plugin-svelte'
import { tmpdir } from 'node:os'
import { Linter } from 'eslint'
import path from 'node:path'

import type { ConfigOptions } from '../../../index'

import { svelte } from '../../../core/svelte'

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
  return { ...disabled, svelte: true, ...flags }
}

describe('svelte', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty config when svelte is disabled', async () => {
    await expect(svelte({ ...enabled, svelte: false })).resolves.toStrictEqual(
      {},
    )
  })

  it('names the block and wires the plugin, parser and processor', async () => {
    let config = await svelte(options())

    expect(config.name).toBe('azat-io/svelte/rules')
    expect(config.plugins).toStrictEqual({ svelte: sveltePlugin })
    expect(config.languageOptions?.['parser']).toBe(svelteParser)
    expect(config.processor).toBe(sveltePlugin.processors['.svelte'])
  })

  it.each([
    { name: 'svelte alone', flags: {} },
    { name: 'every option', flags: enabled },
  ])('lints only svelte files for $name', async ({ flags }) => {
    let config = await svelte(options(flags))

    expect(config.files).toStrictEqual(['**/*.svelte'])
  })

  it.each([
    { name: 'svelte alone', flags: {} },
    {
      flags: { ...enabled, typescript: false },
      name: 'every option except typescript',
    },
  ])('parses scripts with the default parser for $name', async ({ flags }) => {
    let config = await svelte(options(flags))

    expect(config.languageOptions?.['parserOptions']).toStrictEqual({
      extraFileExtensions: ['.svelte'],
      ecmaVersion: 'latest',
      sourceType: 'module',
    })
  })

  it('parses scripts with the typescript project service from the working directory', async () => {
    let root = path.join(tmpdir(), 'svelte-project')
    vi.spyOn(process, 'cwd').mockReturnValue(root)

    let config = await svelte(options({ typescript: true }))

    expect(config.languageOptions?.['parserOptions']).toStrictEqual({
      extraFileExtensions: ['.svelte'],
      parser: typescriptEslint.parser,
      ecmaVersion: 'latest',
      tsconfigRootDir: root,
      sourceType: 'module',
      projectService: true,
    })
  })

  it('enables the same existing plugin rules for every option', async () => {
    let config = await svelte(options())
    let everyOption = await svelte(enabled)
    let rules = Object.keys(config.rules ?? {})

    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(rule =>
        rule.startsWith('unicorn/') ?
          !Object.hasOwn(
            unicornPlugin.rules ?? {},
            rule.replace(/^unicorn\//u, ''),
          )
        : !Object.hasOwn(sveltePlugin.rules, rule.replace(/^svelte\//u, '')),
      ),
    ).toStrictEqual([])
    expect(everyOption.rules).toStrictEqual(config.rules)
  })

  it.each([
    {
      rules: ['svelte/button-has-type', 'svelte/block-lang'],
      name: 'a component without a script',
      code: '<button>Add</button>\n',
    },
    {
      code: [
        '<script>',
        "  let html = '<b>bold</b>'",
        '</script>',
        '',
        '{@html html}',
        '',
      ].join('\n'),
      rules: ['svelte/no-at-html-tags'],
      name: 'a component with raw html',
    },
    {
      code: [
        '<script>',
        '  let count = 0',
        '</script>',
        '',
        '<button type="button">{count}</button>',
        '',
      ].join('\n'),
      name: 'a valid component',
      rules: [],
    },
  ])('reports svelte rules in $name', async ({ rules, code }) => {
    let config = await svelte(options())
    let linter = new Linter()

    expect(
      linter
        .verify(code, [config], 'Component.svelte')
        .map(message => message.ruleId),
    ).toStrictEqual(rules)
  })
})
