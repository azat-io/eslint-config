import type {
  SimpleSupportStatement,
  SupportStatement,
  CompatStatement,
} from '@mdn/browser-compat-data'

import bcd from '@mdn/browser-compat-data' with { type: 'json' }
import { writeFileSync } from 'node:fs'
import prettier from 'prettier'
import path from 'node:path'

import type { RuleSupport, BcdBrowser, RuleScope } from '../runtime/targets'

import { compareVersions } from '../runtime/targets'

/**
 * How the support of one rule is computed.
 */
interface RuleDefinition {
  /**
   * Hand-written data for APIs that MDN does not track, or that override MDN
   * data per browser.
   */
  manual?: Partial<Pick<RuleSupport, 'browsers' | 'node'>>

  /**
   * Options that make the rule safe for unsupported targets. They are merged
   * into the configured options instead of turning the rule off.
   */
  unsupportedOptions?: Record<string, unknown>

  /**
   * MDN feature paths of every API the rule writes in fixes or suggestions.
   */
  features?: string[]

  /**
   * Runtimes that execute the rewritten code.
   */
  scope: RuleScope
}

const BUILTINS = 'javascript.builtins'

let browsers: BcdBrowser[] = [
  'samsunginternet_android',
  'firefox_android',
  'webview_android',
  'chrome_android',
  'opera_android',
  'safari_ios',
  'firefox',
  'chrome',
  'safari',
  'opera',
  'edge',
  'ie',
]

/**
 * Builds feature paths of several members of one built-in.
 *
 * @param object - Built-in name such as `Iterator`.
 * @param members - Member names.
 * @returns MDN feature paths.
 */
function builtins(object: string, members: string[]): string[] {
  return members.map(member => `${BUILTINS}.${object}.${member}`)
}

/**
 * Rules gated by runtime support. Every list contains all APIs the rule may
 * introduce, because the strictest one decides.
 */
