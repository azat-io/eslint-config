import { writeFileSync, mkdtempSync, mkdirSync } from 'node:fs'
import { getAllVersions } from 'baseline-browser-mapping'
import { describe, expect, it, vi } from 'vitest'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import browserslist from 'browserslist'
import { tmpdir } from 'node:os'
import path from 'node:path'

import type {
  ResolveRuntimeTargetsOptions,
  RuntimeTargetsOption,
  RuleSupport,
  RuleScope,
} from '../../runtime/targets'

import {
  resolveRuntimeTargets,
  DEFAULT_NODE_FLOOR,
  explainRuleSupport,
  normalizeNodeRange,
  pinBaselineQueries,
} from '../../runtime/targets'
import data from '../../runtime/support.json' with { type: 'json' }

let table = data.rules as Record<string, RuleSupport>

function project(files: Record<string, string>): string {
  let root = mkdtempSync(path.join(tmpdir(), 'targets-v2-'))
  for (let [name, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    writeFileSync(path.join(root, name), content)
  }
  return root
}

function enabledRules(options: ResolveRuntimeTargetsOptions): string[] {
  let targets = resolveRuntimeTargets(options)
  return Object.entries(table)
    .filter(([, rule]) => explainRuleSupport(rule, targets).enabled)
    .map(([name]) => name)
}

function isEnabled(
  rule: string,
  options: ResolveRuntimeTargetsOptions,
): boolean {
  return enabledRules(options).includes(rule)
}

function sharedConfig(name: string, source: string): Record<string, string> {
  return { [`node_modules/${name}/index.js`]: source }
}

describe('node targets', () => {
  it('[#1] browsers-only project falls back to the Node.js floor instead of ignoring Node', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['last 2 chrome versions'],
      }),
    })
    let targets = resolveRuntimeTargets({ root })
    expect(targets.node?.minimum).toBe('22.0.0')
    expect(isEnabled('unicorn/prefer-promise-try', { root })).toBe(false)
    expect(isEnabled('unicorn/prefer-uint8array-base64', { root })).toBe(false)
  })

  it('[#1] targets.node: false is the explicit opt-out for browser-only code', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['last 2 chrome versions'],
      }),
    })
    expect(
      isEnabled('unicorn/prefer-promise-try', {
        targets: { node: false },
        root,
      }),
    ).toBe(true)
  })

  it('[#28] fallback: false turns Node-dependent rules off', () => {
    let root = project({ 'package.json': '{}' })
    expect(enabledRules({ fallback: false, root })).toEqual([])
  })

  it.each(['latest', 'lts/*', '>=20 <18', 'node >= 18'])(
    '[#2] unusable engines.node %j blocks rules and warns',
    value => {
      let root = project({
        'package.json': JSON.stringify({
          browserslist: ['chrome 130'],
          engines: { node: value },
        }),
      })
      let targets = resolveRuntimeTargets({ root })
      expect(targets.unknown).toHaveLength(1)
      expect(targets.warnings).toHaveLength(1)
      expect(isEnabled('unicorn/prefer-promise-try', { root })).toBe(false)
    },
  )

  it('[#2] numeric engines.node is unusable, not silently ignored', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: 20 } }),
    })
    expect(resolveRuntimeTargets({ root }).unknown).toHaveLength(1)
  })

  it('[#3] package.json with a BOM is read', () => {
    let root = project({
      'package.json': `\u{FEFF}${JSON.stringify({ engines: { node: '>=18' } })}`,
    })
    expect(resolveRuntimeTargets({ root }).node?.minimum).toBe('18.0.0')
  })

  it('[#29] malformed package.json throws a clear error', () => {
    let root = project({ 'package.json': '{ "engines": { "node": ">=18" }, }' })
    expect(() => resolveRuntimeTargets({ root })).toThrow(
      /cannot parse .*package\.json/u,
    )
  })

  it('[#4] root may point to a file and is normalized to its directory', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=24' } }),
      'eslint.config.js': '',
    })
    expect(
      resolveRuntimeTargets({ root: path.join(root, 'eslint.config.js') }).node
        ?.minimum,
    ).toBe('24.0.0')
    expect(
      resolveRuntimeTargets({
        root: pathToFileURL(path.join(root, 'eslint.config.js')),
      }).node?.minimum,
    ).toBe('24.0.0')
  })

  it('[#30] relative and missing roots throw', () => {
    expect(() => resolveRuntimeTargets({ root: '.' })).toThrow(/absolute path/u)
    expect(() => resolveRuntimeTargets({ root: '/does/not/exist' })).toThrow(
      /does not exist/u,
    )
  })

  it('[#4/#5] a subdirectory without package.json reads the nearest one; engines are not inherited further', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=24' } }),
      'packages/a/package.json': JSON.stringify({ name: 'a' }),
      'src/index.ts': '',
    })
    expect(
      resolveRuntimeTargets({ root: path.join(root, 'src') }).node?.minimum,
    ).toBe('24.0.0')
    expect(
      resolveRuntimeTargets({ root: path.join(root, 'packages/a') }).sources,
    ).toContain('node: no engines.node, fallback "22.0.0"')
  })

  it('[#6] backports count: ^18.18 || ^20.9 || >=21.1 enables rules backported to 18.17', () => {
    let root = project({
      'package.json': JSON.stringify({
        engines: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
      }),
    })
    expect(
      isEnabled('unicorn/prefer-url-can-parse', {
        targets: { browsers: false },
        root,
      }),
    ).toBe(true)
    expect(
      isEnabled('unicorn/prefer-abort-signal-any', {
        targets: { browsers: false },
        root,
      }),
    ).toBe(true)
    expect(
      isEnabled('unicorn/no-array-sort', {
        targets: { browsers: false },
        root,
      }),
    ).toBe(false)
  })

  it('[#8] explicit non-string node throws a TypeError', () => {
    let root = project({ 'package.json': '{}' })
    expect(() =>
      resolveRuntimeTargets({
        targets: JSON.parse('{"node":20}') as RuntimeTargetsOption,
        root,
      }),
    ).toThrow(TypeError)
  })

  it('[#9] "" and "*" both mean "any version" and turn Node-dependent rules off', () => {
    for (let value of ['', '*']) {
      let root = project({
        'package.json': JSON.stringify({ engines: { node: value } }),
      })
      expect(enabledRules({ targets: { browsers: false }, root })).toEqual([])
    }
  })

  it('normalizes bare explicit versions to "this or newer"', () => {
    expect(normalizeNodeRange('22.12')).toBe('>=22.12.0')
    expect(normalizeNodeRange('v24')).toBe('>=24.0.0')
  })

  it.each([
    [['node 20'], '>=20.0.0', '20.0.0'],
    [['node 22', 'node 20'], '>=22.0.0||>=20.0.0', '20.0.0'],
    [['node 20.10', 'node 20.9'], '>=20.0.0', '20.0.0'],
  ] as [string[], string, string][])(
    '[#15] floors browserslist node queries %j to major releases',
    (queries, range, minimum) => {
      let root = project({ 'package.json': '{}' })
      let targets = resolveRuntimeTargets({
        targets: { browsers: queries },
        root,
      })
      expect(targets.node).toStrictEqual({
        source: 'browserslist',
        minimum,
        range,
      })
      expect(
        isEnabled('unicorn/prefer-abort-signal-any', {
          targets: { browsers: queries },
          root,
        }),
      ).toBe(false)
    },
  )
})

