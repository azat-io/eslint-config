import type { TSESTree } from '@typescript-eslint/types'
import type { Rule } from 'eslint'

import path from 'node:path'

/**
 * Exported binding that the filename is compared with.
 */
interface Candidate {
  /**
   * Location of the name, where the problem is reported.
   */
  loc: TSESTree.SourceLocation

  /**
   * How the export counts.
   */
  kind: ExportKind

  /**
   * Exported name, or the own name of a default export.
   */
  name: string
}

/**
 * Node types whose value is a function or a class.
 */
type CallableNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.TSDeclareFunction
  | TSESTree.ClassDeclaration
  | TSESTree.ClassExpression

/**
 * Exports that decide whether the filename matches.
 */
interface MainExports {
  /**
   * Candidates in source order, one per name.
   */
  candidates: Candidate[]

  /**
   * Whether the only candidate is the default export.
   */
  isDefault: boolean
}

/**
 * TypeScript expressions that only add type information to the expression
 * inside them.
 */
type TypeWrapper =
  | TSESTree.TSInstantiationExpression
  | TSESTree.TSSatisfiesExpression
  | TSESTree.TSNonNullExpression
  | TSESTree.TSTypeAssertion
  | TSESTree.TSAsExpression

/**
 * Options of the rule.
 */
interface Options {
  /**
   * Names of exported values that an external API dictates.
   */
  allow: string[]
}

/**
 * How an export counts: functions and classes are behavior, other values are
 * data, and types only describe values.
 */
type ExportKind = 'callable' | 'data' | 'type'

/**
 * The longest list of names that a message shows in full.
 */
const MAX_LISTED_NAMES = 4

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

let callableTypes = new Set<string>([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'TSDeclareFunction',
  'ClassDeclaration',
  'ClassExpression',
])

let typeWrapperTypes = new Set<string>([
  'TSInstantiationExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
  'TSAsExpression',
])

/**
 * When one name has several kinds, such as a value and a type merged under one
 * name, the strongest kind counts.
 */
let kindRanks: Record<ExportKind, number> = {
  callable: 2,
  data: 1,
  type: 0,
}

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
            (first, second) => kindRanks[second.kind] - kindRanks[first.kind],
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
 * Collects the exports that decide whether the filename matches. A default
 * export takes precedence: a named function or class is the only candidate, and
 * any other default export leaves nothing to compare. Without a default export,
 * every named export is a candidate, unless `export *` hides some of them.
 *
 * @param program - Root node of the module.
 * @returns Candidates and whether they come from the default export.
 */
function getMainExports(program: TSESTree.Program): MainExports {
  let localKinds = getLocalKinds(program)
  let namedExports = new Map<string, Candidate>()
  let defaultExport: Candidate | undefined | null
  let hasExportAll = false

  for (let statement of program.body) {
    switch (statement.type) {
      case 'ExportDefaultDeclaration':
        defaultExport ??= getDefaultCandidate(statement.declaration, localKinds)
        break
      case 'ExportNamedDeclaration': {
        let bindings =
          statement.declaration ? getBindings(statement.declaration) : []
        for (let binding of bindings) {
          addCandidate(namedExports, binding)
        }
        for (let specifier of statement.specifiers) {
          let exportedName = getName(specifier.exported)
          if (exportedName === 'default') {
            defaultExport ??=
              statement.source || isTypeExport(statement, specifier) ?
                null
              : getDefaultCandidate(specifier.local, localKinds)
          } else {
            addCandidate(namedExports, {
              kind: getSpecifierKind(statement, specifier, localKinds),
              loc: specifier.exported.loc,
              name: exportedName,
            })
          }
        }
        break
      }
      case 'ExportAllDeclaration':
        if (!statement.exported) {
          hasExportAll = true
        } else if (getName(statement.exported) === 'default') {
          defaultExport ??= null
        } else {
          addCandidate(namedExports, {
            kind: statement.exportKind === 'type' ? 'type' : 'data',
            name: getName(statement.exported),
            loc: statement.exported.loc,
          })
        }
        break
      case 'TSExportAssignment':
        defaultExport ??= getDefaultCandidate(statement.expression, localKinds)
        break
      default:
        break
    }
  }

  if (defaultExport !== undefined) {
    return {
      candidates: defaultExport ? [defaultExport] : [],
      isDefault: true,
    }
  }

  return {
    candidates: hasExportAll ? [] : namedExports.values().toArray(),
    isDefault: false,
  }
}

