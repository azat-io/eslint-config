import { getAllVersions } from 'baseline-browser-mapping'
import { readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import browserslist from 'browserslist'
import path from 'node:path'
import semver from 'semver'

/**
 * Options of {@link resolveRuntimeTargets}.
 */
export interface ResolveRuntimeTargetsOptions {
  /**
   * Explicit targets. `'auto'` detects everything.
   */
  targets?: RuntimeTargetsOption | 'auto'

  /**
   * What to assume when no browserslist config exists: nothing (`'ignore'`),
   * unknown browsers (`'off'`) or the given query or queries.
   */
  missingBrowsers?: string[] | string

  /**
   * Node.js target used when the project declares none. `false` makes every
   * rule that depends on Node.js turn off instead.
   */
  fallback?: { node: string } | false

  /**
   * Policy for browsers without compatibility data.
   */
  unknownBrowsers?: 'ignore' | 'off'

  /**
   * Browserslist agents that never block a rule. A custom list replaces the
   * default `['op_mini']`.
   */
  ignoreBrowsers?: string[]

  /**
   * Browserslist environment, pinned so linting ignores `NODE_ENV`.
   */
  browserslistEnv?: string

  /**
   * Date in `YYYY-MM-DD` format that replaces "today" in Baseline queries.
   */
  pinnedDate?: string

  /**
   * Absolute path or file URL of the project directory (or of a file in it).
   */
  root: string | URL
}

/**
 * Minimal runtimes the linted code must support.
 */
export interface ResolvedRuntimeTargets {
  /**
   * Node.js targets, `undefined` when Node.js is not targeted.
   */
  node?: {
    /**
     * Where the range came from.
     */
    source: 'browserslist' | 'explicit' | 'fallback' | 'engines'

    /**
     * Lowest supported version.
     */
    minimum: string

    /**
     * Full supported range.
     */
    range: string
  }

  /**
   * Targets that exist but cannot be evaluated. They turn rules off.
   */
  unknown: { runtime: 'browser' | 'node'; reason: string }[]

  /**
   * Browserslist entry behind every browser version, for explanations.
   */
  browserOrigins: Partial<Record<BcdBrowser, string>>

  /**
   * Minimal version of every browser, `undefined` when no browser is targeted.
   */
  browsers?: Partial<Record<BcdBrowser, string>>

  /**
   * Browserslist entries that were skipped on purpose.
   */
  ignoredBrowsers: string[]

  /**
   * Problems worth showing to the user.
   */
  warnings: string[]

  /**
   * Where every target came from.
   */
  sources: string[]
}

/**
 * Support data of one rule, generated at build time from MDN data.
 */
export interface RuleSupport {
  /**
   * Minimal browser versions. `null` means the API is not supported.
   */
  browsers: Partial<Record<BcdBrowser, string | null>>

  /**
   * Options merged into the configured ones when the targets lack support.
   * Rules without them are turned off.
   */
  unsupportedOptions?: Record<string, unknown>

  /**
   * Node.js ranges of every API the rule uses (all must contain the target),
   * `null` when Node.js does not support them.
   */
  node: string[] | null

  /**
   * Runtimes that matter for the rule.
   */
  scope: RuleScope
}

/**
 * Targets given explicitly. Every key is detected from project files when
 * omitted, and `false` means the runtime is not targeted at all.
 */
export interface RuntimeTargetsOption {
  /**
   * Browserslist queries.
   */
  browsers?: string[] | string | false

  /**
   * Node.js range such as `>=22.12`. A bare version means "this or newer".
   */
  node?: string | false
}

/**
 * Browser identifiers used by `@mdn/browser-compat-data`.
 */
export type BcdBrowser =
  | 'samsunginternet_android'
  | 'firefox_android'
  | 'webview_android'
  | 'chrome_android'
  | 'opera_android'
  | 'safari_ios'
  | 'firefox'
  | 'chrome'
  | 'safari'
  | 'opera'
  | 'edge'
  | 'ie'

/**
 * Result of {@link explainRuleSupport}.
 */
export interface RuleSupportExplanation {
  /**
   * Reasons that keep the rule off.
   */
  blockers: string[]

  /**
   * Whether the rule can be enabled.
   */
  enabled: boolean
}

/**
 * Which runtimes execute the code a rule rewrites. `node` means APIs that exist
 * only in Node.js, so the rule needs a Node.js target. `syntax` means syntax
 * that bundlers lower for browsers: only Node.js targets are checked, and
 * without them the rule stays on.
 */
export type RuleScope = 'universal' | 'browser' | 'syntax' | 'node'

/**
 * Node.js floor for projects without `engines.node`. Reviewed on every release:
 * the oldest Node.js line that is still maintained.
 */
export const DEFAULT_NODE_FLOOR = '22.0.0'

const ERROR_PREFIX = 'Runtime targets'

let optionKeys = new Set([
  'browserslistEnv',
  'unknownBrowsers',
  'missingBrowsers',
  'ignoreBrowsers',
  'pinnedDate',
  'fallback',
  'targets',
  'root',
])

let unknownBrowsersValues = new Set<unknown>([undefined, 'ignore', 'off'])

let browserslistToBcd = new Map<string, BcdBrowser>([
  ['samsung', 'samsunginternet_android'],
  ['android', 'webview_android'],
  ['and_ff', 'firefox_android'],
  ['and_chr', 'chrome_android'],
  ['op_mob', 'opera_android'],
  ['ios_saf', 'safari_ios'],
  ['firefox', 'firefox'],
  ['chrome', 'chrome'],
  ['safari', 'safari'],
  ['opera', 'opera'],
  ['ie_mob', 'ie'],
  ['edge', 'edge'],
  ['ie', 'ie'],
])

/**
 * Browsers built on another engine. Their engine version is looked up in
 * `baseline-browser-mapping` and checked as the upstream browser.
 */
let downstreamBrowsers = new Map<string, string>([
  ['and_qq', 'qq_android'],
  ['and_uc', 'uc_android'],
  ['kaios', 'kai_os'],
])

let engineToBcd = new Map<string, BcdBrowser>([
  ['Gecko', 'firefox_android'],
  ['Blink', 'chrome_android'],
])

/**
 * Agents whose caniuse data cannot represent older versions.
 */
let collapsingAgents = new Set(['and_qq', 'and_uc', 'op_mob'])

/**
 * Internal browserslist module that loads shareable configs for `extends`.
 */
interface BrowserslistNode {
  loadStat(
    context: { path: string; env: string },
    name: string,
    data: typeof browserslist.data,
  ): browserslist.Stats | undefined
  loadQueries(context: { path: string; env: string }, name: string): string[]
}

/**
 * Query node as browserslist returns it at runtime; its types omit these keys.
 */
interface ParsedQuery extends browserslist.Query {
  browser?: string
  version?: string
  config?: string
  sign?: string
  from?: string
}

/**
 * Release of a downstream browser with its engine version.
 */
interface DownstreamRelease {
  engine_version?: string
  browser: string
  version: string
  engine?: string
}

let browserslistNode: BrowserslistNode | undefined

let downstreamReleases: DownstreamRelease[] | undefined

/**
 * Explains whether every relevant target supports a rule.
 *
 * @param support - Generated support data of the rule.
 * @param targets - Resolved targets.
 * @returns Whether the rule can be enabled and what blocks it.
 */
export function explainRuleSupport(
  support: RuleSupport,
  targets: ResolvedRuntimeTargets,
): RuleSupportExplanation {
  let checkNode = support.scope !== 'browser'
  let checkBrowsers =
    support.scope === 'universal' || support.scope === 'browser'
  let blockers: string[] = []
  let checked = false

  for (let { runtime, reason } of targets.unknown) {
    if (
      (runtime === 'node' && checkNode) ||
      (runtime === 'browser' && checkBrowsers)
    ) {
      blockers.push(reason)
    }
  }

  if (checkNode && targets.node) {
    checked = true
    let { range } = targets.node
    if (support.node === null) {
      blockers.push(`node ${range}: not supported`)
    } else {
      for (let required of support.node) {
        /**
         * The plain check keeps `>=20` inside `>=20.0.0`; the prerelease-aware
         * one accepts `>=24.0.0-rc.1` inside `>=22.0.0`.
         */
        if (
          !semver.subset(range, required) &&
          !semver.subset(range, required, { includePrerelease: true })
        ) {
          blockers.push(`node ${range} is not within ${required}`)
        }
      }
    }
  }

  if (checkBrowsers && targets.browsers) {
    for (let [browser, version] of Object.entries(targets.browsers)) {
      checked = true
      let origin = targets.browserOrigins[browser as BcdBrowser]
      let label =
        origin && origin !== `${browser} ${version}` ?
          `${browser} ${version} (${origin})`
        : `${browser} ${version}`
      let required = support.browsers[browser as BcdBrowser]
      if (required === undefined || required === null) {
        blockers.push(`${label}: not supported`)
      } else if (compareVersions(version, required) < 0) {
        blockers.push(`${label} < ${required}`)
      }
    }
  }

  if (!checked && blockers.length === 0 && support.scope !== 'syntax') {
    blockers.push(
      support.scope === 'universal' ?
        'no targets'
      : `no ${support.scope} targets`,
    )
  }

  return { enabled: blockers.length === 0, blockers }
}

/**
 * Resolves the minimal runtimes from explicit options and project files.
 *
 * @param options - Resolver options.
 * @returns Minimal Node.js and browser targets with an explanation.
 */
export function resolveRuntimeTargets(
  options: ResolveRuntimeTargetsOptions,
): ResolvedRuntimeTargets {
  validateOptions(options)

  let {
    browserslistEnv: browserslistEnvironment = 'production',
    fallback = { node: DEFAULT_NODE_FLOOR },
    ignoreBrowsers = ['op_mini'],
    missingBrowsers = 'ignore',
    unknownBrowsers = 'off',
    targets = 'auto',
    pinnedDate,
  } = options
  let directory = normalizeRoot(options.root)
  let explicit = targets === 'auto' ? {} : targets
  let result: ResolvedRuntimeTargets = {
    ignoredBrowsers: [],
    browserOrigins: {},
    warnings: [],
    unknown: [],
    sources: [],
  }
  let context = {
    ignoreBrowsers: ignoreBrowsers.map(name => normalizeAgent(name)),
    strictEnvironment: options.browserslistEnv !== undefined,
    browserslistEnvironment,
    missingBrowsers,
    unknownBrowsers,
    pinnedDate,
    directory,
    result,
  }

  let packageJson = findPackageJson(directory)
  if (!packageJson) {
    result.warnings.push(
      `no package.json in or above ${directory}; is "root" correct?`,
    )
  }

  let nodeVersions = withQuietBrowserslist(result, 'browser', () =>
    resolveBrowsers({ ...context, explicit: explicit.browsers }),
  )

  /**
   * With explicit browsers, Node.js entries come from those queries or, when
   * they have none, from the project config, read lazily.
   */
  resolveNode({
    readConfigNodeVersions: () =>
      explicit.browsers === undefined || nodeVersions.length > 0 ?
        nodeVersions
      : withQuietBrowserslist(result, 'node', () =>
          readConfigNodeVersions(context),
        ),
    explicit: explicit.node,
    packageJson,
    fallback,
    result,
  })

  return result
}

/**
 * Compares dotted numeric versions such as `18.2` and `18.10`.
 *
 * @param left - First version.
 * @param right - Second version.
 * @returns A negative number, zero or a positive number.
 */
export function compareVersions(left: string, right: string): number {
  let leftParts = left.split('.').map(Number)
  let rightParts = right.split('.').map(Number)
  let length = Math.max(leftParts.length, rightParts.length)

  for (let index = 0; index < length; index++) {
    let difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0)
    if (difference !== 0) {
      return difference
    }
  }

  return 0
}

