/**
 * @rashwright/storage — drivers/secure-storage-driver.ts
 *
 * Driver chiffré pour les données sensibles sur Mobile (tokens, clés privées).
 * Compatible avec expo-secure-store.
 */

import type { IStorageDriver } from '../types.js';

export interface SecureStoreLike {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export class SecureStorageDriver implements IStorageDriver {
  constructor(private readonly secureStore: SecureStoreLike) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.secureStore.getItemAsync(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.secureStore.setItemAsync(key, serialized);
  }

  async remove(key: string): Promise<void> {
    await this.secureStore.deleteItemAsync(key);
  }

  async clear(): Promise<void> {
    // Note: SecureStore sur iOS/Android ne fournit pas de méthode clear globale pour des raisons de sécurité de trousseau.
    // Cette méthode est no-op sécurisée si non supportée nativement.
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }
}
