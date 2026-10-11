import type { ESLint, Linter } from 'eslint'

import gitignore from 'eslint-config-flat-gitignore'
import { defineConfig } from 'eslint/config'

import { perfectionist } from './core/perfectionist'
import { packageJson } from './core/package-json'
import { typescript } from './core/typescript'
import { svelte } from './core/svelte'
import { vitest } from './core/vitest'
import { react } from './core/react'
import { astro } from './core/astro'
import { qwik } from './core/qwik'
import { a11y } from './core/a11y'
import { core } from './core/base'
import { node } from './core/node'
import { vue } from './core/vue'

const CONFIG_OPTIONS = [
  'perfectionist',
  'typescript',
  'svelte',
  'vitest',
  'astro',
  'react',
  'qwik',
  'node',
  'vue',
] as const

export type ConfigOptions = Required<ConfigOptionFlags>

type RawConfigOptions = {
  extends?: Linter.Config[] | Linter.Config
} & Partial<ConfigOptionFlags>

type ConfigOptionFlags = Record<ConfigOptionKeys, boolean>

type ConfigOptionKeys = (typeof CONFIG_OPTIONS)[number]

export default async ({
  extends: customExtends = {},
  ...rawConfig
}: RawConfigOptions = {}): Promise<Linter.Config[]> => {
  let config: Required<ConfigOptionFlags> = {} as Required<ConfigOptionFlags>
  for (let configName of CONFIG_OPTIONS) {
    config[configName] = rawConfig[configName] ?? false
  }

  let configFunctions = [
    core,
    a11y,
    react,
    node,
    typescript,
    vitest,
    astro,
    svelte,
    qwik,
    vue,
    packageJson,
    perfectionist,
  ]

  let configs = await Promise.all(
    configFunctions.map(createConfigFunction =>
      Promise.resolve(createConfigFunction(config)),
    ),
  )

  let plugins = configs.reduce<Record<string, ESLint.Plugin>>(
    (accumulator, current) =>
      current.plugins ?
        {
          ...accumulator,
          ...current.plugins,
        }
      : accumulator,
    {},
  )

  function prepareExtends(
    extendsConfig: RawConfigOptions['extends'],
  ): Linter.Config[] {
    if (!extendsConfig) {
      return []
    }

    function prepareExtendedConfig(
      currentConfig: Linter.Config,
    ): Linter.Config {
      return {
        name: 'azat-io/custom-extends',
        ...currentConfig,
        plugins: {
          ...plugins,
          ...currentConfig.plugins,
        },
      }
    }

    return Array.isArray(extendsConfig) ?
        extendsConfig.map(prepareExtendedConfig)
      : [prepareExtendedConfig(extendsConfig)]
  }

  return defineConfig([
    gitignore({
      name: 'azat-io/gitignore',
      strict: false,
    }),
    {
      ignores: [
        /**
         * Ignores files for benchmarks by ESLint Rule Benchmark:
         * https://github.com/azat-io/eslint-rule-benchmark.
         */
        'benchmark/**/*',
      ],
      name: 'azat-io/benchmark/ignores',
    },
    ...configs,
    ...prepareExtends(customExtends),
  ])
}