describe('dependency failures', () => {
  it('keeps the cause when reading package.json throws a primitive', async () => {
    let root = project({ 'package.json': '{}' })
    vi.resetModules()
    vi.doMock('node:fs', async importOriginal => ({
      ...(await importOriginal()),
      readFileSync: () => {
        // eslint-disable-next-line typescript/only-throw-error -- Test a dependency throwing a non-Error value.
        throw 'storage unavailable'
      },
    }))
    try {
      let { resolveRuntimeTargets: resolveWithBrokenFilesystem } =
        await import('../../runtime/targets')
      expect(() => resolveWithBrokenFilesystem({ root })).toThrow(
        expect.objectContaining({
          message: `Runtime targets: cannot read ${path.join(root, 'package.json')}: storage unavailable`,
          cause: 'storage unavailable',
        }),
      )
    } finally {
      vi.doUnmock('node:fs')
      vi.resetModules()
    }
  })

  it('blocks collapsed browsers when a shareable config cannot be reloaded', () => {
    let root = project({
      ...sharedConfig(
        'browserslist-config-legacy',
        "module.exports = ['chrome 120', 'op_mob >= 46']\n",
      ),
      'package.json': '{}',
    })
    let loader = createRequire(import.meta.url)('browserslist/node') as {
      loadQueries(
        context: { path: string; env: string },
        name: string,
      ): string[]
    }
    let original = loader.loadQueries
    let load = vi
      .spyOn(loader, 'loadQueries')
      .mockImplementationOnce(original)
      .mockImplementationOnce(() => {
        throw new Error('config is no longer available')
      })
    try {
      let targets = resolveRuntimeTargets({
        targets: {
          browsers: 'extends browserslist-config-legacy',
          node: false,
        },
        root,
      })
      expect(targets.browsers).toStrictEqual({
        // eslint-disable-next-line camelcase
        opera_android: '80',
        chrome: '120',
      })
      expect(targets.unknown).toStrictEqual([
        {
          reason:
            'op_mob 80: cannot check the queries behind it for older versions',
          runtime: 'browser',
        },
      ])
      expect(
        explainRuleSupport(table['unicorn/prefer-at']!, targets).enabled,
      ).toBe(false)
      expect(load).toHaveBeenCalledTimes(2)
    } finally {
      load.mockRestore()
    }
  })

  it('treats an unexpected baseline data format as missing compatibility data', async () => {
    let root = project({ 'package.json': '{}' })
    vi.resetModules()
    vi.doMock('baseline-browser-mapping', () => ({
      getAllVersions: () => ({}),
    }))
    try {
      let { resolveRuntimeTargets: resolveWithoutBaselineData } =
        await import('../../runtime/targets')
      let options: ResolveRuntimeTargetsOptions = {
        targets: { browsers: ['chrome 120', 'and_uc 15.5'], node: false },
        root,
      }
      let targets = resolveWithoutBaselineData(options)
      expect(Object.entries(targets.browsers ?? {})).toStrictEqual([
        ['chrome', '120'],
      ])
      expect(targets.unknown).toStrictEqual([
        { reason: 'and_uc 15.5: no compatibility data', runtime: 'browser' },
      ])

      let ignored = resolveWithoutBaselineData({
        ...options,
        unknownBrowsers: 'ignore',
      })
      expect(ignored.unknown).toStrictEqual([])
      expect(ignored.ignoredBrowsers).toStrictEqual(['and_uc 15.5'])
    } finally {
      vi.doUnmock('baseline-browser-mapping')
      vi.resetModules()
    }
  })
})

