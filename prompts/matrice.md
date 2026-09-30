# 63. Matrice Web / Mobile / API

Cette matrice définit où une responsabilité doit être placée selon la nature de l'application.

Elle sert de référence lors de la création d'un nouveau projet, de l'ajout d'une fonctionnalité et de l'extraction d'un module vers Rashwright.

## 63.1 Matrice principale

| Élément                  |       Web       |      Mobile     |   API / Backend   |   Rashwright  |
| ------------------------ | :-------------: | :-------------: | :---------------: | :-----------: |
| `app/` / routing         |        ✅        |        ✅        |         ⚠️        |       ❌       |
| `components/ui/`         |        ✅        |        ✅        |         ❌         |       ⚠️      |
| `components/shared/`     |        ✅        |        ✅        |         ❌         |       ⚠️      |
| `components/pages/`      |        ✅        |        ✅        |         ❌         |       ❌       |
| `layouts/`               |        ✅        |        ✅        |         ❌         |       ⚠️      |
| `hooks/`                 |        ✅        |        ✅        |         ❌         |       ⚠️      |
| `contexts/`              |        ✅        |        ✅        |         ❌         |       ⚠️      |
| `providers/`             |        ✅        |        ✅        |         ⚠️        |       ⚠️      |
| `theme/`                 |        ✅        |        ✅        |         ❌         |       ⚠️      |
| `services/`              |        ✅        |        ✅        |         ✅         |       ⚠️      |
| `stores/`                |        ✅        |        ✅        |         ❌         |       ⚠️      |
| `lib/`                   |        ✅        |        ✅        |         ✅         |       ⚠️      |
| `configs/`               |        ✅        |        ✅        |         ✅         |       ⚠️      |
| `constants/`             |        ✅        |        ✅        |         ✅         |       ⚠️      |
| `types/`                 |        ✅        |        ✅        |         ✅         |       ⚠️      |
| `utils/`                 |        ✅        |        ✅        |         ✅         |       ⚠️      |
| `validations/`           |        ✅        |        ✅        |         ✅         |       ⚠️      |
| `locales/`               |        ⚠️       |        ⚠️       |         ❌         |       ❌       |
| API client               |        ✅        |        ✅        |         ❌         |       ✅       |
| API routes               |        ⚠️       |        ❌        |         ✅         |       ⚠️      |
| Controllers / handlers   |        ❌        |        ❌        |         ✅         |       ⚠️      |
| Services métier          |        ⚠️       |        ⚠️       |         ✅         |       ❌       |
| Repositories             |        ❌        |        ❌        |         ✅         |       ❌       |
| Database                 |        ❌        |        ❌        |         ✅         |       ❌       |
| ORM                      |        ❌        |        ❌        |         ✅         |       ❌       |
| Pagination               |     ✅ client    |     ✅ client    |     ✅ serveur     |  ✅ primitives |
| API responses            | ⚠️ consommation | ⚠️ consommation |    ✅ production   |    ✅ types    |
| Authentication UI        |        ✅        |        ✅        |         ❌         |       ⚠️      |
| Authentication server    |        ❌        |        ❌        |         ✅         |       ⚠️      |
| Authorization            |      ⚠️ UI      |      ⚠️ UI      | ✅ source of truth |   ⚠️ helpers  |
| File upload UI           |        ✅        |        ✅        |         ❌         |       ⚠️      |
| File upload logic        |        ⚠️       |        ⚠️       |         ⚠️        |       ✅       |
| Storage local            |        ✅        |        ✅        |         ⚠️        |       ✅       |
| File storage             |        ⚠️       |        ⚠️       |         ✅         |  ✅ providers  |
| Notifications UI         |        ✅        |        ✅        |         ❌         |       ⚠️      |
| Push notifications       |       ❌/⚠️      |        ✅        |     ✅ provider    |       ⚠️      |
| WebSocket client         |        ✅        |        ✅        |         ❌         |       ⚠️      |
| WebSocket server         |        ❌        |        ❌        |         ✅         |       ⚠️      |
| Offline storage          |        ⚠️       |        ✅        |         ❌         |       ⚠️      |
| Offline sync             |        ⚠️       |        ✅        |         ✅         |       ⚠️      |
| Logging                  |        ✅        |        ✅        |         ✅         |       ✅       |
| Error handling           |        ✅        |        ✅        |         ✅         | ✅ conventions |
| Environment config       |        ✅        |        ✅        |         ✅         |       ⚠️      |
| Security-sensitive logic |        ❌        |        ❌        |         ✅         |       ⚠️      |
| Database migrations      |        ❌        |        ❌        |         ✅         |       ❌       |
| Tests UI                 |        ✅        |        ✅        |         ❌         |       ⚠️      |
| Tests API                |        ⚠️       |        ❌        |         ✅         |       ⚠️      |

