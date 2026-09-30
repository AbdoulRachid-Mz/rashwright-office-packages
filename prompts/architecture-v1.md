# Rashwright Architecture Specification v1

**Version:** 1.0
**Statut:** Fondations / Standard de développement
**Projet:** Rashwright
**Objectif:** Standardiser l'architecture, les conventions, les outils réutilisables et les pratiques de développement des futurs projets Web, Mobile et API.

---

# 1. Vision

Rashwright est le socle technique commun utilisé pour concevoir et développer les projets Web, Mobile et Backend.

Rashwright n'est pas uniquement une collection de packages.

Il regroupe quatre éléments complémentaires :

1. **Conventions** — comment les projets sont nommés et organisés.
2. **Architectures** — comment les différentes couches d'une application communiquent.
3. **Packages** — code générique réellement réutilisable.
4. **Skills** — règles et instructions destinées aux développeurs et aux agents IA.

La philosophie générale est :

> **Standardiser ce qui se répète, réutiliser ce qui est stable et conserver les bibliothèques matures lorsqu'elles apportent une valeur importante.**

Rashwright ne cherche pas à remplacer l'écosystème JavaScript/TypeScript existant.

Il cherche à construire une couche cohérente au-dessus de cet écosystème.

---

# 2. Principes fondamentaux

## 2.1 Réutilisation avant duplication

Lorsqu'une logique existe déjà dans Rashwright, elle doit être réutilisée plutôt que réimplémentée dans chaque projet.

## 2.2 Ne pas abstraire trop tôt

Une fonctionnalité n'est pas automatiquement extraite parce qu'elle pourrait être réutilisable.

Elle doit généralement être extraite lorsqu'elle :

* existe dans plusieurs projets ;
* possède une interface relativement stable ;
* ne dépend pas du métier d'un seul projet ;
* apporte une réduction réelle de duplication ;
* peut être maintenue indépendamment.

## 2.3 Ne pas remplacer les bibliothèques matures inutilement

Rashwright ne doit pas recréer :

* un ORM ;
* un framework frontend ;
* un moteur de cache complexe ;
* un système cryptographique ;
* un système d'authentification complet sans nécessité ;
* un moteur vidéo ;
* un moteur de traitement d'image ;
* un client HTTP complet si une solution mature répond déjà au besoin.

Rashwright doit préférer :

> **abstraction + intégration + conventions**

plutôt que :

> **réimplémentation complète.**

## 2.4 Séparation des responsabilités

Chaque couche doit avoir une responsabilité claire.

Une fonctionnalité ne doit pas être placée arbitrairement dans un dossier uniquement parce qu'il est disponible.

## 2.5 Simplicité

Une architecture doit rester compréhensible par un développeur qui découvre le projet.

La complexité architecturale doit être justifiée par un besoin réel.

## 2.6 Compatibilité Web / Mobile

Lorsque cela est pertinent, les conventions Web et Mobile doivent rester conceptuellement similaires.

Les différences imposées par les plateformes doivent être isolées.

---

# 3. Convention de nommage

## 3.1 Fichiers

Les noms de fichiers utilisent `kebab-case`.

Correct :

```text
upload-video.ts
image-viewer.tsx
api-client.ts
use-properties.ts
storage-manager.ts
property-card.tsx
```

Incorrect :

```text
uploadVideo.ts
imageViewer.tsx
apiClient.ts
useProperties.ts
```

Les fichiers imposés par les frameworks conservent leur nom officiel :

```text
package.json
tsconfig.json
next.config.ts
layout.tsx
page.tsx
route.ts
middleware.ts
global.css
```

---

## 3.2 Dossiers

Les dossiers utilisent également `kebab-case`.

Exemple :

```text
components/
property-details/
image-upload/
api-client/
```

Éviter :

```text
propertyDetails/
imageUpload/
apiClient/
```

---

## 3.3 Variables et fonctions

Les variables et fonctions utilisent `camelCase`.

```ts
const maxFileSize = 10_000_000

function createApiClient() {}
```

---

## 3.4 Composants React

Les composants utilisent `PascalCase`.

```tsx
export function ImageViewer() {}

export function PropertyCard() {}
```

Le fichier reste en `kebab-case` :

```text
image-viewer.tsx
property-card.tsx
```

---