describe('browser targets', () => {
  it('[#10] mobile ranges are not collapsed to the newest version', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['and_chr >= 110', 'android >= 110'], node: false },
      root,
    })
    expect(
      Object.entries(targets.browsers ?? {}).toSorted(([left], [right]) =>
        left.localeCompare(right),
      ),
    ).toEqual([
      ['chrome_android', '110'],
      ['webview_android', '110'],
    ])
    expect(
      isEnabled('unicorn/prefer-promise-try', {
        targets: { browsers: ['and_chr >= 110'], node: false },
        root,
      }),
    ).toBe(false)
  })

  it('[#11] UC, QQ and KaiOS are checked through their engines', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['and_uc 15.5', 'kaios 2.5'], node: false },
      root,
    })
    expect(
      Object.entries(targets.browsers ?? {}).toSorted(([left], [right]) =>
        left.localeCompare(right),
      ),
    ).toEqual([
      ['chrome_android', '100'],
      ['firefox_android', '48'],
    ])
  })

  it('[#12] browsers without data block rules instead of throwing', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['baidu 13.52', 'chrome 130'], node: false },
      root,
    })
    expect(targets.unknown[0]?.reason).toMatch(/baidu/u)
    expect(
      isEnabled('unicorn/prefer-at', {
        targets: { browsers: ['baidu 13.52', 'chrome 130'], node: false },
        root,
      }),
    ).toBe(false)
    expect(
      isEnabled('unicorn/prefer-at', {
        targets: { browsers: ['baidu 13.52', 'chrome 130'], node: false },
        unknownBrowsers: 'ignore',
        root,
      }),
    ).toBe(true)
  })

  it('[#13] a config without a section for the env makes browsers unknown', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: { development: ['last 1 chrome version'] },
        engines: { node: '>=24' },
      }),
    })
    expect(resolveRuntimeTargets({ root }).unknown[0]?.runtime).toBe('browser')
    expect(isEnabled('unicorn/prefer-iterator-helpers', { root })).toBe(false)
  })

  it('[#14] a config added later is seen without restarting the process', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=24' } }),
    })
    expect(resolveRuntimeTargets({ root }).browsers).toBeUndefined()
    writeFileSync(path.join(root, '.browserslistrc'), 'chrome 100\n')
    expect(resolveRuntimeTargets({ root }).browsers).toEqual({ chrome: '100' })
  })

  it('[#16] BROWSERSLIST and BROWSERSLIST_CONFIG do not change auto mode', () => {
    let root = project({
      'package.json': JSON.stringify({ browserslist: ['chrome 130'] }),
    })
    process.env.BROWSERSLIST = 'chrome 90'
    try {
      expect(resolveRuntimeTargets({ root }).browsers).toEqual({
        chrome: '130',
      })
    } finally {
      delete process.env.BROWSERSLIST
    }
  })

  it('[#17] sources name the config file', () => {
    let root = project({
      '.browserslistrc': 'chrome 120\n',
      'package.json': '{}',
    })
    expect(resolveRuntimeTargets({ root }).sources.join('\n')).toContain(
      path.join(root, '.browserslistrc'),
    )
  })

  it('[#18] invalid queries throw with their origin', () => {
    let root = project({
      '.browserslistrc': 'navigator 100\n',
      'package.json': '{}',
    })
    expect(() => resolveRuntimeTargets({ root })).toThrow(
      /\.browserslistrc.*Unknown browser navigator/u,
    )
  })

  it('[#27] baseline queries are pinned to a date', () => {
    expect(
      pinBaselineQueries(
        ['baseline widely available with downstream'],
        '2026-10-01',
      ),
    ).toEqual(['baseline widely available on 2026-10-01 with downstream'])
    expect(
      pinBaselineQueries(['baseline newly available'], '2026-10-01'),
    ).toEqual(['baseline widely available on 2029-04-01'])
    let root = project({ 'package.json': '{}' })
    let early = resolveRuntimeTargets({
      targets: { browsers: 'baseline widely available', node: false },
      pinnedDate: '2025-01-01',
      root,
    })
    let late = resolveRuntimeTargets({
      targets: { browsers: 'baseline widely available', node: false },
      pinnedDate: '2026-10-01',
      root,
    })
    expect(Number(early.browsers?.chrome)).toBeLessThan(
      Number(late.browsers?.chrome),
    )
  })

  it('ignores op_mini and Safari TP', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: {
        browsers: ['op_mini all', 'safari TP', 'safari 17.4'],
        node: false,
      },
      root,
    })
    expect(targets.browsers).toEqual({ safari: '17.4' })
    expect(targets.ignoredBrowsers).toEqual(['op_mini all'])
  })
})

describe('rule scopes and explanations', () => {
  it('[#20] browser-only rules ignore Node.js targets', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['chrome 130'],
        engines: { node: '>=22.12' },
      }),
    })
    expect(isEnabled('unicorn/prefer-dom-node-html-methods', { root })).toBe(
      true,
    )
  })

  it('[#20/#21] node-only rules ignore browser targets', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['firefox 128'],
        engines: { node: '>=22' },
      }),
    })
    expect(isEnabled('unicorn/prefer-json-import', { root })).toBe(true)
    expect(isEnabled('unicorn/prefer-import-meta-properties', { root })).toBe(
      true,
    )
  })

  it('[#21] import.meta.dirname is unavailable on 21.0-21.1', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=21.0' } }),
    })
    expect(isEnabled('unicorn/prefer-import-meta-properties', { root })).toBe(
      false,
    )
  })

  it('[#31] explains why a rule is off', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['chrome 109'],
        engines: { node: '>=24' },
      }),
    })
    let targets = resolveRuntimeTargets({ root })
    expect(
      explainRuleSupport(table['unicorn/no-array-sort']!, targets),
    ).toStrictEqual({
      blockers: ['chrome 109 < 110'],
      enabled: false,
    })
  })

  it('realistic projects', () => {
    let library = project({
      'package.json': JSON.stringify({ engines: { node: '>=20.19' } }),
    })
    let enabled = enabledRules({ root: library })
    expect(enabled).toContain('unicorn/no-array-sort')
    expect(enabled).toContain('prefer-object-has-own')
    expect(enabled).not.toContain('unicorn/prefer-iterator-helpers')
    expect(enabled).not.toContain('unicorn/prefer-import-meta-properties')
    expect(enabled).not.toContain('unicorn/prefer-dom-node-html-methods')
  })
})