/**
 * Rewrites date-relative Baseline queries so that the result depends on the
 * pinned date instead of the current day.
 *
 * @param queries - Browserslist queries.
 * @param date - Date in `YYYY-MM-DD` format.
 * @returns Queries with an explicit date.
 */
export function pinBaselineQueries(queries: string[], date: string): string[] {
  return queries.map(query =>
    query
      .replaceAll(
        /\bbaseline\s+widely\s+available\b(?!\s+on\b)/giu,
        `baseline widely available on ${date}`,
      )
      .replaceAll(
        /\bbaseline\s+newly\s+available\b/giu,
        () => `baseline widely available on ${addMonths(date, 30)}`,
      ),
  )
}

/**
 * Turns a Node.js option into a semver range.
 *
 * @param value - Range or bare version such as `22.12`.
 * @returns The range, or `undefined` when it is invalid or unsatisfiable.
 */
export function normalizeNodeRange(value: string): undefined | string {
  let trimmed = value.trim().replace(/^v/u, '')
  let range =
    /^\d+(?:\.\d+){0,2}(?:-[\w.]+)?$/u.test(trimmed) ? `>=${trimmed}` : trimmed
  return validateRange(range)
}

/**
 * Validates options so that typos fail loudly instead of silently changing
 * which rules are enabled.
 *
 * @param options - Options passed by the user.
 */