## 3.5 Types et interfaces

Les types et interfaces utilisent `PascalCase`.

```ts
type Property = {}

interface UploadOptions {}
```

---

## 3.6 Constantes

Les constantes globales immuables utilisent `UPPER_SNAKE_CASE`.

```ts
const MAX_UPLOAD_SIZE = 10_000_000
const DEFAULT_PAGE_SIZE = 20
```

Les constantes locales peuvent rester en `camelCase` lorsqu'elles ne représentent pas une configuration globale.

---

## 3.7 Hooks

Les hooks utilisent le préfixe `use`.

Fichier :

```text
use-properties.ts
```

Code :

```ts
export function useProperties() {}
```

---

## 3.8 Types de fichiers

| Élément           | Convention         |
| ----------------- | ------------------ |
| Fichier           | `kebab-case`       |
| Dossier           | `kebab-case`       |
| Variable          | `camelCase`        |
| Fonction          | `camelCase`        |
| Hook              | `useCamelCase`     |
| Composant         | `PascalCase`       |
| Type              | `PascalCase`       |
| Interface         | `PascalCase`       |
| Constante globale | `UPPER_SNAKE_CASE` |

---

# 4. Alias d'import

Les projets doivent privilégier un alias racine.

Convention :

```text
@/
```

Exemples :

```ts
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { Property } from "@/types/property"
```

Éviter les chemins relatifs excessivement profonds :

```ts
../../../../components/shared/image-viewer
```

Lorsque l'environnement le permet, préférer :

```ts
@/components/shared/image-viewer
```

---

# 5. Structure générale des applications

Structure de référence :

```text
src/
├── app/
├── components/
├── configs/
├── constants/
├── contexts/
├── hooks/
├── lib/
├── providers/
├── theme/
├── types/
├── utils/
└── validations/
```

Dossiers optionnels :

```text
services/
stores/
locales/
```

Ils ne doivent être créés que lorsqu'ils répondent à un besoin réel.

---

# 6. Responsabilité des dossiers

## `app/`

Entrées du framework :

* routes ;
* pages ;
* layouts ;
* API routes ;
* navigation ;
* fichiers spécifiques au framework.

`app/` ne doit pas devenir un emplacement général pour toute la logique métier.

---

## `components/`

Composants React/React Native.

Structure :

```text
components/
├── ui/
├── shared/
├── pages/
└── layouts/
```

---

## `components/ui/`

Composants UI génériques.

Exemples :

```text
button.tsx
input.tsx
dialog.tsx
card.tsx
badge.tsx
```

### Web

Les composants existants de shadcn/ui sont utilisés comme base.

Rashwright ne remplace pas shadcn/ui.

Les composants personnalisés peuvent compléter cette base.

### Mobile

Les composants UI internes existants sont conservés et améliorés progressivement.

---

## `components/shared/`

Composants réutilisables au niveau du projet mais plus spécialisés.

Exemples :

```text
image-uploader.tsx
video-uploader.tsx
image-viewer.tsx
video-player.tsx
file-picker.tsx
pagination.tsx
empty-state.tsx
error-state.tsx
```

Ils ne doivent pas dépendre du contexte d'une seule page.

---

## `components/pages/`

Composants liés à une page ou à un écran particulier.

Exemple :

```text
components/
└── pages/
    ├── home/
    ├── properties/
    ├── property-details/
    ├── profile/
    └── settings/
```

Pour une page `properties`, on peut avoir :

```text
components/pages/properties/
├── property-card.tsx
├── property-filter.tsx
├── property-list.tsx
└── property-toolbar.tsx
```

Cette organisation évite de disperser les composants spécifiques aux pages dans `components/`.

---

# 7. Règle UI / Shared / Page / Package

La hiérarchie suivante doit être respectée :

```text
components/ui
        ↓
components/shared
        ↓
components/pages
```

Un composant doit être placé au niveau correspondant à son degré de généralité.

### UI

Générique.

### Shared

Réutilisable dans plusieurs parties du projet.

### Pages

Spécifique à une page ou un écran.

### Package

Réutilisable entre plusieurs applications ou projets.

---

# 8. Architecture Web

