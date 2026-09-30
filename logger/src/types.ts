/**
 * @rashwright/logger — types.ts
 *
 * Interfaces et types du logger universel Rashwright.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export interface LogMeta {
  [key: string]: unknown
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  meta?: LogMeta
  error?: Error | unknown
}

/** Interface principale du logger — tout adaptateur doit l'implémenter. */
export interface ILogger {
  debug(message: string, meta?: LogMeta): void
  info(message: string, meta?: LogMeta): void
  warn(message: string, meta?: LogMeta): void
  error(message: string, error?: unknown, meta?: LogMeta): void
  child(context: LogMeta): ILogger
}

export interface LoggerOptions {
  /** Niveau minimum affiché. Par défaut : 'debug' en dev, 'info' en prod. */
  level?: LogLevel
  /** Préfixe affiché avant chaque message. */
  prefix?: string
  /** Activer le formatage coloré (console Web / Node). */
  colorize?: boolean
  /** Contexte persistant ajouté à tous les messages de cette instance. */
  context?: LogMeta
}
