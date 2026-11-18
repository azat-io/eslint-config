import { normalizeName } from './normalize-name'

/**
 * Collects the forms of a base name that an export can match: the whole name
 * and every prefix that ends before a dot, so that `logger.node` matches
 * `logger` and `user.service` matches `UserService`.
 *
 * @param segments - Parts of the filename without its extension, split at dots.
 * @returns Normalized non-empty variants.
 */
export function getFilenameVariants(segments: string[]): Set<string> {
  let variants = segments.map((_segment, index) =>
    normalizeName(segments.slice(0, index + 1).join('.')),
  )
  return new Set(variants.filter(variant => variant !== ''))
}
