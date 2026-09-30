/**
 * @rashwright/core
 *
 * Barrel d'export principal du package.
 * Toutes les primitives fondamentales de l'écosystème Rashwright.
 */

// Result pattern
export {
  ok,
  err,
  isOk,
  isErr,
  tryCatch,
  tryCatchAsync,
  type Ok,
  type Err,
  type Result,
} from './result.js'

// API response contracts
export {
  apiSuccess,
  apiFailure,
  isApiSuccess,
  isApiFailure,
  type ApiSuccess,
  type ApiFailure,
  type ApiResponse,
  type ApiMeta,
  type PaginatedResponse,
  type PaginationMeta,
} from './response.js'

// Error hierarchy
export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitedError,
  DatabaseError,
  UploadError,
  ErrorCode,
  isAppError,
  isOperationalError,
  type ErrorCode as ErrorCodeType,
} from './errors.js'

// Pagination
export {
  parsePaginationParams,
  buildPaginationMeta,
  paginateArray,
  PAGINATION_DEFAULTS,
  type PaginationParams,
  type ParsedPagination,
} from './pagination.js'

// Generic types
export {
  type ID,
  type NumericID,
  type Nullable,
  type Optional,
  type Maybe,
  type DeepRequired,
  type DeepPartial,
  type DeepReadonly,
  type KeysOfType,
  type AsyncFn,
  type ProgressCallback,
  type Timestamps,
  type SoftDeletable,
  type SortOrder,
  type SortParams,
} from './types.js'
