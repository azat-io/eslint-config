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

import eslintCommentsPlugin from '@eslint-community/eslint-plugin-eslint-comments'
import preferArrowPlugin from 'eslint-plugin-prefer-arrow'
import preferLetPlugin from 'eslint-plugin-prefer-let'
import importXPlugin from 'eslint-plugin-import-x'
import promisePlugin from 'eslint-plugin-promise'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import unicornPlugin from 'eslint-plugin-unicorn'
import regexpPlugin from 'eslint-plugin-regexp'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import globals from 'globals'

import type { ConfigOptions } from '..'

export let core = (config: ConfigOptions): Linter.Config => {
  let files = ['**/*.js', '**/*.cjs', '**/*.mjs']

  if (config.typescript) {
    files.push('**/*.ts', '**/*.cts', '**/*.mts')
  }

  if (config.react || config.qwik) {
    files.push('**/*.jsx')

    if (config.typescript) {
      files.push('**/*.tsx')
    }
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
    name: 'azat-io/core/rules',

    files,

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2025,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    plugins: {
      'eslint-comments': eslintCommentsPlugin,
      'import-x': importXPlugin,
      jsdoc: jsdocPlugin,
      'prefer-arrow': preferArrowPlugin,
      'prefer-let': preferLetPlugin,
      promise: promisePlugin,
      regexp: regexpPlugin,
      sonarjs: sonarjsPlugin,
      unicorn: unicornPlugin,
    },

    rules: {
      /**
       * Require property getters and setters to come in pairs.
       */
      'accessor-pairs': 'error',
      /**
       * Enforce `return` statements in callbacks of array methods.
       */
      'array-callback-return': [
        'error',
        {
          allowImplicit: false,
          checkForEach: false,
        },
      ],
      /**
       * Require braces around arrow function bodies only if needed.
       */
      'arrow-body-style': ['error', 'as-needed'],
      /**
       * Require to use camelcase.
       */
      camelcase: [
        'error',
        {
          ignoreGlobals: true,
          properties: 'always',
        },
      ],
      /**
       * Enforce capitalization of the first letter of a comment
       */
      'capitalized-comments': [
        'error',
        'always',
        {
          ignorePattern: 'c8|v8|spell-checker',
        },
      ],
      /**
       * Enforce that class methods utilize `this` or use `static` methods.
       */
      'class-methods-use-this': 'error',
      /**
       * Require `return` statements to either always or never specify values.
       */
      'consistent-return': 'error',
      /**
       * Require `super()` calls in constructors.
       */
      'constructor-super': 'error',
      /**
       * Require to use curly braces.
       */
      curly: ['error', 'all'],
      /**
       * Require `default` clauses in `switch` statements to be last.
       */
      'default-case-last': 'error',
      /**
       * Enforce default parameters to be last.
       */
      'default-param-last': 'error',
      /**
       * Require to use dot notation whenever possible.
       */
      'dot-notation': 'error',
      /**
       * Require the use of `===` and `!==`.
       */
      eqeqeq: 'error',
      /**
       * Enforce `for` loop update clause moving the counter in the right
       * direction.
       */
      'for-direction': 'error',
      /**
       * Disallow named function expressions.
       */
      'func-names': ['error', 'never'],
      /**
       * Enforce return statements in getters.
       */
      'getter-return': 'error',
      /**
       * Enforce minimum identifier lengths.
       */
      'id-length': [
        'error',
        {
          exceptions: ['_', 'a', 'b', 'i', 'j', 't', 'x', 'y', 'z'],
          min: 2,
          properties: 'never',
        },
      ],
      /**
       * Require logical assignment operator shorthand.
       */
      'logical-assignment-operators': ['error', 'always'],
      /**
       * Enforce a maximum number of parameters in function definitions.
       */
      'max-params': [
        'error',
        {
          max: 3,
        },
      ],
      /**
       * Require constructor names to begin with a capital letter.
       */
      'new-cap': [
        'error',
        {
          capIsNew: false,
          newIsCap: true,
          properties: true,
        },
      ],
      /**
       * Disallow the use of `alert`, `confirm`, and `prompt`.
       */
      'no-alert': 'error',
      /**
       * Disallow `Array` constructors.
       */
      'no-array-constructor': 'error',
      /**
       * Disallow using an async function as a Promise executor.
       */
      'no-async-promise-executor': 'error',
      /**
       * Disallow await inside of loops.
       */
      'no-await-in-loop': 'error',
      /**
       * Disallow the use of `arguments.caller` or `arguments.callee`.
       */
      'no-caller': 'error',
      /**
       * Disallow lexical declarations in case clauses.
       */
      'no-case-declarations': 'error',
      /**
       * Disallow reassigning class members.
       */
      'no-class-assign': 'error',
      /**
       * Disallow comparing against -0.
       */
      'no-compare-neg-zero': 'error',
      /**
       * Disallow assignment operators in conditional expressions.
       */
      'no-cond-assign': 'error',
      /**
       * Disallow the use of `console`.
       */
      'no-console': [
        'error',
        {
          allow: ['error', 'warn', 'info'],
        },
      ],
      /**
       * Disallow reassigning `const` variables.
       */
      'no-const-assign': 'error',
      /**
       * Disallow expressions where the operation doesn't affect the value.
       */
      'no-constant-binary-expression': 'error',
      /**
       * Disallow constant expressions in conditions.
       */
      'no-constant-condition': 'error',
      /**
       * Disallow returning value from constructor.
       */
      'no-constructor-return': 'error',
      /**
       * Disallow control characters in regular expressions.
       */
      'no-control-regex': 'error',
      /**
       * Disallow the use of `debugger`.
       */
      'no-debugger': 'error',
      /**
       * Disallow deleting variables.
       */
      'no-delete-var': 'error',
      /**
       * Disallow duplicate `arguments` in function definitions.
       */
      'no-dupe-args': 'error',
      /**
       * Disallow duplicate class members.
       */
      'no-dupe-class-members': 'error',
      /**
       * Disallow duplicate conditions in if-else-if chains.
       */
      'no-dupe-else-if': 'error',
      /**
       * Disallow duplicate keys in object literals.
       */
      'no-dupe-keys': 'error',
      /**
       * Disallow duplicate case labels.
       */
      'no-duplicate-case': 'error',
      /**
       * Disallow `else` blocks after return statements in `if` statements.
       */
      'no-else-return': 'error',
      /**
       * Disallow empty block statements.
       */
      'no-empty': [
        'error',
        {
          allowEmptyCatch: true,
        },
      ],
      /**
       * Disallow empty character classes in regular expressions.
       */
      'no-empty-character-class': 'error',
      /**
       * Disallow empty destructuring patterns.
       */
      'no-empty-pattern': 'error',
      /**
       * Disallow empty static blocks.
       */
      'no-empty-static-block': 'error',
      /**
       * Disallow the use of `eval()`.
       */
      'no-eval': 'error',
      /**
       * Disallow reassigning exceptions in catch clauses.
       */
      'no-ex-assign': 'error',
      /**
       * Disallow extending native types.
       */
      'no-extend-native': 'error',
      /**
       * Disallow unnecessary calls to `.bind()`.
       */
      'no-extra-bind': 'error',
      /**
       * Disallow unnecessary boolean casts.
       */
      'no-extra-boolean-cast': 'error',
      /**
       * Disallow unnecessary labels.
       */
      'no-extra-label': 'error',
      /**
       * Disallow fallthrough of case statements.
       */
      'no-fallthrough': 'error',
      /**
       * Disallow reassigning `function` declarations.
       */
      'no-func-assign': 'error',
      /**
       * Disallow assignments to native objects or read-only global variables.
       */
      'no-global-assign': 'error',
      /**
       * Disallow the use of `eval()`-like methods.
       */
      'no-implied-eval': 'error',
      /**
       * Disallow assigning to imported bindings.
       */
      'no-import-assign': 'error',
      /**
       * Disallow invalid regular expression strings in `RegExp` constructors.
       */
      'no-invalid-regexp': 'error',
      /**
       * Disallow irregular whitespace.
       */
      'no-irregular-whitespace': [
        'error',
        {
          skipComments: true,
          skipJSXText: true,
          skipRegExps: true,
          skipStrings: true,
          skipTemplates: true,
        },
      ],
      /**
       * Disallow the use of the `__iterator__` property.
       */
      'no-iterator': 'error',
      /**
       * Disallow labels that share a name with a variable.
       */
      'no-label-var': 'error',
      /**
       * Disallow labeled statements.
       */
      'no-labels': [
        'error',
        {
          allowLoop: false,
          allowSwitch: false,
        },
      ],
      /**
       * Disallow unnecessary nested blocks.
       */
      'no-lone-blocks': 'error',
      /**
       * Disallow function declarations that contain unsafe references inside
       * loop statements.
       */
      'no-loop-func': 'error',
      /**
       * Disallow literal numbers that lose precision.
       */
      'no-loss-of-precision': 'error',
      /**
       * Disallow use of chained assignment expressions.
       */
      'no-multi-assign': 'error',
      /**
       * Disallow multiline strings.
       */
      'no-multi-str': 'error',
      /**
       * Disallow nested ternary expressions.
       */
      'no-nested-ternary': 'error',
      /**
       * Disallow `new` operators outside of assignments or comparisons.
       */
      'no-new': 'error',
      /**
       * Disallow `new` operators with the Function object.
       */
      'no-new-func': 'error',
      /**
       * Disallow `new` operators with global non-constructor functions.
       */
      'no-new-native-nonconstructor': 'error',
      /**
       * Disallow `new` operators with the `String`, `Number`, and `Boolean`
       * objects.
       */
      'no-new-wrappers': 'error',
      /**
       * Disallow `\8` and `\9` escape sequences in string literals.
       */
      'no-nonoctal-decimal-escape': 'error',
      /**
       * Disallow calling global object properties as functions.
       */
      'no-obj-calls': 'error',
      /**
       * Disallow calls to the Object constructor without an argument.
       */
      'no-object-constructor': 'error',
      /**
       * Disallow octal literals.
       */
      'no-octal': 'error',
      /**
       * Disallow octal escape sequences in string literals.
       */
      'no-octal-escape': 'error',
      /**
       * Disallow reassigning function parameters.
       */
      'no-param-reassign': 'error',
      /**
       * Disallow returning values from Promise executor functions.
       */
      'no-promise-executor-return': 'error',
      /**
       * Disallow the use of the `__proto__` property.
       */
      'no-proto': 'error',
      /**
       * Disallow calling some `Object.prototype` methods directly on objects.
       */
      'no-prototype-builtins': 'error',
      /**
       * Disallow variable redeclaration.
       */
      'no-redeclare': 'error',
      /**
       * Disallow multiple spaces in regular expressions.
       */
      'no-regex-spaces': 'error',
      /**
       * Disallow assignment operators in return statements.
       */
      'no-return-assign': ['error', 'except-parens'],
      /**
       * Disallow assignments where both sides are exactly the same.
       */
      'no-self-assign': [
        'error',
        {
          props: true,
        },
      ],
      /**
       * Disallow comparisons where both sides are exactly the same.
       */
      'no-self-compare': 'error',
      /**
       * Disallow returning values from setters.
       */
      'no-setter-return': 'error',
      /**
       * Disallow variable declarations from shadowing variables declared in the
       * outer scope.
       */
      'no-shadow': 'error',
      /**
       * Disallow identifiers from shadowing restricted names.
       */
      'no-shadow-restricted-names': 'error',
      /**
       * Disallow sparse arrays.
       */
      'no-sparse-arrays': 'error',
      /**
       * Disallow template literal placeholder syntax in regular strings.
       */
      'no-template-curly-in-string': 'error',
      /**
       * Disallow `this`/`super` before calling `super()` in constructors.
       */
      'no-this-before-super': 'error',
      /**
       * Disallow throwing literals as exceptions.
       */
      'no-throw-literal': 'error',
      /**
       * Disallow the use of undeclared variables unless mentioned in
       * `\/*global *\/` comments.
       */
      'no-undef': 'error',
      /**
       * Disallow initializing variables to undefined.
       */
      'no-undef-init': 'error',
      /**
       * Disallow the use of `undefined` as an identifier.
       */
      'no-undefined': 'error',
      /**
       * Disallow confusing multiline expressions.
       */
      'no-unexpected-multiline': 'error',
      /**
       * Disallow infinite loops.
       */
      'no-unmodified-loop-condition': 'error',
      /**
       * Disallow ternary operators when simpler alternatives exist.
       */
      'no-unneeded-ternary': [
        'error',
        {
          defaultAssignment: false,
        },
      ],
      /**
       * Disallow unreachable code after `return`, `throw`, `continue`, and
       * `break` statements.
       */
      'no-unreachable': 'error',
      /**
       * Disallow loops with a body that allows only one iteration.
       */
      'no-unreachable-loop': 'error',
      /**
       * Disallow control flow statements in finally blocks.
       */
      'no-unsafe-finally': 'error',
      /**
       * Disallow negating the left operand of relational operators.
       */
      'no-unsafe-negation': 'error',
      /**
       * Disallow use of optional chaining in contexts where the `undefined`
       * value is not allowed.
       */
      'no-unsafe-optional-chaining': 'error',
      /**
       * Disallow unused expressions.
       */
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true,
        },
      ],
      /**
       * Disallow unused labels.
       */
      'no-unused-labels': 'error',
      /**
       * Disallow unused private class members.
       */
      'no-unused-private-class-members': 'error',
      /**
       * Disallow unused variables.
       */
      'no-unused-vars': [
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
      'no-use-before-define': [
        'error',
        {
          classes: false,
          functions: false,
          variables: false,
        },
      ],
      /**
       * Disallow variable assignments when the value is not used.
       */
      'no-useless-assignment':
        config.astro || config.react || config.qwik ? 'off' : 'error',
      /**
       * Disallow useless backreferences in regular expressions.
       */
      'no-useless-backreference': 'error',
      /**
       * Disallow unnecessary calls to `.call()` and `.apply()`.
       */
      'no-useless-call': 'error',
      /**
       * Disallow unnecessary catch clauses.
       */
      'no-useless-catch': 'error',
      /**
       * Disallow unnecessary computed property keys in objects and classes.
       */
      'no-useless-computed-key': 'error',
      /**
       * Disallow unnecessary concatenation of literals or template literals.
       */
      'no-useless-concat': 'error',
      /**
       * Disallow unnecessary constructors.
       */
      'no-useless-constructor': 'error',
      /**
       * Disallow unnecessary escape characters.
       */
      'no-useless-escape': 'error',
      /**
       * Disallow renaming import, export, and destructured assignments to the
       * same name.
       */
      'no-useless-rename': 'error',
      /**
       * Disallow redundant return statements.
       */
      'no-useless-return': 'error',
      /**
       * Require `let` or `const` instead of `var`.
       */
      'no-var': 'error',
      /**
       * Disallow `void` operators.
       */
      'no-void': 'error',
      /**
       * Disallow `with` statements.
       */
      'no-with': 'error',
      /**
       * Require method and property shorthand syntax for object literals.
       */
      'object-shorthand': ['error', 'always'],
      /**
       * Enforce variables to be declared either together or separately in
       * functions.
       */
      'one-var': [
        'error',
        {
          initialized: 'never',
        },
      ],
      /**
       * Require assignment operator shorthand where possible
       */
      'operator-assignment': ['error', 'always'],
      /**
       * Require using arrow functions for callbacks.
       */
      'prefer-arrow-callback': 'error',
      /**
       * Require destructuring from arrays and/or objects.
       */
      'prefer-destructuring': 'error',
      /**
       * Disallow the use of `Math.pow` in favor of the `**` operator.
       */
      'prefer-exponentiation-operator': 'error',
      /**
       * Enforce using named capture group in regular expression.
       */
      'prefer-named-capture-group': 'error',
      /**
       * Disallow `parseInt()` and `Number.parseInt()` in favor of binary,
       * octal, and hexadecimal literals
       */
      'prefer-numeric-literals': 'error',
      /**
       * Disallow use of `Object.prototype.hasOwnProperty.call()` and prefer use
       * of `Object.hasOwn()`.
       */
      'prefer-object-has-own': 'error',
      /**
       * Disallow using `Object.assign` with an object literal as the first
       * argument and prefer the use of object spread instead.
       */
      'prefer-object-spread': 'error',
      /**
       * Require using Error objects as Promise rejection reasons.
       */
      'prefer-promise-reject-errors': 'error',
      /**
       * Disallow use of the `RegExp` constructor in favor of regular expression
       * literals.
       */
      'prefer-regex-literals': [
        'error',
        {
          disallowRedundantWrapping: true,
        },
      ],
      /**
       * Require rest parameters instead of arguments.
       */
      'prefer-rest-params': 'error',
      /**
       * Require spread operators instead of `.apply()`.
       */
      'prefer-spread': 'error',
      /**
       * Require template literals instead of string concatenation.
       */
      'prefer-template': 'error',
      /**
       * Disallow async functions which have no `await` expression.
       */
      'require-await': 'error',
      /**
       * Require generator functions to contain `yield`.
       */
      'require-yield': 'error',
      /**
       * Disallow strict mode directives.
       */
      strict: ['error', 'never'],
      /**
       * Require symbol descriptions.
       */
      'symbol-description': 'error',
      /**
       * Require calls to `isNaN()` when checking for `NaN`.
       */
      'use-isnan': [
        'error',
        {
          enforceForIndexOf: true,
          enforceForSwitchCase: true,
        },
      ],
      /**
       * Enforce comparing `typeof` expressions against valid strings.
       */
      'valid-typeof': [
        'error',
        {
          requireStringLiterals: true,
        },
      ],
      /**
       * Disallow "Yoda" conditions.
       */
      yoda: ['error', 'never'],

      /**
       * Require a `eslint-enable` comment for every `eslint-disable` comment.
       */
      'eslint-comments/disable-enable-pair': 'error',
      /**
       * Disallow a `eslint-enable` comment for multiple `eslint-disable` comments.
       */
      'eslint-comments/no-aggregating-enable': 'error',
      /**
       * Disallow duplicate `eslint-disable` comments.
       */
      'eslint-comments/no-duplicate-disable': 'error',
      /**
       * Disallow `eslint-disable` comments without rule names.
       */
      'eslint-comments/no-unlimited-disable': 'error',
      /**
       * Disallow unused `eslint-disable` comments.
       */
      'eslint-comments/no-unused-disable': 'error',
      /**
       * Disallow unused `eslint-enable` comments.
       */
      'eslint-comments/no-unused-enable': 'error',

      /**
       * Require that type-only named specifiers be written only as part of
       * high-level type-only imports and never with an embedded marker.
       */
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      /**
       * Forbid any invalid exports.
       */
      'import-x/export': 'error',
      /**
       * Require all imports appear before other statements.
       */
      'import-x/first': 'error',
      /**
       * Enforce having one or more empty lines after the last top-level import
       * statement or require call.
       */
      'import-x/newline-after-import': 'error',
      /**
       * Forbid the import of modules using absolute paths.
       */
      'import-x/no-absolute-path': 'error',
      /**
       * Report `require([array], ...)` and `define([array], ...)` function
       * calls at the module scope.
       */
      'import-x/no-amd': 'error',
      /**
       * Forbid empty named import blocks.
       */
      'import-x/no-empty-named-blocks': 'error',
      /**
       * Forbid the import of external modules that are not declared in the
       * `package.json`.
       */
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
      /**
       * Disallow usage of import declarations with CommonJS exports.
       */
      'import-x/no-import-module-exports': 'error',
      /**
       * Forbid named default exports..
       */
      'import-x/no-named-default': 'error',
      /**
       * Forbid a module from importing itself.
       */
      'import-x/no-self-import': 'error',
      /**
       * Forbid unnecessary path segments in import and require statements.
       */
      'import-x/no-useless-path-segments': 'error',
      /**
       * Forbid webpack loader syntax in imports.
       */
      'import-x/no-webpack-loader-syntax': 'error',

      /**
       * Check that `@access` tags use one of the following values: `"package"`,
       * `"private"`, `"protected"`, `"public"`.
       */
      'jsdoc/check-access': 'error',
      /**
       * Report invalid alignment of JSDoc block asterisks.
       */
      'jsdoc/check-alignment': 'error',
      /**
       * Report invalid padding inside JSDoc blocks.
       */
      'jsdoc/check-indentation': 'error',
      /**
       * Report invalid alignment of JSDoc block lines.
       */
      'jsdoc/check-line-alignment': 'error',
      /**
       * Ensure that parameter names in JSDoc are matched by corresponding items
       * in the function declaration.
       */
      'jsdoc/check-param-names': 'error',
      /**
       * Ensure that property names in JSDoc are not duplicated on the same
       * block and that nested properties have defined roots.
       */
      'jsdoc/check-property-names': 'error',
      /**
       * Report if syntax not encouraged for the mode of JSDoc.
       */
      'jsdoc/check-syntax': 'error',
      /**
       * Report if block tag names are invalid.
       */
      'jsdoc/check-tag-names': 'error',
      /**
       * Check that any `@template` names are actually used in the connected
       * `@typedef`, `@callback`, `@function` or type structure.
       */
      'jsdoc/check-template-names': 'error',
      /**
       * Report if types are invalid.
       */
      'jsdoc/check-types': 'error',
      /**
       * Check for expected content within some miscellaneous tags (`@version`,
       * `@since`, `@license`, `@author`)
       */
      'jsdoc/check-values': 'error',
      /**
       * Check tags that are expected to be empty (e.g., `@abstract` or
       * `@async`), reporting if they have content
       */
      'jsdoc/empty-tags': 'error',
      /**
       * Report an issue with any non-constructor function using `@implements`.
       */
      'jsdoc/implements-on-classes': 'error',
      /**
       * Report an issue if JSDoc `import()` statements point to a package which
       * is not listed in `dependencies` or `devDependencies`.
       */
      'jsdoc/imports-as-dependencies': 'error',
      /**
       * Report on JSDoc texts that serve only to restate their attached name.
       */
      'jsdoc/informative-docs': 'error',
      /**
       * Control how and whether jsdoc blocks can be expressed as single or
       * multiple line blocks.
       */
      'jsdoc/multiline-blocks': 'error',
      /**
       * Check for multi-line-style comments which fail to meet the criteria of
       * a JSDoc block.
       */
      'jsdoc/no-bad-blocks': 'error',
      /**
       * Prevent empty lines in the block description.
       */
      'jsdoc/no-blank-block-descriptions': 'error',
      /**
       * Report blocks with whitespace only.
       */
      'jsdoc/no-blank-blocks': 'error',
      /**
       * Report defaults being used on the relevant portion of `@param` or
       * `@default`.
       */
      'jsdoc/no-defaults': 'error',
      /**
       * Prevent usage of multiple asterisks at the beginning of lines.
       */
      'jsdoc/no-multi-asterisks': 'error',
      /**
       * Check that types in jsdoc comments are defined.
       */
      'jsdoc/no-undefined-types': 'error',
      /**
       * Requires that each JSDoc line starts with an `*`.
       */
      'jsdoc/require-asterisk-prefix': 'error',
      /**
       * Require that all functions (or optionally other structures) with a
       * JSDoc block have a description.
       */
      'jsdoc/require-description': 'error',
      /**
       * Require a hyphen before the `@param` description.
       */
      'jsdoc/require-hyphen-before-param-description': 'error',
      /**
       * Require that all function parameters are documented.
       */
      'jsdoc/require-param': 'error',
      /**
       * Require that each `@param` tag has a description value.
       */
      'jsdoc/require-param-description': 'error',
      /**
       * Require that all @param tags have names.
       */
      'jsdoc/require-param-name': 'error',
      /**
       * Require that each `@param` tag has a type value (within curly
       * brackets).
       */
      'jsdoc/require-param-type': 'error',
      /**
       * Requires that all `@typedef` and `@namespace` tags have `@property`
       * tags when their type is a plain `object`, `Object`, or `PlainObject`.
       */
      'jsdoc/require-property': 'error',
      /**
       * Require that each `@property` tag has a description value.
       */
      'jsdoc/require-property-description': 'error',
      /**
       * Require that all @property tags have names.
       */
      'jsdoc/require-property-name': 'error',
      /**
       * Require that each `@property` tag has a type value (within curly
       * brackets).
       */
      'jsdoc/require-property-type': 'error',
      /**
       * Require that return statements are documented.
       */
      'jsdoc/require-returns': 'error',
      /**
       * Require a return statement (or non-`undefined` Promise resolve value)
       * be present in a function body if a `@returns` tag.
       */
      'jsdoc/require-returns-check': 'error',
      /**
       * Require that the `@returns` tag has a description value.
       */
      'jsdoc/require-returns-description': 'error',
      /**
       * Require that `@returns` tag has a type value (in curly brackets).
       */
      'jsdoc/require-returns-type': 'error',
      /**
       * Ensure that if a `@yields` is present that a `yield`.
       */
      'jsdoc/require-yields-check': 'error',
      /**
       * Sort tags by a specified sequence according to tag name, optionally
       * adding line breaks between tag groups.
       */
      'jsdoc/sort-tags': 'error',
      /**
       * Enforce lines between tags.
       */
      'jsdoc/tag-lines': 'error',
      /**
       * Requires all types/namepaths to be valid JSDoc, Closure compiler, or
       * TypeScript types.
       */
      'jsdoc/valid-types': 'error',

      /**
       * Require to use arrow functions.
       */
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          classPropertiesAllowed: false,
          disallowPrototype: true,
          singleReturnOnly: false,
        },
      ],

      /**
       * Encourage semantic of usage of `let` and `const`.
       */
      'prefer-let/prefer-let': 'error',

      /**
       * Enforce the use of `catch()` on un-returned promises.
       */
      'promise/catch-or-return': 'error',
      /**
       * Disallow calling `cb()` inside of a `then()`.
       */
      'promise/no-callback-in-promise': 'error',
      /**
       * Disallow to create new promises with paths that resolve multiple times.
       */
      'promise/no-multiple-resolved': 'error',
      /**
       * Disallow nested then() or catch() statements.
       */
      'promise/no-nesting': 'error',
      /**
       * Disallow calling `new` on a Promise static method.
       */
      'promise/no-new-statics': 'error',
      /**
       * Disallow to use promises inside of callbacks.
       */
      'promise/no-promise-in-callback': 'error',
      /**
       * Disallow return statements in `finally()`.
       */
      'promise/no-return-in-finally': 'error',
      /**
       * Disallow wrapping values in `Promise.resolve` or `Promise.reject` when
       * not needed.
       */
      'promise/no-return-wrap': 'error',
      /**
       * Enforce consistent param names and ordering when creating new promises.
       */
      'promise/param-names': 'error',
      /**
       * Prefer `catch` to `then(a, b)`/`then(null, b)` for handling errors.
       */
      'promise/prefer-catch': 'error',
      /**
       * Disallow use of non-standard Promise static methods.
       */
      'promise/spec-only': 'error',
      /**
       * Check number of arguments are passed to Promise functions.
       */
      'promise/valid-params': 'error',

      /**
       * Disallow confusing quantifiers.
       */
      'regexp/confusing-quantifier': 'error',
      /**
       * Enforce consistent escaping of control characters.
       */
      'regexp/control-character-escape': 'error',
      /**
       * Enforce lowercase.
       */
      'regexp/letter-case': [
        'error',
        {
          caseInsensitive: 'lowercase',
          controlEscape: 'uppercase',
          hexadecimalEscape: 'lowercase',
          unicodeEscape: 'uppercase',
        },
      ],
      /**
       * Enforce match any character style.
       */
      'regexp/match-any': 'error',
      /**
       * Enforce use of escapes on negation.
       */
      'regexp/negation': 'error',
      /**
       * Disallow elements that contradict assertions.
       */
      'regexp/no-contradiction-with-assertion': 'error',
      /**
       * Disallow control characters.
       */
      'regexp/no-control-character': 'error',
      /**
       * Disallow duplicate characters in the RegExp character class.
       */
      'regexp/no-dupe-characters-character-class': 'error',
      /**
       * Disallow duplicate disjunctions.
       */
      'regexp/no-dupe-disjunctions': 'error',
      /**
       * Disallow alternatives without elements.
       */
      'regexp/no-empty-alternative': 'error',
      /**
       * Disallow capturing group that captures empty.
       */
      'regexp/no-empty-capturing-group': 'error',
      /**
       * Disallow character classes that match no characters.
       */
      'regexp/no-empty-character-class': 'error',
      /**
       * Disallow empty group.
       */
      'regexp/no-empty-group': 'error',
      /**
       * Disallow empty lookahead assertion or empty lookbehind assertion.
       */
      'regexp/no-empty-lookarounds-assertion': 'error',
      /**
       * Disallow empty string literals in character classes.
       */
      'regexp/no-empty-string-literal': 'error',
      /**
       * Disallow escape backspace `[\b]`.
       */
      'regexp/no-escape-backspace': 'error',
      /**
       * Disallow invalid regular expression strings in `RegExp` constructors.
       */
      'regexp/no-invalid-regexp': 'error',
      /**
       * Disallow invisible raw character.
       */
      'regexp/no-invisible-character': 'error',
      /**
       * Disallow lazy quantifiers at the end of an expression.
       */
      'regexp/no-lazy-ends': 'error',
      /**
       * Disallow legacy RegExp features.
       */
      'regexp/no-legacy-features': 'error',
      /**
       * Disallow capturing groups that do not behave as one would expect.
       */
      'regexp/no-misleading-capturing-group': 'error',
      /**
       * Disallow missing `g` flag in patterns used in `String#matchAll` and
       * `String#replaceAll`.
       */
      'regexp/no-missing-g-flag': 'error',
      /**
       * Disallow non-standard flags.
       */
      'regexp/no-non-standard-flag': 'error',
      /**
       * Disallow obscure character ranges.
       */
      'regexp/no-obscure-range': 'error',
      /**
       * Disallow octal escape sequence.
       */
      'regexp/no-octal': 'error',
      /**
       * Disallow optional assertions.
       */
      'regexp/no-optional-assertion': 'error',
      /**
       * Disallow backreferences that reference a group that might not be
       * matched.
       */
      'regexp/no-potentially-useless-backreference': 'error',
      /**
       * Disallow standalone backslashes `\`.
       */
      'regexp/no-standalone-backslash': 'error',
      /**
       * Disallow exponential and polynomial backtracking.
       */
      'regexp/no-super-linear-backtracking': 'error',
      /**
       * Disallow trivially nested assertions.
       */
      'regexp/no-trivially-nested-assertion': 'error',
      /**
       * Disallow nested quantifiers that can be rewritten as one quantifier.
       */
      'regexp/no-trivially-nested-quantifier': 'error',
      /**
       * Disallow unused capturing group.
       */
      'regexp/no-unused-capturing-group': 'error',
      /**
       * Disallow assertions that are known to always accept (or reject).
       */
      'regexp/no-useless-assertions': 'error',
      /**
       * Disallow useless backreferences in regular expressions.
       */
      'regexp/no-useless-backreference': 'error',
      /**
       * Disallow character class with one character.
       */
      'regexp/no-useless-character-class': 'error',
      /**
       * Disallow useless `$` replacements in replacement string.
       */
      'regexp/no-useless-dollar-replacements': 'error',
      /**
       * Disallow unnecessary escape characters in RegExp.
       */
      'regexp/no-useless-escape': 'error',
      /**
       * Disallow unnecessary regex flags.
       */
      'regexp/no-useless-flag': 'error',
      /**
       * Disallow unnecessarily non-greedy quantifiers.
       */
      'regexp/no-useless-lazy': 'error',
      /**
       * Disallow unnecessary non-capturing group.
       */
      'regexp/no-useless-non-capturing-group': 'error',
      /**
       * Disallow quantifiers that can be removed.
       */
      'regexp/no-useless-quantifier': 'error',
      /**
       * Disallow unnecessary character ranges.
       */
      'regexp/no-useless-range': 'error',
      /**
       * Disallow unnecessary elements in expression character classes.
       */
      'regexp/no-useless-set-operand': 'error',
      /**
       * Disallow string disjunction of single characters in `\q{...}`.
       */
      'regexp/no-useless-string-literal': 'error',
      /**
       * Disallow unnecessary `{n,m}` quantifier.
       */
      'regexp/no-useless-two-nums-quantifier': 'error',
      /**
       * Disallow quantifiers with a maximum of zero.
       */
      'regexp/no-zero-quantifier': 'error',
      /**
       * Disallow the alternatives of lookarounds that end with a non-constant
       * quantifier.
       */
      'regexp/optimal-lookaround-quantifier': 'error',
      /**
       * Require optimal quantifiers for concatenated quantifiers.
       */
      'regexp/optimal-quantifier-concatenation': 'error',
      /**
       * Enforce using character class.
       */
      'regexp/prefer-character-class': 'error',
      /**
       * Enforce using `\d`.
       */
      'regexp/prefer-d': 'error',
      /**
       * Enforce escape of replacement `$` character `$$`.
       */
      'regexp/prefer-escape-replacement-dollar-char': 'error',
      /**
       * Prefer lookarounds over capturing group that do not replace.
       */
      'regexp/prefer-lookaround': 'error',
      /**
       * Enforce using named backreferences.
       */
      'regexp/prefer-named-backreference': 'error',
      /**
       * Enforce using named capture groups.
       */
      'regexp/prefer-named-capture-group': 'error',
      /**
       * Enforce using named replacement.
       */
      'regexp/prefer-named-replacement': 'error',
      /**
       * Enforce using `+` quantifier.
       */
      'regexp/prefer-plus-quantifier': 'error',
      /**
       * Prefer predefined assertion over equivalent lookarounds.
       */
      'regexp/prefer-predefined-assertion': 'error',
      /**
       * Enforce using quantifier.
       */
      'regexp/prefer-quantifier': 'error',
      /**
       * Enforce using `?` quantifier.
       */
      'regexp/prefer-question-quantifier': 'error',
      /**
       * Enforce using character class range.
       */
      'regexp/prefer-range': 'error',
      /**
       * Prefer character class set operations instead of lookarounds.
       */
      'regexp/prefer-set-operation': 'error',
      /**
       * Enforce using `*` quantifier.
       */
      'regexp/prefer-star-quantifier': 'error',
      /**
       * Enforce use of unicode codepoint escapes.
       */
      'regexp/prefer-unicode-codepoint-escapes': 'error',
      /**
       * Enforce using `\w`.
       */
      'regexp/prefer-w': 'error',
      /**
       * Enforce the use of the `u` flag.
       */
      'regexp/require-unicode-regexp': 'error',
      /**
       * Require simplify set operations.
       */
      'regexp/simplify-set-operations': 'error',
      /**
       * Sort alternatives if order doesn't matter.
       */
      'regexp/sort-alternatives': 'error',
      /**
       * Enforces elements order in character class.
       */
      'regexp/sort-character-class-elements': 'error',
      /**
       * Require regex flags to be sorted.
       */
      'regexp/sort-flags': 'error',
      /**
       * Disallow not strictly valid regular expressions.
       */
      'regexp/strict': 'error',
      /**
       * Enforce consistent usage of unicode escape or unicode codepoint escape.
       */
      'regexp/unicode-escape': 'error',
      /**
       * Enforce consistent naming of unicode properties.
       */
      'regexp/unicode-property': 'error',
      /**
       * Use the `i` flag if it simplifies the pattern.
       */
      'regexp/use-ignore-case': 'error',

      /**
       * Require parameters to be passed in the correct order.
       */
      'sonarjs/arguments-order': 'error',
      /**
       * Require callbacks of array methods to have return statements.
       */
      'sonarjs/array-callback-without-return': 'error',
      /**
       * Require `for...in` loops to be filtered before acting on them.
       */
      'sonarjs/for-in': 'error',
      /**
       * Collapse `if` statements if statements can be merged.
       */
      'sonarjs/no-collapsible-if': 'error',
      /**
       * Disallow for branches in a conditional structure to the same
       * implementation.
       */
      'sonarjs/no-duplicated-branches': 'error',
      /**
       * Disallow to use equality operators in "for" loop termination
       * conditions.
       */
      'sonarjs/no-equals-in-for-termination': 'error',
      /**
       * Disallow gratuitous expressions.
       */
      'sonarjs/no-gratuitous-expressions': 'error',
      /**
       * Disallow to add identical conditions in if-else-if and switch-case
       * statements.
       */
      'sonarjs/no-identical-conditions': 'error',
      /**
       * Disallow to add identical expressions.
       */
      'sonarjs/no-identical-expressions': 'error',
      /**
       * Disallow to add identical functions.
       */
      'sonarjs/no-identical-functions': 'error',
      /**
       * Disallow to add empty exception handlers.
       */
      'sonarjs/no-ignored-exceptions': 'error',
      /**
       * Disallow to add functions that doesn't have no side effects.
       */
      'sonarjs/no-ignored-return': 'error',
      /**
       * Disallow to add inverted boolean check.
       */
      'sonarjs/no-inverted-boolean-check': 'error',
      /**
       * Disallow array mutations with variable assigning.
       */
      'sonarjs/no-misleading-array-reverse': 'error',
      /**
       * Disallow redundant boolean check.
       */
      'sonarjs/no-redundant-boolean': 'error',
      /**
       * Conditionals should start on new lines.
       */
      'sonarjs/no-same-line-conditional': 'error',
      /**
       * Allow to use switch statements if it has at least 3 `case` clauses.
       */
      'sonarjs/no-small-switch': 'error',
      /**
       * Disallow to use `undefined` in function arguments.
       */
      'sonarjs/no-undefined-argument': 'error',
      /**
       * Local variables should not be declared and then immediately returned or
       * thrown.
       */
      'sonarjs/prefer-immediate-return': 'error',
      /**
       * Prefer to use shorthand syntax for promises.
       */
      'sonarjs/prefer-promise-shorthand': 'error',
      /**
       * Return of boolean literal statements wrapped into `if-then-else` flow
       * should be simplified.
       */
      'sonarjs/prefer-single-boolean-return': 'error',
      /**
       * Require to have initial value in array `reduce` method.
       */
      'sonarjs/reduce-initial-value': 'error',

      /**
       * Improve regexp by making them shorter, consistent, and safer.
       */
      'unicorn/better-regex': 'error',
      /**
       * Enforce a specific parameter name in catch clauses.
       */
      'unicorn/catch-error-name': 'error',
      /**
       * Use destructured variables over properties.
       */
      'unicorn/consistent-destructuring': 'error',
      /**
       * Prefer consistent types when spreading a ternary in an array literal.
       */
      'unicorn/consistent-empty-array-spread': 'error',
      /**
       * Enforce consistent style for element existence checks with `indexOf()`,
       * `lastIndexOf()`, `findIndex()`, and `findLastIndex()`.
       */
      'unicorn/consistent-existence-index-check': 'error',
      /**
       * Enforce correct `Error` subclassing.
       */
      'unicorn/custom-error-definition': 'error',
      /**
       * Enforce passing a `message` value when creating a built-in error.
       */
      'unicorn/error-message': 'error',
      /**
       * Require escape sequences to use uppercase values.
       */
      'unicorn/escape-case': 'error',
      /**
       * Enforce explicitly comparing the `length` or `size` property of a
       * value.
       */
      'unicorn/explicit-length-check': 'error',
      /**
       * Enforce kebab case style for filenames.
       */
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
      /**
       * Enforce the use of `new` for all builtins, except `String`, `Number`,
       * `Boolean`, `Symbol` and `BigInt`.
       */
      'unicorn/new-for-builtins': 'error',
      /**
       * Prefer `for…of` over the `forEach` method.
       */
      'unicorn/no-array-for-each': 'error',
      /**
       * Disallow using the `this` argument in array methods.
       */
      'unicorn/no-array-method-this-argument': 'error',
      /**
       * Enforce combining multiple `Array#push()` into one call.
       */
      'unicorn/no-array-push-push': 'error',
      /**
       * Disallow using `await` in Promise method parameters.
       */
      'unicorn/no-await-in-promise-methods': 'error',
      /**
       * Disallow to use `for` loop.
       */
      'unicorn/no-for-loop': 'error',
      /**
       * Enforce the use of Unicode escapes instead of hexadecimal escapes.
       */
      'unicorn/no-hex-escape': 'error',
      /**
       * Require `Array.isArray()` instead of `instanceof Array`.
       */
      'unicorn/no-instanceof-array': 'error',
      /**
       * Disallow invalid options in `fetch()` and `new Request()`.
       */
      'unicorn/no-invalid-fetch-options': 'error',
      /**
       * Prevent calling `EventTarget#removeEventListener()` with the result of
       * an expression.
       */
      'unicorn/no-invalid-remove-event-listener': 'error',
      /**
       * Disallow using `.length` as the end argument of
       * `{Array,String,TypedArray}#slice()`.
       */
      'unicorn/no-length-as-slice-end': 'error',
      /**
       * Disallow negated conditions.
       */
      'unicorn/no-negated-condition': 'error',
      /**
       * Disallow negated expression in equality check.
       */
      'unicorn/no-negation-in-equality-check': 'error',
      /**
       * Disallow `new Array()`.
       */
      'unicorn/no-new-array': 'error',
      /**
       * Enforce the use of `Buffer.from()` and `Buffer.alloc()` instead of the
       * deprecated `new Buffer()`.
       */
      'unicorn/no-new-buffer': 'error',
      /**
       * Disallow `process.exit()`.
       */
      'unicorn/no-process-exit': 'error',
      /**
       * Disallow passing single-element arrays to `Promise` methods.
       */
      'unicorn/no-single-promise-in-promise-methods': 'error',
      /**
       * Disallow classes that only have static members.
       */
      'unicorn/no-static-only-class': 'error',
      /**
       * Disallow assigning `this` to a variable.
       */
      'unicorn/no-this-assignment': 'error',
      /**
       * Disallow comparing `undefined` using `typeof`.
       */
      'unicorn/no-typeof-undefined': 'error',
      /**
       * Disallow awaiting non-promise values.
       */
      'unicorn/no-unnecessary-await': 'error',
      /**
       * Disallow unreadable array destructuring.
       */
      'unicorn/no-unreadable-array-destructuring': 'error',
      /**
       * Disallow unreadable IIFEs.
       */
      'unicorn/no-unreadable-iife': 'error',
      /**
       * Disallow unused object properties.
       */
      'unicorn/no-unused-properties': 'error',
      /**
       * Disallow useless fallback when spreading in object literals.
       */
      'unicorn/no-useless-fallback-in-spread': 'error',
      /**
       * Disallow useless array length check.
       */
      'unicorn/no-useless-length-check': 'error',
      /**
       * Disallow returning/yielding `Promise.resolve/reject()` in async
       * functions or promise callbacks.
       */
      'unicorn/no-useless-promise-resolve-reject': 'error',
      /**
       * Disallow unnecessary spread.
       */
      'unicorn/no-useless-spread': 'error',
      /**
       * Disallow useless case in switch statements.
       */
      'unicorn/no-useless-switch-case': 'error',
      /**
       * Disallow useless undefined
       */
      'unicorn/no-useless-undefined': [
        'error',
        {
          checkArguments: false,
        },
      ],
      /**
       * Disallow number literals with zero fractions or dangling dots.
       */
      'unicorn/no-zero-fractions': ['error'],
      /**
       * Enforce the style of numeric separators by correctly grouping digits.
       */
      'unicorn/numeric-separators-style': [
        'error',
        {
          onlyIfContainsSeparator: true,
        },
      ],
      /**
       * Prefer `.addEventListener()` and `.removeEventListener()` over
       * `on`-functions.
       */
      'unicorn/prefer-add-event-listener': 'error',
      /**
       * Prefer `.find(…)` and `.findLast(…)` over the first or last element
       * from `.filter(…)`.
       */
      'unicorn/prefer-array-find': 'error',
      /**
       * Prefer `Array#flat()` over legacy techniques to flatten arrays.
       */
      'unicorn/prefer-array-flat': 'error',
      /**
       * Prefer `.flatMap(…)` over `.map(…).flat()`.
       */
      'unicorn/prefer-array-flat-map': 'error',
      /**
       * Prefer `Array#{indexOf,lastIndexOf}()` over
       * `Array#{findIndex,findLastIndex}()` when looking for the index of an
       * item.
       */
      'unicorn/prefer-array-index-of': 'error',
      /**
       * Prefer `.some(…)` over `.filter(…).length` check and
       * `.{find,findLast}(…)`.
       */
      'unicorn/prefer-array-some': 'error',
      /**
       * Prefer `.at()` method for index access.
       */
      'unicorn/prefer-at': 'error',
      /**
       * Prefer `Blob#arrayBuffer()` over `FileReader#readAsArrayBuffer(…)` and
       * `Blob#text()` over `FileReader#readAsText(…)`.
       */
      'unicorn/prefer-blob-reading-methods': 'error',
      /**
       * Prefer `Date.now()` to get the number of milliseconds since the Unix
       * Epoch.
       */
      'unicorn/prefer-date-now': 'error',
      /**
       * Prefer default parameters over reassignment.
       */
      'unicorn/prefer-default-parameters': 'error',
      /**
       * Prefer `Node#append()` over `Node#appendChild()`.
       */
      'unicorn/prefer-dom-node-append': 'error',
      /**
       * Prefer using `.dataset` on DOM elements over calling attribute methods.
       */
      'unicorn/prefer-dom-node-dataset': 'error',
      /**
       * Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`.
       */
      'unicorn/prefer-dom-node-remove': 'error',
      /**
       * Prefer `.textContent` over `.innerText`.
       */
      'unicorn/prefer-dom-node-text-content': 'error',
      /**
       * Prefer `EventTarget` over `EventEmitter`.
       */
      'unicorn/prefer-event-target': 'error',
      /**
       * Prefer `export…from` when re-exporting.
       */
      'unicorn/prefer-export-from': 'error',
      /**
       * Prefer `globalThis` over `window`, `self`, and `global`.
       */
      'unicorn/prefer-global-this': 'error',
      /**
       * Prefer `.includes()` over `.indexOf()` and `Array#some()` when checking
       * for existence or non-existence.
       */
      'unicorn/prefer-includes': 'error',
      /**
       * Prefer `KeyboardEvent#key` over `KeyboardEvent#keyCode`.
       */
      'unicorn/prefer-keyboard-event-key': 'error',
      /**
       * Prefer using a logical operator over a ternary.
       */
      'unicorn/prefer-logical-operator-over-ternary': 'error',
      /**
       * Prefer `Math.min()` and `Math.max()` over ternaries for simple
       * comparisons.
       */
      'unicorn/prefer-math-min-max': 'error',
      /**
       * Prefer `.before()` over `.insertBefore()`, `.replaceWith()` over
       * `.replaceChild()`, prefer one of `.before()`, `.after()`, `.append()`
       * or `.prepend()` over `insertAdjacentText()` and
       * `insertAdjacentElement()`.
       */
      'unicorn/prefer-modern-dom-apis': 'error',
      /**
       * Prefer modern `Math` APIs over legacy patterns.
       */
      'unicorn/prefer-modern-math-apis': 'error',
      /**
       * Prefer using `String`, `Number`, `BigInt`, `Boolean`, and `Symbol`
       * directly.
       */
      'unicorn/prefer-native-coercion-functions': 'error',
      /**
       * Prefer negative index over `.length - index` when possible.
       */
      'unicorn/prefer-negative-index': 'error',
      /**
       * Prefer `Number` static properties over global ones.
       */
      'unicorn/prefer-number-properties': 'error',
      /**
       * Prefer using `Object.fromEntries(…)` to transform a list of key-value
       * pairs into an object.
       */
      'unicorn/prefer-object-from-entries': 'error',
      /**
       * Prefer `.querySelector()` over `.getElementById()`,
       * `.querySelectorAll()` over `.getElementsByClassName()` and
       * `.getElementsByTagName()` and `.getElementsByName()`.
       */
      'unicorn/prefer-query-selector': 'error',
      /**
       * Prefer `RegExp#test()` over `String#match()` and `RegExp#exec()`.
       */
      'unicorn/prefer-regexp-test': 'error',
      /**
       * Prefer `Set#has()` over `Array#includes()` when checking for existence
       * or non-existence.
       */
      'unicorn/prefer-set-has': 'error',
      /**
       * Prefer using `Set#size` instead of `Array#length`.
       */
      'unicorn/prefer-set-size': 'error',
      /**
       * Prefer the spread operator over `Array.from(…)`, `Array#concat(…)`,
       * `Array#{slice,toSpliced}()` and `String#split('')`.
       */
      'unicorn/prefer-spread': 'error',
      /**
       * Prefer `String#replaceAll()` over regex searches with the global flag.
       */
      'unicorn/prefer-string-replace-all': 'error',
      /**
       * Prefer `String#slice()` over `String#substr()` and `String#substring()`.
       */
      'unicorn/prefer-string-slice': 'error',
      /**
       * Prefer `String#startsWith()` & `String#endsWith()` over `RegExp#test()`.
       */
      'unicorn/prefer-string-starts-ends-with': 'error',
      /**
       * Prefer `String#trimStart()` / `String#trimEnd()` over
       * `String#trimLeft()` / `String#trimRight()`.
       */
      'unicorn/prefer-string-trim-start-end': 'error',
      /**
       * Prefer using `structuredClone` to create a deep clone.
       */
      'unicorn/prefer-structured-clone': 'error',
      /**
       * Prefer `switch` over multiple `else-if`.
       */
      'unicorn/prefer-switch': [
        'error',
        {
          minimumCases: 3,
        },
      ],
      /**
       * Prefer top-level await over top-level promises and async function
       * calls.
       */
      'unicorn/prefer-top-level-await': 'error',
      /**
       * Enforce throwing `TypeError` in type checking conditions.
       */
      'unicorn/prefer-type-error': 'error',
      /**
       * Prevent abbreviations.
       */
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            attrs: true,
            env: config.astro,
            i: true,
            Props: true,
            props: true,
            rel: (['astro', 'react', 'svelte', 'vue'] as const).some(
              configName => config[configName],
            ),
          },
        },
      ],
      /**
       * Enforce using the separator argument with `Array#join()`.
       */
      'unicorn/require-array-join-separator': 'error',
      /**
       * Enforce using the digits argument with `Number#toFixed()`.
       */
      'unicorn/require-number-to-fixed-digits-argument': 'error',
      /**
       * Fix whitespace-insensitive template indentation.
       */
      'unicorn/template-indent': 'error',
      /**
       * Enforce consistent case for text encoding identifiers.
       */
      'unicorn/text-encoding-identifier-case': 'error',
      /**
       * Require `new` when creating an error.
       */
      'unicorn/throw-new-error': 'error',
    },

    settings: {
      jsdoc: {
        mode: 'jsdoc',
      },
    },
  }
}