let ruleDefinitions: Record<string, RuleDefinition> = {
  'unicorn/prefer-top-level-await': {
    /**
     * Top-level await cannot be lowered by bundlers, so browsers count too. MDN
     * marks Safari 15-26 as partial because of a rare cycle bug; it is treated
     * as supported, otherwise browser projects would never get it.
     */
    manual: {
      browsers: Object.fromEntries([
        ['safari_ios', '15'],
        ['safari', '15'],
      ]),
    },
    features: ['javascript.operators.await.top_level'],
    scope: 'universal',
  },
  'logical-assignment-operators': {
    /**
     * Browser code goes through a bundler that lowers syntax, while Node.js
     * code usually runs as written, so only Node.js targets are checked.
     */
    features: [
      'javascript.operators.logical_and_assignment',
      'javascript.operators.logical_or_assignment',
      'javascript.operators.nullish_coalescing_assignment',
    ],
    scope: 'syntax',
  },
  'unicorn/prefer-modern-dom-apis': {
    /**
     * Besides `before()`, `after()` and `replaceWith()`, which the floor
     * covers, the rule writes `replaceChildren()` on any parent node.
     */
    features: [
      'api.Document.replaceChildren',
      'api.DocumentFragment.replaceChildren',
      'api.Element.replaceChildren',
    ],
    scope: 'browser',
  },
  'unicorn/prefer-array-find': {
    /**
     * Only the `checkFromLast` fixes write `findLast()`; plain `find()` is safe
     * everywhere, so the rule stays on without that option.
     */
    features: [`${BUILTINS}.Array.findLast`, `${BUILTINS}.TypedArray.findLast`],
    unsupportedOptions: { checkFromLast: false },
    scope: 'universal',
  },
  'unicorn/prefer-json-import': {
    /**
     * Node.js 18.20 and 20.10 support JSON modules behind an experimental
     * warning; MDN lists them as supported, so they count as supported here.
     */
    features: ['javascript.statements.import.import_attributes.type_json'],
    scope: 'node',
  },
  'unicorn/prefer-abort-signal-timeout': {
    /**
     * MDN marks early `AbortSignal.timeout()` as partial (wrong error type);
     * partial rows are skipped, so those versions count as unsupported.
     */
    features: ['api.AbortSignal.timeout_static'],
    scope: 'universal',
  },
  'unicorn/prefer-import-meta-properties': {
    /**
     * MDN has no data for `import.meta.dirname`. Node.js added it in 21.2.0 and
     * backported it to 20.11.0.
     */
    manual: { node: ['^20.11.0 || >=21.2.0'], browsers: {} },
    scope: 'node',
  },
  'unicorn/prefer-set-methods': {
    features: builtins('Set', [
      'difference',
      'intersection',
      'isDisjointFrom',
      'isSubsetOf',
      'isSupersetOf',
      'symmetricDifference',
      'union',
    ]),
    scope: 'universal',
  },
  'unicorn/prefer-iterator-helpers': {
    features: builtins('Iterator', [
      'drop',
      'every',
      'find',
      'forEach',
      'reduce',
      'some',
      'take',
      'toArray',
    ]),
    scope: 'universal',
  },
  'unicorn/dom-node-dataset': {
    /**
     * The `hasAttribute()` branch writes `Object.hasOwn()` and no option turns
     * off only that branch.
     */
    features: [`${BUILTINS}.Object.hasOwn`],
    scope: 'browser',
  },
  'unicorn/prefer-dom-node-replace-children': {
    features: [
      'api.Document.replaceChildren',
      'api.DocumentFragment.replaceChildren',
      'api.Element.replaceChildren',
    ],
    scope: 'browser',
  },
  'regexp/prefer-lookaround': {
    /**
     * Lookbehind is regex syntax, which transpilers do not rewrite.
     */
    features: ['javascript.regular_expressions.lookbehind_assertion'],
    scope: 'universal',
  },
  'unicorn/prefer-array-last-methods': {
    features: [
      ...builtins('Array', ['findLast', 'findLastIndex']),
      ...builtins('TypedArray', ['findLast', 'findLastIndex']),
    ],
    scope: 'universal',
  },
  'unicorn/prefer-export-from': {
    /**
     * Re-exporting a namespace writes `export * as name from`.
     */
    features: ['javascript.statements.export.namespace'],
    scope: 'syntax',
  },
  'unicorn/prefer-get-or-insert-computed': {
    features: [
      `${BUILTINS}.Map.getOrInsertComputed`,
      `${BUILTINS}.WeakMap.getOrInsertComputed`,
    ],
    scope: 'universal',
  },
  'unicorn/prefer-uint8array-base64': {
    features: builtins('Uint8Array', [
      'fromBase64',
      'setFromBase64',
      'toBase64',
    ]),
    scope: 'universal',
  },
  'unicorn/prefer-at': {
    features: [
      `${BUILTINS}.Array.at`,
      `${BUILTINS}.String.at`,
      `${BUILTINS}.TypedArray.at`,
    ],
    scope: 'universal',
  },
  'unicorn/no-array-reverse': {
    features: [
      `${BUILTINS}.Array.toReversed`,
      `${BUILTINS}.TypedArray.toReversed`,
    ],
    scope: 'universal',
  },
  'regexp/prefer-named-capture-group': {
    features: ['javascript.regular_expressions.named_capturing_group'],
    scope: 'universal',
  },
  'unicorn/prefer-uint8array-hex': {
    features: builtins('Uint8Array', ['fromHex', 'setFromHex', 'toHex']),
    scope: 'universal',
  },
  'unicorn/no-array-sort': {
    features: [`${BUILTINS}.Array.toSorted`, `${BUILTINS}.TypedArray.toSorted`],
    scope: 'universal',
  },
  'unicorn/prefer-dom-node-html-methods': {
    features: ['api.Element.getHTML', 'api.ShadowRoot.getHTML'],
    scope: 'browser',
  },
  'unicorn/custom-error-definition': {
    features: [`${BUILTINS}.Error.Error.options_cause_parameter`],
    scope: 'universal',
  },
  'unicorn/prefer-group-by': {
    features: [`${BUILTINS}.Map.groupBy`, `${BUILTINS}.Object.groupBy`],
    scope: 'universal',
  },
  'unicorn/prefer-promise-with-resolvers': {
    features: [`${BUILTINS}.Promise.withResolvers`],
    scope: 'universal',
  },
  'unicorn/no-computed-property-existence-check': {
    features: [`${BUILTINS}.Object.hasOwn`],
    scope: 'universal',
  },
  'preserve-caught-error': {
    features: [`${BUILTINS}.Error.Error.options_cause_parameter`],
    scope: 'universal',
  },
  'unicorn/prefer-string-replace-all': {
    features: [`${BUILTINS}.String.replaceAll`],
    scope: 'universal',
  },
  'unicorn/prefer-iterator-to-array': {
    features: [`${BUILTINS}.Iterator.toArray`],
    scope: 'universal',
  },
  'unicorn/prefer-string-match-all': {
    features: [`${BUILTINS}.String.matchAll`],
    scope: 'universal',
  },
  'unicorn/prefer-array-from-async': {
    features: [`${BUILTINS}.Array.fromAsync`],
    scope: 'universal',
  },
  'unicorn/prefer-single-replace': {
    features: [`${BUILTINS}.String.replaceAll`],
    scope: 'universal',
  },
  'unicorn/prefer-iterator-concat': {
    features: [`${BUILTINS}.Iterator.concat`],
    scope: 'universal',
  },
  'unicorn/prefer-abort-signal-any': {
    features: ['api.AbortSignal.any_static'],
    scope: 'universal',
  },
  'unicorn/prefer-aggregate-error': {
    features: [`${BUILTINS}.AggregateError`],
    scope: 'universal',
  },
  'unicorn/prefer-error-is-error': {
    features: [`${BUILTINS}.Error.isError`],
    scope: 'universal',
  },
  'unicorn/prefer-regexp-escape': {
    features: [`${BUILTINS}.RegExp.escape`],
    scope: 'universal',
  },
  'unicorn/prefer-url-can-parse': {
    features: ['api.URL.canParse_static'],
    scope: 'universal',
  },
  'unicorn/no-array-splice': {
    features: [`${BUILTINS}.Array.toSpliced`],
    scope: 'universal',
  },
  'unicorn/prefer-structured-clone': {
    features: ['api.structuredClone'],
    scope: 'universal',
  },
  'unicorn/prefer-promise-try': {
    features: [`${BUILTINS}.Promise.try`],
    scope: 'universal',
  },
  'prefer-object-has-own': {
    features: [`${BUILTINS}.Object.hasOwn`],
    scope: 'universal',
  },
  'unicorn/require-css-escape': {
    features: ['api.CSS.escape_static'],
    scope: 'browser',
  },
}

