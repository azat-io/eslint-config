import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      fileName: format => `index.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [
        '@azat-io/eslint-config-typescript',
        '@typescript-eslint/parser',
        'vue-eslint-parser',
        'eslint-plugin-vue',
      ],
    },
  },
  plugins: [
    dts({
      outputDir: path.join(__dirname, 'dist'),
      root: path.join(__dirname, '..'),
      entryRoot: __dirname,
      include: [
        path.join(__dirname, '..', 'env.d.ts'),
        path.join(__dirname, 'index.ts'),
      ],
    }),
  ],
})
