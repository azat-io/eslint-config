# filename-matches-export

Require the filename to match the main export of a module.

## Rule Details

A module that exports one thing should be named after it. Names are compared
without case and without separators, so `get-line-number.ts`,
`get_line_number.ts` and `GetLineNumber.ts` all match `getLineNumber`,
`github.ts` matches `GitHub` and `known-runner-images.ts` matches
`KNOWN_RUNNER_IMAGES`.

Incorrect:

```ts
// get-line-number.ts
export function getLineNumberForKey(content: string): number {}
```

```ts
// runner.ts
export default class HostRunner {}
```

```ts
// colors.ts
export function createColors(): Colors {}

export function isColorSupported(): boolean {}
```

Correct:

```ts
// get-line-number-for-key.ts
export function getLineNumberForKey(content: string): number {}
```

```ts
// lint-client.ts
export interface LintClient {}

export function createLintClient(): LintClient {}
```

```ts
// constants.ts
export const GITHUB_DIRECTORY = '.github'

export const LOCKFILE_NAME = 'actions.lock'
```

## Main Export

The rule only checks modules that have a main export:

- A default export that is a function or a class with its own name. It is the
  only export that counts. Other default exports, such as objects, calls,
  anonymous functions and re-exports, have no name to match, and the module is
  skipped. TypeScript's `export =` counts as a default export.
- Without a default export, named exports that include a function or a class, or
  exactly one other value. The filename has to match one of them, types
  included.

These modules have no main export and are skipped:

- Modules that only export types, including namespaces of types.
- Collections of values without functions or classes: several constants, or even
  one constant in a file named `constants` or `types`, such as `constants.ts` or
  `button.types.ts`.
- Modules without a default export that use `export * from`, whose exports are
  not known.

## Filenames

- The filename may carry dot suffixes: `logger.node.ts` matches `logger`, and
  `user.service.ts` matches `UserService`.
- Only JavaScript and TypeScript modules are checked. Components (`.vue`,
  `.svelte`, `.astro`) and code blocks in other files are skipped.
- Declaration files (`.d.ts`), index files and manual mocks in `__mocks__` are
  skipped.
- `module.exports` and `exports.name` are not checked.

Files whose names a framework chooses are skipped, because their exports are
named freely, like `RootLayout` in `layout.tsx`:

- Names that start with `+` or `_`: `+page.ts` in SvelteKit, `_app.tsx` in
  Next.js, `_layout.tsx` in Expo Router, `_index.tsx` in React Router.
- Names with route parameters, such as `[slug].tsx` and `$id.tsx`.
- Special files of Next.js in `app`, such as `page.tsx`, `layout.tsx` and
  `opengraph-image.tsx`, and API routes in `pages/api`.
- `root.tsx` and entries such as `entry.server.tsx` of React Router in `app`.

Other route files are checked as usual, so the component in `pages/about.tsx` is
named `About`.

A store is a hook, so its file is named after the hook: `use-counter-store.ts`
for Pinia's or Zustand's `useCounterStore`.

## Options

### allow

<sub>type: `string[]`</sub><br /> <sub>default: `[]`</sub>

Names of exported values that an external API dictates, so they do not have to
match the filename. Names are exact and case-sensitive. They are compared with
the exported name, or with the own name of a default export. Types are not
affected: an interface named `Route` is checked like any other type. A module
that matches its filename passes even if the matching name is allowed.

```js
{
  'azat-io/filename-matches-export': ['error', { allow: ['initialize', 'load'] }]
}
```

An allowed export is the main export of its module. Constants and types next to
it configure the same API and are not checked either:

```ts
// app/api/users/route.ts
export const runtime = 'nodejs'

export function GET(): Response {}
```

Functions and classes next to it still have to match. Incorrect:

```ts
// app/api/users/route.ts
export function toUser(row: Row): User {}

export function GET(): Response {}
```

The config allows these names:

| Config   | Names                                                                                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| always   | `DELETE`, `GET`, `HEAD`, `OPTIONS`, `PATCH`, `POST`, `PUT`, `QUERY`                                                              |
| `node`   | `activate`, `deactivate`, `globalSetup`, `globalTeardown`, `initialize`, `load`, `resolve`                                       |
| `astro`  | `ALL`, `CONNECT`, `TRACE`, `collections`, `getStaticPaths`, `onRequest`, `prerender`                                             |
| `qwik`   | `onDelete`, `onGet`, `onHead`, `onOptions`, `onPatch`, `onPost`, `onPut`, `onRequest`                                            |
| `react`  | `Route`, `action`, `generateStaticParams`, `loader`, `onRequestError`, `onRouterTransitionStart`, `register`, `useMDXComponents` |
| `svelte` | `handle`, `handleError`, `handleFetch`, `handleValidationError`, `init`, `match`, `reroute`, `transport`                         |
| `vitest` | `setup`, `teardown`                                                                                                              |

The `react` names cover Next.js route handlers, instrumentation and MDX
components, React Router resource routes and TanStack Router file routes. Every
name is allowed in every file of a project with its config, so a generic name
such as `load` hides a mismatch: `config-loader.ts` that only exports `load`
passes.

Setting the options replaces this list. To keep it, turn the rule off for the
files that need other names instead. For example, Netlify Functions export
`handler`, and the shadcn/ui CLI writes its own files:

```js
import eslintConfig from '@azat-io/eslint-config'

export default eslintConfig({
  extends: [
    {
      rules: {
        'azat-io/filename-matches-export': 'off',
      },
      files: ['netlify/functions/**', 'src/components/ui/**'],
    },
  ],
})
```

## Resources

- [Rule Source](https://github.com/azat-io/eslint-config/blob/main/rules/filename-matches-export.ts)
- [Test Source](https://github.com/azat-io/eslint-config/blob/main/test/rules/filename-matches-export.test.ts)
