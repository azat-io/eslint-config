import type { Linter } from 'eslint'

import { isDeepStrictEqual } from 'node:util'
import { createHash } from 'node:crypto'

import type {
  ResolveRuntimeTargetsOptions,
  ResolvedRuntimeTargets,
  RuntimeTargetsOption,
  RuleSupport,
} from './runtime-targets'

import { resolveRuntimeTargets, explainRuleSupport } from './runtime-targets'
import support from './runtime-support.json' with { type: 'json' }

/**
 * Files that run on Node.js even in browser projects, without extensions.
 */
const NODE_TOOLING_PATTERNS = [
  '**/*.config',
  '**/{vitest.workspace,gulpfile,Gruntfile}',
  '**/.storybook/main',
  '**/{scripts,bin,tools}/**/*',
]

/**
 * Result of {@link createRuntimeGate}.
 */
export interface RuntimeGate {
  /**
   * Settings for `eslint-plugin-n` and an explanation that `--print-config`
   * shows.
   */
  settings: Record<string, unknown>

  /**
   * Resolved targets, for debugging.
   */
  targets: ResolvedRuntimeTargets

  /**
   * Rule overrides: only downgrades of rules enabled in the base config.
   */
  rules: Linter.RulesRecord
}

/**
 * Options of {@link createRuntimeGate}.
 */
export interface RuntimeGateOptions extends ResolveRuntimeTargetsOptions {
  /**
   * Rules of the base config. Only enabled rules are downgraded.
   */
  baseRules: Partial<Linter.RulesRecord>

  /**
   * Do not print warnings; they stay in `settings` for `--print-config`.
   */
  quiet?: boolean
}

/**
 * Generated support table.
 */
interface RuntimeSupportTable {
  rules: Record<string, RuleSupport>
  floor: RuleSupport
  date: string
}

/**
 * Downgrades of one target set, before warnings are printed.
 */
interface GateResult extends RuntimeGate {
  warnings: string[]
}

const WARNING_CODE = 'AZAT_IO_ESLINT_RUNTIME_TARGETS'

/**
 * Environment variable with hashes of printed warnings. Worker threads copy the
 * environment of the main thread, which loads the config first, so every
 * warning is printed once per ESLint run.
 */
const WARNED_VARIABLE = 'AZAT_IO_ESLINT_RUNTIME_WARNED'

/**
 * Builds config blocks: the project gate for all files and, for files that
 * always run on Node.js, a block checked against Node.js only. That block turns
 * back on Node.js-only rules that the project gate disabled (for example with
 * `targets.node: false`) and applies downgrades the Node.js target needs.
 *
 * @param options - Gate options, the Node.js range of tooling files (by default
 *   the project range) and the extensions of tooling files the base config
 *   lints (by default `js`, `cjs` and `mjs`).
 * @returns Config blocks to append after the base config.
 */
export function createRuntimeConfigs({
  toolingExtensions = ['js', 'cjs', 'mjs'],
  quiet = false,
  toolingNode,
  baseRules,
  ...options
}: {
  toolingExtensions?: string[]
  toolingNode?: string
} & RuntimeGateOptions): Linter.Config[] {
  let project = computeGate(baseRules, options)
  let configs: Linter.Config[] = [
    {
      name: 'azat-io/runtime-targets',
      settings: project.settings,
      rules: project.rules,
    },
  ]
  let explicitNode: RuntimeTargetsOption['node'] =
    options.targets === undefined || options.targets === 'auto' ?
      undefined
    : options.targets.node

  /**
   * An unknown project Node.js target already turned Node.js rules off; the
   * tooling block must not guess a different one.
   */
  if (
    toolingNode === undefined &&
    explicitNode !== false &&
    !project.targets.node
  ) {
    if (!quiet) {
      reportWarnings(project.warnings)
    }
    return configs
  }

  let node =
    toolingNode ??
    (explicitNode === false ? undefined : project.targets.node?.range)
  let tooling = computeGate(baseRules, {
    ...options,
    targets: { ...(node !== undefined && { node }), browsers: false },
  })
  let table = support as RuntimeSupportTable
  let toolingRules: Linter.RulesRecord = {}

  for (let [rule, ruleSupport] of Object.entries(table.rules)) {
    let base = baseRules[rule]
    if (!isEnabled(base)) {
      continue
    }
    let projectEntry = project.rules[rule] ?? base
    let toolingEntry = tooling.rules[rule]
    if (toolingEntry !== undefined) {
      if (!isDeepStrictEqual(toolingEntry, projectEntry)) {
        toolingRules[rule] = toolingEntry
      }
    } else if (projectEntry !== base && ruleSupport.scope === 'node') {
      toolingRules[rule] = base
    }
  }

  if (!quiet) {
    reportWarnings([
      ...project.warnings,
      ...tooling.warnings.filter(
        warning => !project.warnings.includes(warning),
      ),
    ])
  }

  if (Object.keys(toolingRules).length > 0) {
    configs.push({
      files: getNodeToolingFiles(toolingExtensions),
      settings: getNodeSettings(tooling.targets),
      name: 'azat-io/runtime-targets/tooling',
      rules: toolingRules,
    })
  }

  return configs
}

/**
 * Computes rule downgrades for the runtime targets of a project.
 *
 * @param options - Resolver options plus the rules of the base config.
 * @returns Overrides that only turn rules off or to safer options.
 */
