import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { version } from '../../package.json'
import plugin from '../../rules'

describe('rules', () => {
  it('describes the plugin with the package name and version', () => {
    expect(plugin.meta).toStrictEqual({
      name: '@azat-io/eslint-config',
      namespace: 'azat-io',
      version,
    })
  })

  it.each(Object.entries(plugin.rules))(
    'documents %s next to its source',
    (name, rule) => {
      expect(rule.meta?.docs?.url).toBe(
        `https://github.com/azat-io/eslint-config/blob/main/rules/${name}.md`,
      )
      expect(
        existsSync(path.join(import.meta.dirname, '../../rules', `${name}.md`)),
      ).toBe(true)
    },
  )
})
