/**
 * @rashwright/logger — logger.ts
 *
 * Implémentation du logger universel Rashwright.
 *
 * Améliorations par rapport à immo360-web/src/logger/index.ts :
 * - Niveaux hiérarchiques (debug < info < warn < error) avec filtrage configurable.
 * - Support de contexte persistant via child loggers.
 * - Formatage coloré en développement, JSON compact en production.
 * - Adaptatif selon l'environnement (Node, Browser, React Native).
 * - Méta-données structurées sur chaque message.
 */

import {
  type LogLevel,
  type LogMeta,
  type ILogger,
  type LoggerOptions,
  LOG_LEVELS,
} from './types.js'

// ---------------------------------------------------------------------------
// Détection de l'environnement
// ---------------------------------------------------------------------------

function detectEnvironment(): 'node' | 'browser' | 'react-native' {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'react-native'
  }
  if (typeof window !== 'undefined') return 'browser'
  return 'node'
}

function isProduction(): boolean {
  if (typeof process !== 'undefined' && process.env['NODE_ENV']) {
    return process.env['NODE_ENV'] === 'production'
  }
  return false
}

// ---------------------------------------------------------------------------
// Formatage
// ---------------------------------------------------------------------------

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',  // Cyan
  info: '\x1b[32m',   // Vert
  warn: '\x1b[33m',   // Jaune
  error: '\x1b[31m',  // Rouge
}
const RESET = '\x1b[0m'

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: ' INFO',
  warn: ' WARN',
  error: 'ERROR',
}

function formatTimestamp(): string {
  return new Date().toISOString()
}

function formatMessage(
  level: LogLevel,
  message: string,
  prefix: string | undefined,
  context: LogMeta | undefined,
  meta: LogMeta | undefined,
  error: unknown | undefined,
  colorize: boolean,
  env: 'node' | 'browser' | 'react-native',
): string | [string, ...unknown[]] {
  const ts = formatTimestamp()
  const label = LEVEL_LABELS[level]
  const pfx = prefix ? `[${prefix}] ` : ''
  const combined = { ...context, ...meta }
  const hasMeta = Object.keys(combined).length > 0

  // React Native : format compact lisible
  if (env === 'react-native') {
    const metaStr = hasMeta ? ` ${JSON.stringify(combined)}` : ''
    const errStr = error ? ` ERROR: ${error instanceof Error ? error.message : String(error)}` : ''
    return `${label} ${pfx}${message}${metaStr}${errStr}`
  }

  // Production : JSON structuré (pour les agrégateurs de logs)
  if (isProduction()) {
    const entry: Record<string, unknown> = {
      level,
      timestamp: ts,
      message: `${pfx}${message}`,
    }
    if (hasMeta) entry['meta'] = combined
    if (error) entry['error'] = error instanceof Error ? { message: error.message, stack: error.stack } : error
    return JSON.stringify(entry)
  }

  // Développement Node / Browser : format lisible avec couleurs optionnelles
  const color = colorize && env === 'node' ? COLORS[level] : ''
  const reset = colorize && env === 'node' ? RESET : ''
  const metaPart = hasMeta ? ` | ${JSON.stringify(combined)}` : ''

  const base = `${color}${label}${reset} [${ts}] ${pfx}${message}${metaPart}`

  if (env === 'browser') {
    // Browser : utiliser les styles CSS console
    if (error) return [base, combined, error] as [string, ...unknown[]]
    if (hasMeta) return [base, combined] as [string, ...unknown[]]
    return base
  }

  return base
}

// ---------------------------------------------------------------------------
// Implémentation du Logger
// ---------------------------------------------------------------------------

export class Logger implements ILogger {
  private readonly level: LogLevel
  private readonly prefix: string | undefined
  private readonly colorize: boolean
  private readonly context: LogMeta
  private readonly env: 'node' | 'browser' | 'react-native'

  constructor(options: LoggerOptions = {}) {
    this.env = detectEnvironment()
    this.level = options.level ?? (isProduction() ? 'info' : 'debug')
    this.prefix = options.prefix
    this.colorize = options.colorize ?? this.env === 'node'
    this.context = options.context ?? {}
  }

  private shouldLog(level: LogLevel): boolean {
    return (LOG_LEVELS[level] ?? 0) >= (LOG_LEVELS[this.level] ?? 0)
  }

  private log(level: LogLevel, message: string, meta?: LogMeta, error?: unknown): void {
    if (!this.shouldLog(level)) return

    const formatted = formatMessage(
      level, message, this.prefix,
      this.context, meta, error,
      this.colorize, this.env,
    )

    const consoleFn = level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : level === 'debug'
          ? console.debug
          : console.log

    if (Array.isArray(formatted)) {
      consoleFn(...formatted)
    } else {
      if (error) {
        consoleFn(formatted, error)
      } else {
        consoleFn(formatted)
      }
    }
  }

  debug(message: string, meta?: LogMeta): void {
    this.log('debug', message, meta)
  }

  info(message: string, meta?: LogMeta): void {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: LogMeta): void {
    this.log('warn', message, meta)
  }

  error(message: string, error?: unknown, meta?: LogMeta): void {
    this.log('error', message, meta, error)
  }

  /**
   * Crée un logger enfant qui hérite du contexte parent
   * et y ajoute des méta-données supplémentaires.
   *
   * @example
   * const requestLogger = logger.child({ requestId: 'abc-123' })
   * requestLogger.info('Processing request') // inclut toujours requestId
   */
  child(context: LogMeta): Logger {
    const opts: LoggerOptions = {
      level: this.level,
      colorize: this.colorize,
      context: { ...this.context, ...context },
    }
    if (this.prefix !== undefined) opts.prefix = this.prefix
    return new Logger(opts)
  }
}
