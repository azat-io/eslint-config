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
        '@azat-io/eslint-config-typescript',
        'eslint-plugin-react-hooks',
        'eslint-plugin-jsx-a11y',
        'eslint-plugin-react',
      ],
    },
  },
})