/**
 * Computes support of one rule. A rule is supported only where every feature it
 * uses is supported.
 *
 * @param definition - Features, hand-written data and scope of the rule.
 * @returns Generated support data.
 */
function getRuleSupport(definition: RuleDefinition): RuleSupport {
  let statements = (definition.features ?? []).map(featurePath =>
    getCompat(featurePath),
  )
  let selectedBrowsers: RuleSupport['browsers'] = {
    ...definition.manual?.browsers,
  }
  let nodeRanges: string[] | null = definition.manual?.node ?? []

  if (definition.scope === 'universal' || definition.scope === 'browser') {
    for (let browser of browsers) {
      if (statements.length === 0) {
        break
      }
      let versions = statements.map(compat =>
        getBrowserVersion(compat.support[browser]),
      )
      selectedBrowsers[browser] =
        versions.includes(null) ? null : (
          ((versions as string[]).toSorted(compareVersions).at(-1) ?? null)
        )
    }
  }

  Object.assign(selectedBrowsers, definition.manual?.browsers)

  if (definition.scope !== 'browser') {
    for (let compat of statements) {
      let range = getNodeRange(compat.support.nodejs)
      if (range === null) {
        nodeRanges = null
      } else if (nodeRanges !== null) {
        nodeRanges = [...new Set([...nodeRanges, range])]
      }
    }
  }

  return {
    ...(definition.unsupportedOptions && {
      unsupportedOptions: definition.unsupportedOptions,
    }),
    node:
      (
        nodeRanges === null ||
        nodeRanges.length === 0 ||
        definition.scope === 'browser'
      ) ?
        null
      : nodeRanges,
    browsers: selectedBrowsers,
    scope: definition.scope,
  }
}

/**
 * Keeps only complete, unprefixed, unflagged support entries.
 *
 * @param statement - MDN support statement of one runtime.
 * @returns Versions in which the feature was added and, if so, removed.
 */
function getStableEntries(
  statement: SupportStatement | undefined,
): { removed?: string; added: string }[] {
  let entries: SimpleSupportStatement[] =
    statement === undefined ? [] : [statement].flat()
  let stable: { removed?: string; added: string }[] = []

  for (let entry of entries) {
    let {
      partial_implementation: partial,
      version_removed: removed,
      version_added: added,
    } = entry
    if (
      partial ||
      typeof added !== 'string' ||
      added === 'preview' ||
      entry.flags ||
      entry.prefix ||
      entry.alternative_name
    ) {
      continue
    }
    stable.push({
      ...(typeof removed === 'string' && { removed: removed.replace('≤', '') }),
      added: added.replace('≤', ''),
    })
  }

  return stable
}

