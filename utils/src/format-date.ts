/**
 * @rashwright/utils — format-date.ts
 *
 * Utilitaires de formatage de dates — sans dépendances externes.
 * Pour les projets qui ont besoin de date-fns, ils peuvent l'utiliser directement.
 * Ces fonctions couvrent les cas simples et universels.
 */

export type DateInput = Date | string | number

/**
 * Normalise une entrée en objet Date.
 * Retourne null si la valeur est invalide.
 */
export function toDate(value: DateInput): Date | null {
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Formate une date en chaîne lisible.
 *
 * @example
 * formatDate(new Date(), 'fr-FR')       // "30 septembre 2026"
 * formatDate('2026-01-15', 'en-US')     // "January 15, 2026"
 * formatDate(1712345678000, 'fr-FR', { includeTime: true }) // "5 avril 2024 à 19:54"
 */
export function formatDate(
  value: DateInput,
  locale: string = 'fr-FR',
  options: {
    includeTime?: boolean
    dateStyle?: Intl.DateTimeFormatOptions['dateStyle']
    timeStyle?: Intl.DateTimeFormatOptions['timeStyle']
  } = {},
): string {
  const date = toDate(value)
  if (!date) return ''

  const { includeTime = false, dateStyle = 'long', timeStyle = 'short' } = options

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    ...(includeTime ? { timeStyle } : {}),
  }).format(date)
}

/**
 * Retourne une durée relative humainement lisible (ex : "il y a 3 jours").
 *
 * @example
 * formatRelativeTime(Date.now() - 60000, 'fr') // "il y a 1 minute"
 */
export function formatRelativeTime(value: DateInput, locale: string = 'fr'): string {
  const date = toDate(value)
  if (!date) return ''

  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffSeconds = Math.round(diffMs / 1000)
  const diffMinutes = Math.round(diffSeconds / 60)
  const diffHours = Math.round(diffMinutes / 60)
  const diffDays = Math.round(diffHours / 24)
  const diffWeeks = Math.round(diffDays / 7)
  const diffMonths = Math.round(diffDays / 30)
  const diffYears = Math.round(diffDays / 365)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, 'second')
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute')
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day')
  if (Math.abs(diffWeeks) < 5) return rtf.format(diffWeeks, 'week')
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month')
  return rtf.format(diffYears, 'year')
}

/**
 * Retourne une date au format ISO 8601 (YYYY-MM-DD).
 *
 * @example
 * toISODate(new Date()) // "2026-09-30"
 */
export function toISODate(value: DateInput): string {
  const date = toDate(value)
  if (!date) return ''
  return date.toISOString().split('T')[0] ?? ''
}