### Légende

* **✅** responsabilité normale.
* **⚠️** possible selon le contexte ou sous forme d'abstraction.
* **❌** ne doit normalement pas être placé ici.

---

# 63.2 Matrice des responsabilités

## Présentation

```text
                 WEB             MOBILE           API
────────────────────────────────────────────────────────
UI               ████             ████             -
Pages            ████             ████             -
Navigation       ████             ████             -
State UI         ████             ████             -
Server State     ████             ████             -
Business Logic   ██               ██               ████
Validation       ███              ███              ████
Authentication   ███              ███              ████
Authorization    ██               ██               ████
Database         -                -                ████
Storage Files    ██               ██               ████
Local Storage    ███              ████             ██
Upload           ██               ███              ███
Realtime         ███              ███              ████
Notifications    ███              ████             ███
Offline          ██               ████             ███
Logging          ███              ███              ████
```

Le niveau de responsabilité n'est pas toujours identique.

Par exemple, l'interface Web peut **afficher** les permissions, mais l'API reste la source de vérité pour l'autorisation.

---

# 63.3 Web

Le Web est principalement responsable de :

```text
UI
Routing
Pages
Layouts
Interactions
Client state
Server state
Formulaires
UX
SEO
Accessibilité
API consumption
```

Architecture typique :

```text
Page
 ↓
Page Components
 ↓
Shared / UI Components
 ↓
Hooks
 ↓
API Client / Services
 ↓
API
```

Le Web ne doit pas devenir responsable de la logique métier critique qui doit être garantie côté serveur.

---

# 63.4 Mobile

Le Mobile est principalement responsable de :

```text
UI
Screens
Navigation
Gestures
Device APIs
Permissions
Local storage
Offline experience
Push notifications
Camera
Media
File system
API consumption
```

Architecture typique :

```text
Screen
 ↓
Page Components
 ↓
Shared / UI Components
 ↓
Hooks
 ↓
Services
 ↓
API Client
 ↓
API
```

Le Mobile peut avoir davantage de logique locale que le Web, notamment pour :

* offline-first ;
* synchronisation ;
* cache ;
* fichiers ;
* permissions ;
* fonctionnalités natives.

Cependant, la logique métier critique ne doit pas être considérée comme sécurisée parce qu'elle se trouve sur le client.

---

# 63.5 API / Backend

L'API est responsable de :

```text
Authentication
Authorization
Business rules
Validation serveur
Database
Transactions
Repositories
File storage
Server-side uploads
Notifications
Background jobs
Webhooks
Rate limiting
Security
Audit
```

Architecture :

```text
Request
 ↓
Route
 ↓
Validation
 ↓
Handler / Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

Avec les services externes :

```text
                    ┌── Database
                    │
Request → Service ───┼── Storage
                    │
                    ├── Notifications
                    │
                    ├── Payments
                    │
                    └── External APIs
```

---

# 63.6 Ce qui doit rester côté serveur

Certaines responsabilités ne doivent pas être confiées uniquement au Web ou au Mobile :

```text
Permission enforcement
Authorization
Sensitive business rules
Payment validation
Ownership checks
Administrative operations
Secret management
Database access
Private API credentials
Security-sensitive operations
```

Le client peut effectuer une validation UX préalable, mais l'API doit toujours effectuer la validation faisant autorité.

---

# 63.7 Ce qui peut être partagé entre Web et Mobile

Certaines briques sont candidates à un package partagé du monorepo :

```text
packages/
├── types/
├── validation/
├── api-client/
├── constants/
└── utils/
```

Exemple :

```text
Web ───────┐
           ├── @project/types
Mobile ────┤
           ├── @project/validation
           ├── @project/api-client
           └── @project/utils
