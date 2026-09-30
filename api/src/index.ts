/**
 * @rashwright/api
 *
 * Barrel d'export principal du package API.
 */

// Client API
export {
  createApiClient,
  type ExtendedApiClient,
} from './client/api-client.js';

export {
  extractApiError,
} from './client/error-extractor.js';

export {
  type ApiClientConfig,
  type ApiRequestOptions,
  type TokenProvider,
} from './client/types.js';

// Helpers Serveur (Route Handlers)
export {
  success,
  created,
  updated,
  deleted,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  handleError,
} from './server/responses.js';
