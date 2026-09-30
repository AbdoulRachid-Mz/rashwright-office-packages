/**
 * @rashwright/storage — drivers/sqlite-driver.ts
 *
 * Driver de persistance structuré pour les environnements avec SQLite
 * (Expo SQLite, better-sqlite3, bun:sqlite, Drizzle).
 *
 * Utilise une table dédiée (par défaut "rashwright_kv_store") pour stocker
 * des paires clé/valeur typées et indexées.
 */

import type { IStorageDriver } from '../types.js';

export interface SQLiteDatabaseAdapter {
  /** Exécute une instruction SQL (ex: CREATE TABLE). */
  exec(sql: string): Promise<void> | void;
  /** Récupère une ligne SQL. */
  get<T = { value: string }>(sql: string, params?: unknown[]): Promise<T | null | undefined> | T | null | undefined;
  /** Exécute une requête d'insertion, mise à jour ou suppression. */
  run(sql: string, params?: unknown[]): Promise<unknown> | unknown;
}

export interface SQLiteDriverOptions {
  /** Nom de la table de stockage clé/valeur. Par défaut : "rashwright_kv_store". */
  tableName?: string;
}

export class SQLiteDriver implements IStorageDriver {
  private readonly tableName: string;
  private isInitialized = false;

  constructor(
    private readonly db: SQLiteDatabaseAdapter,
    options: SQLiteDriverOptions = {},
  ) {
    this.tableName = options.tableName ?? 'rashwright_kv_store';
  }

  /**
   * Initialise automatiquement la table de stockage si elle n'existe pas encore.
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    this.isInitialized = true;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();

    const row = await this.db.get<{ value: string }>(
      `SELECT value FROM ${this.tableName} WHERE key = ? LIMIT 1`,
      [key],
    );

    if (!row || row.value === undefined || row.value === null) return null;

    try {
      return JSON.parse(row.value) as T;
    } catch {
      return row.value as unknown as T;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.init();

    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const now = Date.now();

    await this.db.run(
      `INSERT OR REPLACE INTO ${this.tableName} (key, value, updated_at) VALUES (?, ?, ?)`,
      [key, serialized, now],
    );
  }

  async remove(key: string): Promise<void> {
    await this.init();

    await this.db.run(
      `DELETE FROM ${this.tableName} WHERE key = ?`,
      [key],
    );
  }

  async clear(): Promise<void> {
    await this.init();

    await this.db.run(`DELETE FROM ${this.tableName}`);
  }

  async has(key: string): Promise<boolean> {
    await this.init();

    const row = await this.db.get<{ key: string }>(
      `SELECT key FROM ${this.tableName} WHERE key = ? LIMIT 1`,
      [key],
    );

    return row !== null && row !== undefined;
  }
}

/**
 * Crée un adaptateur SQLite pour Expo SQLite (expo-sqlite v14+ / v15+).
 */
export function createExpoSQLiteAdapter(expoDb: {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
  runAsync(sql: string, params?: unknown[]): Promise<unknown>;
}): SQLiteDatabaseAdapter {
  return {
    exec: (sql) => expoDb.execAsync(sql),
    get: (sql, params) => expoDb.getFirstAsync(sql, params),
    run: (sql, params) => expoDb.runAsync(sql, params),
  };
}
