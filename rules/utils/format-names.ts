/**
 * The longest list of names that a message shows in full.
 */
const MAX_LISTED_NAMES = 4

/**
 * Formats names for a message, shortening long lists.
 *
 * @param names - Names to show.
 * @returns Names in backticks, separated by commas.
 */
export function formatNames(names: string[]): string {
  let listed =
    names.length > MAX_LISTED_NAMES ?
      names.slice(0, MAX_LISTED_NAMES - 1)
    : names
  let text = listed.map(name => `\`${name}\``).join(', ')

  return listed.length < names.length ?
      `${text} and ${names.length - listed.length} more`
    : text
}
