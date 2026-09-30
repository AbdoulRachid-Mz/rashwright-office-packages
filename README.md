# 🚀 Écosystème Monorepo Rashwright

Bienvenue dans le cœur d'ingénierie et d'uniformisation de l'écosystème **Rashwright**. Ce monorepo propulsé par **[Bun](https://bun.sh)** regroupe l'ensemble des modules partagés, des contrats d'API universels, des primitives de stockage, des moteurs d'upload découplés, des composants d'interface (Web et Mobile) ainsi que les compétences (Skills) pour agents IA et développeurs.

---

## 🏛️ Architecture & Organisation des Packages

```
packages/
├── package.json              # Racine du workspace Bun
├── bun.lock                  # Lockfile unifié du monorepo
├── tsconfig.base.json        # Configuration TypeScript stricte partagée
├── README.md                 # Ce guide global
│
├── core/                     # @rashwright/core       (Zero dépendance runtime)
├── utils/                    # @rashwright/utils      (Zero dépendance runtime)
├── logger/                   # @rashwright/logger     (Logger universel structuré)
├── validation/               # @rashwright/validation (Schémas Zod & adaptateur d'erreurs)
├── api/                      # @rashwright/api        (Client Axios + Helpers Route Handlers)
├── storage/                  # @rashwright/storage    (Abstraction KV : LocalStorage, MMKV, SQLite)
├── upload/                   # @rashwright/upload     (Moteur d'upload agnostique & providers)
├── ui/                       # @rashwright/ui         (Composants UI Web & Mobile)
│   ├── web/                  # @rashwright/ui-web     (shadcn/ui, Tailwind v4, Uploads avancés)
│   └── mobile/               # @rashwright/ui-mobile   (Liquid Glass UI, NativeWind, Expo)
│
├── skills/                   # Bibliothèque de compétences pour Agents IA & Développeurs
└── prompts/                  # Spécifications d'architecture de référence
```

---

## 📦 Matrice des Packages

| Package | Version | Description & Rôle Clé |
| :--- | :---: | :--- |
| [`@rashwright/core`](./core) | `0.1.0` | **Primitives fondamentales** : Pattern `Result<T, E>`, contrat universel de réponse `ApiResponse<T>`, hiérarchie d'erreurs `AppError` avec codes stables, helpers de pagination. |
| [`@rashwright/utils`](./utils) | `0.1.0` | **Utilitaires purs** : Formatage d'octets (`formatBytes`, `mbToBytes`), monnaies avec support d'Afrique de l'Ouest (`formatCurrency` XOF, XAF, EUR, USD), dates, `slugify`, `math`, collections. |
| [`@rashwright/logger`](./logger) | `0.1.0` | **Logger universel** : Sortie lisible et colorée en dev Node, JSON compact en prod, consoles enrichies pour navigateurs et format optimisé pour React Native. |
| [`@rashwright/validation`](./validation) | `0.1.0` | **Validation Zod** : Schémas réutilisables (pagination, ID UUID/CUID, fichiers d'upload) et convertisseurs automatiques vers `ValidationError`. |
| [`@rashwright/api`](./api) | `0.1.0` | **Couche HTTP unifiée** : Client Axios configuré avec injection dynamique de jeton d'authentification (Bearer), normalisation d'erreurs réseau, et helpers serveur (`success`, `created`, `badRequest`, `handleError`). |
| [`@rashwright/storage`](./storage) | `0.1.0` | **Stockage Clé-Valeur** : Drivers interchangeables : `MemoryDriver`, `LocalStorageDriver`, `SessionStorageDriver`, `MMKVDriver`, `SecureStorageDriver` et **`SQLiteDriver`** (Expo SQLite / better-sqlite3 / Bun). |
| [`@rashwright/upload`](./upload) | `0.1.0` | **Moteur d'Upload Agnostique** : `CloudinaryProvider` (sans aucune clé en dur), `MockUploadProvider` pour les tests/Storybooks, `UploadManager` avec concurrence et suivi d'état. |
| [`@rashwright/ui`](./ui) | `0.1.0` | **Primitives & Composants UI** :<br>• `web` : shadcn/ui complet + uploads avancés découplés (`AdvancedUpload`, `AdvancedMultiUpload`, `AdvancedVideoUpload`).<br>• `mobile` : Liquid Glass UI, physique élastique Reanimated, 35+ composants natifs. |

---

## 🧠 Dossier des Skills (`packages/skills/`)

Le dossier `packages/skills/` sert de base de connaissances exécutable pour les agents d'intelligence artificielle et les développeurs :

- **`rashwright-architecture`** : Guide normatif des conventions de code, gestion d'erreurs, enveloppes API et structure de projet.
- **`rashwright-upload`** : Guide complet de l'upload multi-plateforme et gestion de médias.
- **`rashwright-storage`** : Spécifications des drivers de persistance locale, y compris l'utilisation de SQLite (`SQLiteDriver`).
- **`liquid-glass-ui`** : Spécifications et implémentation du système visuel Liquid Glass pour applications mobiles.
- **`expo-*`** : Primitives Expo, SwiftUI/Compose et NativeWind.

---

## 🛠️ Commandes & Scripts

Toutes les commandes s'exécutent depuis le dossier `packages/` avec **Bun** :

```bash
# Installation des dépendances du monorepo
bun install

# Compilation de l'ensemble des packages (build JS + génération des .d.ts)
bun run build

# Vérification stricte des types TypeScript sur tous les packages
bun run check-types

# Exécution des tests unitaires
bun run test

# Nettoyage des dossiers dist et caches
bun run clean
```

Pour agir sur un package spécifique :

```bash
bun run --filter @rashwright/core build
bun run --filter @rashwright/storage test
```

---

## 🔒 Principes d'Ingénierie & Sécurité

1. **Zéro secret codé en dur** :
   Aucun preset Cloudinary, clé d'API ou jeton d'authentification ne doit être codé en dur. Les composants et providers s'initialisent via props ou variables d'environnement (`NEXT_PUBLIC_*` ou `EXPO_PUBLIC_*`).
2. **Gestion explicite des erreurs (Railway-Oriented)** :
   Préférer le retour d'un `Result<T, E>` plutôt que de lancer des exceptions non interceptées dans les fonctions métier.
3. **Contrat d'API unique (`ApiResponse<T>`)** :
   Chaque endpoint API renvoie l'enveloppe `{ success: true, data: ... }` ou `{ success: false, error: ... }`.
4. **Isolation absolue des projets en production** :
   Ce monorepo centralise les bibliothèques et futurs modules sans toucher ni modifier les applications de production existantes (`immo360-web`, `immo360-mobile`, `rashwright-identity`).
# rashwright-office-packages