Architecture de référence :

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── shared/
│   ├── pages/
│   └── layouts/
├── configs/
├── constants/
├── contexts/
├── hooks/
├── lib/
├── providers/
├── services/
├── stores/
├── theme/
├── types/
├── utils/
└── validations/
```

Les dossiers `services`, `stores` et `locales` restent optionnels.

---

# 9. Architecture Mobile

Architecture de référence :

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── shared/
│   ├── pages/
│   └── layouts/
├── configs/
├── constants/
├── contexts/
├── hooks/
├── lib/
├── providers/
├── services/
├── stores/
├── theme/
├── types/
├── utils/
├── validations/
└── locales/
```

Pour Expo Router, `app/` reste principalement consacré au système de navigation et aux routes.

La logique métier et les composants spécifiques doivent être externalisés lorsque cela améliore la séparation des responsabilités.

---

# 10. Architecture API

L'architecture API de Rashwright suit généralement :

```text
HTTP Route
    ↓
Validation
    ↓
Controller / Handler
    ↓
Service
    ↓
Repository
    ↓
Database
```

Chaque couche possède une responsabilité précise.

---

## 10.1 Route / Handler

Responsable de :

* recevoir la requête ;
* extraire les paramètres ;
* déclencher la validation ;
* appeler le service ;
* retourner la réponse HTTP.

La route ne doit pas contenir une quantité importante de logique métier.

---

## 10.2 Validation

La validation des données entrantes doit être effectuée avant l'exécution de la logique métier.

La validation peut utiliser une bibliothèque mature comme Zod.

Rashwright fournit des helpers et des conventions plutôt que de recréer un moteur complet.

---

## 10.3 Service

Le service contient la logique métier.

Il ne doit pas dépendre directement de HTTP.

Éviter :

```ts
return Response.json(...)
```

dans un service.

Le service doit pouvoir être utilisé indépendamment d'une route HTTP.

---

## 10.4 Repository

Le repository gère l'accès aux données.

Exemple :

```text
service
   ↓
propertyRepository
   ↓
database
```

Le service ne doit pas contenir directement toute la logique SQL lorsque la séparation repository est pertinente.

---

# 11. Standard API Response

Toutes les APIs Rashwright doivent utiliser une structure de réponse cohérente.

Succès :

```ts
type ApiSuccess<T> = {
  success: true
  data: T
  meta?: ApiMeta
}
```

Erreur :

```ts
type ApiFailure = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}
```

Réponse complète :

```ts
type ApiResponse<T> =
  | ApiSuccess<T>
  | ApiFailure
```

---

# 12. Codes d'erreur

Les erreurs utilisent des codes stables.

Exemples :

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
NETWORK_ERROR
```

Les projets peuvent ajouter leurs propres codes métier :

```text
PROPERTY_NOT_FOUND
PROPERTY_ALREADY_SOLD
USER_NOT_FOUND
UPLOAD_FAILED
```

Le code doit être stable même si le message utilisateur change.

---

# 13. Pagination

Format standard :

```ts
type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

Réponse paginée :

```ts
type PaginatedResponse<T> = {
  success: true
  data: T[]
  meta: {
    pagination: PaginationMeta
  }
}
```

Les projets peuvent utiliser d'autres stratégies lorsque cela est justifié, par exemple la pagination par curseur.

---

# 14. Validation

Rashwright fournit des helpers de validation et des conventions.

Il ne remplace pas les bibliothèques matures.

Architecture :

```text
@rashwright/validation
├── schemas/
├── helpers/
└── messages/
```

Exemples de helpers potentiels :

```text
createPaginationSchema()
createIdSchema()
createUploadSchema()
createDateRangeSchema()
```

Les règles métier restent dans le projet.

---

# 15. Storage

Rashwright distingue deux catégories.

## 15.1 Data Storage

Stockage de données :

```text
MMKV
AsyncStorage
SecureStore
SQLite
IndexedDB
```

## 15.2 File Storage

Stockage de fichiers :

```text
Cloudinary
Firebase Storage
Vercel Blob
S3-compatible storage
Local filesystem
```

Ces deux catégories doivent rester conceptuellement séparées.

---

# 16. `@rashwright/storage`

Le package fournit une abstraction commune pour le stockage local.

Exemple conceptuel :

```ts
interface Storage {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}
```

Les providers peuvent inclure :

```text
memory
mmkv
async-storage
secure-storage
indexed-db
```

