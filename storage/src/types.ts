/**
 * @rashwright/storage — types.ts
 *
 * Contrats fondamentaux du système de stockage unifié Rashwright.
 */

export interface IStorageDriver {
  /** Récupère et désérialise une valeur stockée. */
  get<T>(key: string): Promise<T | null> | T | null;

  /** Enregistre une valeur sérialisée. */
  set<T>(key: string, value: T): Promise<void> | void;

  /** Supprime une clé spécifique. */
  remove(key: string): Promise<void> | void;

  /** Vide l'ensemble du stockage géré par ce driver. */
  clear(): Promise<void> | void;

  /** Vérifie l'existence d'une clé. */
  has(key: string): Promise<boolean> | boolean;
}

export interface StorageOptions {
  /** Préfixe optionnel appliqué à toutes les clés (ex : "immo360_"). */
  prefix?: string;
  /** Driver de stockage à utiliser. */
  driver: IStorageDriver;
}
