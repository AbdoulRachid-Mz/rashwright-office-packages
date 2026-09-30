/**
 * @rashwright/validation — schemas/pagination.ts
 *
 * Schémas Zod pour la validation et le prétraitement des paramètres de pagination.
 * Compatible avec les query strings (string) et les objets typés (number).
 */

import { z } from 'zod';
import { PAGINATION_DEFAULTS } from '@rashwright/core';

export interface PaginationSchemaOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

/**
 * Crée un schéma Zod de pagination configurable.
 */
export function createPaginationSchema(options: PaginationSchemaOptions = {}) {
  const defaultLimit = options.defaultLimit ?? PAGINATION_DEFAULTS.DEFAULT_LIMIT;
  const maxLimit = options.maxLimit ?? PAGINATION_DEFAULTS.MAX_LIMIT;

  return z.object({
    page: z.preprocess((val) => {
      if (val === undefined || val === null || val === '') return PAGINATION_DEFAULTS.DEFAULT_PAGE;
      const num = Number(val);
      return Number.isInteger(num) && num > 0 ? num : PAGINATION_DEFAULTS.DEFAULT_PAGE;
    }, z.number().int().positive().default(PAGINATION_DEFAULTS.DEFAULT_PAGE)),

    limit: z.preprocess((val) => {
      if (val === undefined || val === null || val === '') return defaultLimit;
      const num = Number(val);
      if (!Number.isInteger(num) || num <= 0) return defaultLimit;
      return Math.min(num, maxLimit);
    }, z.number().int().positive().max(maxLimit).default(defaultLimit)),
  });
}

/** Schéma standard de pagination prêt à l'emploi. */
export const paginationParamsSchema = createPaginationSchema();

export type PaginationParamsInput = z.input<typeof paginationParamsSchema>;
export type PaginationParamsOutput = z.output<typeof paginationParamsSchema>;

/** Schéma standard de recherche, tri et pagination combinés. */
export const searchParamsSchema = z.object({
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type SearchParamsInput = z.input<typeof searchParamsSchema>;
export type SearchParamsOutput = z.output<typeof searchParamsSchema>;
