/**
 * @rashwright/storage
 *
 * Barrel d'export principal pour le système de stockage universel.
 */

// Types & Contrats
export type {
  IStorageDriver,
  StorageOptions,
} from './types.js';

// Gestionnaire principal
export {
  StorageManager,
  createStorage,
} from './storage-manager.js';

// Drivers
export { MemoryDriver } from './drivers/memory-driver.js';
export { LocalStorageDriver } from './drivers/local-storage-driver.js';
export { SessionStorageDriver } from './drivers/session-storage-driver.js';
export { MMKVDriver, type MMKVLike } from './drivers/mmkv-driver.js';
export { SecureStorageDriver, type SecureStoreLike } from './drivers/secure-storage-driver.js';
export {
  SQLiteDriver,
  createExpoSQLiteAdapter,
  type SQLiteDatabaseAdapter,
  type SQLiteDriverOptions,
} from './drivers/sqlite-driver.js';
