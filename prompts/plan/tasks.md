# Tâches & Suivi de Progression de l'Écosystème Rashwright

> **Légende :**
> - `[ ]` Tâche en attente
> - `[/]` Tâche en cours
> - `[x]` Tâche terminée

---

## 🛠️ Phase 0 : Configuration Racine & Workspace Bun
- [x] Créer le fichier `package.json` à la racine configuré pour les workspaces Bun (`workspaces: ["packages/*"]`).
- [x] Configurer le `tsconfig.base.json` partagé pour tous les packages TypeScript.
- [x] Créer les scripts racine pour exécuter les builds, types checks et tests avec Bun (`bun run build`, `bun run check-types`).

---

## 🥇 Phase 1 : Fondations Fondamentales (Zero Dépendance)

### 1.1 `@rashwright/core`
- [x] Initialiser `packages/core/package.json` et `tsconfig.json`.
- [x] Implémenter `src/result.ts` (`Result<T, E>`, `ok`, `err`, `isOk`, `isErr`).
- [x] Implémenter `src/response.ts` (`ApiResponse<T>`, `ApiSuccess<T>`, `ApiFailure`, `ApiMeta`).
- [x] Implémenter `src/errors.ts` (`AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`).
- [x] Implémenter `src/pagination.ts` (`PaginationParams`, `PaginationMeta`, `buildPaginationMeta`).
- [x] Implémenter `src/types.ts` (`Nullable`, `AsyncResult`, `ID`, etc.).
- [x] Créer le barrel d'export `src/index.ts` et valider la compilation.

### 1.2 `@rashwright/utils`
- [x] Initialiser `packages/utils/package.json` et `tsconfig.json`.
- [x] Implémenter `src/format-bytes.ts` et `src/format-file-size.ts`.
- [x] Implémenter `src/format-currency.ts` (support XOF, EUR, USD).
- [x] Implémenter `src/slugify.ts`.
- [x] Implémenter `src/string.ts` (`truncate`, `capitalize`, `sanitize`).
- [x] Implémenter `src/math.ts` (`clamp`, `round`, `percentage`).
- [x] Implémenter `src/collections.ts` (`groupBy`, `unique`, `chunk`, `sortBy`).
- [x] Implémenter `src/url.ts` (`buildQueryString`, `parseQueryParams`).
- [x] Créer le barrel d'export `src/index.ts` et valider la compilation.

### 1.3 `@rashwright/logger`
- [x] Initialiser `packages/logger/package.json` et `tsconfig.json`.
- [x] Définir l'interface `ILogger` et les niveaux de logs (`debug`, `info`, `warn`, `error`).
- [x] Implémenter le formateur universel avec horodatage ISO et gestion des erreurs/métadonnées.
- [x] Configurer les adaptateurs d'environnement (Node / Web / React Native).
- [x] Créer le barrel d'export `src/index.ts` et valider la compilation.

---

## 🥈 Phase 2 : Validation & Couche API

### 2.1 `@rashwright/validation`
- [x] Initialiser `packages/validation/package.json` (avec dépendance `zod` et `@rashwright/core`).
- [x] Implémenter les schémas de pagination (`paginationParamsSchema`).
- [x] Implémenter les schémas d'identifiants (`idSchema`, `cuidSchema`, `uuidSchema`).
- [x] Implémenter les schémas de fichiers / upload (`fileUploadSchema`, types MIME, tailles max).
- [x] Implémenter l'adaptateur d'erreurs Zod vers `ValidationError`.
- [x] Créer le barrel d'export `src/index.ts` et valider la compilation.

