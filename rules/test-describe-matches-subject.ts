import type { TSESTree } from '@typescript-eslint/types'
import type { Linter, Rule } from 'eslint'

import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import type { ModuleExports, ModuleExport } from './utils/get-module-exports'

import { EXPORT_KIND_RANKS, getModuleExports } from './utils/get-module-exports'
import { getFilenameVariants } from './utils/get-filename-variants'
import { normalizeName } from './utils/normalize-name'
import { formatNames } from './utils/format-names'

/**
 * Test file in a `test` directory.
 */
interface TestFile {
  /**
   * Directories of the test file below `test`, which repeat the directories of
   * the module under test.
   */
  mirroredDirectories: string[]

  /**
   * Directories of the module under test relative to the working directory.
   */
  subjectDirectories: string[]

  /**
   * Parts of the name before `.test`, split at dots.
   */
  segments: string[]

  /**
   * Extension of the test file.
   */
  extension: string
}

/**
 * Call of `describe` at the top level of a test file.
 */
interface DescribeCall {
  /**
   * First argument of the call.
   */
  title: TSESTree.CallExpressionArgument | undefined

  /**
   * Whether the call runs the describe for every case of a table, as
   * `describe.each` and `describe.for` do. Its title is a template.
   */
  isParameterized: boolean
}

/**
 * Module that a test file tests.
 */
interface Subject {
  /**
   * Normalized forms of the filename that the main export can match.
   */
  variants: Set<string>

  /**
   * Path relative to the working directory, with forward slashes.
   */
  relativePath: string

  /**
   * Physical path.
   */
  filename: string
}

/**
 * Describe with a title that is known without running the code.
 */
interface TitledDescribe {
  /**
   * Whether the describe runs for every case of a table.
   */
  isParameterized: boolean

  /**
   * String or template literal with the title.
   */
  node: TSESTree.Node

  /**
   * Value of the title.
   */
  title: string
}

/**
 * Names that the top-level describes of a test file may have.
 */
interface SubjectNames {
  /**
   * Every exported name of the subject, the main export first.
   */
  names: string[]

  /**
   * Name of the main export, which a fixed describe gets.
   */
  main: string
}

/**
 * Suffix that marks a test file before its extension.
 */
const TEST_SUFFIX = '.test'

/**
 * Extensions of JavaScript and TypeScript modules, in the order in which a
 * subject is looked for after the extension of the test file.
 */
let moduleExtensions = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
]

/**
 * Names of test files: a name, `.test` and the extension of a module.
 */
let testFilePattern = /^.+\.test\.(?:[cm]?[jt]s|[jt]sx)$/u

/**
 * Extension of a JavaScript or TypeScript module at the end of a path.
 */
let moduleExtensionPattern = /\.(?:[cm]?[jt]s|[jt]sx)$/u

/**
 * Index files, including Qwik City pages with a named layout (`index@narrow`).
 * Their main export is named after the directory.
 */
let indexPattern = /^index(?:[.@]|$)/iu

/**
 * Names that a fixed title can take without escaping in any quotes.
 */
let identifierPattern = /^[\p{ID_Start}$_][\p{ID_Continue}$\u{200C}\u{200D}]*$/u

/**
 * Modifiers that run a describe for every case of a table.
 */
let parameterizedModifiers = new Set(['each', 'for'])

/**
 * Matchers that store snapshots in a file under the titles of their tests, so
 * that a renamed describe loses its snapshots.
 */
let snapshotMatcherSelector = [
  'MemberExpression > Identifier.property[name="toMatchSnapshot"]',
  'MemberExpression > Identifier.property[name="toThrowErrorMatchingSnapshot"]',
].join(', ')

