/*
  eslint perfectionist/sort-objects: [
    'error',
    {
      type: 'alphabetical',
      order: 'asc',
      partitionByNewLine: true
    }
  ]
*/

import type { Linter } from 'eslint'

import type { ConfigOptions } from '..'

import { interopDefault } from '../utils'

export let typescript = async (
  config: ConfigOptions,
): Promise<Linter.Config> => {
  if (!config.typescript) {
    return {}
  }

  let { parser: typescriptParser, plugin: typescriptPlugin } =
    await interopDefault(import('typescript-eslint'))

  let files = ['**/*.ts', '**/*.cts', '**/*.mts']

  if (config.react || config.qwik) {
    files.push('**/*.tsx')
  }

  if (config.astro) {
    files.push('**/*.astro')
  }

  if (config.svelte) {
    files.push('**/*.svelte')
  }

  if (config.vue) {
    files.push('**/*.vue')
  }

  return {
    files,

    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: config.react || config.qwik,
        },
        ecmaVersion: 'latest',
        projectService: true,
        sourceType: 'module',
        tsconfigRootDir: process.cwd(),
      },
    },

    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },

    rules: {
      /**
       * Require consistently using either `T[]` or `Array<T>` for arrays.
       */
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
          readonly: 'array',
        },
      ],
      /**
       * Disallow awaiting a value that is not a Thenable.
       */
      '@typescript-eslint/await-thenable': 'error',
      /**
       * Enforce that literals on classes are exposed in a consistent style.
       */
      '@typescript-eslint/class-literal-property-style': 'error',
      /**
       * Enforce specifying generic type arguments on constructor name of a
       * constructor call.
       */
      '@typescript-eslint/consistent-generic-constructors': [
        'error',
        'constructor',
      ],
      /**
       * Require the `Record` type.
       */
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
      /**
       * Enforce using `interface` for object type definitions.
       */
      '@typescript-eslint/consistent-type-definitions': 'error',
      /**
       * Enforce consistent usage of type exports.
       */
      '@typescript-eslint/consistent-type-exports': 'error',
      /**
       * Enforce consistent usage of type imports.
       */
      '@typescript-eslint/consistent-type-imports': 'error',
      /**
       * Enforce default parameters to be last.
       */
      '@typescript-eslint/default-param-last': 'error',
      /**
       * Enforce dot notation whenever possible.
       */
      '@typescript-eslint/dot-notation': 'error',
      /**
       * Require explicit return types on functions and class methods.
       */
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          // https://github.com/withastro/compiler/issues/554
          allowedNames: config.astro ? ['getStaticPaths'] : [],
          allowExpressions: true,
          allowHigherOrderFunctions: true,
          allowIIFEs: true,
        },
      ],
      /**
       * Require explicit accessibility modifiers on class properties and
       * methods.
       */
      '@typescript-eslint/explicit-member-accessibility': 'error',
      /**
       * Require explicit return and argument types on exported functions' and
       * classes' public class methods.
       */
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          // https://github.com/withastro/compiler/issues/554
          allowedNames: config.astro ? ['getStaticPaths'] : [],
        },
      ],
      /**
       * Enforce a maximum number of parameters in function definitions.
       */
      '@typescript-eslint/max-params': [
        'error',
        {
          max: 3,
        },
      ],
      /**
       * Enforce using property signature for functions.
       */
      '@typescript-eslint/method-signature-style': ['error', 'method'],
      /**
       * Enforce naming conventions for everything across a codebase.
       */
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          selector: 'import',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['const'],
          selector: 'variable',
        },
        {
          format: ['PascalCase', 'UPPER_CASE'],
          selector: 'typeLike',
        },
      ],
      /**
       * Disallow generic `Array` constructors.
       */
      '@typescript-eslint/no-array-constructor': 'error',
      /**
       * Disallow using the `delete` operator on array values.
       */
      '@typescript-eslint/no-array-delete': 'error',
      /**
       * Require `.toString()` and `.toLocaleString()` to only be called on
       * objects which provide useful information when stringified.
       */
      '@typescript-eslint/no-base-to-string': 'error',
      /**
       * Disallow duplicate enum member values.
       */
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      /**
       * Disallow duplicate constituents of union or intersection types.
       */
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      /**
       * Disallow accidentally using the "empty object" type.
       */
      '@typescript-eslint/no-empty-object-type': 'error',
      /**
       * Disallow the `any` type.
       */
      '@typescript-eslint/no-explicit-any': 'error',
      /**
       * Disallow extra non-null assertions.
       */
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      /**
       * Require Promise-like statements to be handled appropriately.
       */
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            {
              from: 'package',
              name: ['task'],
              package: 'nanostores',
            },
          ],
          checkThenables: true,
          ignoreIIFE: true,
          ignoreVoid: true,
        },
      ],
      /**
       * Disallow iterating over an array with a for-in loop.
       */
      '@typescript-eslint/no-for-in-array': 'error',
      /**
       * Disallow the use of `eval()`-like methods.
       */
      '@typescript-eslint/no-implied-eval': 'error',
      /**
       * Enforce the use of top-level import type qualifier when an import only
       * has specifiers with inline type qualifiers.
       */
      '@typescript-eslint/no-import-type-side-effects': 'error',
      /**
       * Disallow `void` type outside of generic or return types.
       */
      '@typescript-eslint/no-invalid-void-type': 'error',
      /**
       * Disallow function declarations that contain unsafe references inside
       * loop statements.
       */
      '@typescript-eslint/no-loop-func': 'error',
      /**
       * Disallow the `void` operator except when used to discard a value.
       */
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      /**
       * Enforce valid definition of `new` and `constructor`.
       */
      '@typescript-eslint/no-misused-new': 'error',
      /**
       * Disallow Promises in places not designed to handle them.
       */
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      /**
       * Disallow enums from having both number and string members.
       */
      '@typescript-eslint/no-mixed-enums': 'error',
      /**
       * Disallow TypeScript namespaces.
       */
      '@typescript-eslint/no-namespace': 'error',
      /**
       * Disallow non-null assertions in the left operand of a nullish
       * coalescing operator.
       */
      '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
      /**
       * Disallow non-null assertions after an optional chain expression.
       */
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      /**
       * Disallow invocation of `require()`.
       */
      '@typescript-eslint/no-require-imports': 'error',
      /**
       * Disallow variable declarations from shadowing variables declared in the
       * outer scope.
       */
      '@typescript-eslint/no-shadow': 'error',
      /**
       * Disallow aliasing `this`.
       */
      '@typescript-eslint/no-this-alias': 'error',
      /**
       * Disallow unnecessary equality comparisons against boolean literals.
       */
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      /**
       * Disallow conditionals where the type is always truthy or always falsy.
       */
      '@typescript-eslint/no-unnecessary-condition': 'error',
      /**
       * Disallow unnecessary assignment of constructor property parameter.
       */
      '@typescript-eslint/no-unnecessary-parameter-property-assignment':
        'error',
      /**
       * Disallow unnecessary namespace qualifiers.
       */
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      /**
       * Disallow unnecessary template expressions.
       */
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      /**
       * Disallow type arguments that are equal to the default.
       */
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      /**
       * Disallow type assertions that do not change the type of an expression.
       */
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      /**
       * Disallow unnecessary constraints on generic types.
       */
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      /**
       * Disallow type parameters that aren't used multiple times.
       */
      '@typescript-eslint/no-unnecessary-type-parameters': 'error',
      /**
       * Disallow calling a function with a value with type `any`.
       */
      '@typescript-eslint/no-unsafe-argument': 'error',
      /**
       * Disallow assigning a value with type `any` to variables and properties.
       */
      '@typescript-eslint/no-unsafe-assignment':
        // https://github.com/ota-meshi/eslint-plugin-astro/issues/341
        config.astro ? 'off' : 'error',
      /**
       * Disallow calling a value with type `any`.
       */
      '@typescript-eslint/no-unsafe-call': 'error',
      /**
       * Disallow unsafe declaration merging.
       */
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      /**
       * Disallow using the unsafe built-in Function type.
       */
      '@typescript-eslint/no-unsafe-function-type': 'error',
      /**
       * Disallow member access on a value with type `any`.
       */
      '@typescript-eslint/no-unsafe-member-access': 'error',
      /**
       * Disallow returning a value with type `any` from a function.
       */
      '@typescript-eslint/no-unsafe-return': 'error',
      /**
       * Require unary negation to take a number.
       */
      '@typescript-eslint/no-unsafe-unary-minus': 'error',
      /**
       * Disallow unused expressions.
       */
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true,
        },
      ],
      /**
       * Disallow unused variables.
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      /**
       * Disallow the use of variables before they are defined.
       */
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          classes: false,
          functions: false,
          variables: false,
        },
      ],
      /**
       * Disallow unnecessary constructors.
       */
      '@typescript-eslint/no-useless-constructor': 'error',
      /**
       * Disallow empty exports that don't change anything in a module file.
       */
      '@typescript-eslint/no-useless-empty-export': 'error',
      /**
       * Disallow using confusing built-in primitive class wrappers.
       */
      '@typescript-eslint/no-wrapper-object-types': 'error',
      /**
       * Enforce non-null assertions over explicit type casts.
       */
      '@typescript-eslint/non-nullable-type-assertion-style': 'error',
      /**
       * Disallow throwing non-`Error` values as exceptions.
       */
      '@typescript-eslint/only-throw-error': 'error',
      /**
       * Enforce the use of `as const` over literal type.
       */
      '@typescript-eslint/prefer-as-const': 'error',
      /**
       * Require destructuring from arrays and/or objects.
       */
      '@typescript-eslint/prefer-destructuring': 'error',
      /**
       * Require each enum member value to be explicitly initialized.
       */
      '@typescript-eslint/prefer-enum-initializers': 'error',
      /**
       * Enforce the use of `for-of` loop over the standard `for` loop where
       * possible.
       */
      '@typescript-eslint/prefer-for-of': 'error',
      /**
       * Enforce using function types instead of interfaces with call
       * signatures.
       */
      '@typescript-eslint/prefer-function-type': 'error',
      /**
       * Enforce using the nullish coalescing operator instead of logical
       * assignments or chaining.
       */
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      /**
       * Enforce using concise optional chain expressions instead of chained
       * logical ands, negated logical ors, or empty objects.
       */
      '@typescript-eslint/prefer-optional-chain': 'error',
      /**
       * Require using Error objects as Promise rejection reasons.
       */
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      /**
       * Require private members to be marked as `readonly` if they're never
       * modified outside of the constructor.
       */
      '@typescript-eslint/prefer-readonly': 'error',
      /**
       * Enforce using type parameter when calling `Array#reduce` instead of
       * casting.
       */
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      /**
       * Enforce that `this` is used when only `this` type is returned.
       */
      '@typescript-eslint/prefer-return-this-type': 'error',
      /**
       * Enforce that `get()` types should be assignable to their equivalent
       * `set()` type.
       */
      '@typescript-eslint/related-getter-setter-pairs': 'error',
      /**
       * Require `Array#sort` and `Array#toSorted` calls to always provide a
       * `compareFunction`.
       */
      '@typescript-eslint/require-array-sort-compare': 'error',
      /**
       * Disallow async functions which have no `await` expression.
       */
      '@typescript-eslint/require-await': 'error',
      /**
       * Require both operands of addition to be the same type and be `bigint`,
       * `number`, or `string`.
       */
      '@typescript-eslint/restrict-plus-operands': 'error',
      /**
       * Enforce template literal expressions to be of `string` type.
       */
      '@typescript-eslint/restrict-template-expressions': 'error',
      /**
       * Disallow certain triple slash directives in favor of ES6-style import
       * declarations.
       */
      '@typescript-eslint/triple-slash-reference': config.astro
        ? 'off'
        : 'error',
      /**
       * Disallow two overloads that could be unified into one with a union or
       * an optional/rest parameter.
       */
      '@typescript-eslint/unified-signatures': 'error',
      /**
       * The code problems checked by this ESLint rule is automatically checked
       * by the TypeScript compiler.
       */
      'consistent-return': 'off',
      'default-param-last': 'off',
      'dot-notation': 'off',
      'max-params': 'off',
      'no-array-constructor': 'off',
      'no-dupe-class-members': 'off',
      'no-implied-eval': 'off',
      'no-loop-func': 'off',
      'no-shadow': 'off',
      'no-undef': 'off',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'prefer-destructuring': 'off',
      'require-await': 'off',
    },

    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
  }
}
