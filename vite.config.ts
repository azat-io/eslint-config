import type { Plugin } from 'vite'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'node:path'

let removeCommentsPlugin = (): Plugin => ({
  generateBundle: (_options, bundle): void => {
    let chunks = Object.values(bundle).filter(chunk => chunk.type === 'chunk')
    for (let chunk of chunks) {
      chunk.code = chunk.code
        .replaceAll(/^[\t ]*\/\*[\s\S]*?\*\/\s*$|^[\t ]*\/\/.*$/gmu, '')
        .replaceAll(/^[\t ]*[\n\r]/gmu, '')
    }
  },
  name: 'remove-comments',
})

export default defineConfig({
  build: {
    lib: {
      fileName: (format, entryName) =>
        `${entryName}${format === 'cjs' ? '.cjs' : '.mjs'}`,
      entry: path.resolve(import.meta.dirname, 'index.ts'),
      name: '@azat-io/eslint-config',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        exports: 'auto',
      },
      external: (id: string) => !id.startsWith('.') && !path.isAbsolute(id),
    },
    minify: false,
  },
  plugins: [
    dts({
      include: [
        path.join(import.meta.dirname, 'environment.d.ts'),
        path.join(import.meta.dirname, 'index.ts'),
      ],
    }),
    removeCommentsPlugin(),
  ],
})
