/**
 * @rashwright/api — client/types.ts
 *
 * Types de configuration pour le client API unifié.
 */

import type { AxiosRequestConfig } from 'axios';

export type TokenProvider = () => Promise<string | null> | string | null;

export interface ApiClientConfig {
  /** URL de base pour les requêtes en production. */
  baseURL: string;
  /** URL de base optionnelle en développement. */
  devBaseURL?: string;
  /** Activer l'URL de dev. Par défaut : process.env.NODE_ENV !== 'production'. */
  isDev?: boolean;
  /** Timeout en millisecondes. Par défaut : 15 000 ms. */
  timeout?: number;
  /** Headers HTTP par défaut. */
  headers?: Record<string, string>;
  /** Fonction asynchrone fournissant le Bearer Token (Firebase Auth, BetterAuth, JWT...). */
  getToken?: TokenProvider;
  /** Préfixe des logs API. Par défaut : "API". */
  logPrefix?: string;
  /** Activer les logs de requête/réponse. Par défaut : true en dev. */
  enableLogging?: boolean;
}

export interface ApiRequestOptions extends AxiosRequestConfig {
  /** Ignorer l'injection du token pour cette requête spécifique. */
  skipAuth?: boolean;
}
