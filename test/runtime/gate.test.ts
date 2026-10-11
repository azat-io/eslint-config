import type { Linter } from 'eslint'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { createRuntimeConfigs, createRuntimeGate } from '../../runtime/gate'

function project(packageJson: object): string {
  let root = mkdtempSync(path.join(tmpdir(), 'gate-'))
  writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson))
  return root
}

let baseRules = {
  'unicorn/prefer-uint8array-base64': 'error',
  'unicorn/prefer-array-find': 'error',
  'unicorn/prefer-at': 'error',
} as const

describe('createRuntimeGate', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env['AZAT_IO_ESLINT_RUNTIME_WARNED']
  })

  it('only downgrades rules that the base config enables', () => {
    let gate = createRuntimeGate({
      root: project({ engines: { node: '>=22' } }),
      quiet: true,
      baseRules,
    })
    expect(gate.rules).toStrictEqual({
      'unicorn/prefer-uint8array-base64': 'off',
    })
  })

  it('merges safer options into the configured ones and keeps the severity', () => {
    let root = project({
      browserslist: ['safari 15'],
      engines: { node: '>=22' },
    })
    let gate = createRuntimeGate({
      baseRules: {
        'unicorn/prefer-array-find': [
          'warn',
          { checkFromLast: true, extra: 1 },
        ],
        'unicorn/prefer-at': 'error',
      },
      quiet: true,
      root,
    })
    expect(gate.rules['unicorn/prefer-array-find']).toStrictEqual([
      'warn',
      { checkFromLast: false, extra: 1 },
    ])
    expect(gate.rules['unicorn/prefer-at']).toBe('off')

    let entry = gate.rules['unicorn/prefer-array-find'] as [
      string,
      Record<string, unknown>,
    ]
    entry[1]['checkFromLast'] = true
    let next = createRuntimeGate({ quiet: true, baseRules, root })
    expect(next.rules['unicorn/prefer-array-find']).toStrictEqual([
      'error',
      { checkFromLast: false },
    ])
  })

  it.each([
    {
      expected: ['warn', { checkFromLast: false }],
      name: 'no options',
      entry: ['warn'],
    },
    {
      expected: [2, { checkFromLast: false }, 'extra'],
      entry: [2, { checkFromLast: true }, 'extra'],
      name: 'extra items',
    },
    { entry: ['error', 'always'], name: 'string options', expected: 'off' },
    { entry: ['error', null], name: 'null options', expected: 'off' },
    { entry: ['error', ['option']], name: 'array options', expected: 'off' },
  ])('downgrades a rule with $name', ({ expected, entry }) => {
    let gate = createRuntimeGate({
      root: project({
        browserslist: ['safari 15'],
        engines: { node: '>=22' },
      }),
      baseRules: {
        'unicorn/prefer-array-find': entry as Linter.RuleEntry,
      },
      quiet: true,
    })
    expect(gate.rules).toStrictEqual({ 'unicorn/prefer-array-find': expected })
  })

  it('shares only explicit or browserslist Node.js ranges with eslint-plugin-n', () => {
    let explicit = createRuntimeGate({
      targets: { node: '>=22' },
      root: project({}),
      quiet: true,
      baseRules,
    })
    expect(explicit.settings['node']).toStrictEqual({ version: '>=22.0.0' })

    let fallback = createRuntimeGate({
      root: project({}),
      quiet: true,
      baseRules,
    })
    expect(fallback.settings['node']).toBeUndefined()
    expect(fallback.settings['azat-io/runtime']).toMatchObject({
      off: {
        'unicorn/prefer-uint8array-base64': [
          'node >=22.0.0 is not within >=25.0.0',
        ],
      },
    })

    let engines = createRuntimeGate({
      root: project({ engines: { node: '>=22' } }),
      quiet: true,
      baseRules,
    })
    expect(engines.settings['node']).toBeUndefined()
  })

  it('reports the floor once, from versions only', () => {
    let gate = createRuntimeGate({
      root: project({ browserslist: ['defaults'], engines: { node: '>=22' } }),
      quiet: true,
      baseRules,
    })
    let { warnings } = gate.settings['azat-io/runtime'] as {
      warnings: string[]
    }
    expect(
      warnings.filter(warning => warning.includes('older than this config')),
    ).toHaveLength(1)

    let unknownOnly = createRuntimeGate({
      root: project({ engines: { node: 'latest' } }),
      targets: { browsers: false },
      quiet: true,
      baseRules,
    })
    expect(JSON.stringify(unknownOnly.settings)).not.toContain(
      'older than this config',
    )
  })

  it('respects an explicit pinnedDate', () => {
    let root = project({ engines: { node: '>=22' } })
    let options = {
      targets: { browsers: 'baseline widely available' },
      baseRules: { 'unicorn/prefer-at': 'error' },
      quiet: true,
      root,
    } as const
    expect(
      createRuntimeGate({ ...options, pinnedDate: '2022-01-01' }).rules,
    ).toStrictEqual({ 'unicorn/prefer-at': 'off' })
    expect(createRuntimeGate(options).rules).toStrictEqual({})
  })

  it('prints one combined warning per run unless quiet', () => {
    let emit = vi.spyOn(process, 'emitWarning').mockImplementation(() => {})
    let root = project({ engines: { node: 'latest' } })

    createRuntimeGate({ quiet: true, baseRules, root })
    expect(emit).not.toHaveBeenCalled()

    createRuntimeGate({ baseRules, root })
    createRuntimeGate({ baseRules, root })
    expect(emit).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^Runtime targets:\n {2}- .+engines\.node "latest"/u,
      ),
      { code: 'AZAT_IO_ESLINT_RUNTIME' },
    )
  })

  it('prints nothing without warnings', () => {
    let emit = vi.spyOn(process, 'emitWarning').mockImplementation(() => {})
    let gate = createRuntimeGate({
      root: project({ engines: { node: '>=22' } }),
      baseRules,
    })
    expect(gate.settings['azat-io/runtime']).toHaveProperty('warnings', [])
    expect(emit).not.toHaveBeenCalled()
    expect(process.env['AZAT_IO_ESLINT_RUNTIME_WARNED']).toBeUndefined()
  })
})