### 2.2 `@rashwright/api`
- [x] Initialiser `packages/api/package.json` (avec dépendances `axios`, `@rashwright/core`, `@rashwright/logger`).
- [x] Implémenter `src/client/api-client.ts` (factory Axios unifiée avec timeout et headers configurables).
- [x] Implémenter `src/client/interceptors.ts` (injection dynamique de Bearer token).
- [x] Implémenter `src/client/error-extractor.ts` (transformation des erreurs HTTP en `ApiError`).
- [x] Implémenter `src/server/responses.ts` (helpers serveur Next.js : `success`, `created`, `badRequest`, `handleError`).
- [x] Créer le barrel d'export `src/index.ts` et valider la compilation.

---

## 🥉 Phase 3 : Moteur de Stockage & Upload

### 3.1 `@rashwright/storage`
- [x] Initialiser `packages/storage/package.json` et `tsconfig.json`.
- [x] Définir l'interface `IStorageDriver` (`get`, `set`, `remove`, `clear`, `has`).
- [x] Implémenter `src/drivers/memory-storage.ts`.
- [x] Implémenter `src/drivers/local-storage.ts` (Web).
- [x] Implémenter `src/drivers/session-storage.ts` (Web).
- [x] Implémenter `src/drivers/mmkv-storage.ts` (Mobile React Native).
- [x] Implémenter `src/drivers/secure-storage.ts` (Mobile SecureStore).
- [x] Implémenter `src/drivers/sqlite-storage.ts` (SQLite via Expo SQLite / better-sqlite3 / Drizzle).
- [x] Créer le barrel d'export `src/index.ts` et valider la compilation.

### 3.2 `@rashwright/upload`
- [x] Initialiser `packages/upload/package.json` et `tsconfig.json`.
- [x] Définir les types génériques (`UploadSource`, `UploadOptions`, `UploadResult`, `IUploadProvider`).
- [x] Implémenter `src/providers/cloudinary-provider.ts` (paramétrable via config injectée, sans clé codée en dur).
- [x] Implémenter `src/providers/mock-provider.ts` pour le dev et les tests.
- [x] Implémenter les utilitaires de compression d'image pour Web (Worker) et Mobile.
- [x] Créer le gestionnaire d'upload `src/upload-manager.ts` avec suivi d'état (`idle`, `compressing`, `uploading`, `completed`, `error`).
- [x] Créer le barrel d'export `src/index.ts` et valider la compilation.

---

## 🎖️ Phase 4 : Primitives UI & Standardisation

### 4.1 `@rashwright/ui` - Web
- [x] Vérifier et nettoyer l'arborescence copiée dans `packages/ui/web`.
- [x] Harmoniser le nommage des fichiers en strict `kebab-case`.
- [x] Découpler les composants d'upload (`advanced-upload.tsx`, `advanced-multi-upload.tsx`, `advanced-video-upload.tsx`) de Cloudinary en les branchant sur `@rashwright/upload`.
- [x] Remplacer les formats d'octets et helpers locaux par `@rashwright/utils`.
- [x] Établir le fichier d'export propre `packages/ui/web/index.tsx`.

### 4.2 `@rashwright/ui` - Mobile (Liquid Glass UI)
- [x] Vérifier et nettoyer l'arborescence copiée dans `packages/ui/mobile`.
- [x] Valider l'intégration complète des primitives Liquid Glass (`LiquidSurface`, `LiquidPressable`, `LiquidBorder`, `LiquidHighlight`, etc.).
- [x] Renommer et organiser les composants partagés et UI en conventions Rashwright.
- [x] Adapter les composants `upload-image.tsx` et `upload-video.tsx` pour consommer le service découplé et `@rashwright/upload`.
- [x] Établir le fichier d'export propre `packages/ui/mobile/index.ts`.

---

## 🏁 Phase 5 : Documentation, Skills & Vérification Finale
- [x] Documenter le guide d'utilisation de chaque package dans son `README.md`.
- [x] Centraliser les Skills Rashwright pour les agents IA et développeurs dans `.agents/skills`.
- [x] Valider le build complet du monorepo via `bun run build`.
- [x] Vérifier qu'aucune régression ou modification n'a touché `immo360-web`, `immo360-mobile` ou `rashwright-identity`.
