import type { TSESTree } from '@typescript-eslint/types'
import type { Rule } from 'eslint'

import path from 'node:path'

import type { ModuleExport } from './utils/get-module-exports'

import { EXPORT_KIND_RANKS, getModuleExports } from './utils/get-module-exports'
import { getFilenameVariants } from './utils/get-filename-variants'
import { normalizeName } from './utils/normalize-name'
import { formatNames } from './utils/format-names'

/**
 * Exports that decide whether the filename matches.
 */
interface MainExports {
  /**
   * Candidates in source order, one per name.
   */
  candidates: ModuleExport[]

  /**
   * Whether the only candidate is the default export.
   */
  isDefault: boolean
}

/**
 * Options of the rule.
 */
interface Options {
  /**
   * Names of exported values that an external API dictates.
   */
  allow: string[]
}

let moduleExtensions = new Set([
  '.cjs',
  '.cts',
  '.jsx',
  '.mjs',
  '.mts',
  '.tsx',
  '.js',
  '.ts',
])

/**
 * Declaration files, including declarations of arbitrary extensions such as
 * `styles.d.css.ts`.
 */
let declarationFilePattern = /\.d\.(?:[^.]+\.)?[cm]?ts$/u

/**
 * Index files, including Qwik City pages with a named layout (`index@narrow`).
 */
let indexPattern = /^index(?:@|$)/iu

/**
 * Names of files that collect constants and types. Such a file has no main
 * export even when it holds a single constant.
 */
let collectionNames = new Set(['constants', 'types'])

/**
 * Special files of Next.js in the `app` directory. Next.js chooses their names,
 * and their default exports are named freely, like `RootLayout` in
 * `layout.tsx`.
 */
let nextFileNames = new Set([
  'global-not-found',
  'opengraph-image',
  'twitter-image',
  'global-error',
  'unauthorized',
  'apple-icon',
  'forbidden',
  'not-found',
  'manifest',
  'template',
  'default',
  'loading',
  'sitemap',
  'layout',
  'robots',
  'error',
  'icon',
  'page',
])

/**
 * Modules of React Router and Remix right in the `app` directory: `root.tsx`
 * and the entries, such as `entry.server.tsx`.
 */
let reactRouterFileNames = new Set(['entry', 'root'])

/**
 * Route parameters in filenames: `[id].tsx` in Next.js, Nuxt, Astro and Expo
 * Router, `$id.tsx` in React Router and TanStack Router.
 */