let rule: Rule.RuleModule = {
  create: context => {
    let filename = context.physicalFilename
    let testFile =
      context.filename === filename ?
        parseTestFile(filename, context.cwd)
      : null

    if (!testFile) {
      return {}
    }

    let testDirectory = path.dirname(filename)
    let importedPaths = new Set<string>()
    let usesSnapshots = false

    /**
     * Remembers a module that the test file imports by a relative path.
     *
     * @param source - Path in an import.
     */
    function addImport(source: string): void {
      if (source.startsWith('.')) {
        importedPaths.add(
          path
            .resolve(testDirectory, source)
            .replace(moduleExtensionPattern, ''),
        )
      }
    }

    return {
      'Program:exit': (node: unknown) => {
        let describes = (node as TSESTree.Program).body
          .map(getDescribeCall)
          .filter(describe => describe !== null)
        let titled = describes.flatMap(getTitledDescribe)

        if (titled.length === 0) {
          return
        }

        let subject = findSubject(testFile, context.cwd, importedPaths)

        if (!subject) {
          return
        }

        let subjectNames = getSubjectNames(subject, context.languageOptions)

        if (!subjectNames) {
          return
        }

        let { names, main } = subjectNames

        /**
         * A fix renames the only top-level describe of a file. With several of
         * them, the new title could repeat the title of another one. The title
         * of a parameterized describe is a template for every case of its
         * table, so the export name would give every case the same title.
         */
        let canRename =
          describes.length === 1 &&
          !titled[0]!.isParameterized &&
          identifierPattern.test(main)

        for (let describe of titled) {
          if (names.includes(describe.title)) {
            continue
          }

          let { range, loc } = describe.node
          let quote = context.sourceCode.text.charAt(range[0])
          let rename = replaceText(range, `${quote}${main}${quote}`)

          context.report({
            data: {
              subject: subject.relativePath,
              names: formatNames(names),
              title: describe.title,
              name: main,
            },
            /**
             * Snapshots of the file would lose their titles, so the rename is
             * left to the author, who updates the snapshots.
             */
            suggest:
              canRename && usesSnapshots ?
                [{ data: { name: main }, messageId: 'rename', fix: rename }]
              : null,
            messageId: names.length === 1 ? 'mismatch' : 'mismatchAny',
            fix: canRename && !usesSnapshots ? rename : null,
            loc,
          })
        }
      },
      ImportExpression: (node: unknown) => {
        let source = getStaticString((node as TSESTree.ImportExpression).source)

        if (source !== null) {
          addImport(source)
        }
      },
      ImportDeclaration: (node: unknown) => {
        addImport((node as TSESTree.ImportDeclaration).source.value)
      },
      [snapshotMatcherSelector]: () => {
        usesSnapshots = true
      },
    }
  },
  meta: {
    messages: {
      mismatchAny:
        'Describe `{{ title }}` does not match any of the exports {{ names }} of `{{ subject }}`',
      mismatch:
        'Describe `{{ title }}` does not match the export `{{ name }}` of `{{ subject }}`',
      rename: 'Rename the describe to `{{ name }}`',
    },
    docs: {
      url: 'https://github.com/azat-io/eslint-config/blob/main/rules/docs/test-describe-matches-subject.md',
      description:
        'Require top-level describes to name exports of the module under test',
    },
    hasSuggestions: true,
    type: 'suggestion',
    fixable: 'code',
    schema: [],
  },
}

export default rule

/**
 * Reads the names that the top-level describes may have: the exports of the
 * subject. The subject is parsed with the parser of the test file, without type
 * information. A subject without a main export is skipped: one whose default
 * export has no name, one that uses `export * from`, and one with several
 * exports that the filename does not tell apart, such as a collection of
 * constants.
 *
 * @param subject - Module that the test file tests.
 * @param languageOptions - Language options of the test file.
 * @returns Names of the exports, or `null` when the subject cannot be parsed or
 *   has no main export.
 */
function getSubjectNames(
  subject: Subject,
  languageOptions: Linter.LanguageOptions,
): SubjectNames | null {
  let moduleExports: ModuleExports

  /**
   * Another parser may give an AST of another shape, which is skipped as well.
   */
  try {
    moduleExports = getModuleExports(
      parseModule(
        readFileSync(subject.filename, 'utf8'),
        subject.filename,
        languageOptions,
      ),
    )
  } catch {
    return null
  }

  let { defaultExport, namedExports, hasExportAll } = moduleExports

  if (defaultExport === null || hasExportAll) {
    return null
  }

  let main = defaultExport ?? findMainExport(namedExports, subject.variants)

  if (!main) {
    return null
  }

  let others = namedExports
    .filter(moduleExport => moduleExport !== main)
    .toSorted(
      (first, second) =>
        EXPORT_KIND_RANKS[second.kind] - EXPORT_KIND_RANKS[first.kind],
    )

  return {
    names: [
      ...new Set([main, ...others].map(moduleExport => moduleExport.name)),
    ],
    main: main.name,
  }
}

