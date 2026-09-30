/**
 * @rashwright/utils — url.ts
 *
 * Utilitaires de construction et de parsing d'URLs / Query Strings.
 */

/**
 * Construit une query string à partir d'un objet de paramètres.
 * Ignore les valeurs null, undefined et les chaînes vides.
 *
 * @example
 * buildQueryString({ page: 1, limit: 20, query: 'villa', status: undefined })
 * // "page=1&limit=20&query=villa"
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined) {
          searchParams.append(key, String(item))
        }
      }
    } else {
      searchParams.set(key, String(value))
    }
  }

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

/**
 * Parse une query string en objet.
 *
 * @example
 * parseQueryString("?page=1&limit=20&tags=a&tags=b")
 * // { page: "1", limit: "20", tags: ["a", "b"] }
 */
export function parseQueryString(search: string): Record<string, string | string[]> {
  const params = new URLSearchParams(search)
  const result: Record<string, string | string[]> = {}

  params.forEach((value, key) => {
    const existing = result[key]
    if (existing === undefined) {
      result[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      result[key] = [existing, value]
    }
  })

  return result
}

/**
 * Combine une URL de base avec des paramètres de query string.
 *
 * @example
 * buildUrl('/api/properties', { page: 1, categoryId: 'abc' })
 * // "/api/properties?page=1&categoryId=abc"
 */
export function buildUrl(base: string, params?: Record<string, unknown>): string {
  if (!params) return base
  const qs = buildQueryString(params)
  return `${base}${qs}`
}

/**
 * Extrait le nom de fichier depuis une URL ou un chemin.
 *
 * @example
 * getFilenameFromUrl("https://cdn.example.com/images/photo.jpg") // "photo.jpg"
 * getFilenameFromUrl("/uploads/document.pdf")                     // "document.pdf"
 */
export function getFilenameFromUrl(url: string): string {
  return url.split('/').filter(Boolean).pop() ?? ''
}

/**
 * Extrait l'extension d'un fichier depuis une URL ou un nom de fichier.
 *
 * @example
 * getExtension("photo.jpg")          // "jpg"
 * getExtension("document.pdf")       // "pdf"
 * getExtension("archive.tar.gz")     // "gz"
 */
export function getExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? (parts.pop() ?? '') : ''
}
