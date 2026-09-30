---
name: rashwright-storage
description: Guide et conventions pour le stockage clé/valeur universel Rashwright (Web, Mobile, Node.js). Utiliser pour choisir, configurer et implémenter des drivers de persistance (Memory, LocalStorage, MMKV, SecureStore, SQLite).
---

# Rashwright Storage Architecture & Conventions

Le module `@rashwright/storage` unifie l'accès à la persistance locale à travers une interface standard `IStorageDriver` et un gestionnaire de clés avec préfixage `StorageManager`.

## 1. Interface Commune `IStorageDriver`

```ts
export interface IStorageDriver {
  get<T>(key: string): Promise<T | null> | T | null;
  set<T>(key: string, value: T): Promise<void> | void;
  remove(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
  has(key: string): Promise<boolean> | boolean;
}
```

---

## 2. Matrice de Sélection des Drivers

| Environnement | Driver Recommandé | Cas d'Usage |
| :--- | :--- | :--- |
| **Web Browser** | `LocalStorageDriver` | Préférences utilisateur, thèmes, filtres. |
| **Web Browser** | `SessionStorageDriver` | Données temporaires valides pour l'onglet actif. |
| **Mobile (React Native)** | `MMKVDriver` | Haute performance synchrone pour les données fréquentes. |
| **Mobile (React Native)** | `SecureStorageDriver` | Jetons d'authentification, clés de chiffrement (Keychain/Keystore). |
| **Mobile / Hybride** | `SQLiteDriver` | Projets utilisant SQLite (Expo SQLite, Drizzle ORM, better-sqlite3). |
| **Node.js / Tests / SSR** | `MemoryDriver` | Tests unitaires, mocks, isolation totale. |

---

## 3. Utilisation de `SQLiteDriver`

Pour les projets nécessitant SQLite pour le stockage persistant :

### Avec Expo SQLite (React Native)
```ts
import * as SQLite from 'expo-sqlite';
import { SQLiteDriver, createExpoSQLiteAdapter, createStorage } from '@rashwright/storage';

const db = await SQLite.openDatabaseAsync('app.db');

export const storage = createStorage({
  prefix: 'app_',
  driver: new SQLiteDriver(createExpoSQLiteAdapter(db), {
    tableName: 'kv_store',
  }),
});

await storage.set('user_profile', { id: '123', name: 'Aziz' });
const profile = await storage.get<{ name: string }>('user_profile');
```

Le driver exécute automatiquement la migration `CREATE TABLE IF NOT EXISTS kv_store` lors du premier accès.

---

## 4. Préfixage des Clés

Toujours utiliser `createStorage({ prefix: 'nom_projet_' })` pour éviter les collisions entre micro-applications ou sessions partagées.
