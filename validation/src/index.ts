/**
 * @rashwright/validation
 *
 * Barrel d'export principal pour le package de validation.
 */

// Schémas de pagination
export {
  createPaginationSchema,
  paginationParamsSchema,
  searchParamsSchema,
  type PaginationSchemaOptions,
  type PaginationParamsInput,
  type PaginationParamsOutput,
  type SearchParamsInput,
  type SearchParamsOutput,
} from './schemas/pagination.js';

// Schémas d'identifiants
export {
  uuidSchema,
  cuidSchema,
  idSchema,
  numericIdSchema,
  createIdSchema,
} from './schemas/id.js';

// Schémas de fichiers et uploads
export {
  createFileMetadataSchema,
  mediaRecordSchema,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  type FileValidationOptions,
  type MediaRecordInput,
} from './schemas/upload.js';

// Helpers et intégration ValidationError
export {
  formatZodIssues,
  toValidationError,
  validateOrThrow,
  safeValidate,
  type FormattedZodIssue,
} from './helpers.js';

// Re-export Zod pour faciliter l'usage sans installer deux versions différentes
export { z } from 'zod';
