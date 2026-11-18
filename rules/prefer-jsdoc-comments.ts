import type { TSESTree } from '@typescript-eslint/types'
import type { Rule } from 'eslint'

/**
 * Directives that tools read from line comments. In a JSDoc comment they would
 * stop working, so they keep their form. The patterns are tested on the text of
 * the comment after `//`. Directives of other linters and bundlers are the same
 * as in the `ignorePattern` of `capitalized-comments`.
 */
let directivePatterns = [
  /**
   * ESLint: `eslint-disable-line` and `eslint-disable-next-line`.
   */
  /^\s*eslint-disable/u,
  /**
   * Other linters: Biome, Oxlint, Stylelint, TSLint and JetBrains IDEs.
   */
  /^\s*(?:biome-ignore|noinspection|stylelint-|language=|oxlint-|tslint:)/u,
  /**
   * Magic comments of webpack and Turbopack, such as `webpackChunkName`.
   */
  /^\s*(?:turbopack|webpack)[A-Z]/u,
  /**
   * TypeScript, which also reads its directives after `///`.
   */
  /^\/?\s*@ts-/u,
  /**
   * Other pragmas. In a JSDoc comment they would become tags.
   */
  /^\s*@(?:(?:jest|vitest)-environment|jsx(?:Frag|ImportSource|Runtime)?|__NO_SIDE_EFFECTS__|vite-ignore|__PURE__|preserve|license|refresh|no?flow)\b/u,
  /**
   * Triple-slash directives of TypeScript, such as `/// <reference types="node"
   * />`.
   */
  /^\/\s*</u,
  /**
   * The Svelte compiler.
   */
  /^\s*svelte-ignore\b/u,
  /**
   * CSpell, under each of its names.
   */
  /^\s*(?:c?spell|spell-?checker):/iu,
  /**
   * The default pattern of `default-case`, which only reads the comment as it
   * is.
   */
  /^\s*no default\s*$/iu,
  /**
   * Prettier compares the whole comment with this text.
   */
  /^\s*prettier-ignore\s*$/u,
  /**
   * Coverage hints of V8 and Istanbul.
   */
  /^\s*(?:istanbul|[cv]8|node:coverage)\s+ignore\b/u,
  /**
   * Folding regions of TypeScript and VS Code.
   */
  /^\s*#(?:end)?region\b/u,
  /**
   * Source maps, `//# sourceMappingURL=`, and legal comments that bundlers
   * keep, `//! Copyright`.
   */
  /^(?:[#@]\s*source(?:Mapping)?URL=|!)/u,
]

/**
 * Directives that TypeScript looks for above an error. It skips empty lines and
 * line comments on the way, but not a JSDoc comment.
 */
let typeScriptErrorDirectivePattern = /^\/?\s*@ts-(?:expect-error|ignore)/u

/**
 * A link at the start of a line or a sentence. In a JSDoc comment
 * `jsdoc/require-description-complete-sentence` would capitalize it and break
 * it, so the author has to rewrite such a comment.
 */
let sentenceLinkPattern = /(?:^|[!.?]\s)[a-z][\d+\-.a-z]*:\/\//iu

/**
 * A list item marked with `*`. In a JSDoc comment `jsdoc/no-multi-asterisks`
 * would remove the marker.
 */
let asteriskItemPattern = /^\s*\*/u

/**
 * The end of a line of commented-out code. In a JSDoc comment
 * `jsdoc/require-description-complete-sentence` would add a period to it.
 */
let codeEndingPattern = /[(),;[\]{}]$/u

let rule: Rule.RuleModule = {
  create: context => {
    let { sourceCode } = context
    let fileLineBreak = /\r\n?|\n/u.exec(sourceCode.text)?.[0] ?? '\n'

    /**
     * Checks whether a comment takes its line alone.
     *
     * @param comment - Comment to check, with its location.
     * @returns Whether only whitespace is before the comment on its line.
     */
    function isOwnLine(comment: TSESTree.LineComment): boolean {
      let { start } = comment.loc
      return (
        sourceCode.lines[start.line - 1]!.slice(0, start.column).trim() === ''
      )
    }

    /**
     * Checks whether the comments above a group give it a meaning that a JSDoc
     * comment would lose.
     *
     * @param first - First comment of the group.
     * @returns Whether the group has to stay line comments.
     */
    function dependsOnCommentsAbove(first: TSESTree.LineComment): boolean {
      let before = sourceCode.getTokenBefore(first, {
        includeComments: true,
      }) as TSESTree.Token | null

      /**
       * The group continues a comment after code in the same column, and only
       * the group would be moved.
       */
      if (
        before?.type === 'Line' &&
        !isOwnLine(before) &&
        before.loc.start.line + 1 === first.loc.start.line &&
        before.loc.start.column === first.loc.start.column
      ) {
        return true
      }

      /**
       * The group is between a directive of TypeScript and the code that the
       * directive applies to.
       */
      while (before?.type === 'Line') {
        if (typeScriptErrorDirectivePattern.test(before.value)) {
          return true
        }
        if (!isOwnLine(before)) {
          return false
        }
        before = sourceCode.getTokenBefore(before, {
          includeComments: true,
        }) as TSESTree.Token | null
      }

      return false
    }

    /**
     * Reports consecutive line comments as one JSDoc comment. Only comments in
     * the same column on adjacent lines form a group.
     *
     * @param group - Line comments that each take a whole line.
     */
    function reportGroup(group: TSESTree.LineComment[]): void {
      let first = group[0]!
      let last = group.at(-1)!
      let indent = sourceCode.lines[first.loc.start.line - 1]!.slice(
        0,
        first.loc.start.column,
      )
      let lines = trimEmptyLines(group.map(comment => getText(comment.value)))
      let lineBreak =
        /^(?:\r\n?|\n)/u.exec(
          sourceCode.text.slice(last.range[1], last.range[1] + 2),
        )?.[0] ?? fileLineBreak

      context.report({
        fix:
          canBecomeJsdoc(lines) && !dependsOnCommentsAbove(first) ?
            fixer =>
              fixer.replaceTextRange(
                [first.range[0], last.range[1]],
                [
                  '/**',
                  ...lines.map(line => `${indent} *${line ? ` ${line}` : ''}`),
                  `${indent} */`,
                ].join(lineBreak),
              )
          : null,
        loc: {
          start: first.loc.start,
          end: last.loc.end,
        },
        messageId: 'preferJsdoc',
      })
    }

    return {
      Program: () => {
        let group: TSESTree.LineComment[] = []

        /**
         * Reports the collected group, if any, and starts a new one.
         */
        function flush(): void {
          if (group.length > 0) {
            reportGroup(group)
            group = []
          }
        }

        let comments = sourceCode.getAllComments() as TSESTree.Comment[]

        for (let comment of comments) {
          if (comment.type !== 'Line' || isDirective(comment.value)) {
            flush()
            continue
          }

          /**
           * A comment after code has no place of its own to become a JSDoc
           * comment. Where to move it is up to the author.
           */
          if (!isOwnLine(comment)) {
            flush()
            context.report({
              messageId: 'preferJsdocOnOwnLine',
              loc: comment.loc,
            })
            continue
          }

          let previous = group.at(-1)
          if (
            previous &&
            (previous.loc.start.line + 1 !== comment.loc.start.line ||
              previous.loc.start.column !== comment.loc.start.column)
          ) {
            flush()
          }
          group.push(comment)
        }

        flush()
      },
    }
  },
  meta: {
    docs: {
      url: 'https://github.com/azat-io/eslint-config/blob/main/rules/docs/prefer-jsdoc-comments.md',
      description: 'Require JSDoc comments instead of line comments',
    },
    messages: {
      preferJsdocOnOwnLine:
        'Use a `/** */` comment on its own line instead of `//` after code',
      preferJsdoc: 'Use a `/** */` comment instead of `//`',
    },
    type: 'suggestion',
    fixable: 'code',
    schema: [],
  },
}

export default rule

/**
 * Checks whether lines keep their text in a JSDoc comment, including after the
 * fixes of JSDoc rules. A line with `*\/` would end the comment early.
 *
 * @param lines - Lines of the comment without empty lines at the edges.
 * @returns Whether the fix may turn the lines into a JSDoc comment.
 */
function canBecomeJsdoc(lines: string[]): boolean {
  let last = lines.at(-1)
  return (
    last !== undefined &&
    !codeEndingPattern.test(last) &&
    lines.every(
      line =>
        !line.includes('*/') &&
        !asteriskItemPattern.test(line) &&
        !sentenceLinkPattern.test(line),
    )
  )
}

/**
 * Removes empty lines at the start and at the end of a comment.
 *
 * @param lines - Lines of the comment.
 * @returns Lines from the first to the last one with text.
 */
function trimEmptyLines(lines: string[]): string[] {
  let start = lines.findIndex(line => line !== '')
  if (start === -1) {
    return []
  }
  let end = lines.findLastIndex(line => line !== '')
  return lines.slice(start, end + 1)
}

/**
 * Removes the slashes and the space after `//` and the whitespace at the end.
 * Other leading whitespace stays, so that indented code in the comment keeps
 * its shape.
 *
 * @param value - Text of the comment after `//`.
 * @returns Text of the line in the JSDoc comment.
 */
function getText(value: string): string {
  let text = value.replace(/^\/+/u, '')
  return (text.startsWith(' ') ? text.slice(1) : text).trimEnd()
}

/**
 * Checks whether a line comment is a directive for a tool.
 *
 * @param value - Text of the comment after `//`.
 * @returns Whether the comment has to stay a line comment.
 */
function isDirective(value: string): boolean {
  return directivePatterns.some(pattern => pattern.test(value))
}
