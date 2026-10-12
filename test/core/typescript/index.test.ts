import type { ESLint, Linter } from 'eslint'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { builtinRules } from 'eslint/use-at-your-own-risk'
import promisePlugin from 'eslint-plugin-promise'
import unicornPlugin from 'eslint-plugin-unicorn'
import typescriptEslint from 'typescript-eslint'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import { tmpdir } from 'node:os'
import path from 'node:path'

import type { ConfigOptions } from '../../../index'

import { typescript } from '../../../core/typescript/index'

function findUnknownRules(config: Linter.Config): string[] {
  let plugins: Record<string, ESLint.Plugin> = {
    promise: promisePlugin,
    unicorn: unicornPlugin,
    jsdoc: jsdocPlugin,
    ...config.plugins,
  }
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

let frameworks = {
  svelte: true,
  astro: true,
  react: true,
  qwik: true,
  vue: true,
}

let typescriptFiles = ['**/*.ts', '**/*.cts', '**/*.mts']

describe('typescript', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    {},
    { ...frameworks, perfectionist: true, vitest: true, node: true },
  ])('returns an empty config when typescript is off %o', async enabled => {
    await expect(typescript(options(enabled))).resolves.toStrictEqual({})
  })

  it('names the config and uses typescript-eslint', async () => {
    let config = await typescript(options({ typescript: true }))

    expect(config.name).toBe('azat-io/typescript/rules')
    expect(config.languageOptions?.['parser']).toBe(typescriptEslint.parser)
    expect(config.plugins).toStrictEqual({
      typescript: typescriptEslint.plugin,
    })
    expect(config.settings).toStrictEqual({ jsdoc: { mode: 'typescript' } })
  })

  it('resolves the project service from the working directory', async () => {
    let root = path.join(tmpdir(), 'typescript-project')
    vi.spyOn(process, 'cwd').mockReturnValue(root)

    let config = await typescript(options({ typescript: true }))

    expect(config.languageOptions?.['parserOptions']).toStrictEqual({
      ecmaFeatures: { jsx: false },
      ecmaVersion: 'latest',
      tsconfigRootDir: root,
      projectService: true,
      sourceType: 'module',
    })
  })

  it.each([
    [{}, typescriptFiles],
    [{ perfectionist: true, vitest: true, node: true }, typescriptFiles],
    [{ react: true }, [...typescriptFiles, '**/*.tsx']],
    [{ qwik: true }, [...typescriptFiles, '**/*.tsx']],
    [{ react: true, qwik: true }, [...typescriptFiles, '**/*.tsx']],
    [{ astro: true }, [...typescriptFiles, '**/*.astro']],
    [{ svelte: true }, [...typescriptFiles, '**/*.svelte']],
    [{ vue: true }, [...typescriptFiles, '**/*.vue']],
    [
      frameworks,
      [...typescriptFiles, '**/*.tsx', '**/*.astro', '**/*.svelte', '**/*.vue'],
    ],
  ])('lints the files of the enabled configs %o', async (enabled, files) => {
    let config = await typescript(options({ ...enabled, typescript: true }))

    expect(config.files).toStrictEqual(files)
  })

  it.each([
    [{}, false],
    [{ svelte: true, astro: true, vue: true }, false],
    [{ react: true }, true],
    [{ qwik: true }, true],
  ])('parses jsx for the configs %o: %s', async (enabled, jsx) => {
    let config = await typescript(options({ ...enabled, typescript: true }))

    expect(config.languageOptions?.['parserOptions']).toMatchObject({
      ecmaFeatures: { jsx },
    })
  })

  it.each([
    [{}, [], 'error'],
    [{ svelte: true, react: true, qwik: true, vue: true }, [], 'error'],
    [{ astro: true }, ['getStaticPaths'], 'off'],
  ])(
    'adapts rules to astro for the configs %o',
    async (enabled, allowedNames, severity) => {
      let { rules } = await typescript(
        options({ ...enabled, typescript: true }),
      )

      expect(rules?.['typescript/explicit-function-return-type']).toStrictEqual(
        [
          'error',
          {
            allowHigherOrderFunctions: true,
            allowExpressions: true,
            allowIIFEs: true,
            allowedNames,
          },
        ],
      )
      expect(rules?.['typescript/no-unsafe-assignment']).toBe(severity)
      expect(rules?.['typescript/triple-slash-reference']).toBe(severity)
    },
  )

  it('turns off the core rules that the type checker covers', async () => {
    let { rules } = await typescript(options({ typescript: true }))

    expect(rules).toMatchObject({
      'no-dupe-class-members': 'off',
      'consistent-return': 'off',
      'no-undef': 'off',
    })
  })

  it('only enables rules that ESLint or the plugins define', async () => {
    let config = await typescript(options({ ...frameworks, typescript: true }))

    expect(findUnknownRules(config)).toStrictEqual([])
  })
})