describe('createRuntimeConfigs', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env['AZAT_IO_ESLINT_RUNTIME_WARNED']
  })

  it('checks tooling files against Node.js only', () => {
    let configs = createRuntimeConfigs({
      baseRules: {
        'unicorn/prefer-import-meta-properties': 'error',
        'unicorn/prefer-promise-try': 'error',
        'unicorn/prefer-set-methods': 'error',
      },
      root: project({ browserslist: ['chrome 130'] }),
      targets: { node: false },
      toolingNode: '>=22',
      quiet: true,
    })
    expect(configs).toHaveLength(2)
    expect(configs[0]?.rules).toStrictEqual({
      'unicorn/prefer-import-meta-properties': 'off',
    })
    expect(configs[1]).toMatchObject({
      rules: {
        'unicorn/prefer-import-meta-properties': 'error',
        'unicorn/prefer-promise-try': 'off',
      },
      settings: { node: { version: '>=22.0.0' } },
    })
    expect(configs[1]?.rules).not.toHaveProperty('unicorn/prefer-set-methods')
  })

  it('takes the tooling Node.js range from the resolved project target', () => {
    let configs = createRuntimeConfigs({
      baseRules: {
        'unicorn/prefer-import-meta-properties': 'error',
        'unicorn/prefer-json-import': 'error',
      },
      targets: { browsers: ['chrome 130', 'node 18'] },
      root: project({}),
      quiet: true,
    })
    expect(configs[0]?.rules).toStrictEqual({
      'unicorn/prefer-import-meta-properties': 'off',
      'unicorn/prefer-json-import': 'off',
    })
    expect(configs).toHaveLength(1)
  })

  it('adds no tooling block for an unknown project Node.js target', () => {
    let configs = createRuntimeConfigs({
      baseRules: { 'unicorn/prefer-import-meta-properties': 'error' },
      root: project({ engines: { node: 'latest' } }),
      quiet: true,
    })
    expect(configs).toHaveLength(1)
  })

  it('lints only tooling files with the extensions the base config lints', () => {
    let options = {
      baseRules: { 'unicorn/prefer-import-meta-properties': 'error' },
      root: project({ browserslist: ['chrome 130'] }),
      targets: { node: false },
      toolingNode: '>=22',
      quiet: true,
    } as const
    expect(createRuntimeConfigs(options)[1]?.files).toContain(
      '**/*.config.{js,cjs,mjs}',
    )
    expect(
      createRuntimeConfigs({ ...options, toolingExtensions: ['ts'] })[1]?.files,
    ).toContain('**/*.config.ts')
  })

  it('keeps syntax rules on without a Node.js target', () => {
    let rules: Linter.RulesRecord = {
      'logical-assignment-operators': ['error', 'always'],
      'unicorn/prefer-export-from': 'error',
    }
    let browserOnly = createRuntimeConfigs({
      root: project({ browserslist: ['chrome 80'] }),
      targets: { node: false },
      baseRules: rules,
      quiet: true,
    })
    expect(browserOnly[0]?.rules).toStrictEqual({})

    let oldNode = createRuntimeConfigs({
      root: project({ browserslist: ['chrome 80'], engines: { node: '>=12' } }),
      baseRules: rules,
      quiet: true,
    })
    expect(oldNode[0]?.rules).toStrictEqual({
      'logical-assignment-operators': 'off',
      'unicorn/prefer-export-from': 'off',
    })
  })

  it('adds no tooling block when nothing differs', () => {
    let configs = createRuntimeConfigs({
      root: project({ engines: { node: '>=22' } }),
      baseRules: { 'unicorn/prefer-at': 'error' },
      quiet: true,
    })
    expect(configs).toHaveLength(1)
  })

  it.each([
    {
      warnings: [
        /^ {2}- .+engines\.node "latest" is not a valid semver range$/u,
      ],
      name: 'the project gate without a tooling gate',
      packageJson: { engines: { node: 'latest' } },
      options: {},
    },
    {
      warnings: [
        /^ {2}- .+engines\.node "latest" is not a valid semver range$/u,
        /^ {2}- targets are older than this config supports \(node >=10\.0\.0 /u,
      ],
      name: 'warnings of the project and tooling gates',
      packageJson: { engines: { node: 'latest' } },
      options: { toolingNode: '>=10' },
    },
    {
      warnings: [
        /^ {2}- targets are older than this config supports \(node >=10\.0\.0 /u,
      ],
      options: { targets: { browsers: false } } as const,
      packageJson: { engines: { node: '>=10' } },
      name: 'a warning of both gates once',
    },
  ])('prints $name unless quiet', ({ packageJson, warnings, options }) => {
    let emit = vi.spyOn(process, 'emitWarning').mockImplementation(() => {})
    let gateOptions = {
      baseRules: { 'unicorn/prefer-at': 'error' },
      root: project(packageJson),
      ...options,
    } as const

    createRuntimeConfigs({ ...gateOptions, quiet: true })
    expect(emit).not.toHaveBeenCalled()

    createRuntimeConfigs(gateOptions)
    expect(emit).toHaveBeenCalledExactlyOnceWith(expect.any(String), {
      code: 'AZAT_IO_ESLINT_RUNTIME',
    })
    expect(String(emit.mock.calls[0]?.[0]).split('\n')).toStrictEqual([
      'Runtime targets:',
      ...warnings.map((warning): unknown => expect.stringMatching(warning)),
    ])
  })
})