function validateOptions(options: unknown): void {
  if (!isRecord(options)) {
    throw new TypeError(`${ERROR_PREFIX}: options must be an object`)
  }

  for (let key of Object.keys(options)) {
    if (!optionKeys.has(key)) {
      throw new TypeError(`${ERROR_PREFIX}: unknown option "${key}"`)
    }
  }

  let { unknownBrowsers, missingBrowsers, pinnedDate, fallback, targets } =
    options

  let { browserslistEnv: browserslistEnvironment, ignoreBrowsers } = options
  if (
    browserslistEnvironment !== undefined &&
    (typeof browserslistEnvironment !== 'string' ||
      browserslistEnvironment === '' ||
      browserslistEnvironment.trim() !== browserslistEnvironment)
  ) {
    throw new TypeError(
      `${ERROR_PREFIX}: browserslistEnv must be a non-empty string without surrounding spaces`,
    )
  }
  if (
    ignoreBrowsers !== undefined &&
    (!Array.isArray(ignoreBrowsers) ||
      ignoreBrowsers.some(
        name =>
          typeof name !== 'string' ||
          !Object.hasOwn(browserslist.data, normalizeAgent(name)),
      ))
  ) {
    throw new TypeError(
      `${ERROR_PREFIX}: ignoreBrowsers must be an array of browserslist agents such as op_mini`,
    )
  }

  if (!unknownBrowsersValues.has(unknownBrowsers)) {
    throw new TypeError(
      `${ERROR_PREFIX}: unknownBrowsers must be "off" or "ignore", got ${JSON.stringify(unknownBrowsers)}`,
    )
  }

  if (
    missingBrowsers !== undefined &&
    missingBrowsers !== 'off' &&
    missingBrowsers !== 'ignore' &&
    !isQueryList(missingBrowsers)
  ) {
    throw new TypeError(
      `${ERROR_PREFIX}: missingBrowsers must be "off", "ignore" or non-empty queries`,
    )
  }

  if (
    pinnedDate !== undefined &&
    (typeof pinnedDate !== 'string' || !isIsoDate(pinnedDate))
  ) {
    throw new TypeError(
      `${ERROR_PREFIX}: pinnedDate must be a YYYY-MM-DD date, got ${JSON.stringify(pinnedDate)}`,
    )
  }

  if (
    fallback !== undefined &&
    fallback !== false &&
    (!isRecord(fallback) || typeof fallback['node'] !== 'string')
  ) {
    throw new TypeError(
      `${ERROR_PREFIX}: fallback must be false or { node: string }`,
    )
  }

  if (targets === undefined || targets === 'auto') {
    return
  }

  if (!isRecord(targets)) {
    throw new TypeError(
      `${ERROR_PREFIX}: targets must be "auto" or an object, got ${JSON.stringify(targets)}`,
    )
  }

  for (let key of Object.keys(targets)) {
    if (key !== 'browsers' && key !== 'node') {
      throw new TypeError(
        `${ERROR_PREFIX}: unknown targets key "${key}" (expected "browsers" or "node")`,
      )
    }
  }

  let { browsers, node } = targets
  if (browsers !== undefined && browsers !== false && !isQueryList(browsers)) {
    throw new TypeError(
      `${ERROR_PREFIX}: targets.browsers must be false or non-empty browserslist queries`,
    )
  }
  if (node !== undefined && node !== false && typeof node !== 'string') {
    throw new TypeError(
      `${ERROR_PREFIX}: targets.node must be a string or false, got ${JSON.stringify(node)}`,
    )
  }
}

