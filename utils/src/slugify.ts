/**
 * @rashwright/utils — slugify.ts
 *
 * Génération sécurisée de slugs URL à partir de chaînes multilingues.
 * Supporte le français, l'arabe et les caractères accentués africains.
 */

/**
 * Convertit une chaîne en slug URL sûr.
 *
 * @example
 * slugify("Immo 360 — Annonces & Propriétés")  // "immo-360-annonces-proprietes"
 * slugify("  Vente   d'appartement ")           // "vente-dappartement"
 */
export function slugify(input: string, separator: string = '-'): string {
  return input
    .normalize('NFD')                          // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '')           // Supprime les diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')             // Garde seulement alphanumérique, espaces et tirets
    .trim()
    .replace(/[\s-]+/g, separator)             // Remplace espaces et tirets multiples par le séparateur
}

/**
 * Génère un slug unique en ajoutant un suffixe numérique si nécessaire.
 *
 * @example
 * uniqueSlug("propriete", ["propriete", "propriete-1"]) // "propriete-2"
 */
export function uniqueSlug(base: string, existing: string[]): string {
  const slug = slugify(base)
  if (!existing.includes(slug)) return slug

  let counter = 1
  while (existing.includes(`${slug}-${counter}`)) {
    counter++
  }
  return `${slug}-${counter}`
}
