# @rashwright/storage

Abstraction Key-Value universelle pour Web et Mobile. Supporte les drivers Mémoire, LocalStorage, SessionStorage, MMKV, SecureStore et SQLite.

## Installation

```bash
bun add @rashwright/storage @rashwright/core
```

## Utilisation

```ts
import {
  createStorage,
  LocalStorageDriver,
  MemoryDriver,
  SQLiteDriver,
  MMKVDriver,
  SecureStorageDriver,
} from '@rashwright/storage';

// 1. Web LocalStorage avec préfixe de projet
const storage = createStorage({
  prefix: 'rashwright_',
  driver: new LocalStorageDriver(),
});

await storage.set('user_preferences', { theme: 'dark', lang: 'fr' });
const prefs = await storage.get<{ theme: string }>('user_preferences');
await storage.remove('user_preferences');

// 2. Mobile React Native via MMKV
// import { MMKV } from 'react-native-mmkv';
// const mmkv = new MMKV();
// const mobileStorage = createStorage({ driver: new MMKVDriver(mmkv) });

// 3. SQLite (Expo SQLite / better-sqlite3 / Drizzle)
// const sqliteStorage = createStorage({
//   driver: new SQLiteDriver(createExpoSQLiteAdapter(expoDb)),
// });
```