API ───────┘
```

Cependant, le partage ne doit être effectué que lorsque les contraintes des plateformes restent compatibles.

---

# 63.8 Ce qui doit rester spécifique à la plateforme

### Web

```text
Server Components
Browser APIs
SEO
DOM
Web Workers
Web-specific routing
Browser storage
```

### Mobile

```text
Camera
GPS
Biometrics
Push permissions
Native filesystem
App lifecycle
Deep links
Device sensors
```

Ces fonctionnalités ne doivent pas être artificiellement uniformisées.

Une abstraction peut être créée uniquement si elle apporte une vraie valeur.

---

# 63.9 Web / Mobile / API et Rashwright

La relation cible est :

```text
                         Rashwright
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
       Web                 Mobile                API
        │                    │                    │
        └──────────────┬─────┴──────┬─────────────┘
                       │            │
                  Shared Code   Project Code
                       │            │
                 @rashwright/*   application
```

Rashwright fournit les primitives communes.

Le projet fournit le métier.

La plateforme fournit les spécificités.

---

# 63.10 Matrice des packages Rashwright

| Package                  |    Web   |  Mobile  |        API       | Shared |
| ------------------------ | :------: | :------: | :--------------: | :----: |
| `@rashwright/core`       |     ✅    |     ✅    |         ✅        |    ✅   |
| `@rashwright/utils`      |     ✅    |     ✅    |         ✅        |    ✅   |
| `@rashwright/api`        | ✅ client | ✅ client | ✅ server helpers |    ✅   |
| `@rashwright/storage`    |     ✅    |     ✅    |        ⚠️        |    ✅   |
| `@rashwright/upload`     |     ✅    |     ✅    |         ✅        |    ✅   |
| `@rashwright/validation` |     ✅    |     ✅    |         ✅        |    ✅   |
| `@rashwright/logger`     |     ✅    |     ✅    |         ✅        |    ✅   |
| `@rashwright/ui`         |     ✅    |     ✅    |         ❌        |   ⚠️   |
| `@rashwright/auth`       |    ⚠️    |    ⚠️    |        ⚠️        |   ⚠️   |

Le package d'authentification ne doit pas être créé automatiquement. Il dépendra des choix définitifs concernant Rashwright Identity et les solutions d'authentification utilisées.

---

# 63.11 Matrice de décision : où mettre une nouvelle fonctionnalité ?

Lorsqu'une nouvelle fonctionnalité est créée, poser les questions suivantes :

### Question 1

Est-ce spécifique au Web ?

→ `apps/web`

### Question 2

Est-ce spécifique au Mobile ?

→ `apps/mobile`

### Question 3

Est-ce spécifique au Backend ?

→ `apps/api`

### Question 4

Est-ce partagé entre Web et Mobile mais spécifique au produit ?

→ `packages/` du monorepo.

### Question 5

Est-ce partagé entre plusieurs projets indépendants ?

→ candidat à `@rashwright/*`.

### Question 6

Est-ce uniquement une règle de développement ?

→ `skills/` ou `conventions/`.

### Question 7

Est-ce une décision architecturale propre au projet ?

→ `architecture/`.

---

# 63.12 Règle de séparation finale

La décision peut être résumée ainsi :

```text
                    Est-ce du code ?
                         │
                 ┌───────┴───────┐
                Non              Oui
                 │                │
              Skill /        Est-ce générique ?
              Convention          │
                            ┌─────┴─────┐
                           Non         Oui
                            │            │
                         Projet      Combien de
                                     projets ?
                                        │
                               ┌────────┴────────┐
                              Un              Plusieurs
                               │                  │
                       Code projet          Rashwright
```

Pour le code projet :

```text
                    Code projet
                        │
             ┌──────────┼──────────┐
             │          │          │
            Web       Mobile      API
             │          │          │
          apps/web  apps/mobile apps/api
```

---

# 63.13 Règle de priorité

Lorsqu'une fonctionnalité pourrait être placée à plusieurs endroits, choisir dans cet ordre :

1. **Le niveau le plus spécifique qui reste correct.**
2. Ne pas partager prématurément.
3. Extraire uniquement lorsque la réutilisation est démontrée.
4. Utiliser Rashwright lorsque la fonctionnalité est générique et stable.
5. Ne jamais déplacer une fonctionnalité vers Rashwright uniquement pour rendre l'arborescence « plus propre ».

Cette règle protège Rashwright contre la sur-abstraction.
