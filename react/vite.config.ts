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
      external: [
        '@azat-io/eslint-config-typescript',
        'eslint-plugin-testing-library',
        'eslint-plugin-react-hooks',
        'eslint-plugin-jsx-a11y',
        'eslint-plugin-react',
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
