/**
 * @rashwright/utils — collections.ts
 *
 * Utilitaires de manipulation de tableaux et d'objets.
 */

/**
 * Groupe les éléments d'un tableau par une clé.
 *
 * @example
 * groupBy([{type:'a', v:1},{type:'b', v:2},{type:'a', v:3}], x => x.type)
 * // { a: [{type:'a',v:1},{type:'a',v:3}], b: [{type:'b',v:2}] }
 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item)
    if (!acc[key]) acc[key] = []
    acc[key]!.push(item)
    return acc
  }, {})
}

/**
 * Déduplique un tableau, optionnellement par une clé.
 *
 * @example
 * unique([1, 2, 2, 3])                             // [1, 2, 3]
 * unique([{id:1},{id:2},{id:1}], x => x.id)        // [{id:1},{id:2}]
 */
export function unique<T>(items: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) return [...new Set(items)]
  const seen = new Set<unknown>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Divise un tableau en sous-tableaux de taille fixe.
 *
 * @example
 * chunk([1,2,3,4,5], 2) // [[1,2],[3,4],[5]]
 */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items]
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

/**
 * Tri un tableau d'objets par une clé, avec support de l'ordre.
 *
 * @example
 * sortBy([{n:'b'},{n:'a'}], x => x.n)         // [{n:'a'},{n:'b'}]
 * sortBy([{n:'b'},{n:'a'}], x => x.n, 'desc') // [{n:'b'},{n:'a'}]
 */
export function sortBy<T>(
  items: T[],
  keyFn: (item: T) => string | number | Date,
  order: 'asc' | 'desc' = 'asc',
): T[] {
  return [...items].sort((a, b) => {
    const aVal = keyFn(a)
    const bVal = keyFn(b)
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return order === 'asc' ? cmp : -cmp
  })
}

/**
 * Aplatit un tableau de tableaux d'un seul niveau.
 *
 * @example
 * flatten([[1,2],[3],[4,5]]) // [1,2,3,4,5]
 */
export function flatten<T>(items: T[][]): T[] {
  return ([] as T[]).concat(...items)
}

/**
 * Retourne la différence entre deux tableaux (éléments de a qui ne sont pas dans b).
 *
 * @example
 * difference([1,2,3,4], [2,4]) // [1,3]
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b)
  return a.filter((item) => !setB.has(item))
}

/**
 * Retourne l'intersection de deux tableaux.
 *
 * @example
 * intersection([1,2,3], [2,3,4]) // [2,3]
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b)
  return a.filter((item) => setB.has(item))
}

/**
 * Indexe un tableau par une clé unique pour un accès O(1).
 *
 * @example
 * indexBy([{id:'a',v:1},{id:'b',v:2}], x => x.id)
 * // { a: {id:'a',v:1}, b: {id:'b',v:2} }
 */
export function indexBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[keyFn(item)] = item
    return acc
  }, {})
}