describe('round 2', () => {
  it.each([
    ['"chrome 100"', 'chrome 100'],
    ['{"production":"chrome 100"}', { production: 'chrome 100' }],
  ])(
    '[r2#1] package.json browserslist written as %s',
    (_label, browserslistValue) => {
      let root = project({
        'package.json': JSON.stringify({
          browserslist: browserslistValue,
          engines: { node: '>=24' },
        }),
      })
      expect(resolveRuntimeTargets({ root }).browsers).toStrictEqual({
        chrome: '100',
      })
    },
  )

  it('[r2#1] an empty string section makes browsers unknown', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: { production: ' ' },
        engines: { node: '>=24' },
      }),
    })
    expect(resolveRuntimeTargets({ root }).unknown[0]?.runtime).toBe('browser')
  })

  it('[r2#7] prerelease engines ranges still enable old rules', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=24.0.0-rc.1' } }),
    })
    expect(
      isEnabled('unicorn/prefer-at', { targets: { browsers: false }, root }),
    ).toBe(true)
    expect(
      isEnabled('unicorn/prefer-regexp-escape', {
        targets: { browsers: false },
        root,
      }),
    ).toBe(false)
  })

  it.each([
    { unknownBrowsers: 'unsupported' },
    { targets: 'chrome 90' },
    { targets: { browser: ['chrome 90'] } },
    { pinnedDate: '2026/10/01' },
    { fallback: { node: 20 } },
    { missingBrowsers: [] },
    { typo: true, root: '/' },
  ])('[r2#13] rejects invalid options %j', options => {
    let root = project({ 'package.json': '{}' })
    expect(() =>
      resolveRuntimeTargets({ root, ...(options as object) }),
    ).toThrow(TypeError)
  })

  it('[r2#14] missingBrowsers decides what a project without browserslist targets', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=24' } }),
    })
    expect(resolveRuntimeTargets({ root }).sources.join('\n')).toContain(
      'browsers: not targeted (no browserslist config',
    )
    expect(
      isEnabled('unicorn/prefer-iterator-helpers', {
        missingBrowsers: 'off',
        root,
      }),
    ).toBe(false)
    expect(
      isEnabled('unicorn/prefer-iterator-helpers', {
        missingBrowsers: ['safari 16'],
        root,
      }),
    ).toBe(false)
    expect(isEnabled('unicorn/prefer-iterator-helpers', { root })).toBe(true)
  })

  it('[r2#14] missingBrowsers accepts a single query string', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=24' } }),
    })
    let targets = resolveRuntimeTargets({ missingBrowsers: 'safari 16', root })
    expect(targets.warnings).toContain(
      'no browserslist config; assuming safari 16',
    )
    expect(
      isEnabled('unicorn/prefer-iterator-helpers', {
        missingBrowsers: 'safari 16',
        root,
      }),
    ).toBe(false)
  })

  it('[r2#15] queries that select no browsers warn and, in auto mode, block rules', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=24' } }),
      '.browserslistrc': '> 50%\n',
    })
    let targets = resolveRuntimeTargets({ root })
    expect(targets.warnings.join('\n')).toContain('queries select no browsers')
    expect(isEnabled('unicorn/prefer-promise-try', { root })).toBe(false)
  })

  it('[r2#12] targets.browsers: false keeps node entries of the browserslist config', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['node 18', 'chrome 130'],
      }),
    })
    let targets = resolveRuntimeTargets({ targets: { browsers: false }, root })
    expect(targets.node).toMatchObject({
      source: 'browserslist',
      minimum: '18.0.0',
    })
    expect(
      isEnabled('unicorn/no-array-sort', {
        targets: { browsers: false },
        root,
      }),
    ).toBe(false)
  })

  it('[r2#5] a malformed package.json throws even with explicit targets.node', () => {
    let root = project({
      'package.json': '{ "browserslist": ["chrome 100"], }',
    })
    expect(() =>
      resolveRuntimeTargets({ targets: { node: '24' }, root }),
    ).toThrow(/cannot parse/u)
  })

  it.each([
    ['and_uc >= 12', false],
    ['op_mob >= 60', false],
    ['and_uc < 16', false],
    ['and_qq >= 10', false],
    ['op_mob >= 80', true],
    ['last 1 and_uc version', true],
    ['defaults', true],
  ])('[r3] %j: collapsed single-version agents are unknown', (query, known) => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: [query], node: false },
      root,
    })
    expect(
      targets.unknown.some(item => item.reason.includes('has no data')),
    ).toBe(!known)
  })

  it.each([
    'op_mob 46-80',
    'and_uc 12-16',
    'and_qq 1-14',
    'and_uc >= 16',
    'op_mob > 80',
    'OperaMobile 46-80',
  ])('[r4] %j: ranges and versions outside the data are unknown', query => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['chrome >= 120', query], node: false },
      root,
    })
    expect(
      targets.unknown.some(item => item.reason.includes('has no data')),
    ).toBe(true)
    expect(
      isEnabled('unicorn/prefer-at', {
        targets: { browsers: ['chrome >= 120', query], node: false },
        root,
      }),
    ).toBe(false)
  })

  it('[r4] shareable configs and "browserslist config" are expanded', () => {
    let root = project({
      'node_modules/browserslist-config-acme/package.json':
        '{"name":"browserslist-config-acme","main":"index.js"}',
      'node_modules/browserslist-config-acme/index.js':
        "module.exports = ['chrome >= 120', 'op_mob >= 46']\n",
      'package.json': JSON.stringify({
        browserslist: ['extends browserslist-config-acme'],
      }),
    })
    let fromExtends = resolveRuntimeTargets({ targets: { node: false }, root })
    expect(fromExtends.unknown.map(item => item.reason).join('\n')).toContain(
      'op_mob >= 46',
    )
    let fromConfigQuery = resolveRuntimeTargets({
      targets: { browsers: 'browserslist config', node: false },
      root,
    })
    expect(fromConfigQuery.unknown.length).toBeGreaterThan(0)
  })

  it('[r4] ignored agents never block rules, and names are normalized', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['chrome >= 120', 'and_uc >= 12'], node: false },
      ignoreBrowsers: ['UCAndroid'],
      root,
    })
    expect(targets.unknown).toStrictEqual([])
    expect(() =>
      resolveRuntimeTargets({ ignoreBrowsers: ['opera_mini'], root }),
    ).toThrow('ignoreBrowsers')
  })

  it('[r4] an explicit browserslistEnv without a section makes browsers unknown', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: { production: ['chrome 130'] },
      }),
    })
    let targets = resolveRuntimeTargets({
      browserslistEnv: 'staging',
      targets: { node: false },
      root,
    })
    expect(targets.unknown.map(item => item.reason).join('\n')).toContain(
      'none for browserslistEnv "staging"',
    )
    let flat = project({
      'package.json': JSON.stringify({ browserslist: ['chrome 130'] }),
    })
    expect(
      resolveRuntimeTargets({
        browserslistEnv: 'staging',
        targets: { node: false },
        root: flat,
      }).unknown,
    ).toStrictEqual([])
  })

  it('[r4] reading only node entries does not leak browser problems', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['node 20', 'op_mob >= 46'],
      }),
    })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['chrome 130'] },
      root,
    })
    expect(targets.node?.minimum).toBe('20.0.0')
    expect(targets.unknown).toStrictEqual([])
  })

  it('[r4] repeated resolutions keep the "could not parse" unknown', () => {
    let root = project({
      'package.json': '{ "browserslist": ["ie 11"',
      'packages/app/package.json': '{}',
    })
    let options = {
      targets: { browsers: 'browserslist config', node: false },
      root: path.join(root, 'packages/app'),
    } as const
    let first = resolveRuntimeTargets(options)
    let second = resolveRuntimeTargets(options)
    expect(second.unknown).toStrictEqual(first.unknown)
    expect(second.unknown.length).toBeGreaterThan(0)
  })

  it('[r3] ignoreBrowsers and browserslistEnv are validated', () => {
    let options: unknown = { ignoreBrowsers: 'op_mini', root: '/' }
    expect(() =>
      resolveRuntimeTargets(options as ResolveRuntimeTargetsOptions),
    ).toThrow('ignoreBrowsers')
    expect(() =>
      resolveRuntimeTargets({ browserslistEnv: '', root: '/' }),
    ).toThrow('browserslistEnv')
  })

  it('[r3] engines.node wins without reading a broken browserslist config', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=22' } }),
      '.browserslistrc': 'not a query at all\n',
    })
    let targets = resolveRuntimeTargets({ targets: { browsers: false }, root })
    expect(targets.node?.source).toBe('engines')
  })

  it('[r3] warns when browsers come from an ancestor .browserslistrc', () => {
    let root = project({
      '.browserslistrc': 'chrome 120\n',
      'packages/app/package.json': '{}',
    })
    let targets = resolveRuntimeTargets({
      root: path.join(root, 'packages/app'),
    })
    expect(targets.warnings.join('\n')).toContain('ancestor config')
  })

  it('[r3] an unparsable ancestor package.json makes browsers unknown', () => {
    let root = project({
      'package.json': '{ "browserslist": ["chrome 120"',
      'packages/app/package.json': '{}',
    })
    let targets = resolveRuntimeTargets({
      root: path.join(root, 'packages/app'),
    })
    expect(targets.unknown.map(item => item.reason).join('\n')).toContain(
      'Could not parse',
    )
  })

  it('[r2#4] warns when browsers come from an ancestor package.json with engines', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['chrome 120'],
        engines: { node: '>=18' },
      }),
      'packages/cli/package.json': JSON.stringify({ name: 'cli' }),
    })
    let targets = resolveRuntimeTargets({
      root: path.join(root, 'packages/cli'),
    })
    expect(targets.warnings.join('\n')).toContain('is not inherited')
  })

  it('[r2#31] blockers name the browserslist entry behind a mapped engine', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['kaios 2.5'], node: false },
      root,
    })
    expect(
      explainRuleSupport(table['unicorn/prefer-at']!, targets).blockers,
    ).toStrictEqual(['firefox_android 48 (kaios 2.5) < 90'])
  })

  it('[r2#20/#21/#27] defaults gate the autofix rules that write newer APIs', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['defaults'],
        engines: { node: '>=22' },
      }),
    })
    let enabled = enabledRules({ root })
    expect(enabled).not.toContain('prefer-object-has-own')
    expect(enabled).not.toContain('unicorn/prefer-string-replace-all')
    expect(enabled).not.toContain('unicorn/prefer-array-find')
  })
})