/**
 * Finds the module that a test file tests: `test/x/y.test.ts` tests `x/y.ts`
 * next to the `test` directory. A name with dots may end with an aspect of the
 * module: `index.cache.test.ts` tests `index.ts`, and
 * `prompt.windows.screens.test.ts` tests `prompt.ts`. The longest name of an
 * existing module wins, so `user.service.test.ts` tests `user.service.ts` when
 * it exists. A shorter name counts only when the test file imports the module,
 * because `config.schema.test.ts` may test `config.schema.json` next to
 * `config.ts`.
 *
 * @param testFile - Parts of the path of the test file.
 * @param cwd - Current working directory of ESLint.
 * @param importedPaths - Paths without extensions of the modules that the test
 *   file imports.
 * @returns Subject, or `null` when it does not exist.
 */
function findSubject(
  testFile: TestFile,
  cwd: string,
  importedPaths: Set<string>,
): Subject | null {
  let { mirroredDirectories, subjectDirectories, extension, segments } =
    testFile
  let extensions = new Set([extension, ...moduleExtensions])

  for (let count = segments.length; count > 0; count--) {
    let stem = segments.slice(0, count).join('.')

    for (let subjectExtension of extensions) {
      let basename = `${stem}${subjectExtension}`
      let filename = path.join(cwd, ...subjectDirectories, basename)

      if (
        isFile(filename) &&
        (count === segments.length || isImported(filename, importedPaths))
      ) {
        return {
          variants: getFilenameVariants(
            indexPattern.test(stem) ?
              mirroredDirectories.slice(-1)
            : stem.split('.'),
          ),
          relativePath: [...subjectDirectories, basename].join('/'),
          filename,
        }
      }
    }
  }

  return null
}

/**
 * Finds the call of `describe` in a top-level statement: `describe()`, a call
 * with modifiers, such as `describe.only()` and `describe.skipIf(condition)()`,
 * or a parameterized call, such as `describe.each(cases)()`.
 *
 * @param statement - Top-level statement of the test file.
 * @returns Call of `describe`, or `null` for other statements.
 */
function getDescribeCall(
  statement: TSESTree.ProgramStatement,
): DescribeCall | null {
  if (
    statement.type !== 'ExpressionStatement' ||
    statement.expression.type !== 'CallExpression'
  ) {
    return null
  }

  let { expression } = statement
  let isParameterized = false
  let callee: TSESTree.Node = expression.callee

  while (
    callee.type === 'CallExpression' ||
    callee.type === 'TaggedTemplateExpression' ||
    callee.type === 'MemberExpression'
  ) {
    if (callee.type === 'MemberExpression') {
      isParameterized ||=
        !callee.computed && parameterizedModifiers.has(callee.property.name)
      callee = callee.object
    } else {
      callee = callee.type === 'CallExpression' ? callee.callee : callee.tag
    }
  }

  return callee.type === 'Identifier' && callee.name === 'describe' ?
      {
        title: expression.arguments[0],
        isParameterized,
      }
    : null
}

/**
 * Parses a module with the parser of the linted file. Options that make
 * typescript-eslint load a TypeScript project are turned off: only the syntax
 * is needed. JSX is allowed, since parsers that read the extension ignore it.
 * Locations are requested, because Espree adds them only on request.
 *
 * @param code - Source code of the module.
 * @param filename - Path of the module.
 * @param languageOptions - Language options of the linted file.
 * @returns Root node of the module.
 */
function parseModule(
  code: string,
  filename: string,
  languageOptions: Linter.LanguageOptions,
): TSESTree.Program {
  let parser = languageOptions.parser!
  let options = {
    ...languageOptions.parserOptions,
    ecmaFeatures: {
      ...languageOptions.parserOptions?.ecmaFeatures,
      jsx: true,
    },
    projectService: false,
    ecmaVersion: 'latest',
    sourceType: 'module',
    filePath: filename,
    programs: null,
    project: null,
    range: true,
    loc: true,
  }
  let ast: unknown =
    'parseForESLint' in parser ?
      parser.parseForESLint(code, options).ast
    : parser.parse(code, options)

  return ast as TSESTree.Program
}

