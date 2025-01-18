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

export let react = async (config: ConfigOptions): Promise<Linter.Config> => {
  if (!config.react) {
    return {}
  }

  let [reactCompilerPlugin, reactHooksPlugin, reactPerfPlugin, reactPlugin] =
    await Promise.all([
      interopDefault(import('eslint-plugin-react-compiler')),
      interopDefault(import('eslint-plugin-react-hooks')),
      interopDefault(import('eslint-plugin-react-perf')),
      interopDefault(import('eslint-plugin-react')),
    ] as const)

  let files = ['**/*.jsx']

  if (config.typescript) {
    files.push('**/*.tsx')
  }

  return {
    name: 'azat-io/react/rules',

    files,

    plugins: {
      react: reactPlugin,
      'react-compiler': reactCompilerPlugin,
      'react-hooks': reactHooksPlugin,
      'react-perf': reactPerfPlugin,
    },

    rules: {
      /**
       * Disallow usage of `button` elements without an explicit `type` attribute.
       */
      'react/button-has-type': 'error',
      /**
       * Enforce using `onChange` or `readonly` attribute when `checked` is used.
       */
      'react/checked-requires-onchange-or-readonly': 'error',
      /**
       * Disallow certain propTypes.
       */
      'react/forbid-prop-types': 'error',
      /**
       * Require all forwardRef components include a ref parameter.
       */
      'react/forward-ref-uses-ref': 'error',
      /**
       * Require function components to be arrow function.
       */
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
        },
      ],
      /**
       * Ensure symmetric naming of useState hook value and setter variables.
       */
      'react/hook-use-state': [
        'error',
        {
          allowDestructuredState: true,
        },
      ],
      /**
       * Enforce boolean attributes notation in JSX.
       */
      'react/jsx-boolean-value': 'error',
      /**
       * Disallow unnecessary JSX expressions when literals alone are
       * sufficient.
       */
      'react/jsx-curly-brace-presence': [
        'error',
        {
          children: 'never',
          propElementValues: 'always',
          props: 'never',
        },
      ],
      /**
       * Require to use shorthand for React fragments.
       */
      'react/jsx-fragments': 'error',
      /**
       * Disallow missing `key` props in iterators/collection literals.
       */
      'react/jsx-key': 'error',
      /**
       * Disallow comments from being inserted as text nodes.
       */
      'react/jsx-no-comment-textnodes': 'error',
      /**
       * Disallows JSX context provider values from taking values that will
       * cause needless rerenders.
       */
      'react/jsx-no-constructed-context-values': 'error',
      /**
       * Disallow duplicate properties in JSX.
       */
      'react/jsx-no-duplicate-props': 'error',
      /**
       * Disallow problematic leaked values from being rendered.
       */
      'react/jsx-no-leaked-render': 'error',
      /**
       * Disallow `target="_blank"` attribute without `rel="noreferrer"`.
       */
      'react/jsx-no-target-blank': 'error',
      /**
       * Disallow undeclared variables in JSX.
       */
      'react/jsx-no-undef': 'error',
      /**
       * Disallow unnecessary fragments.
       */
      'react/jsx-no-useless-fragment': 'error',
      /**
       * Enforce PascalCase for user-defined JSX components.
       */
      'react/jsx-pascal-case': 'error',
      /**
       * Disallow variables used in JSX to be incorrectly marked as unused.
       */
      'react/jsx-uses-vars': 'error',
      /**
       * Disallow usage of Array index in keys.
       */
      'react/no-array-index-key': 'error',
      /**
       * Lifecycle methods should be methods on the prototype, not class fields.
       */
      'react/no-arrow-function-lifecycle': 'error',
      /**
       * Disallow passing of children as props.
       */
      'react/no-children-prop': 'error',
      /**
       * Disallow when a DOM element is using both children and
       * `dangerouslySetInnerHTML`.
       */
      'react/no-danger-with-children': 'error',
      /**
       * Disallow usage of deprecated methods.
       */
      'react/no-deprecated': 'error',
      /**
       * Disallow usage of `setState` in `componentDidMount`.
       */
      'react/no-did-mount-set-state': 'error',
      /**
       * Disallow usage of `setState` in `componentDidUpdate`.
       */
      'react/no-did-update-set-state': 'error',
      /**
       * Disallow direct mutation of `this.state`.
       */
      'react/no-direct-mutation-state': 'error',
      /**
       * Disallow usage of `findDOMNode`.
       */
      'react/no-find-dom-node': 'error',
      /**
       * Disallow usage of invalid attributes.
       */
      'react/no-invalid-html-attribute': 'error',
      /**
       * Disallow usage of `isMounted`.
       */
      'react/no-is-mounted': 'error',
      /**
       * Enforce that namespaces are not used in React elements.
       */
      'react/no-namespace': 'error',
      /**
       * Disallow usage of `shouldComponentUpdate` when extending
       * `React.PureComponent`.
       */
      'react/no-redundant-should-component-update': 'error',
      /**
       * Disallow usage of the return value of `ReactDOM.render`.
       */
      'react/no-render-return-value': 'error',
      /**
       * Disallow using string references.
       */
      'react/no-string-refs': 'error',
      /**
       * Disallow `this` from being used in stateless functional components.
       */
      'react/no-this-in-sfc': 'error',
      /**
       * Disallow common typos.
       */
      'react/no-typos': 'error',
      /**
       * Disallow unescaped HTML entities from appearing in markup.
       */
      'react/no-unescaped-entities': 'error',
      /**
       * Disallow usage of unknown DOM property.
       */
      'react/no-unknown-property': 'error',
      /**
       * Disallow declaring unused methods of component class.
       */
      'react/no-unused-class-component-methods': 'error',
      /**
       * Disallow definitions of unused state.
       */
      'react/no-unused-state': 'error',
      /**
       * Disallow usage of `setState` in `componentWillUpdate`.
       */
      'react/no-will-update-set-state': 'error',
      /**
       * Enforce ES5 or ES6 class for returning value in render function.
       */
      'react/require-render-return': 'error',
      /**
       * Disallow extra closing tags for components without children.
       */
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      /**
       * Enforce style prop value is an object.
       */
      'react/style-prop-object': 'error',
      /**
       * Disallow void DOM elements (e.g. `<img />`, `<br />`) from receiving
       * children.
       */
      'react/void-dom-elements-no-children': 'error',

      /**
       * Find problematic React code by the React compiler.
       */
      'react-compiler/react-compiler': 'error',

      /**
       * Check effect dependencies.
       */
      'react-hooks/exhaustive-deps': 'error',
      /**
       * Check rules of Hooks.
       */
      'react-hooks/rules-of-hooks': 'error',
      /**
       * Prevent JSX that are local to the current method from being used as
       * values of JSX props.
       */

      'react-perf/jsx-no-jsx-as-prop': 'error',
      /**
       * Prevent Arrays that are local to the current method from being used as
       * values of JSX props.
       */
      'react-perf/jsx-no-new-array-as-prop': 'error',
      /**
       * Prevent Functions that are local to the current method from being used
       * as values of JSX props.
       */
      'react-perf/jsx-no-new-function-as-prop': 'error',
      /**
       * Prevent Objects that are local to the current method from being used as
       * values of JSX props.
       */
      'react-perf/jsx-no-new-object-as-prop': 'error',
    },

    settings: {
      react: {
        fragment: 'Fragment',
        pragma: 'React',
        version: 'detect',
      },
    },
  }
}