describe('explanations without matching targets', () => {
  it.each([
    ['universal', ['no targets']],
    ['browser', ['no browser targets']],
    ['node', ['no node targets']],
    ['syntax', []],
  ] as [RuleScope, string[]][])(
    'explains a %s rule when nothing is targeted',
    (scope, blockers) => {
      let root = project({ 'package.json': '{}' })
      let targets = resolveRuntimeTargets({
        targets: { browsers: false, node: false },
        root,
      })
      expect(
        explainRuleSupport(
          { browsers: { chrome: '1' }, node: ['>=0.10'], scope },
          targets,
        ),
      ).toStrictEqual({ enabled: blockers.length === 0, blockers })
    },
  )

  it('blocks a rule whose API Node.js lacks', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: false, node: '22' },
      root,
    })
    expect(
      explainRuleSupport(
        { browsers: { chrome: '1' }, scope: 'universal', node: null },
        targets,
      ),
    ).toStrictEqual({
      blockers: ['node >=22.0.0: not supported'],
      enabled: false,
    })
  })
})

describe('options', () => {
  it.each<unknown>([null, [], '/'])(
    'rejects options that are not an object: %j',
    options => {
      expect(() =>
        resolveRuntimeTargets(options as ResolveRuntimeTargetsOptions),
      ).toThrow(new TypeError('Runtime targets: options must be an object'))
    },
  )

  it.each([
    [
      { targets: { browsers: [] } },
      'targets.browsers must be false or non-empty browserslist queries',
    ],
    [
      { targets: { browsers: ['chrome 100', ' '] } },
      'targets.browsers must be false or non-empty browserslist queries',
    ],
    [
      { targets: { node: '>=24 <22' } },
      'targets.node ">=24 <22" is not a satisfiable semver range',
    ],
    [
      { fallback: { node: 'latest' } },
      'fallback.node "latest" is not a satisfiable semver range',
    ],
  ] as [Omit<ResolveRuntimeTargetsOptions, 'root'>, string][])(
    'rejects %j',
    (options, message) => {
      let root = project({ 'package.json': '{}' })
      expect(() => resolveRuntimeTargets({ ...options, root })).toThrow(
        new TypeError(`Runtime targets: ${message}`),
      )
    },
  )

  it('lets an explicit targets.node win over engines.node', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=18' } }),
    })
    let targets = resolveRuntimeTargets({
      targets: { browsers: false, node: '22.12' },
      root,
    })
    expect(targets.node).toStrictEqual({
      source: 'explicit',
      minimum: '22.12.0',
      range: '>=22.12.0',
    })
    expect(targets.sources).toContain('node: targets.node "22.12"')
  })

  it.each([
    ['^20.9', '>=20.9.0 <21.0.0-0'],
    ['>=22 <24', '>=22.0.0 <24.0.0-0'],
    ['>=24 <22', undefined],
    ['latest', undefined],
  ])('normalizes the Node.js range %j', (value, range) => {
    expect(normalizeNodeRange(value)).toBe(range)
  })
})

