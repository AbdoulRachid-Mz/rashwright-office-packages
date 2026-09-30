# @rashwright/core

Primitives fondamentales et contrats universels pour tous les projets et bibliothèques de l'écosystème Rashwright (Web, Mobile et API). Ce package est à **zéro dépendance d'exécution**.

## Installation

```bash
bun add @rashwright/core
```

## Fonctionnalités

### 1. Pattern Result (`Result<T, E>`)
Gestion explicite des succès et échecs sans lever d'exceptions (Railway-Oriented Programming).

```ts
import { ok, err, isOk, tryCatch } from '@rashwright/core';

function divide(a: number, b: number) {
  if (b === 0) return err(new Error('Division par zéro'));
  return ok(a / b);
}

const res = divide(10, 2);
if (isOk(res)) {
  console.log(res.data); // 5
}
```

### 2. Contrats de Réponse API (`ApiResponse<T>`)
Enveloppe standard pour toutes les communications réseau :

```ts
import { apiSuccess, apiFailure, type ApiResponse } from '@rashwright/core';

// Succès
const successRes = apiSuccess({ user: 'Aziz' }, 'Utilisateur récupéré');

// Échec
const errorRes = apiFailure('VALIDATION_ERROR', 'Email invalide', { field: 'email' });
```

### 3. Hiérarchie d'Erreurs Typées (`AppError`)
Classes d'erreurs standard avec codes d'erreur stables (`ErrorCode`) et sérialisation directe vers `ApiFailure` :

- `AppError` (classe de base opérationnelle)
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `RateLimitedError` (429)
- `DatabaseError` (500)
- `UploadError` (422)

```ts
import { NotFoundError, ErrorCode } from '@rashwright/core';

throw new NotFoundError('Propriété introuvable');
```

### 4. Primitives de Pagination
```ts
import { parsePaginationParams, buildPaginationMeta, paginateArray } from '@rashwright/core';

const { page, limit, offset } = parsePaginationParams({ page: '2', limit: '10' });
const meta = buildPaginationMeta(page, limit, 100);
```
