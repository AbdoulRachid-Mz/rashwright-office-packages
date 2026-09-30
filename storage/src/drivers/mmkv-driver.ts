/**
 * @rashwright/storage — drivers/mmkv-driver.ts
 *
 * Driver haute performance pour React Native / Expo via MMKV.
 * Accepte une instance MMKV injectée pour une compatibilité totale sans couplage natif forcé.
 */

import type { IStorageDriver } from '../types.js';

export interface MMKVLike {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  clearAll(): void;
  contains(key: string): boolean;
}

export class MMKVDriver implements IStorageDriver {
  constructor(private readonly mmkv: MMKVLike) {}

  get<T>(key: string): T | null {
    const raw = this.mmkv.getString(key);
    if (raw === undefined || raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  set<T>(key: string, value: T): void {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    this.mmkv.set(key, serialized);
  }

  remove(key: string): void {
    this.mmkv.delete(key);
  }

  clear(): void {
    this.mmkv.clearAll();
  }

  has(key: string): boolean {
    return this.mmkv.contains(key);
  }
}