Le choix du provider est effectué par l'application.

---

# 17. `@rashwright/upload`

Le système d'upload doit séparer :

```text
UI
 ↓
Upload abstraction
 ↓
Provider
 ↓
Storage service
```

Providers potentiels :

```text
Cloudinary
Firebase Storage
Vercel Blob
S3
Local
```

Exemple :

```ts
const uploader = createUploader({
  provider: "cloudinary",
})
```

Puis :

```ts
await uploader.upload(file)
```

L'interface du composant ne doit pas dépendre directement d'un fournisseur.

---

# 18. Upload et composants

Un composant comme :

```text
components/shared/image-uploader.tsx
```

utilise :

```text
@rashwright/upload
```

et ne doit pas contenir toute la logique spécifique à Cloudinary ou Firebase.

Architecture :

```text
ImageUploader
      ↓
Rashwright Upload
      ↓
CloudinaryProvider
      ↓
Cloudinary
```

---

# 19. Configuration et variables d'environnement

Les informations spécifiques à l'environnement doivent être externalisées.

Exemples :

```text
DATABASE_URL
API_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
FIREBASE_PROJECT_ID
```

Aucun secret ne doit être codé en dur.

Rashwright peut fournir des helpers pour charger et valider les configurations.

---

# 20. Packages Rashwright

Les packages initiaux envisagés sont :

```text
@rashwright/core
@rashwright/utils
@rashwright/api
@rashwright/storage
@rashwright/upload
@rashwright/validation
@rashwright/logger
```

Package UI :

```text
@rashwright/ui
```

uniquement pour les composants réellement partagés.

Le package UI Web doit compléter shadcn/ui plutôt que le remplacer.

Le package UI Mobile doit compléter les composants internes existants plutôt que forcer une nouvelle bibliothèque.

---

# 21. `@rashwright/core`

Contient les primitives fondamentales.

Exemples :

```text
Result
ApiResponse types
common types
pagination primitives
nullable helpers
assertions
```

Le package doit rester petit.

---

# 22. `@rashwright/utils`

Contient uniquement des utilitaires génériques réellement utilisés.

Exemples :

```text
format-file-size
format-date
format-currency
create-slug
truncate
clamp
group-by
unique
parse-pagination
build-query-string
```

Éviter de transformer ce package en remplacement général de Lodash.

---

# 23. `@rashwright/api`

Responsabilités :

```text
API response types
API errors
pagination
API client
HTTP helpers
request helpers
```

Il peut utiliser un client HTTP mature au lieu de réimplémenter entièrement HTTP.

---

# 24. `@rashwright/logger`

Fournit une interface commune :

```ts
logger.debug()
logger.info()
logger.warn()
logger.error()
```

Il peut adapter son comportement selon :

```text
development
production
web
mobile
server
```

---

# 25. Packages que Rashwright ne doit pas réimplémenter inutilement

Rashwright doit privilégier les bibliothèques matures pour :

```text
React
Next.js
Expo
React Native
TanStack Query
Drizzle
PostgreSQL
Zod
shadcn/ui
NativeWind
WebSocket implementations
cryptography
video engines
image processing
maps
```

Rashwright peut fournir une abstraction ou une intégration autour de ces outils lorsqu'elle apporte une vraie valeur.

---

# 26. Monorepo

Chaque produit complexe peut être organisé comme un monorepo indépendant.

Exemple :

```text
project/
├── apps/
│   ├── web/
│   ├── mobile/
│   └── api/
├── packages/
│   ├── shared/
│   ├── config/
│   └── ...
├── skills/
├── architecture/
├── package.json
└── ...
```

Les applications présentes dépendent des besoins du projet.

Un projet Web uniquement peut avoir :

```text
apps/
└── web/
```

Un projet Mobile uniquement :

```text
apps/
└── mobile/
```

Un projet Web + Mobile :

```text
apps/
├── web/
└── mobile/
```

---

# 27. Repository Rashwright

Rashwright possède son propre repository GitHub.

Structure initiale envisagée :

```text
rashwright/
├── packages/
│   ├── core/
│   ├── utils/
│   ├── api/
│   ├── storage/
│   ├── upload/
│   ├── validation/
│   └── logger/
├── skills/
├── conventions/
├── templates/
├── docs/
└── examples/
```

