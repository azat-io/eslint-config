import type { Linter } from 'eslint'

import eslintConfig from '.'

export default eslintConfig({
  perfectionist: true,
  typescript: true,
  svelte: true,
  vitest: true,
  astro: true,
  react: true,
  qwik: true,
  node: true,
  vue: true,
}) satisfies Promise<Linter.Config[]>
