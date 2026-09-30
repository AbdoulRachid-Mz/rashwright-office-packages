/**
 * @rashwright/core — pagination.ts
 *
 * Primitives de pagination partagées entre Web, Mobile et API.
 *
 * Amélioration par rapport à immo360-web/src/pagination :
 * - Constants configurables via objet PAGINATION_DEFAULTS exporté.
 * - `buildPaginationMeta` aligné sur le type PaginationMeta de response.ts.
 * - Fonction `paginateArray` pour la pagination in-memory (tests, données locales).
 */

import { type PaginationMeta } from './response.js'

// ---------------------------------------------------------------------------
// Valeurs par défaut
// ---------------------------------------------------------------------------

export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number | string
  limit?: number | string
}

export interface ParsedPagination {
  page: number
  limit: number
  offset: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse et normalise les paramètres de pagination
 * en valeurs entières sûres et bornées.
 */
export function parsePaginationParams(params: PaginationParams = {}): ParsedPagination {
  const page = Math.max(1, parseInt(String(params.page ?? PAGINATION_DEFAULTS.DEFAULT_PAGE), 10) || 1)
  const limit = Math.min(
    PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, parseInt(String(params.limit ?? PAGINATION_DEFAULTS.DEFAULT_LIMIT), 10) || PAGINATION_DEFAULTS.DEFAULT_LIMIT),
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Construit les méta-données de pagination à partir des valeurs parsées
 * et du total des éléments.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

/**
 * Pagine un tableau en mémoire (utile pour les tests ou les données locales).
 */
export function paginateArray<T>(
  items: T[],
  params: PaginationParams,
): { data: T[]; meta: PaginationMeta } {
  const { page, limit, offset } = parsePaginationParams(params)
  const data = items.slice(offset, offset + limit)

  return {
    data,
    meta: buildPaginationMeta(page, limit, items.length),
  }
}