/**
 * Resolves the Node.js target and stores it in `result`.
 *
 * @param context - Options and the mutable result.
 */
function resolveNode(context: {
  packageJson: { value: unknown; file: string } | undefined
  explicit: RuntimeTargetsOption['node']
  readConfigNodeVersions(): string[]
  fallback: { node: string } | false
  result: ResolvedRuntimeTargets
}): void {
  let { packageJson, explicit, fallback, result } = context

  if (explicit === false) {
    result.sources.push('node: not targeted (targets.node is false)')
    return
  }

  if (explicit !== undefined) {
    let range = normalizeNodeRange(explicit)
    if (range === undefined) {
      throw new TypeError(
        `${ERROR_PREFIX}: targets.node "${explicit}" is not a satisfiable semver range`,
      )
    }
    setNode(
      result,
      { source: 'explicit', range },
      `node: targets.node "${explicit}"`,
    )
    return
  }

  let engines =
    isRecord(packageJson?.value) ? packageJson.value['engines'] : undefined

  if (packageJson && isRecord(engines) && 'node' in engines) {
    let value = engines['node']
    let range =
      typeof value === 'string' ? validateRange(value.trim()) : undefined
    if (range === undefined) {
      result.unknown.push({
        reason: `${packageJson.file}: unusable engines.node ${JSON.stringify(value)}`,
        runtime: 'node',
      })
      result.warnings.push(
        `${packageJson.file}: engines.node ${JSON.stringify(value)} is not a valid semver range`,
      )
      return
    }
    setNode(
      result,
      { source: 'engines', range },
      `node: ${packageJson.file} engines.node "${String(value)}"`,
    )
    return
  }

  /**
   * Browserslist config is read for Node.js entries only when engines.node is
   * missing, so a broken config cannot affect projects that declare engines.
   */
  let nodeVersions = context.readConfigNodeVersions()

  if (nodeVersions.length > 0) {
    /**
     * Browserslist returns the newest release of a line (`node 20` gives
     * 20.20.0), so every version is floored to its major release. Bounds built
     * from `semver.major()` always form a valid range.
     */
    let range = [
      ...new Set(nodeVersions.map(version => `>=${semver.major(version)}.0.0`)),
    ].join(' || ')
    setNode(
      result,
      { range: semver.validRange(range)!, source: 'browserslist' },
      'node: browserslist node queries (floored to major)',
    )
    return
  }

  if (fallback === false) {
    result.unknown.push({
      reason: 'node: no engines.node and fallback is disabled',
      runtime: 'node',
    })
    return
  }

  let range = normalizeNodeRange(fallback.node)
  if (range === undefined) {
    throw new TypeError(
      `${ERROR_PREFIX}: fallback.node "${fallback.node}" is not a satisfiable semver range`,
    )
  }
  setNode(
    result,
    { source: 'fallback', range },
    `node: no engines.node, fallback "${fallback.node}"`,
  )
}

/**
 * Resolves browser targets and stores them in `result`.
 *
 * @param context - Options and the mutable result.
 * @returns Node.js versions found in browserslist output.
 */
function resolveBrowsers(context: {
  missingBrowsers: Required<ResolveRuntimeTargetsOptions>['missingBrowsers']
  explicit: RuntimeTargetsOption['browsers']
  unknownBrowsers: 'ignore' | 'off'
  browserslistEnvironment: string
  result: ResolvedRuntimeTargets
  pinnedDate: undefined | string
  strictEnvironment: boolean
  ignoreBrowsers: string[]
  directory: string
}): string[] {
  let {
    browserslistEnvironment,
    missingBrowsers,
    directory,
    explicit,
    result,
  } = context

  if (explicit === false) {
    result.sources.push('browsers: not targeted (targets.browsers is false)')
    return []
  }

  let queries: string[]
  let origin: string

  if (explicit === undefined) {
    let config = readBrowserslistConfig(directory, browserslistEnvironment)

    if (config) {
      ;({ queries, origin } = config)
      if (context.strictEnvironment && config.missingSection) {
        let reason = `${origin} has sections, but none for browserslistEnv "${browserslistEnvironment}"`
        result.unknown.push({ runtime: 'browser', reason })
        result.warnings.push(reason)
        return []
      }
      if (queries.length === 0) {
        result.unknown.push({
          reason: `${origin} has no queries for "${browserslistEnvironment}"`,
          runtime: 'browser',
        })
        return []
      }
      warnAboutAncestorConfig(config.file, directory, result)
    } else {
      if (missingBrowsers === 'ignore') {
        result.sources.push(
          `browsers: not targeted (no browserslist config in or above ${directory})`,
        )
        return []
      }
      if (missingBrowsers === 'off') {
        result.unknown.push({
          reason: `no browserslist config in or above ${directory}`,
          runtime: 'browser',
        })
        return []
      }
      origin = 'missingBrowsers option'
      queries = [missingBrowsers].flat()
      result.warnings.push(
        `no browserslist config; assuming ${queries.join(', ')}`,
      )
    }
  } else {
    origin = 'targets.browsers'
    queries = [explicit].flat()
  }

  if (queries.some(query => /\bcurrent\s+node\b/iu.test(query))) {
    result.warnings.push(
      `${origin}: "current node" depends on the Node.js that runs ESLint`,
    )
  }

  let entries = evaluateQueries(queries, origin, context)
  result.sources.push(`browsers: ${origin} (${browserslistEnvironment})`)

  if (entries.length === 0) {
    result.warnings.push(`${origin}: queries select no browsers`)
    if (explicit === undefined) {
      result.unknown.push({
        reason: `${origin}: queries select no browsers`,
        runtime: 'browser',
      })
    }
  }

  return collectBrowsers(entries, context)
}

