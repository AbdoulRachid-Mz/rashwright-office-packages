/**
 * @rashwright/api — server/responses.ts
 *
 * Helpers universels de réponses HTTP conformes au standard ApiResponse de @rashwright/core.
 * Utilisable dans Next.js App Router, Bun HTTP, Remix, ou tout runtime supportant le Web Standard Response.
 */

import {
  apiSuccess,
  apiFailure,
  AppError,
  ErrorCode,
  type ApiResponse,
  type ApiMeta,
} from '@rashwright/core';

/**
 * Retourne une réponse HTTP 200 OK avec le payload normalisé.
 */
export function success<T>(
  data: T,
  message?: string,
  meta?: ApiMeta,
  init?: ResponseInit,
): Response {
  const payload = apiSuccess(data, message, meta);
  return Response.json(payload, { status: 200, ...init });
}

/**
 * Retourne une réponse HTTP 201 Created.
 */
export function created<T>(
  data: T,
  message = 'Ressource créée avec succès',
  meta?: ApiMeta,
  init?: ResponseInit,
): Response {
  const payload = apiSuccess(data, message, meta);
  return Response.json(payload, { status: 201, ...init });
}

/**
 * Retourne une réponse HTTP 200 Updated.
 */
export function updated<T>(
  data: T,
  message = 'Ressource mise à jour avec succès',
  meta?: ApiMeta,
  init?: ResponseInit,
): Response {
  const payload = apiSuccess(data, message, meta);
  return Response.json(payload, { status: 200, ...init });
}

/**
 * Retourne une réponse HTTP 200 Deleted.
 */
export function deleted(
  message = 'Ressource supprimée avec succès',
  init?: ResponseInit,
): Response {
  const payload = apiSuccess({ deleted: true }, message);
  return Response.json(payload, { status: 200, ...init });
}

/**
 * Retourne une réponse HTTP 400 Bad Request.
 */
export function badRequest(
  message = 'Requête invalide',
  details?: unknown,
  init?: ResponseInit,
): Response {
  const payload = apiFailure(ErrorCode.VALIDATION_ERROR, message, details);
  return Response.json(payload, { status: 400, ...init });
}

/**
 * Retourne une réponse HTTP 401 Unauthorized.
 */
export function unauthorized(
  message = 'Non autorisé',
  init?: ResponseInit,
): Response {
  const payload = apiFailure(ErrorCode.UNAUTHORIZED, message);
  return Response.json(payload, { status: 401, ...init });
}

/**
 * Retourne une réponse HTTP 403 Forbidden.
 */
export function forbidden(
  message = 'Accès interdit',
  init?: ResponseInit,
): Response {
  const payload = apiFailure(ErrorCode.FORBIDDEN, message);
  return Response.json(payload, { status: 403, ...init });
}

/**
 * Retourne une réponse HTTP 404 Not Found.
 */
export function notFound(
  message = 'Ressource introuvable',
  init?: ResponseInit,
): Response {
  const payload = apiFailure(ErrorCode.NOT_FOUND, message);
  return Response.json(payload, { status: 404, ...init });
}

/**
 * Retourne une réponse HTTP 409 Conflict.
 */
export function conflict(
  message = 'Conflit de ressource',
  details?: unknown,
  init?: ResponseInit,
): Response {
  const payload = apiFailure(ErrorCode.CONFLICT, message, details);
  return Response.json(payload, { status: 409, ...init });
}

/**
 * Gestionnaire d'erreur serveur universel :
 * Mappe les instances AppError vers leur status code et code d'erreur respectif,
 * et masque les erreurs non opérationnelles en production.
 */
export function handleError(
  error: unknown,
  init?: ResponseInit,
): Response {
  if (error instanceof AppError) {
    const payload = error.toApiFailure();
    return Response.json(payload, { status: error.statusCode, ...init });
  }

  const isProd = typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production';
  const message = isProd
    ? 'Une erreur interne est survenue sur le serveur'
    : error instanceof Error
      ? error.message
      : String(error);

  const payload = apiFailure(ErrorCode.INTERNAL_ERROR, message);
  return Response.json(payload, { status: 500, ...init });
}
