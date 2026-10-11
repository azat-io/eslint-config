import type { Linter } from 'eslint'

import eslintConfig from '.'

let config = await eslintConfig({
  perfectionist: true,
  typescript: true,
  svelte: true,
  vitest: true,
  astro: true,
  react: true,
  qwik: true,
  node: true,
  vue: true,
})

export default [
  {
    /**
     * The prototype has its own dependencies, which the root package does not
     * install.
     */
    ignores: ['runtime/**', 'scripts/**', 'test/**'],
    name: 'runtime/ignores',
  },
  ...config,
] satisfies Linter.Config[]
