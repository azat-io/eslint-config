import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      fileName: format => `index.${format === 'es' ? 'mjs' : 'js'}`,
      entry: path.resolve(__dirname, 'index.ts'),
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: (id: string) =>
        !id.startsWith('.') &&
        !path.isAbsolute(id) &&
        id !== 'eslint-define-config',
    },
  },
  plugins: [
    dts({
      outDir: path.join(__dirname, 'dist'),
      root: path.join(__dirname, '..'),
      entryRoot: __dirname,
      include: [
        path.join(__dirname, '..', 'env.d.ts'),
        path.join(__dirname, 'index.ts'),
      ],
    }),
  ],
})
