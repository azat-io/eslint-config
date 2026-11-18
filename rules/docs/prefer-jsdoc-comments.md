# prefer-jsdoc-comments

Require JSDoc comments instead of line comments.

## Rule Details

Every comment is a JSDoc comment, even inside a function or an array. Editors
show a JSDoc comment on hover, and one style of comments is easier to read than
two.

Consecutive line comments become one JSDoc comment. They are consecutive when
they are on adjacent lines and start in the same column. A JSDoc comment always
takes several lines, even for one sentence.

Incorrect:

```ts
function wait(): void {
  // Nothing may be listening when the host dies.
  void died.catch(() => {})
}
```

```ts
// A clone, since the transformer changes its options in place: that changes
// the project copy.
let clone = structuredClone(config)
```

Correct:

```ts
function wait(): void {
  /**
   * Nothing may be listening when the host dies.
   */
  void died.catch(() => {})
}
```

```ts
/**
 * A clone, since the transformer changes its options in place: that changes the
 * project copy.
 */
let clone = structuredClone(config)
```

`@stylistic/multiline-comment-style` does not do the same: it turns consecutive
line comments into `/* */` instead of `/** */` and leaves single line comments
as they are.

## Directives

Tools read some line comments as directives, and in a JSDoc comment they would
stop working. These line comments are allowed:

- ESLint directives, such as `// eslint-disable-next-line`.
- TypeScript directives, such as `// @ts-expect-error`, and triple-slash
  directives, such as `/// <reference types="node" />`.
- Pragmas that would become tags in a JSDoc comment: `// @vitest-environment`,
  `// @jest-environment`, `// @jsx`, `// @jsxImportSource`, `// @vite-ignore`,
  `// @refresh`, `// @flow`, `// @__PURE__`, `// @license` and others. Other
  comments that start with `@`, such as `// @see` and `// @deprecated`, become
  JSDoc tags.
- CSpell directives, such as `// spell-checker: disable-next-line` and
  `// cspell:ignore`.
- `// No default`, which `default-case` reads to allow a `switch` without a
  `default` case.
- `// prettier-ignore` and `// svelte-ignore`.
- Coverage hints, such as `// v8 ignore next` and `// istanbul ignore else`.
- Folding regions, `// #region` and `// #endregion`.
- Source map comments, `//# sourceMappingURL=`, and legal comments that bundlers
  keep, `//! Copyright`.
- Directives of other tools, the same as in the `ignorePattern` of
  `capitalized-comments`: `// biome-ignore`, `// oxlint-disable-next-line`,
  `// stylelint-disable-next-line`, `// tslint:disable-next-line`,
  `// noinspection` and `// language=` of JetBrains IDEs, and magic comments of
  webpack and Turbopack, such as `// webpackChunkName: "editor"`.

A directive between line comments splits them into two JSDoc comments. Block
comments, such as `/* eslint-disable */`, are not checked.

## Autofix

The fix keeps the indentation of the comments. It removes the slashes and the
space after them, so that other leading spaces, such as in code examples, stay.
The new lines take the line break that follows the comments.

JSDoc rules of the config check the new comment and fix it too:
`jsdoc/require-description-complete-sentence` capitalizes the first word of each
sentence and adds a period at the end. A comment above a function becomes its
JSDoc comment, and `jsdoc/require-param` may ask for `@param` tags.

Comments that these fixes would break are reported without a fix:

- A comment after code on the same line. Whether it describes the line above or
  the line below is up to the author.
- A comment between `// @ts-expect-error` or `// @ts-ignore` and the code that
  the directive applies to. TypeScript only looks through line comments for its
  directive. Move the comment above the directive.
- The continuation of a comment after code, in the same column on the next line.
- A comment that contains `*/`, such as `// Matches src/**/*.ts`, because it
  would end the JSDoc comment early.
- Commented-out code: a comment whose last line ends with `,`, `;`, a bracket or
  a parenthesis, such as `// console.log(value)`. The period would break it.
- A list marked with `*`, whose markers `jsdoc/no-multi-asterisks` would remove.
  Lists marked with `-` are fixed.
- A comment with a link at the start of a line or a sentence, which would become
  `Https://`. A `@see` tag keeps it:

  ```ts
  /**
   * @see https://github.com/withastro/compiler/issues/554
   */
  ```

- A comment without text.

The rule replaces `slop/prefer-jsdoc`, which the config turns off.

## Options

This rule has no options.

## Resources

- [Rule Source](https://github.com/azat-io/eslint-config/blob/main/rules/prefer-jsdoc-comments.ts)
- [Test Source](https://github.com/azat-io/eslint-config/blob/main/test/rules/prefer-jsdoc-comments.test.ts)
