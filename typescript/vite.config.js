import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.join(__dirname, 'index.js'),
      fileName: () => 'index.js',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        '@azat-io/eslint-config',
      ],
    },
  },
})
