# @rashwright/api

Client HTTP universel (Axios) avec intercepteurs et helpers de réponses serveur pour Next.js App Router et runtime Web standard.

## Installation

```bash
bun add @rashwright/api @rashwright/core @rashwright/logger axios
```

## Client API (Web & Mobile)

```ts
import { createApiClient } from '@rashwright/api';

const api = createApiClient({
  baseURL: 'https://api.rashwright.com/v1',
  devBaseURL: 'http://localhost:3000/api',
  getToken: async () => {
    // Récupération dynamique du Bearer token (BetterAuth, Firebase, etc.)
    return localStorage.getItem('token');
  },
  enableLogging: true,
});

// Les réponses sont typées et les erreurs HTTP sont automatiquement
// converties en hiérarchie AppError (@rashwright/core).
const properties = await api.get<Property[]>('/properties');
```

## Helpers Serveur (Route Handlers Next.js / Bun)

```ts
import { success, created, badRequest, notFound, handleError } from '@rashwright/api';

export async function GET(req: Request) {
  try {
    const data = await fetchItems();
    return success(data, 'Liste récupérée avec succès');
  } catch (err) {
    return handleError(err);
  }
}
```
