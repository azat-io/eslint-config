import { describe, expect, it } from 'vitest'

import { interopDefault } from '../../utils/interop-default'

describe('interop-default', () => {
  it('returns the default export', async () => {
    await expect(
      interopDefault(Promise.resolve({ default: 'value' })),
    ).resolves.toBe('value')
  })

  it('returns a namespace without a default export as is', async () => {
    let namespace = { named: 'value' }

    await expect(interopDefault(Promise.resolve(namespace))).resolves.toBe(
      namespace,
    )
  })

  it('returns primitive values as is', async () => {
    await expect(interopDefault(Promise.resolve('value'))).resolves.toBe(
      'value',
    )
  })

  it('wraps import errors and keeps the cause', async () => {
    let error = new Error('missing')
    let result = interopDefault(Promise.reject(error))

    await expect(result).rejects.toThrow('Cannot import module: Error: missing')
    await expect(result).rejects.toHaveProperty('cause', error)
  })
})
