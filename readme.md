# ESLint Config

<img
  src="https://raw.githubusercontent.com/azat-io/eslint-config/main/assets/logo.svg"
  alt="ESLint Config Logo"
  align="right"
  height="160"
/>

[![Version](https://img.shields.io/npm/v/@azat-io/eslint-config.svg?color=4a32c3&labelColor=26272b)](https://npmjs.com/package/@azat-io/eslint-config)
[![GitHub License](https://img.shields.io/badge/license-MIT-232428.svg?color=4a32c3&labelColor=26272b)](https://github.com/azat-io/eslint-config/blob/main/license.md)

A comprehensive and flexible ESLint configuration that supports a wide range of
frameworks and environments. Easily integrate clean, consistent code standards
across projects by enabling settings for specific tools and libraries.

This config covers multiple setups in a single, straightforward import, helping
maintain consistency across different project types and frameworks.

## Usage

Running ESLint requires Node.js `^22.22.3 || ^24.16.0 || >=26.3.0`, matching the
requirements of the included plugins. The code you lint can target older
runtimes.

1. Install package:

```sh
pnpm add --save-dev eslint @azat-io/eslint-config
```

2. Create ESLint configuration file `eslint.config.js`:

```js
import eslintConfig from '@azat-io/eslint-config'

export default eslintConfig({
  root: import.meta.dirname,
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

To configure the ESLint rules based on your project’s needs, import the config
and pass an object with options for each framework or tool. Framework and tool
flags are disabled by default. Runtime compatibility checks are enabled
automatically.

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

Enables rules for sorting and organizing code structures for better readability
and consistency.

### typescript

Adds TypeScript-specific linting rules to ensure type safety and maintain
TypeScript best practices.

### svelte

Enables support for Svelte, including linting rules for Svelte components and
files.

### vitest

Adds support for Vitest, adjusting linting for testing files and practices
within Vitest projects.

### astro

Configures ESLint for Astro projects, with adjustments for Astro’s file
structure and conventions.

### react

Includes React-specific linting rules for JSX syntax, React hooks, and best
practices within React environments.

### qwik

Adds support for Qwik, adjusting linting for Qwik-specific syntax and
conventions.

### node

Adjusts linting for Node.js environments, addressing Node-specific globals,
imports, and common practices.

### vue

Adds Vue-specific linting rules, supporting Vue's syntax and best practices for
Vue components.

### Runtime targets

The config reads the nearest `package.json` and Browserslist configuration to
disable rules that would introduce unsupported APIs. Runtime overrides apply to
source files supported by the enabled configs, leaving JSON files unaffected.

```js
import eslintConfig from '@azat-io/eslint-config'

export default eslintConfig({
  root: import.meta.dirname,
  targets: {
    browsers: 'baseline widely available',
    node: '>=22',
  },
  toolingNode: '>=24',
  typescript: true,
})
```

`root` is the directory or file URL used for runtime target discovery. It
defaults to `process.cwd()`; set it explicitly in monorepos or when running
ESLint from another directory.

`targets` defaults to `'auto'`. Its `node` and `browsers` keys override
automatic discovery independently; omitted keys are still detected, and `false`
excludes that runtime. Node.js targets come from `engines.node`, then
Browserslist Node.js queries, then the Node.js 22 fallback. A bare explicit
version such as `'22.12'` means that version or newer. The `node: true` flag
enables Node.js lint rules and is separate from `targets.node`.

`toolingNode` sets a different Node.js target for config files and files in
`scripts/`, `bin/` and `tools/`. Only extensions already enabled in the config
are included. Otherwise tooling uses the detected project Node.js target,
including in browser-only projects.

Additional runtime options:

| Option            | Default              | Purpose                                                    |
| ----------------- | -------------------- | ---------------------------------------------------------- |
| `browserslistEnv` | `'production'`       | Select the Browserslist environment.                       |
| `pinnedDate`      | Support data date    | Pin relative Baseline queries, including shared configs.   |
| `fallback`        | `{ node: '22.0.0' }` | Choose a fallback Node.js target, or disable with `false`. |
| `missingBrowsers` | `'ignore'`           | Ignore missing browser targets, use `'off'`, or queries.   |
| `unknownBrowsers` | `'off'`              | Disable dependent rules or `'ignore'` unknown browsers.    |
| `ignoreBrowsers`  | `['op_mini']`        | Replace the list of ignored Browserslist agents.           |
| `quiet`           | `false`              | Keep warnings in config settings without printing them.    |

Resolved target sources, warnings and disabled rules are available under
`settings['azat-io/runtime']` in ESLint's `--print-config` output. Custom
`extends` configs run after the runtime overrides, so explicit rule choices take
priority.

### extends

You can add your own configs. Example:

```js
import eslintConfig from '@azat-io/eslint-config'

export default eslintConfig({
  extends: [
    {
      rules: {
        'no-undef': 'off',
      },
    },
  ],
})
```

## Plugins

This config uses the following plugins:

- [@eslint/js](https://github.com/eslint/eslint)
- [@vitest/eslint-plugin](https://github.com/vitest-dev/eslint-plugin-vitest)
- [eslint-plugin-astro](https://github.com/ota-meshi/eslint-plugin-astro)
- [eslint-plugin-de-morgan](https://github.com/azat-io/eslint-plugin-de-morgan)
- [eslint-plugin-depend](https://github.com/es-tooling/eslint-plugin-depend)
- [eslint-plugin-import-lite](https://github.com/9romise/eslint-plugin-import-lite)
- [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc)
- [eslint-plugin-jsx-a11y-x](https://github.com/eslint-community/eslint-plugin-jsx-a11y-x)
- [eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n)
- [eslint-plugin-package-json](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json)
- [eslint-plugin-perfectionist](https://github.com/azat-io/eslint-plugin-perfectionist)
- [eslint-plugin-prefer-let](https://github.com/thefrontside/javascript/tree/v3/packages/eslint-plugin-prefer-let)
- [eslint-plugin-promise](https://github.com/eslint-community/eslint-plugin-promise)
- [eslint-plugin-qwik](https://github.com/QwikDev/qwik/tree/main/packages/eslint-plugin-qwik)
- [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react)
- [eslint-plugin-react-hooks](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)
- [eslint-plugin-react-jsx](https://github.com/Rel1cx/eslint-react)
- [eslint-plugin-react-naming-convention](https://github.com/Rel1cx/eslint-react)
- [eslint-plugin-react-perf](https://github.com/cvazac/eslint-plugin-react-perf)
- [eslint-plugin-react-web-api](https://github.com/Rel1cx/eslint-react)
- [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react)
- [eslint-plugin-regexp](https://github.com/ota-meshi/eslint-plugin-regexp)
- [eslint-plugin-slop](https://github.com/antfu/eslint-plugin-slop)
- [eslint-plugin-sonarjs](https://github.com/SonarSource/SonarJS/tree/master/packages/jsts/src/rules)
- [eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte)
- [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn)
- [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)

## See also

- [@azat-io/ai-config](https://github.com/azat-io/ai-config)
- [@azat-io/prettier-config](https://github.com/azat-io/prettier-config)
- [@azat-io/stylelint-config](https://github.com/azat-io/stylelint-config)
- [@azat-io/typescript-config](https://github.com/azat-io/typescript-config)

## License

MIT &copy; [Azat S.](https://azat.io)
