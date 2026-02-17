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

import { interopDefault } from '../utilities'

export async function react(config: ConfigOptions): Promise<Linter.Config> {
  if (!config.react) {
    return {}
  }

  let [
    reactCompilerPlugin,
    reactDomPlugin,
    reactHooksPlugin,
    reactHooksExtraPlugin,
    reactNamingConventionPlugin,
    reactPerfPlugin,
    reactWebApiPlugin,
    reactXPlugin,
  ] = await Promise.all([
    interopDefault(import('eslint-plugin-react-compiler')),
    interopDefault(import('eslint-plugin-react-dom')),
    interopDefault(import('eslint-plugin-react-hooks')),
    interopDefault(import('eslint-plugin-react-hooks-extra')),
    interopDefault(import('eslint-plugin-react-naming-convention')),
    interopDefault(import('eslint-plugin-react-perf')),
    interopDefault(import('eslint-plugin-react-web-api')),
    interopDefault(import('eslint-plugin-react-x')),
  ] as const)

  let files = ['**/*.jsx']

  if (config.typescript) {
    files.push('**/*.tsx')
  }

  return {
    name: 'azat-io/react/rules',

    files,

    plugins: {
      'react-compiler': reactCompilerPlugin,
      'react-dom': reactDomPlugin,
      'react-hooks': reactHooksPlugin,
      'react-hooks-extra': reactHooksExtraPlugin,
      'react-naming-convention': reactNamingConventionPlugin,
      'react-perf': reactPerfPlugin,
      'react-web-api': reactWebApiPlugin,
      'react-x': reactXPlugin,
    },

    rules: {
      /**
       * Find problematic React code by the React compiler.
       */
      'react-compiler/react-compiler': 'error',

      /**
       * Disallow `dangerouslySetInnerHTML`.
       */
      'react-dom/no-dangerously-set-innerhtml': 'error',
      /**
       * Disallow `dangerouslySetInnerHTML` and children at the same time.
       */
      'react-dom/no-dangerously-set-innerhtml-with-children': 'error',
      /**
       * Disallow `findDOMNode`.
       */
      'react-dom/no-find-dom-node': 'error',
      /**
       * Disallow `flushSync`.
       */
      'react-dom/no-flush-sync': 'error',
      /**
       * Replaces usages of `ReactDom.hydrate()` with `hydrateRoot()`.
       */
      'react-dom/no-hydrate': 'error',
      /**
       * Enforces explicit `type` attribute for `button` elements.
       */
      'react-dom/no-missing-button-type': 'error',
      /**
       * Enforces explicit `sandbox` attribute for `iframe` elements.
       */
      'react-dom/no-missing-iframe-sandbox': 'error',
      /**
       * Enforces the absence of a `namespace` in React elements.
       */
      'react-dom/no-namespace': 'error',
      /**
       * Replaces usages of `ReactDom.render()` with.
       *
       * `createRoot(node).render()`.
       */
      'react-dom/no-render': 'error',
      /**
       * Disallow the return value of `ReactDOM.render`.
       */
      'react-dom/no-render-return-value': 'error',
      /**
       * Disallow `javascript:` URLs as attribute values.
       */
      'react-dom/no-script-url': 'error',
      /**
       * Disallow usage of unknown `DOM` property.
       */
      'react-dom/no-unknown-property': 'error',
      /**
       * Enforces `sandbox` attribute for `iframe` elements is not set to unsafe
       * combinations.
       */
      'react-dom/no-unsafe-iframe-sandbox': 'error',
      /**
       * Disallow `target="_blank"` without `rel="noreferrer noopener"`.
       */
      'react-dom/no-unsafe-target-blank': 'error',
      /**
       * Replaces usages of `useFormState` with `useActionState`.
       */
      'react-dom/no-use-form-state': 'error',
      /**
       * Disallow `children` in void DOM elements.
       */
      'react-dom/no-void-elements-with-children': 'error',

      /**
       * Check effect dependencies.
       */
      'react-hooks/exhaustive-deps': 'error',
      /**
       * Check rules of Hooks.
       */
      'react-hooks/rules-of-hooks': 'error',

      /**
       * Disallow direct calls to the `set` function of `useState` in
       * `useEffect` or `useLayoutEffect`.
       */
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'error',

      /**
       * Enforces naming conventions for components.
       */
      'react-naming-convention/component-name': 'error',
      /**
       * Enforces context name to be a valid component name with the suffix
       * `Context`.
       */
      'react-naming-convention/context-name': 'error',
      /**
       * Enforces identifier names assigned from `useId` calls to be either `id`
       * or end with `Id`.
       */
      'react-naming-convention/id-name': 'error',
      /**
       * Enforces destructuring and symmetric naming of `useState` hook value
       * and setter.
       */
      'react-naming-convention/use-state': 'error',

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

      /**
       * Prevents leaked `AbsoluteOrientationSensor`.
       */
      'react-web-api/no-leaked-absolute-orientation-sensor': 'error',
      /**
       * Prevents leaked `AmbientLightSensor`.
       */
      'react-web-api/no-leaked-ambient-light-sensor': 'error',
      /**
       * Prevents leaked `requestAnimationFrame`.
       */
      'react-web-api/no-leaked-animation-frame': 'error',
      /**
       * Prevents leaked `BroadcastChannel`.
       */
      'react-web-api/no-leaked-broadcast-channel': 'error',
      /**
       * Prevents leaked `addEventListener`.
       */
      'react-web-api/no-leaked-event-listener': 'error',
      /**
       * Prevents leaked `EventSource`.
       */
      'react-web-api/no-leaked-event-source': 'error',
      /**
       * Prevents leaked `Geolocation.watchPosition()`.
       */
      'react-web-api/no-leaked-geolocation': 'error',
      /**
       * Prevents leaked `GravitySensor`.
       */
      'react-web-api/no-leaked-gravity-sensor': 'error',
      /**
       * Prevents leaked `Gyroscope`.
       */
      'react-web-api/no-leaked-gyroscope': 'error',
      /**
       * Prevents leaked `requestIdleCallback`.
       */
      'react-web-api/no-leaked-idle-callback': 'error',
      /**
       * Prevents leaked `IntersectionObserver`.
       */
      'react-web-api/no-leaked-intersection-observer': 'error',
      /**
       * Prevents leaked `setInterval`.
       */
      'react-web-api/no-leaked-interval': 'error',
      /**
       * Prevents leaked `LinearAccelerationSensor`.
       */
      'react-web-api/no-leaked-linear-acceleration-sensor': 'error',
      /**
       * Prevents leaked `Magnetometer`.
       */
      'react-web-api/no-leaked-magnetometer': 'error',
      /**
       * Prevents leaked `MutationObserver`.
       */
      'react-web-api/no-leaked-mutation-observer': 'error',
      /**
       * Prevents leaked `OrientationSensor`.
       */
      'react-web-api/no-leaked-orientation-sensor': 'error',
      /**
       * Prevents leaked `PerformanceObserver`.
       */
      'react-web-api/no-leaked-performance-observer': 'error',
      /**
       * Prevents leaked `Accelerometer`.
       */
      'react-web-api/no-leaked-relative-accelerometer': 'error',
      /**
       * Prevents leaked `ResizeObserver`.
       */
      'react-web-api/no-leaked-resize-observer': 'error',
      /**
       * Prevents leaked `setTimeout`.
       */
      'react-web-api/no-leaked-timeout': 'error',
      /**
       * Prevents leaked `WebSocket`.
       */
      'react-web-api/no-leaked-websocket': 'error',

      /**
       * Enforces that the `key` attribute is placed before the spread attribute
       * in JSX elements.
       */
      'react-x/jsx-key-before-spread': 'error',
      /**
       * Disallow duplicate props in JSX.
       */
      'react-x/jsx-no-duplicate-props': 'error',
      /**
       * Disallow IIFE in JSX.
       */
      'react-x/jsx-no-iife': 'error',
      /**
       * Disallow undefined variables in JSX.
       */
      'react-x/jsx-no-undef': 'error',
      /**
       * Enforces the use of shorthand syntax for boolean attributes.
       */
      'react-x/jsx-shorthand-boolean': 'error',
      /**
       * Enforces the use of shorthand syntax for fragments.
       */
      'react-x/jsx-shorthand-fragment': 'error',
      /**
       * Marks React variables as used when JSX is used.
       */
      'react-x/jsx-uses-react': 'error',
      /**
       * Marks variables used in JSX elements as used.
       */
      'react-x/jsx-uses-vars': 'error',
      /**
       * Disallow access to state in setState updater.
       */
      'react-x/no-access-state-in-setstate': 'error',
      /**
       * Disallow array index as key in JSX.
       */
      'react-x/no-array-index-key': 'error',
      /**
       * Disallow class components except for Error Boundaries.
       */
      'react-x/no-class-component': 'error',
      /**
       * Disallow complex conditional rendering in JSX expressions.
       */
      'react-x/no-complex-conditional-rendering': 'error',
      /**
       * Disallow usage of componentWillMount.
       */
      'react-x/no-component-will-mount': 'error',
      /**
       * Disallow usage of componentWillReceiveProps.
       */
      'react-x/no-component-will-receive-props': 'error',
      /**
       * Disallow usage of componentWillUpdate.
       */
      'react-x/no-component-will-update': 'error',
      /**
       * Disallow duplicate key in JSX.
       */
      'react-x/no-duplicate-key': 'error',
      /**
       * Disallow nested component definitions.
       */
      'react-x/no-nested-component-definitions': 'error',
      /**
       * Disallow unnecessary usage of `key` props.
       */
      'react-x/no-unnecessary-key': 'error',
      /**
       * Disallow unnecessary usage of `useCallback`.
       */
      'react-x/no-unnecessary-use-callback': 'error',
      /**
       * Disallow unnecessary usage of `useMemo`.
       */
      'react-x/no-unnecessary-use-memo': 'error',
      /**
       * Enforces that a function with the `use` prefix should use at least one
       * hook inside of it.
       */
      'react-x/no-unnecessary-use-prefix': 'error',
      /**
       * Warns usage of UNSAFE_componentWillUpdate in class components.
       */
      'react-x/no-unsafe-component-will-update': 'error',
      /**
       * Disallow use of unstable context API.
       */
      'react-x/no-unstable-context-value': 'error',
      /**
       * Warns component props that are defined but never used.
       */
      'react-x/no-unused-props': 'error',
      /**
       * Warns unused class component state.
       */
      'react-x/no-unused-state': 'error',
      /**
       * Disallow usage of useContext; enforce use (React 19).
       */
      'react-x/no-use-context': 'error',
      /**
       * Disallow useless fragments.
       */
      'react-x/no-useless-fragment': 'error',
      /**
       * Enforces React is imported via a namespace import.
       */
      'react-x/prefer-namespace-import': 'error',
      /**
       * Enforces function calls made inside `useState` to be wrapped in an
       * initializer function.
       */
      'react-x/prefer-use-state-lazy-initialization': 'error',
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
