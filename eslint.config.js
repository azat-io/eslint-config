import config from '@azat-io/eslint-config-typescript'

export default [
  ...config,
  {
    rules: {
      'perfectionist/sort-objects': 'off'
    }
  },
]