/**
 * Resolves nested configs before combining their browser sets. Flattening
 * strings would change intersections and negation; evaluating unexpanded
 * `extends` would also reuse Browserslist results cached for a different date.
 *
 * @param queries - Queries to evaluate, including nested configs.
 * @param options - Browserslist environment and project directory.
 * @param date - Pinned data date.
 * @returns Sorted, unique browser versions.
 */
function resolvePinnedQueries(
  queries: readonly string[],
  options: {
    mobileToDesktop: boolean
    path: string
    env: string
  },
  date: string,
): string[] {
  let stats: browserslist.Stats | undefined

  /**
   * Nested configs share the statistics loaded by previous clauses, just as
   * they share a context in Browserslist's resolver.
   *
   * @param nestedQueries - Queries at this nesting level.
   * @param depth - Nesting level, which stops cycles.
   * @returns Sorted, unique browser versions.
   */
  function resolveQueries(
    nestedQueries: readonly string[],
    depth: number,
  ): string[] {
    if (depth > 64) {
      throw new Error('Browserslist configs are circular or nested too deeply')
    }

    let result = new Set<string>()
    let nodes = browserslist.parse(nestedQueries) as ParsedQuery[]
    for (let [index, query] of nodes.entries()) {
      if (index === 0 && query.not) {
        throw new Error(
          `Write a positive browsers query before "${query.query}"`,
        )
      }
      let nested: readonly string[] | undefined
      if (query.type === 'extends' && query.config !== undefined) {
        nested = getBrowserslistNode().loadQueries(options, query.config)
      } else if (query.type === 'browserslist_config') {
        nested =
          readBrowserslistConfig(options.path, options.env)?.queries ??
          browserslist.defaults
      }
      let text = query.query.replace(/^not /iu, '')
      if (
        query.type === 'popularity_in_config_stats' ||
        query.type === 'cover_config'
      ) {
        stats =
          getBrowserslistNode().loadStat(
            options,
            query.config!,
            browserslist.data,
          ) ?? stats
        text = text.replace(/\s+in\s+\S+\s+stats$/iu, ' in my stats')
      }
      let selected =
        nested === undefined ?
          browserslist(pinBaselineQueries([text], date), { ...options, stats })
        : resolveQueries(nested, depth + 1)

      if (!query.not && query.compose === 'or') {
        for (let entry of selected) {
          result.add(entry)
        }
      } else {
        let filter = new Set(selected)
        result = new Set(
          [...result].filter(entry => filter.has(entry) !== Boolean(query.not)),
        )
      }
    }

    return browserslist([...result], options)
  }

  return resolveQueries(queries, 0)
}

/**
 * Browserslist has a single version of some agents and silently maps other
 * versions to it: `op_mob >= 46` and `op_mob 46-80` give `op_mob 80`, and
 * `and_uc >= 16` gives nothing. Such targets are marked unknown, because their
 * real minimum is outside the data. Shareable configs and `browserslist config`
 * are expanded first.
 *
 * @param queries - Pinned browserslist queries.
 * @param entries - Browserslist output.
 * @param context - Environment, directory, ignored agents and the result.
 */
function markCollapsedVersions(
  queries: string[],
  entries: string[],
  context: {
    browserslistEnvironment: string
    result: ResolvedRuntimeTargets
    ignoreBrowsers: string[]
    directory: string
  },
): void {
  let { ignoreBrowsers, result } = context
  let lowest = new Map<string, string>()
  for (let entry of entries) {
    let [name = '', version = ''] = entry.split(' ', 2)
    let [first = version] = version.split('-', 1)
    let current = lowest.get(name)
    if (
      collapsingAgents.has(name) &&
      (current === undefined || compareVersions(first, current) < 0)
    ) {
      lowest.set(name, first)
    }
  }

  let nodes = expandQueries(queries, context, 0)
  if (!nodes) {
    for (let [agent, selected] of lowest) {
      if (!ignoreBrowsers.includes(agent)) {
        result.unknown.push({
          reason: `${agent} ${selected}: cannot check the queries behind it for older versions`,
          runtime: 'browser',
        })
      }
    }
    return
  }

  for (let query of nodes) {
    let agent =
      query.browser === undefined ? undefined : normalizeAgent(query.browser)
    if (
      agent === undefined ||
      query.not ||
      !collapsingAgents.has(agent) ||
      ignoreBrowsers.includes(agent)
    ) {
      continue
    }
    let reason = findCollapse(query, agent, lowest.get(agent))
    if (reason) {
      result.unknown.push({
        reason: `"${query.query}": ${reason}`,
        runtime: 'browser',
      })
    }
  }
}

/**
 * Turns browserslist output into minimal versions per BCD browser.
 *
 * @param entries - Output such as `safari 17.4` or `ios_saf 18.5-18.7`.
 * @param context - Policies and the mutable result.
 * @returns Node.js versions found in the output.
 */
