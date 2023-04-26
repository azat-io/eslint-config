import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.js'),
      fileName: () => 'index.js',
      formats: ['cjs'],
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
})
