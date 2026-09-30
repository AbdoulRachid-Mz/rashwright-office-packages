# @rashwright/utils

Collection d'utilitaires purs, hautement optimisés et sans dépendance d'exécution pour le Web, le Mobile et l'API.

## Installation

```bash
bun add @rashwright/utils
```

## Modules

### Formatage des tailles de fichiers
```ts
import { formatBytes, formatBinaryBytes, mbToBytes, bytesToMb } from '@rashwright/utils';

formatBytes(1500000);        // "1.5 MB" (SI decimal)
formatBinaryBytes(1048576);  // "1 MiB" (IEC binary)
mbToBytes(5);                // 5242880
```

### Devises & Nombres
Support natif des devises d'Afrique de l'Ouest (XOF, XAF) et mondiales (EUR, USD) :

```ts
import { formatCurrency, abbreviateNumber } from '@rashwright/utils';

formatCurrency(150000, { currency: 'XOF' }); // "150 000 FCFA"
formatCurrency(99.99, { currency: 'EUR' });   // "99,99 €"
abbreviateNumber(1500000);                   // "1.5M"
```

### Dates
```ts
import { formatDate, formatRelativeTime, toISODate } from '@rashwright/utils';

formatDate(new Date(), 'fr-FR');               // "30 septembre 2026"
formatRelativeTime(Date.now() - 3600000, 'fr'); // "il y a 1 heure"
toISODate(new Date());                         // "2026-09-30"
```

### Slugs URL Sécurisés
```ts
import { slugify, uniqueSlug } from '@rashwright/utils';

slugify("Villa Moderne — Almadies"); // "villa-moderne-almadies"
```

### Manipulation de Tableaux & Objets
```ts
import { groupBy, unique, chunk, sortBy, indexBy } from '@rashwright/utils';

const groups = groupBy(properties, p => p.category);
const pages = chunk(items, 10);
const sorted = sortBy(items, x => x.price, 'desc');
```