function collectBrowsers(
  entries: string[],
  context: {
    unknownBrowsers: 'ignore' | 'off'
    result: ResolvedRuntimeTargets
    ignoreBrowsers: string[]
  },
): string[] {
  let { unknownBrowsers, ignoreBrowsers, result } = context
  let browsers: Partial<Record<BcdBrowser, string>> = {}
  let nodeVersions: string[] = []

  for (let entry of entries) {
    let [name = '', rawVersion = ''] = entry.split(' ', 2)
    let [lowest = rawVersion] = rawVersion.split('-', 1)

    if (name === 'node') {
      nodeVersions.push(lowest)
      continue
    }

    if (ignoreBrowsers.includes(name)) {
      result.ignoredBrowsers.push(entry)
      continue
    }

    /**
     * Safari Technology Preview is newer than any release.
     */
    if (rawVersion === 'TP') {
      continue
    }

    let target = mapBrowser(name, lowest)

    if (!target) {
      if (unknownBrowsers === 'off') {
        result.unknown.push({
          reason: `${entry}: no compatibility data`,
          runtime: 'browser',
        })
      } else {
        result.ignoredBrowsers.push(entry)
      }
      continue
    }

    let current = browsers[target.browser]
    if (current === undefined || compareVersions(target.version, current) < 0) {
      browsers[target.browser] = target.version
      result.browserOrigins[target.browser] = entry
    }
  }

  result.browsers = browsers

  return nodeVersions
}

/**
 * Reads the browserslist config of a directory, ignoring the `BROWSERSLIST` and
 * `BROWSERSLIST_CONFIG` environment variables so linting is reproducible.
 *
 * @param directory - Directory to start from.
 * @param environment - Section to read, such as `production`.
 * @returns Queries, their origin and whether the section is missing, or
 *   `undefined` without a config.
 */
function readBrowserslistConfig(
  directory: string,
  environment: string,
):
  | { missingSection: boolean; queries: string[]; origin: string; file: string }
  | undefined {
  /**
   * Browserslist caches lookups for the lifetime of the process, which is wrong
   * for long-lived editor servers.
   */
  browserslist.clearCaches()

  let file: undefined | string
  let config: Partial<Record<string, string[] | string>> | undefined
  try {
    file = browserslist.findConfigFile(directory)
    config = browserslist.findConfig(directory)
  } catch (error) {
    throw createError(
      `invalid browserslist config in or above ${directory}`,
      error,
    )
  }

  if (!file || !config) {
    return undefined
  }

  let section = config[environment] ?? config['defaults'] ?? []
  let queries = [section].flat().filter(query => query.trim() !== '')

  /**
   * A flat config applies to every environment. A config with sections but
   * without the requested one silently falls back to `defaults`.
   */
  let missingSection =
    !Object.hasOwn(config, environment) &&
    Object.keys(config).some(key => key !== 'defaults')

  return { missingSection, origin: file, queries, file }
}

/**
 * Reads only the Node.js entries of the project browserslist config. Used when
 * browsers are given explicitly but Node.js is detected automatically.
 *
 * @param context - Options and the mutable result.
 * @returns Node.js versions from the config.
 */
function readConfigNodeVersions(context: {
  browserslistEnvironment: string
  result: ResolvedRuntimeTargets
  pinnedDate: undefined | string
  directory: string
}): string[] {
  let config = readBrowserslistConfig(
    context.directory,
    context.browserslistEnvironment,
  )
  if (!config || config.queries.length === 0) {
    return []
  }

  /**
   * Browser problems of this config go to a scratch result, so they cannot
   * block browsers that are explicit or not targeted.
   */
  let scratch: ResolvedRuntimeTargets = {
    ignoredBrowsers: [],
    browserOrigins: {},
    warnings: [],
    unknown: [],
    sources: [],
  }
  let nodeVersions = evaluateQueries(config.queries, config.origin, {
    ...context,
    ignoreBrowsers: [],
    result: scratch,
  })
    .filter(entry => entry.startsWith('node '))
    .map(entry => entry.slice('node '.length))

  if (nodeVersions.length > 0) {
    context.result.sources.push(
      `node: only node entries read from ${config.origin}`,
    )
  }

  return nodeVersions
}

/**
 * Parses queries and expands `extends` and `browserslist config`.
 *
 * @param queries - Browserslist queries.
 * @param context - Environment and directory.
 * @param depth - Nesting level, which stops cycles.
 * @returns Leaf query nodes, or `undefined` when a config cannot be read.
 */
function expandQueries(
  queries: string[],
  context: { browserslistEnvironment: string; directory: string },
  depth: number,
): ParsedQuery[] | undefined {
  if (depth > 8) {
    return undefined
  }

  let nodes: ParsedQuery[] = []
  for (let query of browserslist.parse(queries) as ParsedQuery[]) {
    let nested: undefined | string[]
    if (query.type === 'extends' && query.config !== undefined) {
      nested = loadSharedConfig(query.config, context)
    } else if (query.type === 'browserslist_config') {
      nested =
        readBrowserslistConfig(
          context.directory,
          context.browserslistEnvironment,
        )?.queries ?? []
    } else {
      nodes.push(query)
      continue
    }

    let expanded = nested && expandQueries(nested, context, depth + 1)
    if (!expanded) {
      return undefined
    }
    for (let node of expanded) {
      nodes.push(query.not ? { ...node, not: true } : node)
    }
  }

  return nodes
}

/**
 * Runs browserslist with fresh caches and without its "caniuse-lite is
 * outdated" warning, which belongs to build tools. Its "could not parse"
 * warnings become unknown targets: browserslist skips such a `package.json` and
 * may pick a config further up instead.
 *
 * @param result - Mutable result.
 * @param runtime - Runtime whose targets a skipped config could hide.
 * @param callback - Code that calls browserslist.
 * @returns The callback result.
 */
