import type { Config } from 'prettier'

export default {
  quoteProps: 'as-needed',
  arrowParens: 'avoid',
  bracketSpacing: true,
  trailingComma: 'all',
  singleQuote: true,
  endOfLine: 'lf',
  printWidth: 80,
  useTabs: false,
  semi: false,
  tabWidth: 2,
} satisfies Config
