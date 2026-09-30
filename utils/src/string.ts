/**
 * @rashwright/utils — string.ts
 *
 * Manipulation de chaînes de caractères.
 */

/**
 * Tronque une chaîne et ajoute un suffixe si elle dépasse la longueur maximale.
 *
 * @example
 * truncate("Bonjour tout le monde", 10)        // "Bonjour..."
 * truncate("Bonjour tout le monde", 10, " →")  // "Bonjour →"
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length).trimEnd() + suffix
}

/**
 * Met en majuscule la première lettre d'une chaîne.
 *
 * @example
 * capitalize("bonjour") // "Bonjour"
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convertit une chaîne camelCase ou PascalCase en kebab-case.
 *
 * @example
 * toKebabCase("PropertyCard")  // "property-card"
 * toKebabCase("myHookName")    // "my-hook-name"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

/**
 * Convertit une chaîne kebab-case ou snake_case en camelCase.
 *
 * @example
 * toCamelCase("property-card") // "propertyCard"
 * toCamelCase("my_hook_name")  // "myHookName"
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, char: string) => char.toUpperCase())
}

/**
 * Retire les balises HTML d'une chaîne.
 *
 * @example
 * stripHtml("<p>Bonjour <b>monde</b></p>") // "Bonjour monde"
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Compte le nombre de mots dans une chaîne.
 *
 * @example
 * wordCount("Bonjour tout le monde") // 4
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Génère les initiales d'un nom complet.
 *
 * @example
 * initials("Abdoul Aziz")   // "AA"
 * initials("Jean-Pierre")   // "J"
 */
export function initials(name: string, maxLetters: number = 2): string {
  return name
    .split(/\s+/)
    .slice(0, maxLetters)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

/**
 * Vérifie si une chaîne est une URL valide.
 *
 * @example
 * isUrl("https://rashwright.com") // true
 * isUrl("not a url")              // false
 */
export function isUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}