Rashwright ne contient pas les applications métier.

---

# 28. Architecture des dépendances

Les dépendances doivent suivre une direction claire.

Exemple général :

```text
UI
 ↓
Hooks
 ↓
Services
 ↓
Repositories
 ↓
Infrastructure
```

Les utilitaires génériques ne doivent pas dépendre des couches supérieures.

Éviter :

```text
utils → components
types → services
core → application
```

Les dépendances circulaires doivent être évitées.

---

# 29. Architecture des types

Les types génériques peuvent être placés dans :

```text
types/
```

Les types fortement liés à une fonctionnalité doivent rester proches de cette fonctionnalité lorsque cela améliore la lisibilité.

Les types réellement partagés entre applications peuvent être placés dans un package partagé du monorepo.

Les types génériques et stables peuvent être candidats à Rashwright.

---

# 30. Services

`services/` contient les intégrations et services applicatifs.

Exemples :

```text
auth-service.ts
notification-service.ts
payment-service.ts
upload-service.ts
```

Un service ne doit pas automatiquement devenir un package Rashwright.

La dépendance au domaine doit être évaluée avant extraction.

---

# 31. Stores

`stores/` est utilisé lorsque l'application nécessite une gestion d'état global.

Le choix de la bibliothèque de state management reste indépendant de Rashwright.

Rashwright peut fournir des conventions mais ne doit pas imposer une bibliothèque sans raison.

---

# 32. Contexts

`contexts/` contient les React Contexts réellement nécessaires.

Exemples :

```text
auth-context.tsx
theme-context.tsx
network-context.tsx
```

Les Contexts ne doivent pas être utilisés automatiquement pour toutes les données.

Les données serveur doivent généralement être gérées par un outil adapté comme TanStack Query.

---

# 33. Hooks

Les hooks encapsulent les comportements React réutilisables.

Exemples :

```text
use-auth.ts
use-theme.ts
use-properties.ts
use-upload.ts
use-debounce.ts
```

Un hook spécifique à une page peut être placé avec cette fonctionnalité plutôt que dans le dossier global.

---

# 34. `lib/`

`lib/` contient les intégrations techniques locales au projet.

Exemples :

```text
db.ts
firebase.ts
cloudinary.ts
query-client.ts
auth.ts
```

Une intégration devient un candidat à Rashwright lorsqu'elle devient réellement générique et réutilisable.

---

# 35. `configs/`

Contient les configurations structurées :

```text
app-config.ts
api-config.ts
upload-config.ts
database-config.ts
```

Les secrets restent dans les variables d'environnement.

---

# 36. `constants/`

Contient les constantes applicatives stables.

Exemples :

```text
routes.ts
permissions.ts
limits.ts
storage-keys.ts
```

Les constantes métier restent dans le projet.

---

# 37. `validations/`

Contient les validations propres au projet.

Exemple :

```text
validations/
├── auth.ts
├── property.ts
├── user.ts
└── upload.ts
```

Les schémas génériques restent dans `@rashwright/validation`.

---

# 38. `locales/`

Optionnel.

Utilisé lorsque le projet possède une véritable stratégie d'internationalisation.

Les traductions spécifiques restent dans l'application.

---

# 39. Architecture documentation

Chaque projet doit posséder un dossier :

```text
architecture/
```

Il documente les décisions importantes.

Exemple :

```text
architecture/
├── README.md
├── web.md
├── mobile.md
├── api.md
├── database.md
├── authentication.md
├── storage.md
├── state-management.md
└── decisions/
```

---

# 40. Architecture Decision Records

Les décisions importantes peuvent être documentées :

```text
architecture/decisions/
```

Exemple :

```text
001-use-drizzle.md
002-use-cloudinary.md
003-offline-first-mobile.md
```

Chaque décision explique :

* contexte ;
* problème ;
* options ;
* décision ;
* conséquences.

---

# 41. Skills Rashwright

Les Skills constituent une partie officielle de Rashwright.

Structure :

```text
skills/
├── naming/
├── architecture/
├── web-architecture/
├── mobile-architecture/
├── api-architecture/
├── storage/
├── upload/
├── validation/
├── testing/
├── security/
├── performance/
├── git/
└── monorepo/
```

Chaque skill possède au minimum :

```text
SKILL.md
```

