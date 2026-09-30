/**
 * @rashwright/utils
 *
 * Barrel d'export principal — tous les utilitaires génériques Rashwright.
 */

// Formatage des tailles de fichiers
export {
  formatBytes,
  formatBinaryBytes,
  mbToBytes,
  bytesToMb,
} from './format-bytes.js'

// Formatage monétaire
export {
  formatCurrency,
  abbreviateNumber,
  type CurrencyCode,
  type FormatCurrencyOptions,
} from './format-currency.js'

// Dates
export {
  toDate,
  formatDate,
  formatRelativeTime,
  toISODate,
  type DateInput,
} from './format-date.js'

// Slugs
export {
  slugify,
  uniqueSlug,
} from './slugify.js'

// Chaînes de caractères
export {
  truncate,
  capitalize,
  toKebabCase,
  toCamelCase,
  stripHtml,
  wordCount,
  initials,
  isUrl,
} from './string.js'

// Mathématiques
export {
  clamp,
  roundTo,
  percentage,
  lerp,
  inRange,
  randomInt,
  sum,
  average,
} from './math.js'

// Collections
export {
  groupBy,
  unique,
  chunk,
  sortBy,
  flatten,
  difference,
  intersection,
  indexBy,
} from './collections.js'

// URLs & Query Strings
export {
  buildQueryString,
  parseQueryString,
  buildUrl,
  getFilenameFromUrl,
  getExtension,
} from './url.js'
