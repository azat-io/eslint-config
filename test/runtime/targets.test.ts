import { writeFileSync, mkdtempSync, mkdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import path from 'node:path'

import type {
  ResolveRuntimeTargetsOptions,
  RuntimeTargetsOption,
  RuleSupport,
} from '../../runtime/targets'

import {
  resolveRuntimeTargets,
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

describe('node targets', () => {
  it('[#1] browsers-only project falls back to the Node.js floor instead of ignoring Node', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['last 2 chrome versions'],
      }),
    })
    let targets = resolveRuntimeTargets({ root })
    expect(targets.node?.minimum).toBe('22.0.0')
    expect(isEnabled('unicorn/prefer-promise-try', { root })).toBeFalsy()
    expect(isEnabled('unicorn/prefer-uint8array-base64', { root })).toBeFalsy()
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
    ).toBeTruthy()
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
      expect(isEnabled('unicorn/prefer-promise-try', { root })).toBeFalsy()
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
    ).toBeTruthy()
    expect(
      isEnabled('unicorn/prefer-abort-signal-any', {
        targets: { browsers: false },
        root,
      }),
    ).toBeTruthy()
    expect(
      isEnabled('unicorn/no-array-sort', {
        targets: { browsers: false },
        root,
      }),
    ).toBeFalsy()
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

  it('[#15] browserslist node queries are floored to the major release', () => {
    let root = project({ 'package.json': '{}' })
    let targets = resolveRuntimeTargets({
      targets: { browsers: ['node 20'] },
      root,
    })
    expect(targets.node?.minimum).toBe('20.0.0')
    expect(
      isEnabled('unicorn/prefer-abort-signal-any', {
        targets: { browsers: ['node 20'] },
        root,
      }),
    ).toBeFalsy()
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
    ).toBeFalsy()
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
    ).toBeFalsy()
    expect(
      isEnabled('unicorn/prefer-at', {
        targets: { browsers: ['baidu 13.52', 'chrome 130'], node: false },
        unknownBrowsers: 'ignore',
        root,
      }),
    ).toBeTruthy()
  })

  it('[#13] a config without a section for the env makes browsers unknown', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: { development: ['last 1 chrome version'] },
        engines: { node: '>=24' },
      }),
    })
    expect(resolveRuntimeTargets({ root }).unknown[0]?.runtime).toBe('browser')
    expect(isEnabled('unicorn/prefer-iterator-helpers', { root })).toBeFalsy()
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
    expect(
      isEnabled('unicorn/prefer-dom-node-html-methods', { root }),
    ).toBeTruthy()
  })

  it('[#20/#21] node-only rules ignore browser targets', () => {
    let root = project({
      'package.json': JSON.stringify({
        browserslist: ['firefox 128'],
        engines: { node: '>=22' },
      }),
    })
    expect(isEnabled('unicorn/prefer-json-import', { root })).toBeTruthy()
    expect(
      isEnabled('unicorn/prefer-import-meta-properties', { root }),
    ).toBeTruthy()
  })

  it('[#21] import.meta.dirname is unavailable on 21.0-21.1', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=21.0' } }),
    })
    expect(
      isEnabled('unicorn/prefer-import-meta-properties', { root }),
    ).toBeFalsy()
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
    ).toBeTruthy()
    expect(
      isEnabled('unicorn/prefer-regexp-escape', {
        targets: { browsers: false },
        root,
      }),
    ).toBeFalsy()
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
    ).toBeFalsy()
    expect(
      isEnabled('unicorn/prefer-iterator-helpers', {
        missingBrowsers: ['safari 16'],
        root,
      }),
    ).toBeFalsy()
    expect(isEnabled('unicorn/prefer-iterator-helpers', { root })).toBeTruthy()
  })

  it('[r2#15] queries that select no browsers warn and, in auto mode, block rules', () => {
    let root = project({
      'package.json': JSON.stringify({ engines: { node: '>=24' } }),
      '.browserslistrc': '> 50%\n',
    })
    let targets = resolveRuntimeTargets({ root })
    expect(targets.warnings.join('\n')).toContain('queries select no browsers')
    expect(isEnabled('unicorn/prefer-promise-try', { root })).toBeFalsy()
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
    ).toBeFalsy()
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
    ).toBeTruthy()
    expect(
      isEnabled('unicorn/prefer-at', {
        targets: { browsers: ['chrome >= 120', query], node: false },
        root,
      }),
    ).toBeFalsy()
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