function withQuietBrowserslist<T>(
  result: ResolvedRuntimeTargets,
  runtime: 'browser' | 'node',
  callback: () => T,
): T {
  let previous = process.env.BROWSERSLIST_IGNORE_OLD_DATA
  let { warn } = console
  browserslist.clearCaches()
  process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true'
  console.warn = (...values: unknown[]) => {
    let message = values.map(String).join(' ')
    if (!message.startsWith('[Browserslist] Could not parse')) {
      warn(...values)
      return
    }
    let reason = message.replace('[Browserslist] ', '')
    if (result.unknown.every(item => item.reason !== reason)) {
      result.unknown.push({ runtime, reason })
      result.warnings.push(reason)
    }
  }
  try {
    return callback()
  } finally {
    console.warn = warn
    if (previous === undefined) {
      delete process.env.BROWSERSLIST_IGNORE_OLD_DATA
    } else {
      process.env.BROWSERSLIST_IGNORE_OLD_DATA = previous
    }
  }
}

/**
 * Warns when browsers come from a config above the nearest `package.json`,
 * which usually means a monorepo root decides for a package. When that config
 * is a `package.json` with `engines.node`, the warning says that engines are
 * not inherited.
 *
 * @param file - Browserslist config file.
 * @param directory - Project directory.
 * @param result - Mutable result.
 */
function warnAboutAncestorConfig(
  file: string,
  directory: string,
  result: ResolvedRuntimeTargets,
): void {
  let nearest = findPackageJson(directory)
  if (!nearest || nearest.file === file) {
    return
  }

  let packageDirectory = path.dirname(nearest.file)
  let relative = path.relative(packageDirectory, path.dirname(file))
  if (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  ) {
    return
  }

  let ancestor =
    path.basename(file) === 'package.json' ?
      findPackageJson(path.dirname(file))
    : undefined
  let engines =
    isRecord(ancestor?.value) ? ancestor.value['engines'] : undefined
  let enginesNote =
    isRecord(engines) && typeof engines['node'] === 'string' ?
      `; its engines.node "${engines['node']}" is not inherited`
    : ''

  result.warnings.push(
    `browsers for ${nearest.file} come from ancestor config ${file}${enginesNote}`,
  )
}

/**
 * Maps a browserslist agent to a BCD browser and version.
 *
 * @param name - Browserslist agent name.
 * @param version - Lowest version of the entry.
 * @returns The BCD browser and version, or `undefined` without data.
 */
function mapBrowser(
  name: string,
  version: string,
): { browser: BcdBrowser; version: string } | undefined {
  let browser = browserslistToBcd.get(name)

  if (browser) {
    return { version, browser }
  }

  let downstream = downstreamBrowsers.get(name)
  if (!downstream) {
    return undefined
  }

  if (!downstreamReleases) {
    let releases: unknown = getAllVersions({
      includeDownstreamBrowsers: true,
      outputFormat: 'array',
      includeKaiOS: true,
    })
    downstreamReleases =
      Array.isArray(releases) ? (releases as DownstreamRelease[]) : []
  }

  let release = downstreamReleases.find(
    item => item.browser === downstream && item.version === version,
  )
  let engineBrowser =
    release?.engine ? engineToBcd.get(release.engine) : undefined

  return engineBrowser && release?.engine_version ?
      { version: release.engine_version, browser: engineBrowser }
    : undefined
}

/**
 * Runs browserslist with pinned dates and readable errors.
 *
 * @param queries - Browserslist queries.
 * @param origin - Description of where the queries came from.
 * @param context - Environment, directory, pinned date and the result.
 * @returns Browserslist output.
 */
function evaluateQueries(
  queries: string[],
  origin: string,
  context: {
    browserslistEnvironment: string
    result: ResolvedRuntimeTargets
    pinnedDate: undefined | string
    ignoreBrowsers: string[]
    directory: string
  },
): string[] {
  let pinned =
    context.pinnedDate === undefined ?
      queries
    : pinBaselineQueries(queries, context.pinnedDate)
  let entries: string[]

  try {
    let options = {
      env: context.browserslistEnvironment,
      path: context.directory,
      mobileToDesktop: true,
    }
    entries =
      context.pinnedDate === undefined ?
        browserslist(pinned, options)
      : resolvePinnedQueries(pinned, options, context.pinnedDate)
  } catch (error) {
    throw createError(`cannot resolve browsers from ${origin}`, error)
  }

  markCollapsedVersions(pinned, entries, context)

  return entries
}

/**
 * Checks one query of a single-version agent against the data.
 *
 * @param query - Parsed query that names the agent.
 * @param agent - Canonical agent name.
 * @param selected - Lowest version browserslist selected, if any.
 * @returns Why the query cannot be evaluated, or `undefined`.
 */
function findCollapse(
  query: ParsedQuery,
  agent: string,
  selected: undefined | string,
): undefined | string {
  if (query.sign === '<' || query.sign === '<=') {
    return selected === undefined ? undefined : (
        `browserslist has no data for ${agent} older than ${selected}`
      )
  }
  let lower = query.version ?? query.from
  if (lower === undefined) {
    return undefined
  }
  if (selected !== undefined) {
    return compareVersions(lower, selected) < 0 ?
        `browserslist has no data for ${agent} older than ${selected}`
      : undefined
  }
  let newest = browserslist.data[agent]?.released.at(-1)
  let threshold = query.sign === '>' ? 0 : 1
  return newest !== undefined && compareVersions(lower, newest) >= threshold ?
      `browserslist has no data for ${agent} newer than ${newest}`
    : undefined
}

/**
 * Finds and parses the nearest `package.json`, like npm and `eslint-plugin-n`.
 *
 * @param directory - Directory to start from.
 * @returns Parsed content and path, or `undefined` when none exists.
 */
