/**
 * @rashwright/api — client/interceptors.ts
 *
 * Intercepteurs Axios pour l'injection du jeton d'authentification et le logging structuré.
 */

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { createLogger } from '@rashwright/logger';
import type { ApiClientConfig, ApiRequestOptions } from './types.js';

export function setupInterceptors(client: AxiosInstance, config: ApiClientConfig): void {
  const logger = createLogger({
    prefix: config.logPrefix ?? 'API',
    level: config.enableLogging ? 'debug' : 'warn',
  });

  // Intercepteur de requête : injection de Bearer Token & logging
  client.interceptors.request.use(async (requestConfig: InternalAxiosRequestConfig) => {
    const customConfig = requestConfig as ApiRequestOptions;

    if (!customConfig.skipAuth && config.getToken) {
      try {
        const token = await config.getToken();
        if (token) {
          requestConfig.headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (err) {
        logger.warn('Impossible de récupérer le jeton d’authentification pour la requête', {
          url: requestConfig.url,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (config.enableLogging) {
      logger.debug(`[${requestConfig.method?.toUpperCase()}] ${requestConfig.url}`, {
        params: requestConfig.params,
      });
    }

    return requestConfig;
  });

  // Intercepteur de réponse : logging des succès & erreurs
  client.interceptors.response.use(
    (response) => {
      if (config.enableLogging) {
        logger.debug(`[${response.status}] ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      if (config.enableLogging) {
        logger.warn(`Erreur [${error.response?.status ?? 'NET'}] ${error.config?.url}`, {
          message: error.message,
        });
      }
      return Promise.reject(error);
    },
  );
}