/**
 * Collects the kinds of the top-level bindings of a module, so that export
 * specifiers and default exports can be resolved to their declarations.
 *
 * @param program - Root node of the module.
 * @returns Kind of every top-level binding by name.
 */
function getLocalKinds(program: TSESTree.Program): Map<string, ExportKind> {
  let localKinds = new Map<string, Candidate>()

  for (let statement of program.body) {
    if (statement.type === 'ImportDeclaration') {
      for (let specifier of statement.specifiers) {
        let isTypeImport =
          statement.importKind === 'type' ||
          (specifier.type === 'ImportSpecifier' &&
            specifier.importKind === 'type')
        addCandidate(
          localKinds,
          createCandidate(specifier.local, isTypeImport ? 'type' : 'data'),
        )
      }
    } else {
      let declaration =
        (
          statement.type === 'ExportNamedDeclaration' ||
          statement.type === 'ExportDefaultDeclaration'
        ) ?
          statement.declaration
        : statement
      let bindings = declaration ? getBindings(declaration) : []
      for (let binding of bindings) {
        addCandidate(localKinds, binding)
      }
    }
  }

  return new Map(
    [...localKinds].map(([name, candidate]) => [name, candidate.kind]),
  )
}

/**
 * Collects the bindings that a declaration creates.
 *
 * @param node - Top-level statement or exported declaration.
 * @returns Bindings in source order.
 */
function getBindings(node: TSESTree.Node): Candidate[] {
  switch (node.type) {
    case 'TSImportEqualsDeclaration':
      return [
        createCandidate(node.id, node.importKind === 'type' ? 'type' : 'data'),
      ]
    case 'TSTypeAliasDeclaration':
    case 'TSInterfaceDeclaration':
      return [createCandidate(node.id, 'type')]
    case 'VariableDeclaration':
      return node.declarations.flatMap(getVariableBindings)
    case 'FunctionDeclaration':
    case 'TSDeclareFunction':
    case 'ClassDeclaration':
      return node.id ? [createCandidate(node.id, 'callable')] : []
    case 'TSModuleDeclaration':
      return getNamespaceBindings(node)
    case 'TSEnumDeclaration':
      return [createCandidate(node.id, 'data')]
    default:
      return []
  }
}

/**
 * Collects the identifiers that a destructuring pattern binds.
 *
 * @param pattern - Binding pattern or one of its parts.
 * @returns Bound identifiers in source order.
 */
function getPatternIdentifiers(pattern: TSESTree.Node): TSESTree.Identifier[] {
  let target = pattern
  while (target.type === 'RestElement' || target.type === 'AssignmentPattern') {
    target = target.type === 'RestElement' ? target.argument : target.left
  }

  switch (target.type) {
    case 'ObjectPattern':
      return target.properties.flatMap(property =>
        getPatternIdentifiers(
          property.type === 'Property' ? property.value : property,
        ),
      )
    case 'ArrayPattern':
      return target.elements.flatMap(element =>
        element ? getPatternIdentifiers(element) : [],
      )
    default:
      return [target as TSESTree.Identifier]
  }
}

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
 * Checks whether a statement of a namespace only declares types. A namespace of
 * such statements emits no code, so it is not a value.
 *
 * @param statement - Statement in the body of a namespace.
 * @returns Whether the statement declares only types.
 */