describe('project files', () => {
  it('warns when no package.json exists in or above the root', () => {
    let root = project({ '.browserslistrc': 'chrome 120\n' })
    let targets = resolveRuntimeTargets({ root })
    expect(targets.warnings).toStrictEqual([
      `no package.json in or above ${root}; is "root" correct?`,
    ])
    expect(targets.browsers).toStrictEqual({ chrome: '120' })
    expect(targets.node?.source).toBe('fallback')
  })

  it('throws when package.json cannot be read', () => {
    let root = project({ 'package.json/.gitkeep': '' })
    expect(() => resolveRuntimeTargets({ root })).toThrow(
      `Runtime targets: cannot read ${path.join(root, 'package.json')}: EISDIR`,
    )
  })

  it.each(['[]', 'null', '"app"'])(
    'falls back when package.json is %s',
    content => {
      let root = project({ 'package.json': content })
      let targets = resolveRuntimeTargets({
        targets: { browsers: false },
        root,
      })
      expect(targets.node).toStrictEqual({
        range: `>=${DEFAULT_NODE_FLOOR}`,
        minimum: DEFAULT_NODE_FLOOR,
        source: 'fallback',
      })
      expect(targets.unknown).toStrictEqual([])
    },
  )

  it.each([
    [
      { browserlist: ['chrome 100'] },
      '`browserlist` key instead of `browserslist`',
    ],
    [
      { browserslist: { production: 100 } },
      'Browserslist config should be a string or an array of strings',
    ],
  ])('throws on the invalid browserslist config %j', (content, message) => {
    let root = project({ 'package.json': JSON.stringify(content) })
    expect(() => resolveRuntimeTargets({ root })).toThrow(
      `Runtime targets: invalid browserslist config in or above ${root}: ${message}`,
    )
  })

  it('does not warn about a config below the nearest package.json', () => {
    let root = project({
      'src/.browserslistrc': 'chrome 120\n',
      'package.json': '{}',
    })
    let targets = resolveRuntimeTargets({ root: path.join(root, 'src') })
    expect(targets.browsers).toStrictEqual({ chrome: '120' })
    expect(targets.warnings).toStrictEqual([])
  })

  it.each([
    ['without a browserslist config', {}],
    ['with a config without node entries', { browserslist: ['firefox 120'] }],
    ['with an empty config section', { browserslist: { production: ' ' } }],
  ])('falls back for explicit browsers in a project %s', (_label, content) => {
    let root = project({ 'package.json': JSON.stringify(content) })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['chrome 130'] },
      root,
    })
    expect(targets.node?.source).toBe('fallback')
    expect(targets.sources).toStrictEqual([
      'browsers: targets.browsers (production)',
      `node: no engines.node, fallback "${DEFAULT_NODE_FLOOR}"`,
    ])
  })
})

