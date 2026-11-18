/**
 * Brings a name to the form in which names are compared: lowercase, without
 * separators and other characters that are not letters or digits.
 *
 * @param name - Identifier or filename.
 * @returns Normalized name.
 */
export function normalizeName(name: string): string {
  return name
    .normalize('NFC')
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]/gu, '')
}
