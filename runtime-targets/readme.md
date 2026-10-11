# Runtime Targets Prototype

A prototype that turns rules off, or switches them to safer options, when their
fixes and suggestions write APIs that the project's Node.js and browser targets
do not support. It is not wired into the config. The design and its evidence are
in [the audit](../audit/eslint-config-audit.md), section 14.1.

## Files

- `runtime-targets.ts`: `resolveRuntimeTargets()` reads targets from explicit
  options, `engines.node` and browserslist; `explainRuleSupport()` says whether
  a rule is supported and why not.
- `generate-runtime-support.ts`: the gated rules and the MDN features each of
  them writes.
- `runtime-support.json`: the table generated from `@mdn/browser-compat-data`.
- `runtime-gate.ts`: `createRuntimeGate()` and `createRuntimeConfigs()` build
  config blocks that only downgrade rules enabled in the base config.

## Usage

Dependencies are not part of the root package, so install them here:

```sh
cd runtime-targets
npm install --no-package-lock
npm test
npm run test:types
```

Regenerate the table after updating `@mdn/browser-compat-data`:

```sh
RUNTIME_SUPPORT_DATE=2026-10-11 npm run build:support
```

Append the blocks after the base config:

```ts
let configs = [/* existing blocks */]
let baseRules = Object.assign({}, ...configs.map(config => config.rules ?? {}))

return [
  ...configs,
  ...createRuntimeConfigs({
    toolingExtensions: ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts'],
    root: import.meta.dirname,
    baseRules,
  }),
]
```

## Known Limitations

- TypeScript `lib` is not checked: an API may exist at runtime but not in the
  types.
- Monorepos need one block per package.
- `last N years` and `extends` queries change over time.
- ESLint caches the config, so editor servers must restart after `engines` or
  browserslist changes.
