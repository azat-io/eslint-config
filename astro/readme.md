# @azat-io/eslint-config-astro

<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/5698350/241426629-f7e3a5bf-50fe-49c1-ad76-98bd3914cd3e.svg" alt="ESLint" align="right" width="150" height="150" />

![Version](https://img.shields.io/npm/v/@azat-io/eslint-config-astro.svg?color=brightgreen)

Shareable ESLint config for Astro projects.

See [docs](https://github.com/azat-io/eslint-config/blob/main/astro/docs.md) for a list of all rules.

## Installation

1. Install package:

```sh
pnpm add --save-dev eslint @azat-io/eslint-config-astro @typescript-eslint/eslint-plugin @typescript-eslint/parser astro-eslint-parser eslint-plugin-astro eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-n eslint-plugin-perfectionist eslint-plugin-prefer-arrow eslint-plugin-prefer-let eslint-plugin-promise eslint-plugin-sonarjs eslint-plugin-unicorn eslint-plugin-vitest
```

2. Create ESLint configuration file `eslint.config.js`:

```js
import eslintConfig from '@azat-io/eslint-config-astro'

export default eslintConfig
```

3. Add script for package.json:

```js
{
  "scripts": {
    "lint": "eslint .",
  }
}
```
