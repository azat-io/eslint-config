import type { Linter } from 'eslint'

import { perfectionist } from './perfectionist'
import { packageJson } from './package-json'
import { typescript } from './typescript'
import { svelte } from './svelte'
import { vitest } from './vitest'
import { react } from './react'
import { astro } from './astro'
import { qwik } from './qwik'
import { a11y } from './a11y'
import { core } from './core'
import { node } from './node'
import { vue } from './vue'

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
  extends: customExtends = {} as Linter.Config,
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
    configFunctions.map(createConfigFunction => createConfigFunction(config)),
  )

  return [
    {
      ignores: [
        '**/.eslint-config-inspector/**',
        '**/vite.config.*.timestamp-*',
        '**/.vitepress/cache/**',
        '**/node_modules/**',
        '**/.svelte-kit/**',
        '**/coverage/**',
        '**/.history/**',
        '**/.netlify/**',
        '**/.vercel/**',
        '**/.output/**',
        '**/.astro/**',
        '**/output/**',
        '**/.cache/**',
        '**/.temp/**',
        '**/build/**',
        '**/.nuxt/**',
        '**/.next/**',
        '**/dist/**',
        '**/temp/**',
        '**/.tmp/**',
        '**/tmp/**',
      ],
      name: 'azat-io/core/ignores',
    },
    ...configs,
    ...(Array.isArray(customExtends)
      ? customExtends
      : [
          {
            name: 'azat-io/custom-extends',
            ...customExtends,
          },
        ]),
  ]
}
