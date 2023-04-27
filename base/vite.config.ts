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
        'eslint-plugin-prefer-arrow',
        'eslint-plugin-prefer-let',
        'eslint-plugin-promise',
        'eslint-plugin-unicorn',
        'eslint-plugin-import',
        'eslint-plugin-vitest',
        '@babel/eslint-parser',
        'eslint-plugin-n',
        'globals',
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
