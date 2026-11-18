import type { ESLint } from 'eslint'

import testDescribeMatchesSubject from './test-describe-matches-subject'
import filenameMatchesExport from './filename-matches-export'
import preferJsdocComments from './prefer-jsdoc-comments'
import { version, name } from '../package.json'

/**
 * Rules of this config, registered as the `azat-io` plugin. The meta gives
 * ESLint a cache key that changes with every release.
 */
export default {
  rules: {
    'test-describe-matches-subject': testDescribeMatchesSubject,
    'filename-matches-export': filenameMatchesExport,
    'prefer-jsdoc-comments': preferJsdocComments,
  },
  meta: {
    namespace: 'azat-io',
    version,
    name,
  },
} satisfies ESLint.Plugin
