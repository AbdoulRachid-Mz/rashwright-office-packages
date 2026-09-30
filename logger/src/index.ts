/**
 * @rashwright/logger
 *
 * Barrel d'export principal.
 *
 * Usage rapide :
 * ```ts
 * import { logger } from '@rashwright/logger'
 *
 * logger.info('Serveur démarré', { port: 3000 })
 * logger.error('Erreur critique', new Error('DB unreachable'))
 *
 * // Logger avec contexte persistant
 * const apiLogger = logger.child({ module: 'api' })
 * apiLogger.warn('Rate limit approché', { remaining: 5 })
 * ```
 */

export { Logger } from './logger.js'

export {
  LOG_LEVELS,
  type LogLevel,
  type LogMeta,
  type LogEntry,
  type ILogger,
  type LoggerOptions,
} from './types.js'

// Instance globale partagée — prête à l'emploi
import { Logger } from './logger.js'
export const logger = new Logger()

/**
 * Crée un logger avec une configuration personnalisée.
 *
 * @example
 * const logger = createLogger({ prefix: 'upload', level: 'warn' })
 */
export function createLogger(options: ConstructorParameters<typeof Logger>[0]): Logger {
  return new Logger(options)
}
