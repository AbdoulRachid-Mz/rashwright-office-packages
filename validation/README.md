# @rashwright/validation

Schémas de validation Zod réutilisables et adaptateurs d'erreurs pour l'écosystème Rashwright.

## Installation

```bash
bun add @rashwright/validation @rashwright/core zod
```

## Schémas Inclus

### 1. Pagination & Recherche
```ts
import { paginationParamsSchema, searchParamsSchema } from '@rashwright/validation';

// Parse automatiquement les strings de query params en entiers bornés sûrs
const { page, limit } = paginationParamsSchema.parse({ page: '1', limit: '20' });
```

### 2. Identifiants
```ts
import { uuidSchema, cuidSchema, idSchema, numericIdSchema } from '@rashwright/validation';

uuidSchema.parse('123e4567-e89b-12d3-a456-426614174000');
```

### 3. Fichiers & Upload
```ts
import { createFileMetadataSchema } from '@rashwright/validation';

const avatarSchema = createFileMetadataSchema({
  maxSizeMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});
```

### 4. Helpers & Intégration `ValidationError`
```ts
import { validateOrThrow, safeValidate, toValidationError } from '@rashwright/validation';

// Lève une ValidationError typée (@rashwright/core) avec les détails par champ
const data = validateOrThrow(schema, input);

// Retourne un Result<T, ValidationError>
const result = safeValidate(schema, input);
```