/**
 * Reads a test file from its path: `<name>.test.<extension>` in a `test`
 * directory of the project. The nearest `test` directory counts, so that
 * fixture projects with their own tests work.
 *
 * @param filename - Physical path of the file.
 * @param cwd - Current working directory of ESLint.
 * @returns Test file, or `null` for other files.
 */
function parseTestFile(filename: string, cwd: string): TestFile | null {
  let basename = path.basename(filename)
  let directories = path.relative(cwd, path.dirname(filename)).split(/[/\\]/u)
  let testIndex = directories.lastIndexOf('test')

  if (testIndex === -1 || !testFilePattern.test(basename)) {
    return null
  }

  let extension = path.extname(basename)

  return {
    segments: basename
      .slice(0, -extension.length - TEST_SUFFIX.length)
      .split('.'),
    subjectDirectories: directories.toSpliced(testIndex, 1),
    mirroredDirectories: directories.slice(testIndex + 1),
    extension,
  }
}

/**
 * Finds the main export among named exports. Values come first: the one that
 * the filename matches, or the only one. Types count only when the module has
 * no values. When several exports match the filename, the strongest kind wins.
 *
 * @param namedExports - Named exports in source order.
 * @param variants - Normalized forms of the filename.
 * @returns Main export, or `undefined` when the exports do not show one.
 */
function findMainExport(
  namedExports: ModuleExport[],
  variants: Set<string>,
): ModuleExport | undefined {
  let values = namedExports.filter(moduleExport => moduleExport.kind !== 'type')
  let candidates = values.length > 0 ? values : namedExports
  let [matching] = candidates
    .filter(moduleExport => variants.has(normalizeName(moduleExport.name)))
    .toSorted(
      (first, second) =>
        EXPORT_KIND_RANKS[second.kind] - EXPORT_KIND_RANKS[first.kind],
    )

  return matching ?? (candidates.length === 1 ? candidates[0] : undefined)
}

/**
 * Reads a string that is known without running the code: a string literal or a
 * template literal without expressions. Other expressions, such as variables,
 * give nothing.
 *
 * @param node - Expression to read.
 * @returns Value of the string, or `null`.
 */
function getStaticString(node: TSESTree.Node | undefined): string | null {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }

  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    /**
     * Only a tagged template can have an invalid escape and no cooked value.
     */
    return node.quasis[0]!.value.cooked!
  }

  return null
}

/**
 * Checks whether the test file imports a module: by its path with or without an
 * extension, or, for an index file, by its directory.
 *
 * @param filename - Path of the module.
 * @param importedPaths - Paths without extensions of the modules that the test
 *   file imports.
 * @returns Whether the module is imported.
 */
function isImported(filename: string, importedPaths: Set<string>): boolean {
  let modulePath = filename.replace(moduleExtensionPattern, '')

  return (
    importedPaths.has(modulePath) ||
    (path.basename(modulePath) === 'index' &&
      importedPaths.has(path.dirname(modulePath)))
  )
}

/**
 * Reads the title of a describe when it is known without running the code.
 *
 * @param describe - Call of `describe`.
 * @returns The describe with its title, or nothing when the title is not known.
 */
function getTitledDescribe(describe: DescribeCall): TitledDescribe[] {
  let { isParameterized, title: node } = describe
  let title = getStaticString(node)

  return title === null ? [] : [{ isParameterized, node: node!, title }]
}

/**
 * Creates a fix that replaces a range of the source code.
 *
 * @param range - Range to replace.
 * @param text - New text of the range.
 * @returns Fix function for a report.
 */
function replaceText(range: TSESTree.Range, text: string): Rule.ReportFixer {
  return fixer => fixer.replaceTextRange(range, text)
}

/**
 * Checks whether a path leads to a file. A missing path and a path through a
 * file, such as `bin/cli.ts` next to a script named `bin`, lead to none.
 *
 * @param filename - Path to check.
 * @returns Whether the path is a file.
 */
function isFile(filename: string): boolean {
  try {
    return statSync(filename).isFile()
  } catch {
    return false
  }
}
