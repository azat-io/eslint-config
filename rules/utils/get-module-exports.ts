import type { TSESTree } from '@typescript-eslint/types'

/**
 * Exports of a module.
 */
export interface ModuleExports {
  /**
   * Default export: a function or a class with its own name, `null` for any
   * other default export, `undefined` when the module has none.
   */
  defaultExport: ModuleExport | undefined | null

  /**
   * Named exports in source order, one per name.
   */
  namedExports: ModuleExport[]

  /**
   * Whether `export * from` adds names that are not known.
   */
  hasExportAll: boolean
}

/**
 * Exported binding of a module.
 */
export interface ModuleExport {
  /**
   * Location of the name, where problems with it are reported.
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
 * How an export counts: functions and classes are behavior, other values are
 * data, and types only describe values.
 */
export type ExportKind = 'callable' | 'data' | 'type'

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
 * When one name has several kinds, such as a value and a type merged under one
 * name, the strongest kind counts.
 */
export const EXPORT_KIND_RANKS: Record<ExportKind, number> = {
  callable: 2,
  data: 1,
  type: 0,
}

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
 * Collects the exports of a module. Only the first default export counts.
 *
 * @param program - Root node of the module.
 * @returns Default export, named exports and whether `export *` hides some of
 *   them.
 */
export function getModuleExports(program: TSESTree.Program): ModuleExports {
  let localKinds = getLocalKinds(program)
  let namedExports = new Map<string, ModuleExport>()
  let defaultExport: ModuleExport | undefined | null
  let hasExportAll = false

  for (let statement of program.body) {
    switch (statement.type) {
      case 'ExportDefaultDeclaration':
        defaultExport ??= getDefaultExport(statement.declaration, localKinds)
        break
      case 'ExportNamedDeclaration': {
        let bindings =
          statement.declaration ? getBindings(statement.declaration) : []
        for (let binding of bindings) {
          addExport(namedExports, binding)
        }
        for (let specifier of statement.specifiers) {
          let exportedName = getName(specifier.exported)
          if (exportedName === 'default') {
            defaultExport ??=
              statement.source || isTypeExport(statement, specifier) ?
                null
              : getDefaultExport(specifier.local, localKinds)
          } else {
            addExport(namedExports, {
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
          addExport(namedExports, {
            kind: statement.exportKind === 'type' ? 'type' : 'data',
            name: getName(statement.exported),
            loc: statement.exported.loc,
          })
        }
        break
      case 'TSExportAssignment':
        defaultExport ??= getDefaultExport(statement.expression, localKinds)
        break
      default:
        break
    }
  }

  return {
    namedExports: namedExports.values().toArray(),
    defaultExport,
    hasExportAll,
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
  let localKinds = new Map<string, ModuleExport>()

  for (let statement of program.body) {
    if (statement.type === 'ImportDeclaration') {
      for (let specifier of statement.specifiers) {
        let isTypeImport =
          statement.importKind === 'type' ||
          (specifier.type === 'ImportSpecifier' &&
            specifier.importKind === 'type')
        addExport(
          localKinds,
          createExport(specifier.local, isTypeImport ? 'type' : 'data'),
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
        addExport(localKinds, binding)
      }
    }
  }

  return new Map([...localKinds].map(([name, binding]) => [name, binding.kind]))
}

/**
 * Collects the bindings that a declaration creates.
 *
 * @param node - Top-level statement or exported declaration.
 * @returns Bindings in source order.
 */
function getBindings(node: TSESTree.Node): ModuleExport[] {
  switch (node.type) {
    case 'TSImportEqualsDeclaration':
      return [
        createExport(node.id, node.importKind === 'type' ? 'type' : 'data'),
      ]
    case 'TSTypeAliasDeclaration':
    case 'TSInterfaceDeclaration':
      return [createExport(node.id, 'type')]
    case 'VariableDeclaration':
      return node.declarations.flatMap(getVariableBindings)
    case 'FunctionDeclaration':
    case 'TSDeclareFunction':
    case 'ClassDeclaration':
      return node.id ? [createExport(node.id, 'callable')] : []
    case 'TSModuleDeclaration':
      return getNamespaceBindings(node)
    case 'TSEnumDeclaration':
      return [createExport(node.id, 'data')]
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
 * Collects the binding of a TypeScript namespace. `declare global` and ambient
 * modules such as `declare module 'x'` bind no name. A dotted namespace `A.B.C`
 * binds its first part. A namespace that only declares types is a type.
 *
 * @param node - Module declaration.
 * @returns Bindings of the declaration.
 */
function getNamespaceBindings(
  node: TSESTree.TSModuleDeclaration,
): ModuleExport[] {
  if (node.kind === 'global' || !node.body || node.id.type === 'Literal') {
    return []
  }

  let name: TSESTree.EntityName = node.id
  while (name.type === 'TSQualifiedName') {
    name = name.left
  }

  let isTypeOnly = node.body.body.every(isTypeDeclaration)

  return [
    createExport(name as TSESTree.Identifier, isTypeOnly ? 'type' : 'data'),
  ]
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
): ModuleExport[] {
  if (declarator.id.type === 'Identifier') {
    let isCallableValue =
      declarator.init !== null &&
      isCallable(unwrapTypeWrappers(declarator.init))
    return [createExport(declarator.id, isCallableValue ? 'callable' : 'data')]
  }

  return getPatternIdentifiers(declarator.id).map(identifier =>
    createExport(identifier, 'data'),
  )
}

/**
 * Turns the value of a default export into an export with a name. Only a
 * function or a class with its own name gives one: the local name of an object
 * or a call is incidental, as in `const config = {}; export default config`.
 *
 * @param node - Exported declaration or expression.
 * @param localKinds - Kinds of the top-level bindings of the module.
 * @returns Export, or `null` when the default export has no name.
 */
function getDefaultExport(
  node: TSESTree.Node,
  localKinds: Map<string, ExportKind>,
): ModuleExport | null {
  let target = unwrapTypeWrappers(node)

  if (target.type === 'Identifier') {
    return localKinds.get(target.name) === 'callable' ?
        createExport(target, 'callable')
      : null
  }

  if (isCallable(target)) {
    return target.id ? createExport(target.id, 'callable') : null
  }

  return null
}

/**
 * Adds an export. When a name is already known, the declaration with the
 * stronger kind wins, so a class merged with an interface counts as the class
 * and keeps the position of the class among the exports.
 *
 * @param exports - Exports by name.
 * @param moduleExport - Export to add.
 */
function addExport(
  exports: Map<string, ModuleExport>,
  moduleExport: ModuleExport,
): void {
  let existing = exports.get(moduleExport.name)

  if (
    !existing ||
    EXPORT_KIND_RANKS[moduleExport.kind] > EXPORT_KIND_RANKS[existing.kind]
  ) {
    exports.delete(moduleExport.name)
    exports.set(moduleExport.name, moduleExport)
  }
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
 * Creates an export from an identifier. The location covers only the name: the
 * identifier of a typed variable also spans its type annotation.
 *
 * @param identifier - Identifier that names the binding.
 * @param kind - How the binding counts.
 * @returns Name, location and kind of the binding.
 */
function createExport(
  identifier: TSESTree.Identifier,
  kind: ExportKind,
): ModuleExport {
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
