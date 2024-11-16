# ESLint Config

<img
  src="https://raw.githubusercontent.com/azat-io/eslint-config/main/assets/logo.png"
  alt="ESLint Config Logo"
  align="right"
  height="160"
  width="160"
/>

[![Version](https://img.shields.io/npm/v/@azat-io/eslint-config.svg?color=4a32c3&labelColor=26272b)](https://npmjs.com/package/@azat-io/eslint-configt)
[![GitHub License](https://img.shields.io/badge/license-MIT-232428.svg?color=4a32c3&labelColor=26272b)](https://github.com/azat-io/eslint-config/blob/main/license.md)

A comprehensive and flexible ESLint configuration that supports a wide range of frameworks and environments. Easily integrate clean, consistent code standards across projects by enabling settings for specific tools and libraries.

This config covers multiple setups in a single, straightforward import, helping maintain consistency across different project types and frameworks.

## Usage

1. Install package:

```sh
pnpm add --save-dev eslint @azat-io/eslint-config
```

2. Create ESLint configuration file `eslint.config.js`:

```js
import eslintConfig from '@azat-io/eslint-config'

export default eslintConfig({
  perfectionist: true,
  typescript: true,
  react: true,
  node: true,
})
```

3. Add script for `package.json`:

```json
{
  "scripts": {
    "test:js": "eslint \"**/*.{js,ts,jsx,tsx,json}\""
  }
}
```

## Configuration

To configure the ESLint rules based on your project’s needs, import the config and pass an object with options for each framework or tool. By default, all options are disabled, so you can enable only what's relevant to your project.

```js
import eslintConfig from '@azat-io/eslint-config'

export default eslintConfig({
  perfectionist: true,
  typescript: true,
  svelte: true,
  vitest: true,
  astro: true,
  react: true,
  qwik: true,
  node: true,
  vue: true,
})
```

### perfectionist

Enables rules for sorting and organizing code structures for better readability and consistency.

### typescript

Adds TypeScript-specific linting rules to ensure type safety and maintain TypeScript best practices.

### svelte

Enables support for Svelte, including linting rules for Svelte components and files.

### vitest

Adds support for Vitest, adjusting linting for testing files and practices within Vitest projects.

### astro

Configures ESLint for Astro projects, with adjustments for Astro’s file structure and conventions.

### react

Includes React-specific linting rules for JSX syntax, React hooks, and best practices within React environments.

### qwik

Adds support for Qwik, adjusting linting for Qwik-specific syntax and conventions.

### node

Adjusts linting for Node.js environments, addressing Node-specific globals, imports, and common practices.

### vue

Adds Vue-specific linting rules, supporting Vue's syntax and best practices for Vue components.

### extends

You can add your own configs. Example:

```js
import eslintConfig from '@azat-io/eslint-config'

export default eslintConfig({
  extends: [
    {
      'no-undef': 'off',
    },
  ],
})
```

## Plugins

This config uses the following plugins:

- [@eslint/js](https://github.com/eslint/eslint)
- [@vitest/eslint-plugin](https://github.com/vitest-dev/eslint-plugin-vitest)
- [eslint-plugin-astro](https://github.com/ota-meshi/eslint-plugin-astro)
- [eslint-plugin-import-x](https://github.com/un-ts/eslint-plugin-import-x)
- [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n)
- [eslint-plugin-package-json](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json)
- [eslint-plugin-perfectionist](https://github.com/azat-io/eslint-plugin-perfectionist)
- [eslint-plugin-prefer-arrow](https://github.com/TristonJ/eslint-plugin-prefer-arrow)
- [eslint-plugin-prefer-let](https://github.com/thefrontside/javascript/tree/v3/packages/eslint-plugin-prefer-let)
- [eslint-plugin-promise](https://github.com/eslint-community/eslint-plugin-promise)
- [eslint-plugin-qwik](https://github.com/QwikDev/qwik/tree/main/packages/eslint-plugin-qwik)
- [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)
- [eslint-plugin-react-compiler](https://github.com/facebook/react/tree/main/compiler/packages/eslint-plugin-react-compiler)
- [eslint-plugin-react-hooks](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)
- [eslint-plugin-react-perf](https://github.com/cvazac/eslint-plugin-react-perf)
- [eslint-plugin-regexp](https://github.com/ota-meshi/eslint-plugin-regexp)
- [eslint-plugin-sonarjs](https://github.com/SonarSource/SonarJS/tree/master/packages/jsts/src/rules)
- [eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte)
- [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn)
- [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)

## License

MIT &copy; [Azat S.](https://azat.io)
