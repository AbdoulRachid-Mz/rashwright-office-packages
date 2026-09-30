/**
 * @rashwright/core — errors.ts
 *
 * Hiérarchie d'erreurs typées et standard pour tous les projets Rashwright.
 *
 * Amélioration par rapport aux implémentations existantes dans immo360-web :
 * - Codes d'erreur enum centralisés (stable même si le message change).
 * - Support du champ `details` pour les erreurs de validation.
 * - Méthode `toApiFailure()` pour sérialiser directement vers ApiFailure.
 * - Compatible Node.js et navigateur (pas de V8-only APIs obligatoires).
 */

import { type ApiFailure } from './response.js'

// ---------------------------------------------------------------------------
// Codes d'erreur stables
// ---------------------------------------------------------------------------

export const ErrorCode = {
  // Génériques
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  // Validation / Ressources
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  // Limites
  RATE_LIMITED: 'RATE_LIMITED',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  // Upload
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  // Base de données
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

// ---------------------------------------------------------------------------
// Classe de base
// ---------------------------------------------------------------------------

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly details?: unknown

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ErrorCode.INTERNAL_ERROR,
    details?: unknown,
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    this.details = details

    // Capture stack trace si disponible (Node.js / V8)
    if ('captureStackTrace' in Error && typeof (Error as unknown as { captureStackTrace: unknown }).captureStackTrace === 'function') {
      (Error as unknown as { captureStackTrace: (target: object, ctor: Function) => void }).captureStackTrace(this, this.constructor)
    }
  }

  /** Sérialise l'erreur au format ApiFailure standard Rashwright. */
  toApiFailure(): ApiFailure {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    }
  }
}

// ---------------------------------------------------------------------------
// Erreurs dérivées
// ---------------------------------------------------------------------------

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, ErrorCode.NOT_FOUND)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, ErrorCode.UNAUTHORIZED)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, ErrorCode.FORBIDDEN)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, ErrorCode.CONFLICT, details)
  }
}

export class RateLimitedError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, ErrorCode.RATE_LIMITED)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, ErrorCode.DATABASE_ERROR, details)
  }
}

export class UploadError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, ErrorCode.UPLOAD_FAILED, details)
  }
}

// ---------------------------------------------------------------------------
// Type-guard
// ---------------------------------------------------------------------------

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational
}
