/**
 * @rashwright/utils — format-currency.ts
 *
 * Formatage monétaire multi-devises.
 * Supporte les devises d'Afrique de l'Ouest (XOF, XAF) et les principales devises mondiales.
 */

/** Devises couramment utilisées dans les projets Rashwright. */
export type CurrencyCode =
  | 'XOF'   // Franc CFA BCEAO (Afrique de l'Ouest)
  | 'XAF'   // Franc CFA BEAC (Afrique Centrale)
  | 'NGN'   // Naira nigérian
  | 'GHS'   // Cedi ghanéen
  | 'MAD'   // Dirham marocain
  | 'EUR'
  | 'USD'
  | 'GBP'
  | string  // Permet n'importe quelle devise ISO 4217

export interface FormatCurrencyOptions {
  currency?: CurrencyCode
  locale?: string
  decimals?: number
  /** Afficher le symbole à la place du code ISO. Par défaut : true. */
  useSymbol?: boolean
  /** Afficher un signe "+" pour les valeurs positives. Par défaut : false. */
  showPositiveSign?: boolean
}

/**
 * Formate un montant numérique en chaîne monétaire lisible.
 *
 * @example
 * formatCurrency(150000, { currency: 'XOF' })           // "150 000 FCFA"
 * formatCurrency(99.99, { currency: 'EUR' })             // "99,99 €"
 * formatCurrency(1500, { currency: 'USD', locale: 'en-US' }) // "$1,500.00"
 */
export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {},
): string {
  const {
    currency = 'XOF',
    locale = 'fr-FR',
    decimals,
    showPositiveSign = false,
  } = options

  // XOF et XAF n'ont pas de décimales par convention
  const isCFA = currency === 'XOF' || currency === 'XAF'
  const resolvedDecimals = decimals ?? (isCFA ? 0 : 2)

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: resolvedDecimals,
      maximumFractionDigits: resolvedDecimals,
    }).format(Math.abs(amount))

    const sign = amount < 0 ? '-' : showPositiveSign && amount > 0 ? '+' : ''
    return `${sign}${formatted}`
  } catch {
    // Fallback si la devise n'est pas reconnue par Intl
    const value = Math.abs(amount).toFixed(resolvedDecimals)
    const sign = amount < 0 ? '-' : showPositiveSign && amount > 0 ? '+' : ''
    return `${sign}${value} ${currency}`
  }
}

/**
 * Abrège un grand nombre (ex : 1 500 000 → "1,5M").
 * Utile pour les statistiques et dashboards.
 *
 * @example
 * abbreviateNumber(1500000) // "1.5M"
 * abbreviateNumber(25000)   // "25K"
 * abbreviateNumber(999)     // "999"
 */
export function abbreviateNumber(value: number, decimals: number = 1): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(decimals)}B`
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(decimals)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(decimals)}K`
  return `${sign}${abs}`
}
