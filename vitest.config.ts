import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default defineConfig(
  mergeConfig(viteConfig, {
    test: {
      coverage: {
        include: ['core/**', 'runtime/**', 'utils/**', 'index.ts'],
        exclude: ['runtime/support.json'],
        provider: 'v8',
      },
    },
  }),
)