function findPackageJson(
  directory: string,
): { value: unknown; file: string } | undefined {
  let current = directory

  for (;;) {
    let file = path.join(current, 'package.json')
    let text: undefined | string

    try {
      text = readFileSync(file, 'utf8')
    } catch (error) {
      if (!isMissingFileError(error)) {
        throw createError(`cannot read ${file}`, error)
      }
    }

    if (text !== undefined) {
      try {
        return {
          value: JSON.parse(text.replace(/^\u{FEFF}/u, '')) as unknown,
          file,
        }
      } catch (error) {
        throw createError(`cannot parse ${file}`, error)
      }
    }

    let parent = path.dirname(current)
    if (parent === current) {
      return undefined
    }
    current = parent
  }
}

/**
 * Validates `root` and turns it into a directory.
 *
 * @param root - Absolute path or file URL.
 * @returns Absolute directory path.
 */
function normalizeRoot(root: unknown): string {
  let value =
    (
      root instanceof URL ||
      (typeof root === 'string' && root.startsWith('file:'))
    ) ?
      fileURLToPath(root)
    : root

  if (typeof value !== 'string' || !path.isAbsolute(value)) {
    throw new TypeError(
      `${ERROR_PREFIX}: root must be an absolute path such as import.meta.dirname, got ${JSON.stringify(value)}`,
    )
  }

  let stat = statSync(value, { throwIfNoEntry: false })
  if (!stat) {
    throw new TypeError(`${ERROR_PREFIX}: root "${value}" does not exist`)
  }

  return stat.isDirectory() ? value : path.dirname(value)
}

/**
 * Loads the queries of a shareable config the way browserslist does.
 *
 * @param name - Package name from `extends`.
 * @param context - Environment and directory.
 * @returns Queries, or `undefined` when they cannot be loaded.
 */
function loadSharedConfig(
  name: string,
  context: { browserslistEnvironment: string; directory: string },
): undefined | string[] {
  try {
    return getBrowserslistNode().loadQueries(
      { env: context.browserslistEnvironment, path: context.directory },
      name,
    )
  } catch {
    return undefined
  }
}

/**
 * Stores a validated, satisfiable Node.js range in the result.
 *
 * @param result - Mutable result.
 * @param node - Range and its origin.
 * @param source - Description for `sources`.
 */
function setNode(
  result: ResolvedRuntimeTargets,
  node: Pick<NonNullable<ResolvedRuntimeTargets['node']>, 'source' | 'range'>,
  source: string,
): void {
  let minimum = semver.minVersion(node.range)!.version
  result.node = { ...node, minimum }
  result.sources.push(source)
}

/**
 * Checks whether a value is a non-empty list of browserslist queries.
 *
 * @param value - Candidate queries.
 * @returns Whether the value can be passed to browserslist.
 */
function isQueryList(value: unknown): value is string[] | string {
  let list: unknown[] = [value].flat()
  return (
    list.length > 0 &&
    list.every(query => typeof query === 'string' && query.trim() !== '')
  )
}

/**
 * Returns a semver range that has at least one version.
 *
 * @param range - Range text.
 * @returns The normalized range, or `undefined`.
 */
function validateRange(range: string): undefined | string {
  let validRange = semver.validRange(range)
  return validRange === null || semver.minVersion(validRange) === null ?
      undefined
    : validRange
}

/**
 * Creates an error with a consistent prefix.
 *
 * @param message - What failed.
 * @param cause - Value thrown by the failed operation.
 * @returns An error that keeps the original value as `cause`.
 */
function createError(message: string, cause: unknown): Error {
  let details = cause instanceof Error ? cause.message : String(cause)
  return new Error(`${ERROR_PREFIX}: ${message}: ${details}`, { cause })
}

/**
 * Adds months to an ISO date.
 *
 * @param date - Date in `YYYY-MM-DD` format.
 * @param months - Number of months.
 * @returns The new date in `YYYY-MM-DD` format.
 */
function addMonths(date: string, months: number): string {
  let value = new Date(`${date}T00:00:00Z`)
  value.setUTCMonth(value.getUTCMonth() + months)
  return value.toISOString().slice(0, 10)
}

/**
 * Checks that a string is a real `YYYY-MM-DD` date.
 *
 * @param value - Candidate date.
 * @returns Whether the date is valid.
 */
function isIsoDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    addMonths(value, 0) === value
  )
}

/**
 * Loads the same CommonJS config loader that Browserslist uses internally.
 *
 * @returns The shared loader module.
 */
function getBrowserslistNode(): BrowserslistNode {
  browserslistNode ??= createRequire(import.meta.url)(
    'browserslist/node',
  ) as BrowserslistNode
  return browserslistNode
}

/**
 * Checks whether a file system error means that the file does not exist.
 *
 * @param error - Thrown value.
 * @returns Whether the error is `ENOENT` or `ENOTDIR`.
 */
function isMissingFileError(error: unknown): boolean {
  let code = isRecord(error) ? error['code'] : undefined
  return code === 'ENOENT' || code === 'ENOTDIR'
}

/**
 * Checks whether a value is a plain object.
 *
 * @param value - Any value.
 * @returns Whether the value can be read as a record.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Turns a browserslist agent name or alias into its canonical name.
 *
 * @param name - Name such as `OperaMobile` or `op_mob`.
 * @returns Canonical name such as `op_mob`.
 */
function normalizeAgent(name: string): string {
  let lower = name.trim().toLowerCase()
  return browserslist.aliases[lower] ?? lower
}
