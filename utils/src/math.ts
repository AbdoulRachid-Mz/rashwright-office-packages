/**
 * @rashwright/utils — math.ts
 *
 * Utilitaires mathématiques purs.
 */

/**
 * Borne une valeur entre un minimum et un maximum.
 *
 * @example
 * clamp(150, 0, 100) // 100
 * clamp(-5, 0, 100)  // 0
 * clamp(42, 0, 100)  // 42
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Arrondit un nombre à N décimales.
 *
 * @example
 * roundTo(3.14159, 2) // 3.14
 * roundTo(2.005, 2)   // 2.01
 */
export function roundTo(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Calcule un pourcentage.
 *
 * @example
 * percentage(25, 200) // 12.5
 */
export function percentage(part: number, total: number, decimals: number = 2): number {
  if (total === 0) return 0
  return roundTo((part / total) * 100, decimals)
}

/**
 * Interpole linéairement entre deux valeurs.
 *
 * @example
 * lerp(0, 100, 0.5) // 50
 * lerp(0, 100, 0.25) // 25
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1)
}

/**
 * Vérifie si un nombre est dans un intervalle (bornes incluses).
 *
 * @example
 * inRange(5, 0, 10) // true
 * inRange(11, 0, 10) // false
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Génère un entier aléatoire entre min et max (inclus).
 *
 * @example
 * randomInt(1, 6) // 1 à 6 (dé 6 faces)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Somme d'un tableau de nombres.
 *
 * @example
 * sum([1, 2, 3, 4]) // 10
 */
export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}

/**
 * Moyenne d'un tableau de nombres.
 *
 * @example
 * average([2, 4, 6]) // 4
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0
  return sum(values) / values.length
}