let routeParameterPattern = /[$[]/u

let rule: Rule.RuleModule = {
  create: context => {
    let filename = context.physicalFilename

    if (
      context.filename !== filename ||
      !isCheckedFile(filename, context.cwd)
    ) {
      return {}
    }

    let basename = path.basename(filename)
    let segments = basename.slice(0, -path.extname(basename).length).split('.')
    let variants = getFilenameVariants(segments)

    if (variants.size === 0) {
      return {}
    }

    let isCollectionFile = segments.some(segment =>
      collectionNames.has(normalizeName(segment)),
    )

    let [{ allow }] = context.options as [Options]
    let allowedNames = new Set(allow)

    return {
      Program: (node: unknown) => {
        let { candidates, isDefault } = getMainExports(node as TSESTree.Program)

        if (
          candidates.some(candidate =>
            variants.has(normalizeName(candidate.name)),
          )
        ) {
          return
        }

        /**
         * An external API dictates the names of values, not of types: `Route`
         * of TanStack Router is a value, and an interface named `Route` is an
         * ordinary type. The strongest kinds come first, so that the problem is
         * reported on a function or a class when the module has one.
         */
        let checked = candidates
          .filter(
            candidate =>
              candidate.kind === 'type' || !allowedNames.has(candidate.name),
          )
          .toSorted(
            (first, second) =>
              EXPORT_KIND_RANKS[second.kind] - EXPORT_KIND_RANKS[first.kind],
          )

        /**
         * A value that an external API dictates is the main export, and
         * constants next to it configure the same API, like `runtime` next to
         * `GET` in a Next.js route. Only functions and classes are checked
         * then.
         */
        let hasDictatedExport = checked.length < candidates.length
        let values = checked.filter(
          candidate =>
            candidate.kind === 'callable' ||
            (candidate.kind === 'data' && !hasDictatedExport),
        )
        let [reported] = values

        /**
         * Nothing is left to check when a module only declares types or only
         * configures an allowed export. A module of constants without functions
         * or classes is a collection: it has several constants or a name such
         * as `constants.ts`. None of them has a main export.
         */
        if (
          !reported ||
          ((isCollectionFile || values.length > 1) &&
            values.every(candidate => candidate.kind === 'data'))
        ) {
          return
        }

        let names = [
          ...values,
          ...checked.filter(candidate => candidate.kind === 'type'),
        ].map(candidate => candidate.name)

        let messageId:
          'namedMismatchAny' | 'defaultMismatch' | 'namedMismatch' =
          'namedMismatchAny'
        if (isDefault) {
          messageId = 'defaultMismatch'
        } else if (names.length === 1) {
          messageId = 'namedMismatch'
        }

        context.report({
          data: {
            names: formatNames(names),
            name: reported.name,
            filename: basename,
          },
          loc: reported.loc,
          messageId,
        })
      },
    }
  },
  meta: {
    schema: [
      {
        properties: {
          allow: {
            description:
              'Names of exported values that an external API dictates. They ' +
              'do not have to match the filename.',
            items: {
              type: 'string',
            },
            uniqueItems: true,
            type: 'array',
          },
        },
        additionalProperties: false,
        type: 'object',
      },
    ],
    messages: {
      namedMismatchAny:
        'Filename `{{ filename }}` does not match any of the exports {{ names }}',
      defaultMismatch:
        'Filename `{{ filename }}` does not match the default export `{{ name }}`',
      namedMismatch:
        'Filename `{{ filename }}` does not match the export `{{ name }}`',
    },
    docs: {
      url: 'https://github.com/azat-io/eslint-config/blob/main/rules/docs/filename-matches-export.md',
      description: 'Require the filename to match the main export of a module',
    },
    defaultOptions: [
      {
        allow: [],
      },
    ],
    type: 'suggestion',
  },
}

export default rule

/**
 * Checks whether a framework chooses the name of a file, so that its exports
 * are named freely, like `RootLayout` in `layout.tsx` of Next.js. These are
 * names that start with `+` or `_` (`+page.ts`, `_app.tsx`, `_layout.tsx`,
 * `_index.tsx`), names with route parameters, special files of Next.js in
 * `app`, API routes in `pages/api`, and `root.tsx` and `entry.server.tsx` of
 * React Router. Names that start with `_` also cover `__placeholder__.js`, the
 * name under which ESLint lints text without a path.
 *
 * @param basename - Name of the file with its extension.
 * @param directories - Directories of the file relative to the working
 *   directory.
 * @returns Whether a framework chooses the name.
 */
function isFrameworkFile(basename: string, directories: string[]): boolean {
  let stem = basename.slice(0, -path.extname(basename).length)
  let firstSegment = basename.slice(0, basename.indexOf('.'))

  return (
    /^[+_]/u.test(basename) ||
    routeParameterPattern.test(basename) ||
    (directories.includes('app') && nextFileNames.has(stem)) ||
    (directories.at(-1) === 'app' && reactRouterFileNames.has(firstSegment)) ||
    directories.some(
      (directory, index) =>
        directory === 'pages' && directories[index + 1] === 'api',
    )
  )
}

/**
 * Checks whether the rule applies to a file. It skips files that are not
 * JavaScript or TypeScript modules (components, Markdown), declaration files,
 * index files, manual mocks in `__mocks__` and files whose names a framework
 * chooses.
 *
 * @param filename - Physical path of the file.
 * @param cwd - Current working directory of ESLint.
 * @returns Whether the file is checked.
 */
function isCheckedFile(filename: string, cwd: string): boolean {
  let basename = path.basename(filename)

  if (!moduleExtensions.has(path.extname(basename))) {
    return false
  }

  let directories = path.relative(cwd, path.dirname(filename)).split(/[/\\]/u)

  return (
    !declarationFilePattern.test(basename) &&
    !indexPattern.test(basename.slice(0, basename.indexOf('.'))) &&
    !directories.includes('__mocks__') &&
    !isFrameworkFile(basename, directories)
  )
}

/**
 * Collects the exports that decide whether the filename matches. A default
 * export takes precedence: a named function or class is the only candidate, and
 * any other default export leaves nothing to compare. Without a default export,
 * every named export is a candidate, unless `export *` hides some of them.
 *
 * @param program - Root node of the module.
 * @returns Candidates and whether they come from the default export.
 */
function getMainExports(program: TSESTree.Program): MainExports {
  let { defaultExport, namedExports, hasExportAll } = getModuleExports(program)

  if (defaultExport !== undefined) {
    return {
      candidates: defaultExport ? [defaultExport] : [],
      isDefault: true,
    }
  }

  return {
    candidates: hasExportAll ? [] : namedExports,
    isDefault: false,
  }
}
