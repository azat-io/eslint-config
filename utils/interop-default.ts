export async function interopDefault<T>(
  module: Promise<T>,
): Promise<T extends { default: infer U } ? U : T> {
  try {
    let resolved = await module

    if (
      typeof resolved === 'object' &&
      resolved !== null &&
      'default' in resolved
    ) {
      return (resolved as { default: unknown }).default as never
    }

    return resolved as never
  } catch (error) {
    throw new Error(`Cannot import module: ${String(error)}`, {
      cause: error,
    })
  }
}