/**
 * Returns the MDN compat statement for a dotted path.
 *
 * @param featurePath - Path such as `javascript.builtins.Array.at`.
 * @returns The compat statement.
 */
function getCompat(featurePath: string): CompatStatement {
  let node: unknown = bcd

  for (let key of featurePath.split('.')) {
    node = (node as Partial<Record<string, unknown>> | undefined)?.[key]
  }

  let compat = (node as { __compat?: CompatStatement } | undefined)?.__compat

  if (!compat) {
    throw new Error(`Unknown MDN feature "${featurePath}"`)
  }

  return compat
}

/**
 * Node.js versions that support a feature, backports included.
 *
 * @param statement - MDN support statement of Node.js.
 * @returns A semver range, or `null` without stable support.
 */
function getNodeRange(statement: SupportStatement | undefined): string | null {
  let ranges = getStableEntries(statement).map(entry =>
    entry.removed === undefined ?
      `>=${entry.added}`
    : `>=${entry.added} <${entry.removed}`,
  )

  return ranges.length === 0 ? null : ranges.join(' || ')
}

/**
 * Older APIs that rules without a gate write in fixes, for example
 * `Array#flat()` from `unicorn/prefer-array-flat`. Targets that lack them are
 * below the floor this config supports, which is reported as a warning.
 */
let floorDefinitions: RuleDefinition[] = [
  {
    features: [
      ...builtins('Array', ['flat', 'flatMap', 'includes']),
      ...builtins('String', ['trimEnd', 'trimStart']),
      `${BUILTINS}.Object.fromEntries`,
      `${BUILTINS}.globalThis`,
    ],
    scope: 'universal',
  },
  {
    features: [
      'api.Element.after',
      'api.Element.append',
      'api.Element.before',
      'api.Element.replaceWith',
      'api.Element.toggleAttribute',
    ],
    scope: 'browser',
  },
]

/**
 * Merges support rows into one that is supported only where all of them are.
 * Node.js data comes from rows that run on Node.js.
 *
 * @param rows - Rows computed by {@link getRuleSupport}.
 * @returns A row with the strictest browser versions and all Node.js ranges.
 */
function mergeSupport(rows: RuleSupport[]): RuleSupport {
  let selectedBrowsers: RuleSupport['browsers'] = {}
  let node: string[] | null = []

  for (let row of rows) {
    for (let browser of browsers) {
      let required = row.browsers[browser]
      let current = selectedBrowsers[browser]
      if (required === undefined || current === null) {
        continue
      }
      selectedBrowsers[browser] =
        (
          required === null ||
          current === undefined ||
          compareVersions(required, current) > 0
        ) ?
          required
        : current
    }
    if (row.scope !== 'browser') {
      node =
        node === null || row.node === null ?
          null
        : [...new Set([...node, ...row.node])]
    }
  }

  return { browsers: selectedBrowsers, scope: 'universal', node }
}

/**
 * Builds the support table, sorted by rule name so the output does not depend
 * on source order.
 *
 * @param date - Data date that pins Baseline queries.
 * @returns Support per rule, the floor of the config and the data date.
 */
function buildRuntimeSupport(date: string): {
  rules: Record<string, RuleSupport>
  floor: RuleSupport
  date: string
} {
  return {
    rules: Object.fromEntries(
      Object.entries(ruleDefinitions)
        .map(
          ([rule, definition]) => [rule, getRuleSupport(definition)] as const,
        )
        .toSorted(([left], [right]) => left.localeCompare(right)),
    ),
    floor: mergeSupport(
      floorDefinitions.map(definition => getRuleSupport(definition)),
    ),
    date,
  }
}

/**
 * Lowest version from which a browser supports a feature without removal.
 *
 * @param statement - MDN support statement of one browser.
 * @returns The version, or `null` without stable support.
 */
function getBrowserVersion(
  statement: SupportStatement | undefined,
): string | null {
  return (
    getStableEntries(statement)
      .filter(entry => entry.removed === undefined)
      .map(entry => entry.added)
      .toSorted(compareVersions)
      .at(0) ?? null
  )
}

let now = new Date()
let date = process.env['RUNTIME_SUPPORT_DATE'] ?? now.toISOString().slice(0, 10)
let file = path.join(import.meta.dirname, '../runtime/support.json')
let options = await prettier.resolveConfig(file)

writeFileSync(
  file,
  await prettier.format(JSON.stringify(buildRuntimeSupport(date), null, 2), {
    ...options,
    filepath: file,
  }),
)