Lorsque nécessaire :

```text
examples/
templates/
references/
```

---

# 42. Skills par projet

Chaque projet peut ajouter ses propres skills.

Exemple :

```text
project/
└── skills/
    ├── project/
    ├── web/
    └── mobile/
```

Rashwright définit :

> **comment construire.**

Le projet définit :

> **quoi construire et quelles sont ses règles métier.**

---

# 43. Skill Architecture Web

Le skill Web doit documenter :

* structure des dossiers ;
* conventions Next.js ;
* Server Components / Client Components ;
* routing ;
* API routes ;
* data fetching ;
* state management ;
* composants ;
* validation ;
* erreurs ;
* performance ;
* sécurité ;
* SEO lorsque nécessaire.

---

# 44. Skill Architecture Mobile

Le skill Mobile doit documenter :

* Expo ;
* React Native ;
* Expo Router ;
* navigation ;
* screens ;
* composants ;
* stockage ;
* offline-first ;
* permissions ;
* réseau ;
* notifications ;
* gestion des fichiers ;
* performances ;
* build ;
* plateformes natives.

---

# 45. Skill API

Le skill API doit imposer :

```text
validation
→ handler/controller
→ service
→ repository
→ database
```

ainsi que :

* ApiResponse ;
* ApiFailure ;
* codes d'erreur ;
* pagination ;
* validation ;
* authentification ;
* autorisation ;
* logs ;
* gestion des exceptions.

---

# 46. Skill Storage

Le skill Storage doit expliquer :

* quand utiliser le stockage local ;
* quand utiliser SecureStore ;
* quand utiliser SQLite ;
* quand utiliser un file storage ;
* comment sélectionner un provider ;
* comment nommer les clés ;
* comment gérer les migrations ;
* comment gérer le mode offline.

---

# 47. Skill Upload

Le skill Upload doit documenter :

* sélection de fichiers ;
* validation ;
* taille maximale ;
* type MIME ;
* preview ;
* compression ;
* progression ;
* annulation ;
* retry ;
* suppression ;
* providers ;
* gestion des erreurs.

---

# 48. Règle d'extraction vers Rashwright

Une fonctionnalité peut être extraite vers Rashwright lorsqu'elle satisfait suffisamment de critères :

### Critère 1 — Répétition

Elle existe dans au moins deux projets ou devrait clairement être utilisée dans plusieurs projets.

### Critère 2 — Généricité

Elle ne dépend pas du domaine métier d'un seul projet.

### Critère 3 — Stabilité

Son API peut être définie de manière relativement stable.

### Critère 4 — Valeur

L'extraction réduit réellement la duplication ou améliore significativement la cohérence.

### Critère 5 — Maintenance

Le coût de maintenance du package reste raisonnable.

---

# 49. Ne pas extraire

Une fonctionnalité ne doit généralement pas être extraite lorsqu'elle :

* dépend fortement du métier d'un projet ;
* est encore en expérimentation ;
* change constamment ;
* n'existe que dans un seul projet ;
* nécessite énormément de configuration spécifique ;
* rend l'abstraction plus complexe que le code original.

---

# 50. Processus d'extraction

Lorsqu'une fonctionnalité devient candidate :

```text
Projet
   ↓
Identifier la duplication
   ↓
Identifier les parties génériques
   ↓
Séparer le métier
   ↓
Créer une API générique
   ↓
Créer tests
   ↓
Créer package Rashwright
   ↓
Migrer les projets
   ↓
Documenter le package
   ↓
Créer / mettre à jour le Skill
```

---

# 51. Principe "Extract, Don't Copy"

Lorsqu'un projet possède déjà une implémentation intéressante et qu'elle doit être utilisée ailleurs :

Ne pas copier :

```text
project-A/utils/upload.ts
→
project-B/utils/upload.ts
```

Préférer :

```text
project-A
     ↓
extraction
     ↓
@rashwright/upload
     ↓
project-A
project-B
```

---

# 52. Versionnement

Les packages Rashwright doivent être versionnés indépendamment lorsque nécessaire.

Les changements cassants doivent être explicitement identifiés.

Exemple :

```text
1.x → changements compatibles
2.x → changements potentiellement cassants
```

Le versionnement exact pourra être défini lors de l'implémentation du repository.

---

