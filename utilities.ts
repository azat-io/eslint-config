export let interopDefault = async <T>(module: Promise<T> | T): Promise<T> => {
  try {
    let resolved = await module

    if (typeof resolved === 'object' && resolved !== null) {
      if ('default' in resolved && Object.keys(resolved).length === 1) {
        let defaultExport = (resolved as { default: unknown }).default as T

        if (!defaultExport) {
          return defaultExport
        }

        return defaultExport
      }
      return resolved
    }

    return resolved
  } catch (error) {
    throw new Error(`Cannot import module: ${String(error)}`)
  }
}
