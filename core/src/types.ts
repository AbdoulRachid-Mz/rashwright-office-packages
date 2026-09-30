/**
 * @rashwright/core — types.ts
 *
 * Primitives de types TypeScript génériques partagées
 * entre tous les projets et packages Rashwright.
 */

// ---------------------------------------------------------------------------
// Identifiants
// ---------------------------------------------------------------------------

/** Identifiant générique (string) — UUID, CUID, etc. */
export type ID = string

/** Identifiant numérique — pour les schémas SQL avec autoincrement. */
export type NumericID = number

// ---------------------------------------------------------------------------
// Utilitaires de nullabilité
// ---------------------------------------------------------------------------

/** T | null */
export type Nullable<T> = T | null

/** T | undefined */
export type Optional<T> = T | undefined

/** T | null | undefined */
export type Maybe<T> = T | null | undefined

// ---------------------------------------------------------------------------
// Utilitaires d'objets
// ---------------------------------------------------------------------------

/** Rend toutes les propriétés d'un objet obligatoires en profondeur. */
export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K]
}

/** Rend toutes les propriétés d'un objet optionnelles en profondeur. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/** Extrait les clés d'un objet dont la valeur est du type V. */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/** Crée un type Readonly en profondeur. */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

// ---------------------------------------------------------------------------
// Utilitaires de fonctions
// ---------------------------------------------------------------------------

/** Fonction de rappel asynchrone générique. */
export type AsyncFn<T = void> = () => Promise<T>

/** Callback de progression (0–100). */
export type ProgressCallback = (progress: number) => void

// ---------------------------------------------------------------------------
// Timestamps standards
// ---------------------------------------------------------------------------

/** Objet avec des champs de date ISO standard (créé et mis à jour). */
export interface Timestamps {
  createdAt: string | Date
  updatedAt: string | Date
}

/** Extension avec date de suppression logique (soft delete). */
export interface SoftDeletable extends Timestamps {
  deletedAt: Nullable<string | Date>
}

// ---------------------------------------------------------------------------
// Tri et filtres
// ---------------------------------------------------------------------------

export type SortOrder = 'asc' | 'desc'

export interface SortParams<T extends string = string> {
  sortBy?: T
  sortOrder?: SortOrder
}