# 53. Tests

Tout package Rashwright suffisamment important doit posséder des tests.

Priorité particulière pour :

* API ;
* storage ;
* upload ;
* validation ;
* sécurité ;
* utilitaires complexes.

Les tests doivent accompagner les fonctionnalités plutôt qu'être ajoutés uniquement après plusieurs versions.

---

# 54. Documentation

Chaque package doit documenter au minimum :

```text
Purpose
Installation
Usage
API
Configuration
Providers
Examples
Limitations
```

La documentation doit rester courte et pratique.

---

# 55. Sécurité

Les fonctionnalités de sécurité doivent privilégier les bibliothèques et standards reconnus.

Ne pas implémenter soi-même :

* cryptographie ;
* hash sécurisé ;
* chiffrement ;
* protocoles d'authentification ;
* gestion complexe de tokens ;

lorsqu'une implémentation mature existe.

Rashwright peut fournir une intégration standardisée.

---

# 56. Performance

Les abstractions Rashwright ne doivent pas introduire une surcharge inutile.

Avant d'ajouter une couche :

```text
Application
 ↓
Rashwright
 ↓
Library
```

il faut vérifier que cette couche apporte une réelle valeur.

Une abstraction inutile est considérée comme une dette architecturale.

---

# 57. Dépendances

Chaque package doit avoir le minimum de dépendances nécessaire.

Éviter d'importer une grosse bibliothèque pour une fonctionnalité triviale lorsqu'une implémentation simple et fiable suffit.

Inversement, ne pas réimplémenter une fonctionnalité complexe uniquement pour supprimer une dépendance.

La décision doit considérer :

* taille ;
* sécurité ;
* maturité ;
* maintenance ;
* compatibilité ;
* complexité ;
* fréquence d'utilisation.

---

# 58. Templates

Rashwright pourra fournir des templates :

```text
templates/
├── web/
├── mobile/
├── api/
├── web-mobile/
└── monorepo/
```

Ils servent à démarrer rapidement de nouveaux projets conformes aux standards Rashwright.

---

# 59. Création d'un nouveau projet

Processus recommandé :

```text
1. Choisir le type de projet
2. Initialiser le repository
3. Choisir Web / Mobile / API
4. Initialiser la structure Rashwright
5. Installer les packages nécessaires
6. Ajouter les Skills
7. Définir architecture/
8. Définir variables d'environnement
9. Définir database/auth/storage
10. Commencer le développement métier
```

Les packages inutiles ne doivent pas être installés.

---

# 60. Règle finale

Rashwright doit rester :

```text
Petit
Modulaire
Réutilisable
Documenté
Testé
Évolutif
Pragmatique
```

Il ne doit jamais devenir :

```text
Un framework obligatoire pour tout
Une collection gigantesque de helpers
Un remplacement de toutes les bibliothèques existantes
Une abstraction complexe
Une architecture imposée sans besoin
```

---

# 61. Résumé de l'architecture Rashwright

```text
                         RASHWRIGHT
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
     CONVENTIONS          PACKAGES              SKILLS
          │                   │                   │
      Naming             core                  Web
      Structure          utils                 Mobile
      Architecture       api                   API
      Git                storage                Storage
                         upload                 Upload
                         validation             Testing
                         logger                 Security
                              │
                              ↓
                       PROJECT MONOREPO
                              │
              ┌───────────────┼───────────────┐
              │               │               │
             Web            Mobile            API
              │               │               │
              └───────────────┼───────────────┘
                              │
                         Application
                              │
                         Domain / Business
```

---

# 62. Principe directeur

La règle la plus importante de Rashwright est :

> **Le métier appartient au projet. La technologie répétitive et générique appartient à Rashwright.**

Ainsi :

```text
Immo360
→ immobilier

Kokowa TV
→ lutte traditionnelle

Zone-fi
→ hotspot / réseau

Ajiya ta
→ finances

H³ Infinity Gaming
→ gaming
```

restent complètement indépendants.

Mais ils peuvent partager :

```text
API conventions
Storage
Upload
Validation helpers
Logging
Types génériques
UI primitives
Architecture
Naming
Testing
Skills
```

C'est cette séparation qui permet à Rashwright de rester utile pour les projets actuels comme pour ceux qui seront créés dans plusieurs années.
