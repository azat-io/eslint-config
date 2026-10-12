import { afterEach, describe, expect, it, vi } from 'vitest'
import typescriptEslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import vuePlugin from 'eslint-plugin-vue'
import { tmpdir } from 'node:os'
import { Linter } from 'eslint'
import path from 'node:path'

import type { ConfigOptions } from '../../../index'

import { vue } from '../../../core/vue'

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
  return { ...disabled, vue: true, ...flags }
}

describe('vue', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty config when vue is disabled', async () => {
    await expect(vue({ ...enabled, vue: false })).resolves.toStrictEqual({})
  })

  it('names the block and wires the plugin, parser and processor', async () => {
    let config = await vue(options())

    expect(config.name).toBe('azat-io/vue/rules')
    expect(config.plugins).toStrictEqual({ vue: vuePlugin })
    expect(config.languageOptions?.['parser']).toBe(vueParser)
    expect(config.processor).toBe(vuePlugin.processors['.vue'])
  })

  it.each([
    { name: 'vue alone', flags: {} },
    { name: 'every option', flags: enabled },
  ])('lints only vue files for $name', async ({ flags }) => {
    let config = await vue(options(flags))

    expect(config.files).toStrictEqual(['**/*.vue'])
  })

  it.each([
    { name: 'vue alone', flags: {} },
    {
      flags: { ...enabled, typescript: false },
      name: 'every option except typescript',
    },
  ])('parses scripts with the default parser for $name', async ({ flags }) => {
    let config = await vue(options(flags))

    expect(config.languageOptions?.['parserOptions']).toStrictEqual({
      extraFileExtensions: ['.vue'],
      ecmaVersion: 'latest',
      sourceType: 'module',
    })
  })

  it('parses scripts with the typescript project service from the working directory', async () => {
    let root = path.join(tmpdir(), 'vue-project')
    vi.spyOn(process, 'cwd').mockReturnValue(root)

    let config = await vue(options({ typescript: true }))

    expect(config.languageOptions?.['parserOptions']).toStrictEqual({
      parser: typescriptEslint.parser,
      extraFileExtensions: ['.vue'],
      ecmaVersion: 'latest',
      tsconfigRootDir: root,
      sourceType: 'module',
      projectService: true,
    })
  })

  it('enables the same existing plugin rules for every option', async () => {
    let config = await vue(options())
    let everyOption = await vue(enabled)
    let rules = Object.keys(config.rules ?? {})

    expect(rules.length).toBeGreaterThan(0)
    expect(
      rules.filter(
        rule => !Object.hasOwn(vuePlugin.rules, rule.replace(/^vue\//u, '')),
      ),
    ).toStrictEqual([])
    expect(everyOption.rules).toStrictEqual(config.rules)
  })

  it.each([
    {
      code: ['<template>', '  <button>Add</button>', '</template>', ''].join(
        '\n',
      ),
      rules: ['vue/html-button-has-type'],
      name: 'a button without a type',
    },
    {
      code: ['<template>', '  <div v-html="html" />', '</template>', ''].join(
        '\n',
      ),
      name: 'a template with raw html',
      rules: ['vue/no-v-html'],
    },
    {
      code: [
        '<template>',
        '  <p>Text</p>',
        '</template>',
        '',
        '<script setup>',
        "const text = 'Text'",
        '</script>',
        '',
      ].join('\n'),
      name: 'a script below the template',
      rules: ['vue/block-order'],
    },
    {
      code: [
        '<script setup>',
        "import { ref } from 'vue'",
        '',
        'let count = ref(0)',
        '</script>',
        '',
        '<template>',
        '  <button type="button" @click="count++">{{ count }}</button>',
        '</template>',
        '',
      ].join('\n'),
      name: 'a valid component',
      rules: [],
    },
  ])('reports vue rules in $name', async ({ rules, code }) => {
    let config = await vue(options())
    let linter = new Linter()

    expect(
      linter
        .verify(code, [config], 'Component.vue')
        .map(message => message.ruleId),
    ).toStrictEqual(rules)
  })
})
