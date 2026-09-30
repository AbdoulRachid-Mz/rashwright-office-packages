/**
 * @rashwright/api — client/error-extractor.ts
 *
 * Normalisation des erreurs HTTP Axios vers la hiérarchie AppError de @rashwright/core.
 */

import { AxiosError } from 'axios';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ErrorCode,
  type ApiResponse,
} from '@rashwright/core';

/**
 * Extrait une instance d'AppError typée depuis une erreur réseau ou HTTP Axios.
 */
export function extractApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const raw = error.response?.data as Record<string, unknown> | undefined;

    const errorObj = raw && typeof raw['error'] === 'object' && raw['error'] !== null
      ? (raw['error'] as Record<string, unknown>)
      : undefined;

    const metaObj = raw && typeof raw['meta'] === 'object' && raw['meta'] !== null
      ? (raw['meta'] as Record<string, unknown>)
      : undefined;

    // Récupérer le message envoyé par le serveur ou générer un fallback
    const serverMessage =
      typeof raw?.['message'] === 'string'
        ? (raw['message'] as string)
        : typeof errorObj?.['message'] === 'string'
          ? (errorObj['message'] as string)
          : undefined;

    const serverCode =
      typeof errorObj?.['code'] === 'string'
        ? (errorObj['code'] as string)
        : typeof metaObj?.['code'] === 'string'
          ? (metaObj['code'] as string)
          : error.code ?? ErrorCode.UNKNOWN_ERROR;

    const serverDetails = errorObj?.['details'] ?? metaObj?.['details'];

    if (error.code === 'ERR_NETWORK') {
      return new AppError('Erreur réseau. Vérifiez votre connexion Internet.', 0, ErrorCode.NETWORK_ERROR);
    }

    if (error.code === 'ECONNABORTED') {
      return new AppError('La requête a expiré. Veuillez réessayer.', 408, ErrorCode.INTERNAL_ERROR);
    }

    switch (status) {
      case 400:
        return new ValidationError(serverMessage ?? 'Requête invalide', serverDetails);
      case 401:
        return new UnauthorizedError(serverMessage ?? 'Session expirée ou non autorisée');
      case 403:
        return new ForbiddenError(serverMessage ?? 'Accès refusé');
      case 404:
        return new NotFoundError(serverMessage ?? 'Ressource introuvable');
      case 409:
        return new ConflictError(serverMessage ?? 'Conflit de ressource', serverDetails);
      case 422:
        return new ValidationError(serverMessage ?? 'Données non traitables', serverDetails);
      default:
        return new AppError(
          serverMessage ?? error.message ?? 'Une erreur inattendue est survenue.',
          status || 500,
          serverCode,
          serverDetails,
        );
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  return new AppError(message, 500, ErrorCode.INTERNAL_ERROR);
}
