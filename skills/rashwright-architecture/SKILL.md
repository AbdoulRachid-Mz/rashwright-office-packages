---
name: rashwright-architecture
description: Guide complet et conventions de développement pour l'écosystème monorepo Rashwright. Utiliser lors de la création ou modification de code dans les projets Web, Mobile ou API de Rashwright pour garantir l'uniformité des réponses, des erreurs, de la pagination, de la validation et des utilitaires.
---

# Rashwright Architecture & Engineering Standard

Ce guide détaille les conventions architecturales, techniques et structurelles qui régissent l'ensemble des projets de l'écosystème **Rashwright** (`immo360-web`, `immo360-mobile`, `rashwright-identity`, micro-services et futurs projets).

---

## 1. Principes Fondamentaux

1. **Zéro duplication** : Tout code utilitaire, composant générique ou contrat d'API doit être extrait dans `packages/*` et partagé.
2. **Aucune clé en dur** : Ne jamais coder en dur des identifiants cloud, clés API ou presets (Cloudinary, Firebase, etc.). Toujours passer par l'injection de configuration ou des variables d'environnement.
3. **Typage strict & Exhaustivité** : Tout est typé en TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
4. **Railway-Oriented Programming** : Utiliser le pattern `Result<T, E>` pour les opérations métier susceptibles d'échouer sans propager des exceptions non contrôlées.
5. **Enveloppe API Universelle** : Toutes les réponses serveur doivent respecter le format `ApiResponse<T>` de `@rashwright/core`.

---

## 2. Structure des Packages

```
packages/
├── core/         # Primitives fondamentales (Result, ApiResponse, AppError, Pagination, Types)
├── utils/        # Fonctions pures (bytes, currency, dates, slugs, math, collections, url)
├── logger/       # Logger universel (Node coloré / JSON prod, Browser, React Native)
├── validation/   # Schémas Zod (pagination, ID, upload) et adaptateur ValidationError
├── api/          # Client Axios unifié + helpers de Route Handlers (Next.js / Bun)
├── storage/      # Abstraction KV (Memory, LocalStorage, MMKV, SecureStore, SQLiteDriver)
├── upload/       # Moteur d'upload agnostique (CloudinaryProvider, MockUploadProvider, UploadManager)
├── ui/           # UI Web (shadcn/ui, uploads avancés) & UI Mobile (Liquid Glass UI)
└── skills/       # Skills IA et guides pour les développeurs et agents
```

---

## 3. Contrat de Réponse API (`ApiResponse<T>`)

Toutes les routes d'API (Next.js App Router, Bun HTTP, Express, Fastify) doivent renvoyer :

### Format Succès
```json
{
  "success": true,
  "data": { ... },
  "message": "Message optionnel",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Format Erreur
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le champ email est invalide",
    "details": [
      { "field": "email", "message": "Email invalide" }
    ]
  }
}
```

---

## 4. Helpers Serveur (`@rashwright/api`)

Dans les Route Handlers Next.js ou Bun :

```ts
import { success, created, badRequest, notFound, handleError } from '@rashwright/api';
import { validateOrThrow } from '@rashwright/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = validateOrThrow(createItemSchema, body);
    const item = await db.item.create({ data: validated });
    
    return created(item, "Élément créé avec succès");
  } catch (err) {
    return handleError(err);
  }
}
```

---

## 5. Client HTTP Découplé (`@rashwright/api`)

Côté Web et Mobile :

```ts
import { createApiClient } from '@rashwright/api';

export const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  getToken: async () => auth.currentUser?.getIdToken() ?? null,
  enableLogging: process.env.NODE_ENV !== 'production',
});

// GET typé déballant directement 'data' ou renvoyant une AppError typée en cas d'erreur
const users = await api.get<User[]>('/users');
```

---

## 6. Hiérarchie d'Erreurs (`@rashwright/core`)

Toujours lever des erreurs dérivées de `AppError` :
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `RateLimitedError` (429)
- `UploadError` (422)
- `DatabaseError` (500)
- `AppError` (500 par défaut)
