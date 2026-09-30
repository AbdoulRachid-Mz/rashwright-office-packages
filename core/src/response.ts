/**
 * @rashwright/core — response.ts
 *
 * Contrats universels de réponse API utilisés côté client (Web, Mobile)
 * et côté serveur pour uniformiser tous les échanges réseau.
 */

// ---------------------------------------------------------------------------
// Méta-données de pagination (optionnel dans les réponses)
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ---------------------------------------------------------------------------
// Méta-données génériques d'une réponse
// ---------------------------------------------------------------------------

export type ApiMeta = {
  pagination?: PaginationMeta
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Structure de succès
// ---------------------------------------------------------------------------

export type ApiSuccess<T> = {
  readonly success: true
  readonly data: T
  readonly message?: string
  readonly meta?: ApiMeta
}

// ---------------------------------------------------------------------------
// Structure d'erreur
// ---------------------------------------------------------------------------

export type ApiFailure = {
  readonly success: false
  readonly error: {
    readonly code: string
    readonly message: string
    readonly details?: unknown
  }
}

// ---------------------------------------------------------------------------
// Union discriminée — la valeur retournée par l'API
// ---------------------------------------------------------------------------

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

// ---------------------------------------------------------------------------
// Réponse paginée (raccourci typé)
// ---------------------------------------------------------------------------

export type PaginatedResponse<T> = ApiSuccess<T[]> & {
  readonly meta: ApiMeta & { readonly pagination: PaginationMeta }
}

// ---------------------------------------------------------------------------
// Type-guards
// ---------------------------------------------------------------------------

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true
}

export function isApiFailure<T>(response: ApiResponse<T>): response is ApiFailure {
  return response.success === false
}

// ---------------------------------------------------------------------------
// Constructeurs
// ---------------------------------------------------------------------------

export function apiSuccess<T>(
  data: T,
  message?: string,
  meta?: ApiMeta,
): ApiSuccess<T> {
  const result: ApiSuccess<T> = { success: true, data }
  if (message !== undefined) (result as Record<string, unknown>).message = message
  if (meta !== undefined) (result as Record<string, unknown>).meta = meta
  return result
}

export function apiFailure(
  code: string,
  message: string,
  details?: unknown,
): ApiFailure {
  return { success: false, error: { code, message, details } }
}
