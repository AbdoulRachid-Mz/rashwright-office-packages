/**
 * @rashwright/storage — storage-manager.ts
 *
 * Gestionnaire de stockage unifié avec gestion automatique des préfixes de clés.
 */

import type { IStorageDriver, StorageOptions } from './types.js';

export class StorageManager {
  private readonly prefix: string;
  private readonly driver: IStorageDriver;

  constructor(options: StorageOptions) {
    this.prefix = options.prefix ?? '';
    this.driver = options.driver;
  }

  private resolveKey(key: string): string {
    return this.prefix ? `${this.prefix}${key}` : key;
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.driver.get<T>(this.resolveKey(key));
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.driver.set(this.resolveKey(key), value);
  }

  async remove(key: string): Promise<void> {
    await this.driver.remove(this.resolveKey(key));
  }

  async clear(): Promise<void> {
    await this.driver.clear();
  }

  async has(key: string): Promise<boolean> {
    return await this.driver.has(this.resolveKey(key));
  }
}

/**
 * Factory pratique pour instancier un gestionnaire de stockage.
 *
 * @example
 * const storage = createStorage({
 *   prefix: 'immo360_',
 *   driver: new LocalStorageDriver(),
 * });
 */
export function createStorage(options: StorageOptions): StorageManager {
  return new StorageManager(options);
}
