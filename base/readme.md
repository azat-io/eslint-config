# @azat-io/eslint-config

<img src="https://user-images.githubusercontent.com/5698350/234571772-9e0cf164-d6bd-46fa-91d3-9c6f2a83932c.svg" alt="ESLint" align="right" width="120" height="120" />

![Version](https://img.shields.io/npm/v/@azat-io/eslint-config.svg?color=brightgreen)

Shareable ESLint config for JavaScript projects.

See [docs](./docs.md) for a list of all rules.

## Installation

1. Install package:

```sh
pnpm add --save-dev eslint @azat-io/eslint-config
```

2. Create ESLint configuration file `eslint.config.js`:

```js
module.exports = require('@azat-io/eslint-config')
```

3. Add script for package.json:

```js
{
  "scripts": {
    "lint": "eslint .",
  }
}
```