function isTypeDeclaration(statement: TSESTree.Node): boolean {
  let declaration =
    statement.type === 'ExportNamedDeclaration' ?
      statement.declaration
    : statement

  if (!declaration) {
    return true
  }

  if (declaration.type === 'TSModuleDeclaration') {
    return getNamespaceBindings(declaration).every(
      binding => binding.kind === 'type',
    )
  }

  return (
    declaration.type === 'TSInterfaceDeclaration' ||
    declaration.type === 'TSTypeAliasDeclaration'
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
 * Collects the bindings of a variable declarator. A function or a class
 * assigned to a single name is callable; destructured names are data.
 *
 * @param declarator - One name or pattern of a `let`, `const` or `var`.
 * @returns Bindings in source order.
 */
function getVariableBindings(
  declarator: TSESTree.VariableDeclarator,
): Candidate[] {
  if (declarator.id.type === 'Identifier') {
    let isCallableValue =
      declarator.init !== null &&
      isCallable(unwrapTypeWrappers(declarator.init))
    return [
      createCandidate(declarator.id, isCallableValue ? 'callable' : 'data'),
    ]
  }

  return getPatternIdentifiers(declarator.id).map(identifier =>
    createCandidate(identifier, 'data'),
  )
}

/**
 * Collects the binding of a TypeScript namespace. `declare global` and ambient
 * modules such as `declare module 'x'` bind no name. A dotted namespace `A.B.C`
 * binds its first part. A namespace that only declares types is a type.
 *
 * @param node - Module declaration.
 * @returns Bindings of the declaration.
 */
function getNamespaceBindings(node: TSESTree.TSModuleDeclaration): Candidate[] {
  if (node.kind === 'global' || !node.body || node.id.type === 'Literal') {
    return []
  }

  let name: TSESTree.EntityName = node.id
  while (name.type === 'TSQualifiedName') {
    name = name.left
  }

  let isTypeOnly = node.body.body.every(isTypeDeclaration)

  return [
    createCandidate(name as TSESTree.Identifier, isTypeOnly ? 'type' : 'data'),
  ]
}

/**
 * Turns the value of a default export into a candidate. Only a function or a
 * class with its own name gives one: the local name of an object or a call is
 * incidental, as in `const config = {}; export default config`.
 *
 * @param node - Exported declaration or expression.
 * @param localKinds - Kinds of the top-level bindings of the module.
 * @returns Candidate, or `null` when the default export has no name to match.
 */
function getDefaultCandidate(
  node: TSESTree.Node,
  localKinds: Map<string, ExportKind>,
): Candidate | null {
  let target = unwrapTypeWrappers(node)

  if (target.type === 'Identifier') {
    return localKinds.get(target.name) === 'callable' ?
        createCandidate(target, 'callable')
      : null
  }

  if (isCallable(target)) {
    return target.id ? createCandidate(target.id, 'callable') : null
  }

  return null
}

/**
 * Finds what kind of binding an export specifier exports.
 *
 * @param statement - Export declaration that holds the specifier.
 * @param specifier - One name in the braces of the declaration.
 * @param localKinds - Kinds of the top-level bindings of the module.
 * @returns Kind of the exported binding.
 */
function getSpecifierKind(
  statement: TSESTree.ExportNamedDeclaration,
  specifier: TSESTree.ExportSpecifier,
  localKinds: Map<string, ExportKind>,
): ExportKind {
  if (isTypeExport(statement, specifier)) {
    return 'type'
  }
  if (statement.source) {
    return 'data'
  }
  return localKinds.get(getName(specifier.local)) ?? 'data'
}

/**
 * Formats names for a message, shortening long lists.
 *
 * @param names - Names to show.
 * @returns Names in backticks, separated by commas.
 */
function formatNames(names: string[]): string {
  let listed =
    names.length > MAX_LISTED_NAMES ?
      names.slice(0, MAX_LISTED_NAMES - 1)
    : names
  let text = listed.map(name => `\`${name}\``).join(', ')

  return listed.length < names.length ?
      `${text} and ${names.length - listed.length} more`
    : text
}

/**
 * Creates a candidate from an identifier. The location covers only the name:
 * the identifier of a typed variable also spans its type annotation.
 *
 * @param identifier - Identifier that names the binding.
 * @param kind - How the binding counts.
 * @returns Name, location and kind of the binding.
 */
function createCandidate(
  identifier: TSESTree.Identifier,
  kind: ExportKind,
): Candidate {
  let { start } = identifier.loc

  return {
    loc: {
      end: {
        column: start.column + identifier.name.length,
        line: start.line,
      },
      start,
    },
    name: identifier.name,
    kind,
  }
}

/**
 * Adds a candidate. When a name is already known, the declaration with the
 * stronger kind wins, so a class merged with an interface is reported on the
 * class and keeps the position of the class among the exports.
 *
 * @param candidates - Candidates by name.
 * @param candidate - Candidate to add.
 */
function addCandidate(
  candidates: Map<string, Candidate>,
  candidate: Candidate,
): void {
  let existing = candidates.get(candidate.name)

  if (!existing || kindRanks[candidate.kind] > kindRanks[existing.kind]) {
    candidates.delete(candidate.name)
    candidates.set(candidate.name, candidate)
  }
}

/**
 * Collects the forms of a base name that an export can match: the whole name
 * and every prefix that ends before a dot, so that `logger.node` matches
 * `logger` and `user.service` matches `UserService`.
 *
 * @param segments - Parts of the filename without its extension, split at dots.
 * @returns Normalized non-empty variants.
 */
function getFilenameVariants(segments: string[]): Set<string> {
  let variants = segments.map((_segment, index) =>
    normalizeName(segments.slice(0, index + 1).join('.')),
  )
  return new Set(variants.filter(variant => variant !== ''))
}

/**
 * Checks whether an export specifier exports only a type, such as `User` in
 * `export type { User }` and in `export { type User }`.
 *
 * @param statement - Export declaration that holds the specifier.
 * @param specifier - One name in the braces of the declaration.
 * @returns Whether the specifier exports only a type.
 */
function isTypeExport(
  statement: TSESTree.ExportNamedDeclaration,
  specifier: TSESTree.ExportSpecifier,
): boolean {
  return statement.exportKind === 'type' || specifier.exportKind === 'type'
}

/**
 * Removes the type information around an expression.
 *
 * @param node - Expression, possibly wrapped.
 * @returns Expression without type wrappers.
 */
function unwrapTypeWrappers(node: TSESTree.Node): TSESTree.Node {
  let current = node
  while (isTypeWrapper(current)) {
    current = current.expression
  }
  return current
}

/**
 * Brings a name to the form in which names are compared: lowercase, without
 * separators and other characters that are not letters or digits.
 *
 * @param name - Identifier or filename.
 * @returns Normalized name.
 */
function normalizeName(name: string): string {
  return name
    .normalize('NFC')
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]/gu, '')
}

/**
 * Gets the name of an identifier or a string literal in an export.
 *
 * @param node - Identifier or string literal.
 * @returns Text of the identifier or the value of the literal.
 */
function getName(node: TSESTree.StringLiteral | TSESTree.Identifier): string {
  return node.type === 'Identifier' ? node.name : node.value
}

/**
 * Checks whether a node is a TypeScript type wrapper.
 *
 * @param node - Node to check.
 * @returns Whether the node only adds type information.
 */
function isTypeWrapper(node: TSESTree.Node): node is TypeWrapper {
  return typeWrapperTypes.has(node.type)
}

/**
 * Checks whether a node creates a function or a class.
 *
 * @param node - Node to check.
 * @returns Whether the node is callable.
 */
function isCallable(node: TSESTree.Node): node is CallableNode {
  return callableTypes.has(node.type)
}
