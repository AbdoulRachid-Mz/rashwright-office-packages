/**
 * @rashwright/storage — drivers/memory-driver.ts
 *
 * Driver de stockage en mémoire vive (Map).
 * Idéal pour les tests unitaires, le Server-Side Rendering (SSR) et les environnements éphémères.
 */

import type { IStorageDriver } from '../types.js';

export class MemoryDriver implements IStorageDriver {
  private readonly store = new Map<string, string>();

  get<T>(key: string): T | null {
    const raw = this.store.get(key);
    if (raw === undefined) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  set<T>(key: string, value: T): void {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    this.store.set(key, serialized);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}
