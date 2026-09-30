/**
 * @rashwright/storage — drivers/session-storage-driver.ts
 *
 * Driver de stockage éphémère à la session du navigateur (window.sessionStorage).
 */

import type { IStorageDriver } from '../types.js';
import { MemoryDriver } from './memory-driver.js';

export class SessionStorageDriver implements IStorageDriver {
  private readonly fallback = new MemoryDriver();

  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  }

  get<T>(key: string): T | null {
    if (!this.isAvailable()) return this.fallback.get<T>(key);
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch {
      return this.fallback.get<T>(key);
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isAvailable()) {
      this.fallback.set(key, value);
      return;
    }
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      window.sessionStorage.setItem(key, serialized);
    } catch {
      this.fallback.set(key, value);
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) {
      this.fallback.remove(key);
      return;
    }
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      this.fallback.remove(key);
    }
  }

  clear(): void {
    if (!this.isAvailable()) {
      this.fallback.clear();
      return;
    }
    try {
      window.sessionStorage.clear();
    } catch {
      this.fallback.clear();
    }
  }

  has(key: string): boolean {
    if (!this.isAvailable()) return this.fallback.has(key);
    try {
      return window.sessionStorage.getItem(key) !== null;
    } catch {
      return this.fallback.has(key);
    }
  }
}
