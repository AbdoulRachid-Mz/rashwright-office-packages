# @rashwright/logger

Logger universel structuré et adaptatif pour Node.js, Web et React Native.

## Installation

```bash
bun add @rashwright/logger
```

## Utilisation

```ts
import { logger, createLogger } from '@rashwright/logger';

// Utilisation standard
logger.info('Serveur initialisé', { port: 3000 });
logger.warn('Attention: quota approché', { remaining: 5 });
logger.error('Erreur de connexion DB', new Error('Timeout'), { host: 'db.local' });

// Logger avec contexte persistant (Child Logger)
const reqLogger = logger.child({ requestId: 'req_12345', userId: 'usr_88' });
reqLogger.info('Requête traitée'); // Inclura automatiquement requestId et userId

// Instance personnalisée
const customLogger = createLogger({
  prefix: 'UPLOAD',
  level: 'debug',
  colorize: true,
});
```

### Comportement selon l'environnement
- **Développement Node.js** : Sortie colorée et formatée lisiblement.
- **Production Node.js** : Sortie JSON stricte et compacte pour les agrégateurs de logs (Datadog, Loki, CloudWatch).
- **Navigateur** : Utilise les styles et groupes de la console Web.
- **React Native** : Format optimisé pour Metro bundler et React Native Debugger.
