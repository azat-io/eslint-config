export async function interopDefault<T>(module: T): Promise<T> {
  try {
    let resolved = await module

    if (typeof resolved === 'object' && resolved !== null) {
      if ('default' in resolved) {
        return (resolved as { default: unknown }).default as T
      }
      return resolved
    }

    return resolved
  } catch (error) {
    throw new Error(`Cannot import module: ${String(error)}`, {
      cause: error,
    })
  }
}
