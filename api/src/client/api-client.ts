/**
 * @rashwright/api — client/api-client.ts
 *
 * Factory de client HTTP unifié pour Web et Mobile.
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { ApiResponse } from '@rashwright/core';
import type { ApiClientConfig, ApiRequestOptions } from './types.js';
import { setupInterceptors } from './interceptors.js';
import { extractApiError } from './error-extractor.js';

export interface ExtendedApiClient {
  /** L'instance Axios sous-jacente */
  readonly raw: AxiosInstance;

  /** GET avec désérialisation directe ou récupération de l'enveloppe */
  get<T>(url: string, options?: ApiRequestOptions): Promise<T>;
  
  /** POST */
  post<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;

  /** PUT */
  put<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;

  /** PATCH */
  patch<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;

  /** DELETE */
  delete<T>(url: string, options?: ApiRequestOptions): Promise<T>;
}

function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T> | T>): T {
  const data = response.data;
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return (data as ApiResponse<T> & { data: T }).data;
  }
  return data as T;
}

/**
 * Crée une instance de client API configurée avec intercepteurs et normalisation des erreurs.
 */
export function createApiClient(config: ApiClientConfig): ExtendedApiClient {
  const isDev = config.isDev ?? (typeof process !== 'undefined' && process.env?.['NODE_ENV'] !== 'production');
  const baseURL = (isDev && config.devBaseURL) ? config.devBaseURL : config.baseURL;

  const instance = axios.create({
    baseURL,
    timeout: config.timeout ?? 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
    },
  });

  setupInterceptors(instance, config);

  async function execute<T>(fn: () => Promise<AxiosResponse<ApiResponse<T> | T>>): Promise<T> {
    try {
      const res = await fn();
      return unwrapResponse(res);
    } catch (err) {
      throw extractApiError(err);
    }
  }

  return {
    raw: instance,
    get: (url, opts) => execute(() => instance.get(url, opts)),
    post: (url, data, opts) => execute(() => instance.post(url, data, opts)),
    put: (url, data, opts) => execute(() => instance.put(url, data, opts)),
    patch: (url, data, opts) => execute(() => instance.patch(url, data, opts)),
    delete: (url, opts) => execute(() => instance.delete(url, opts)),
  };
}