describe('browserslist queries', () => {
  it.each([
    [
      'cover query',
      [
        'cover 100% in browserslist-config-stats stats',
        'not < 40% in my stats',
      ],
      { chrome: '121' },
    ],
    [
      'popularity query',
      ['> 0% in browserslist-config-stats stats and > 40% in my stats'],
      { chrome: '121' },
    ],
    [
      'statistics loaded inside extends',
      ['extends browserslist-config-load-stats', 'not < 40% in my stats'],
      { chrome: '121' },
    ],
    [
      'statistics consumed inside extends',
      [
        'cover 100% in browserslist-config-stats stats and extends browserslist-config-use-stats',
      ],
      { chrome: '121' },
    ],
    [
      'statistics loaded inside browserslist config',
      ['browserslist config', 'not < 40% in my stats'],
      { chrome: '121' },
    ],
    [
      'statistics replaced by another package',
      [
        'cover 100% in browserslist-config-stats stats and',
        '> 0% in browserslist-config-other-stats stats',
        'not < 40% in my stats',
      ],
      { chrome: '120' },
    ],
    [
      'a package without statistics keeps the current statistics',
      [
        'cover 100% in browserslist-config-stats stats and',
        '> 0% in browserslist-config-empty-stats stats',
        'not < 40% in my stats',
      ],
      { chrome: '121' },
    ],
    [
      'local statistics without a package',
      ['> 0% in my stats', 'not < 40% in my stats'],
      { chrome: '120' },
    ],
  ] satisfies [string, string[], Record<string, string>][])(
    'preserves %s when pinning queries',
    (_name, queries, expected) => {
      let root = project({
        ...sharedConfig(
          'browserslist-config-load-stats',
          "module.exports = ['cover 100% in browserslist-config-stats stats and baseline widely available']\n",
        ),
        ...sharedConfig(
          'browserslist-config-use-stats',
          "module.exports = ['> 40% in my stats and baseline widely available']\n",
        ),
        'node_modules/browserslist-config-other-stats/browserslist-stats.json':
          JSON.stringify({ chrome: { 120: 90, 121: 10 } }),
        'node_modules/browserslist-config-stats/browserslist-stats.json':
          JSON.stringify({ chrome: { 120: 10, 121: 90 } }),
        'browserslist-stats.json': JSON.stringify({
          chrome: { 120: 90, 121: 10 },
        }),
        'node_modules/browserslist-config-empty-stats/browserslist-stats.json':
          'false',
        '.browserslistrc': 'extends browserslist-config-load-stats\n',
        'package.json': '{}',
      })
      let cwd = vi.spyOn(process, 'cwd').mockReturnValue(root)
      try {
        let targets = resolveRuntimeTargets({
          targets: { browsers: queries, node: false },
          pinnedDate: '2022-01-01',
          root,
        })
        expect(targets.browsers).toStrictEqual(expected)
        expect(targets.unknown).toStrictEqual([])
        expect(
          resolveRuntimeTargets({
            targets: { browsers: '> 40% in my stats', node: false },
            pinnedDate: '2022-01-01',
            root,
          }).browsers,
        ).toStrictEqual({ chrome: '120' })
      } finally {
        cwd.mockRestore()
      }
    },
  )

  it('uses package statistics without requiring a local statistics file', () => {
    let root = project({
      'node_modules/browserslist-config-stats/browserslist-stats.json':
        JSON.stringify({ chrome: { 120: 10, 121: 90 } }),
      'package.json': '{}',
    })
    let cwd = vi.spyOn(process, 'cwd').mockReturnValue(root)
    let queries = [
      'cover 100% in browserslist-config-stats stats',
      'not < 40% in my stats',
    ]
    try {
      expect(browserslist(queries, { path: root })).toStrictEqual([
        'chrome 121',
      ])
      expect(
        resolveRuntimeTargets({
          targets: { browsers: queries, node: false },
          pinnedDate: '2022-01-01',
          root,
        }).browsers,
      ).toStrictEqual({ chrome: '121' })
      expect(() =>
        resolveRuntimeTargets({
          targets: { browsers: '> 40% in my stats', node: false },
          pinnedDate: '2022-01-01',
          root,
        }),
      ).toThrow('Custom usage statistics was not provided')
    } finally {
      cwd.mockRestore()
    }
  })

  it.each(['extends browserslist-config-cycle', 'browserslist config'])(
    'rejects recursive pinned configs reached through %s',
    query => {
      let root = project({
        ...sharedConfig(
          'browserslist-config-cycle',
          "module.exports = ['extends browserslist-config-cycle']\n",
        ),
        '.browserslistrc': 'browserslist config\n',
        'package.json': '{}',
      })
      expect(() =>
        resolveRuntimeTargets({
          targets: { browsers: query, node: false },
          pinnedDate: '2022-01-01',
          root,
        }),
      ).toThrow(
        'Runtime targets: cannot resolve browsers from targets.browsers: Browserslist configs are circular or nested too deeply',
      )
    },
  )

  it.each(['not chrome 120', 'extends browserslist-config-negative'])(
    'rejects an initial negation in pinned queries: %s',
    query => {
      let root = project({
        ...sharedConfig(
          'browserslist-config-negative',
          "module.exports = ['not chrome 120']\n",
        ),
        'package.json': '{}',
      })
      expect(() =>
        resolveRuntimeTargets({
          targets: { browsers: query, node: false },
          pinnedDate: '2022-01-01',
          root,
        }),
      ).toThrow(
        'Runtime targets: cannot resolve browsers from targets.browsers: Write a positive browsers query before "not chrome 120"',
      )
    },
  )

  it('uses Browserslist defaults when a pinned config query finds no config', () => {
    let root = project({ 'package.json': '{}' })
    let actual = resolveRuntimeTargets({
      targets: { browsers: 'browserslist config', node: false },
      pinnedDate: '2022-01-01',
      root,
    })
    let expected = resolveRuntimeTargets({
      targets: { browsers: [...browserslist.defaults], node: false },
      pinnedDate: '2022-01-01',
      root,
    })
    expect(actual.browsers).toStrictEqual(expected.browsers)
    expect(actual.unknown).toStrictEqual(expected.unknown)
  })

  it.each([
    ['extends browserslist-config-baseline', 'baseline widely available'],
    ['extends browserslist-config-nested', 'baseline widely available'],
    [
      'chrome >= 60 and extends browserslist-config-nested',
      'chrome >= 60 and baseline widely available',
    ],
    [
      'chrome >= 100 and not extends browserslist-config-nested',
      'chrome >= 100 and not baseline widely available',
    ],
    ['browserslist config', 'baseline widely available'],
  ])('pins nested Baseline queries in %s', (query, directQuery) => {
    let root = project({
      ...sharedConfig(
        'browserslist-config-baseline',
        "module.exports = ['baseline widely available']\n",
      ),
      ...sharedConfig(
        'browserslist-config-nested',
        "module.exports = ['extends browserslist-config-baseline']\n",
      ),
      '.browserslistrc': 'extends browserslist-config-baseline\n',
      'package.json': '{}',
    })
    for (let pinnedDate of ['2022-01-01', '2026-10-11']) {
      let actual = resolveRuntimeTargets({
        targets: { browsers: query, node: false },
        pinnedDate,
        root,
      })
      let expected = resolveRuntimeTargets({
        targets: { browsers: directQuery, node: false },
        pinnedDate,
        root,
      })
      expect(actual.browsers).toStrictEqual(expected.browsers)
      expect(actual.unknown).toStrictEqual(expected.unknown)
    }
  })

  it('preserves shared config environments and explicit Baseline dates', () => {
    let root = project({
      ...sharedConfig(
        'browserslist-config-baseline',
        "module.exports = { production: ['baseline widely available on 2022-01-01'], development: ['chrome 130'] }\n",
      ),
      'package.json': '{}',
    })
    let options: ResolveRuntimeTargetsOptions = {
      targets: {
        browsers: 'extends browserslist-config-baseline',
        node: false,
      },
      pinnedDate: '2026-10-11',
      root,
    }
    expect(resolveRuntimeTargets(options).browsers?.chrome).toBe('66')
    expect(
      resolveRuntimeTargets({ ...options, browserslistEnv: 'development' })
        .browsers,
    ).toStrictEqual({ chrome: '130' })
  })

  it('restores Browserslist loaders and caches after pinned resolutions and errors', () => {
    let root = project({
      ...sharedConfig(
        'browserslist-config-baseline',
        "module.exports = ['baseline widely available']\n",
      ),
      ...sharedConfig(
        'browserslist-config-broken',
        "throw new Error('broken')\n",
      ),
      'package.json': '{}',
    })
    let loader = createRequire(import.meta.url)('browserslist/node') as {
      loadQueries: unknown
    }
    let originalQueries = loader.loadQueries
    let originalConfig = browserslist.loadConfig
    let queries = ['extends browserslist-config-baseline']
    let unpinned = browserslist(queries, { path: root })
    resolveRuntimeTargets({
      targets: { browsers: queries, node: false },
      pinnedDate: '2022-01-01',
      root,
    })
    expect(() =>
      resolveRuntimeTargets({
        targets: {
          browsers: 'extends browserslist-config-broken',
          node: false,
        },
        pinnedDate: '2022-01-01',
        root,
      }),
    ).toThrow('broken')
    expect(loader.loadQueries).toBe(originalQueries)
    expect(browserslist.loadConfig).toBe(originalConfig)
    expect(browserslist(queries, { path: root })).toStrictEqual(unpinned)
  })

  it('warns that "current node" depends on the Node.js running ESLint', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['current node'] },
      root,
    })
    expect(targets.warnings).toContain(
      'targets.browsers: "current node" depends on the Node.js that runs ESLint',
    )
    expect(targets.node).toMatchObject({
      minimum: `${process.versions.node.split('.', 1)[0]}.0.0`,
      source: 'browserslist',
    })
  })

  it('warns without blocking rules when explicit queries select nothing', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: '> 50%', node: false },
      root,
    })
    expect(targets.warnings).toStrictEqual([
      'targets.browsers: queries select no browsers',
    ])
    expect(targets.unknown).toStrictEqual([])
    expect(targets.browsers).toStrictEqual({})
  })

  it('keeps a lower upstream version over an engine-mapped browser', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['and_chr 90', 'and_uc 15.5'], node: false },
      root,
    })
    expect(Object.entries(targets.browsers ?? {})).toStrictEqual([
      ['chrome_android', '90'],
    ])
    expect(Object.entries(targets.browserOrigins)).toStrictEqual([
      ['chrome_android', 'and_chr 90'],
    ])
  })

  it.each([
    [['op_mob 12', 'op_mob >= 46'], [['opera_android', '12']]],
    [['op_mob >= 46', 'not op_mob 80'], []],
    [['and_uc < 15'], []],
  ])(
    '%j: single-version agents that lose no versions are known',
    (queries, browsers) => {
      let root = project({ 'package.json': '{}' })
      let targets = resolveRuntimeTargets({
        targets: { browsers: queries, node: false },
        root,
      })
      expect(targets.unknown).toStrictEqual([])
      expect(Object.entries(targets.browsers ?? {})).toStrictEqual(browsers)
    },
  )

  it.each([
    'not extends browserslist-config-legacy',
    'not browserslist config',
  ])('skips collapsed agents of negated queries in %j', query => {
    let root = project({
      ...sharedConfig(
        'browserslist-config-legacy',
        "module.exports = ['op_mob < 50']\n",
      ),
      '.browserslistrc': 'op_mob < 50\n',
      'package.json': '{}',
    })
    let targets = resolveRuntimeTargets({
      targets: {
        browsers: ['chrome >= 120', 'op_mob >= 80', query],
        node: false,
      },
      root,
    })
    expect(targets.browsers).toHaveProperty('opera_android', '80')
    expect(targets.unknown).toStrictEqual([])
  })

  it.each([
    [
      'browserslist-config-level9',
      '"op_mob >= 46": browserslist has no data for op_mob older than 80',
    ],
    [
      'browserslist-config-level0',
      'op_mob 80: cannot check the queries behind it for older versions',
    ],
  ])('marks collapsed agents behind %s as unknown', (name, reason) => {
    let levels = Array.from({ length: 10 }, (_value, index) =>
      sharedConfig(
        `browserslist-config-level${index}`,
        index === 9 ?
          "module.exports = ['chrome >= 120', 'op_mob >= 46', 'and_uc >= 12']\n"
        : `module.exports = ['extends browserslist-config-level${index + 1}']\n`,
      ),
    )
    let root = project(
      Object.assign({ 'package.json': '{}' }, ...levels) as Record<
        string,
        string
      >,
    )
    let targets = resolveRuntimeTargets({
      targets: { browsers: `extends ${name}`, node: false },
      ignoreBrowsers: ['and_uc'],
      root,
    })
    expect(targets.unknown).toStrictEqual([{ runtime: 'browser', reason }])
    expect(targets.ignoredBrowsers).toStrictEqual(['and_uc 15.5'])
  })

  it('passes other warnings of shareable configs through', () => {
    let root = project({
      ...sharedConfig(
        'browserslist-config-deprecated',
        "console.warn('browserslist-config-deprecated is deprecated')\nmodule.exports = ['chrome >= 120']\n",
      ),
      'package.json': '{}',
    })
    let warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      let targets = resolveRuntimeTargets({
        targets: { browsers: 'extends browserslist-config-deprecated' },
        root,
      })
      expect(warn).toHaveBeenCalledWith(
        'browserslist-config-deprecated is deprecated',
      )
      expect(console.warn).toBe(warn)
      expect(targets.warnings).toStrictEqual([])
      expect(targets.unknown).toStrictEqual([])
    } finally {
      warn.mockRestore()
    }
  })

  it('reports values thrown by a broken shareable config', () => {
    let root = project({
      ...sharedConfig('browserslist-config-broken', "throw 'not built'\n"),
      'package.json': '{}',
    })
    expect(() =>
      resolveRuntimeTargets({
        targets: { browsers: 'extends browserslist-config-broken' },
        root,
      }),
    ).toThrow(
      'Runtime targets: cannot resolve browsers from targets.browsers: not built',
    )
  })

  it.each([undefined, 'false'])(
    'restores BROWSERSLIST_IGNORE_OLD_DATA (%j)',
    value => {
      let root = project({ 'package.json': '{}' })
      vi.stubEnv('BROWSERSLIST_IGNORE_OLD_DATA', value)
      try {
        resolveRuntimeTargets({ targets: { browsers: 'chrome 120' }, root })
        expect(process.env.BROWSERSLIST_IGNORE_OLD_DATA).toBe(value)
      } finally {
        vi.unstubAllEnvs()
      }
    },
  )

  it('treats downstream releases missing from baseline data as unknown', async () => {
    vi.resetModules()
    vi.doMock('baseline-browser-mapping', () => ({
      getAllVersions: (options: Parameters<typeof getAllVersions>[0]) =>
        (
          getAllVersions(options) as { browser: string; version: string }[]
        ).filter(
          release =>
            release.browser !== 'uc_android' || release.version !== '15.5',
        ),
    }))
    try {
      let { resolveRuntimeTargets: resolveWithOldData } =
        await import('../../runtime/targets')
      let root = project({ 'package.json': '{}' })
      let options: ResolveRuntimeTargetsOptions = {
        targets: { browsers: ['and_uc 15.5', 'kaios 2.5'], node: false },
        root,
      }
      let off = resolveWithOldData(options)
      let ignore = resolveWithOldData({ ...options, unknownBrowsers: 'ignore' })
      expect(Object.entries(off.browsers ?? {})).toStrictEqual([
        ['firefox_android', '48'],
      ])
      expect(off.unknown).toStrictEqual([
        { reason: 'and_uc 15.5: no compatibility data', runtime: 'browser' },
      ])
      expect(ignore.unknown).toStrictEqual([])
      expect(ignore.ignoredBrowsers).toStrictEqual(['and_uc 15.5'])
    } finally {
      vi.doUnmock('baseline-browser-mapping')
      vi.resetModules()
    }
  })
})