export function createRuntimeGate({
  quiet = false,
  baseRules,
  ...options
}: RuntimeGateOptions): RuntimeGate {
  let { warnings, ...gate } = computeGate(baseRules, options)
  if (!quiet) {
    reportWarnings(warnings)
  }
  return gate
}

/**
 * Builds glob patterns of tooling files. Only extensions that the base config
 * already lints may be passed: a `files` pattern adds matching files to the
 * lint set, and a JS-only config cannot parse TypeScript.
 *
 * @param extensions - Extensions without dots, such as `['js', 'ts']`.
 * @returns Glob patterns for a config block.
 */
export function getNodeToolingFiles(extensions: string[]): string[] {
  let suffix =
    extensions.length === 1 ? extensions.join('') : `{${extensions.join(',')}}`
  return NODE_TOOLING_PATTERNS.map(pattern => `${pattern}.${suffix}`)
}

/**
 * Computes downgrades and warnings without printing them.
 *
 * @param baseRules - Rules of the base config.
 * @param options - Resolver options.
 * @returns Downgrades, settings, targets and warnings.
 */
function computeGate(
  baseRules: Partial<Linter.RulesRecord>,
  options: ResolveRuntimeTargetsOptions,
): GateResult {
  let table = support as RuntimeSupportTable
  let targets = resolveRuntimeTargets({
    ...options,
    pinnedDate: options.pinnedDate ?? table.date,
  })
  let rules: Linter.RulesRecord = {}
  let off: Record<string, string[]> = {}

  for (let [rule, ruleSupport] of Object.entries(table.rules)) {
    let base = baseRules[rule]
    if (!isEnabled(base)) {
      continue
    }
    let { blockers, enabled } = explainRuleSupport(ruleSupport, targets)
    if (!enabled) {
      rules[rule] = downgrade(base, ruleSupport.unsupportedOptions)
      off[rule] = blockers
    }
  }

  let warnings = [...targets.warnings]
  let floorWarning = checkFloor(table.floor, targets)
  if (floorWarning) {
    warnings.push(floorWarning)
  }

  return {
    settings: {
      'azat-io/runtime-targets': {
        sources: targets.sources,
        warnings,
        off,
      },
      ...getNodeSettings(targets),
    },
    warnings,
    targets,
    rules,
  }
}

/**
 * Prints warnings as one process warning, once per ESLint run.
 *
 * @param warnings - Warnings of every gate.
 */
function reportWarnings(warnings: string[]): void {
  if (warnings.length === 0) {
    return
  }

  let message = [
    'Runtime targets:',
    ...warnings.map(warning => `  - ${warning}`),
  ].join('\n')
  let hash = createHash('sha256').update(message).digest('hex').slice(0, 16)
  let printed = (process.env[WARNED_VARIABLE] ?? '').split(',')

  if (printed.includes(hash)) {
    return
  }

  process.env[WARNED_VARIABLE] = [...printed.filter(Boolean), hash].join(',')
  process.emitWarning(message, { code: WARNING_CODE })
}

/**
 * Checks the targets against older APIs that ungated rules write.
 *
 * @param floor - Merged support row of those APIs.
 * @param targets - Resolved targets.
 * @returns A warning when the targets are below the floor.
 */
function checkFloor(
  floor: RuleSupport,
  targets: ResolvedRuntimeTargets,
): undefined | string {
  let hasVersions =
    targets.node !== undefined || Object.keys(targets.browsers ?? {}).length > 0
  if (!hasVersions) {
    return undefined
  }

  let { blockers, enabled } = explainRuleSupport(floor, {
    ...targets,
    unknown: [],
  })

  return enabled ? undefined : (
      `targets are older than this config supports (${blockers.join(', ')}); rules that are not gated may still write unsupported APIs`
    )
}

/**
 * Turns a rule off, or merges safer options into its configured options and
 * keeps its severity.
 *
 * @param entry - Enabled rule entry from the base config.
 * @param patch - Options that make the rule safe.
 * @returns The downgraded entry.
 */
function downgrade(
  entry: Linter.RuleEntry,
  patch: Record<string, unknown> | undefined,
): Linter.RuleEntry {
  if (!patch) {
    return 'off'
  }

  let severity = Array.isArray(entry) ? entry[0] : entry
  let [, options, ...rest]: unknown[] = Array.isArray(entry) ? entry : []
  if (options !== undefined && !isRecord(options)) {
    return 'off'
  }

  return [severity, { ...options, ...structuredClone(patch) }, ...rest]
}

/**
 * Settings for `eslint-plugin-n`. Ranges from `engines` and the fallback are
 * skipped: the plugin reads the nearest `package.json` of every file itself,
 * which is more precise in monorepos, and a global setting would hide its
 * reports there.
 *
 * @param targets - Resolved targets.
 * @returns Settings with `node.version`, or an empty object.
 */
function getNodeSettings(
  targets: ResolvedRuntimeTargets,
): Record<string, unknown> {
  if (
    !targets.node ||
    targets.node.source === 'engines' ||
    targets.node.source === 'fallback'
  ) {
    return {}
  }
  return { node: { version: targets.node.range } }
}

/**
 * Checks whether a rule entry is enabled.
 *
 * @param entry - Rule entry from a config.
 * @returns Whether the severity is warn or error.
 */
function isEnabled(
  entry: Linter.RuleEntry | undefined,
): entry is Linter.RuleEntry {
  let severity = Array.isArray(entry) ? entry[0] : entry
  return severity !== undefined && severity !== 'off' && severity !== 0
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
