/**
 * @rashwright/utils — format-bytes.ts
 *
 * Formatage lisible des tailles de fichiers en octets.
 *
 * Fusion et amélioration de :
 * - immo360-web/lib/utils.ts → formatBytes
 * - immo360-web/utils/image-upload-utils.ts → formatFileSize
 */

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const
const BINARY_BYTE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'] as const

/**
 * Formate un nombre d'octets en chaîne lisible (base 1000 — standard SI).
 *
 * @example
 * formatBytes(1024)       // "1.02 KB"
 * formatBytes(1500000, 1) // "1.5 MB"
 * formatBytes(0)          // "0 B"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'

  const k = 1000
  const dm = Math.max(0, decimals)
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), BYTE_UNITS.length - 1)
  const value = bytes / Math.pow(k, i)

  return `${parseFloat(value.toFixed(dm))} ${BYTE_UNITS[i]}`
}

/**
 * Formate un nombre d'octets en chaîne lisible (base 1024 — binaire IEC).
 *
 * @example
 * formatBinaryBytes(1024)  // "1 KiB"
 * formatBinaryBytes(1048576) // "1 MiB"
 */
export function formatBinaryBytes(bytes: number, decimals: number = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = Math.max(0, decimals)
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), BINARY_BYTE_UNITS.length - 1)
  const value = bytes / Math.pow(k, i)

  return `${parseFloat(value.toFixed(dm))} ${BINARY_BYTE_UNITS[i]}`
}

/**
 * Convertit une taille en Mo en octets.
 *
 * @example
 * mbToBytes(5) // 5242880
 */
export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024
}

/**
 * Convertit des octets en Mo.
 *
 * @example
 * bytesToMb(5242880) // 5
 */
export function bytesToMb(bytes: number): number {
  return bytes / (1024 * 1024)
}
