---
name: liquid-glass-ui
description: Portable copy-paste React Native & Expo UI library implementing Liquid Glass, Rubber and Viscous Glass aesthetics. Covers glass materials, multi-layer surfaces, Reanimated rubber feedback, platform adaptability (iOS, Android, Web), and 35+ production-ready components.
version: 2.0.0
license: MIT
---

# Liquid Glass UI Library — Guide Complet d'Intégration & Portabilité

Une bibliothèque UI modulaire et autonome pour **React Native** et **Expo**, compatible **iOS**, **Android** et **Web**.
Elle combine deux piliers majeurs :
1. **L'effet Visqueux / Rebond Élastique (Gooey / Rubber Physics)** : animations Reanimated fluides (compression douce au touché, léger rebond à la libération) actives en continu sur toutes les plateformes.
2. **Le système Liquid Glass Débrayable (`liquidGlassEnabled`)** : un toggle global (désactivé par défaut) qui active ou désactive tous les effets visuels de verre dépoli, reflets lumineux et bordures translucides. Lorsqu'il est désactivé, l'ensemble des composants adopte instantanément une apparence **native, épurée et solide** sans surcoût de performance.

---

## 🏛️ Architecture & Principes de Conception

### 1. Portabilité Zéro-Dépendance Propriétaire
L'ensemble des composants réside dans `components/ui/` et ne dépend que de packages standards de l'écosystème Expo / React Native :
- `react-native-reanimated` : animations de rebond physique et travail sur le thread UI.
- `expo-blur` : flou natif sur iOS.
- `expo-linear-gradient` : dégradés lumineux et teintes subtiles.
- `expo-haptics` : retours haptiques légers sur mobile.
- `useTheme()` : accès aux tokens sémantiques (`colors`, `borderRadius`, `spacing`, `typography`, `liquidGlassEnabled`).

### 2. Comportement du Flag `liquidGlassEnabled`
Le flag `liquidGlassEnabled` (booléen, stocké dans `useAppStore` / exposé via `useTheme()`) est **`false` par défaut** :
- **Quand `liquidGlassEnabled = false` (Défaut)** :
  - Les surfaces (`LiquidSurface`, `Card`, `GlassCard`, etc.) affichent un fond opaque propre (`theme.colors.card`), une bordure fine standard (`theme.colors.border`) et évitent tout flou ou calque inutile.
  - Les primitives de reflets et bordures (`LiquidHighlight`, `LiquidBorder`, `LiquidGlow`, `LiquidBlob`) renvoient immédiatement `null`.
  - Les boutons, badges, onglets et filtres s'affichent avec des styles nets, contrastés et parfaitement lisibles.
- **Quand `liquidGlassEnabled = true` (Mode Actif)** :
  - Les surfaces activent le flou matériel (`BlurView` sur iOS, `backdrop-filter` sur Web, fallback teinté sur Android).
  - Les bordures lumineuses et highlights s'affichent selon l'intensité et le matériau configuré.
- **Dans les deux modes** :
  - **Les animations visqueuses (`LiquidPressable`) restent 100% actives** : l'effet élastique au touché / clic apporte un confort tactile premium sans imposer l'esthétique de verre.

```
Your App Root
├── components/ui/
│   ├── index.ts                # Barrel d'exportation unifié
│   ├── liquid/                 # Primitives Liquid Glass
│   │   ├── liquid-types.ts     # Types TypeScript partagés
│   │   ├── liquid-shadow.ts    # Ombres cross-platform (iOS / Android / Web)
│   │   ├── liquid-highlight.tsx# Reflet lumineux (activable/désactivable)
│   │   ├── liquid-border.tsx   # Bordure lumineuse (activable/désactivable)
│   │   ├── liquid-surface.tsx  # Surface multi-couches adaptée aux plateformes
│   │   ├── liquid-pressable.tsx# Wrapper interactif avec physique visqueuse
│   │   ├── liquid-glow.tsx     # Halo lumineux d'accentuation
│   │   └── liquid-blob.tsx     # Formes d'arrière-plan animées
│   │
│   ├── button.tsx
│   ├── icon-button.tsx
│   ├── chip.tsx
│   ├── segmented-control.tsx
│   ├── search-input.tsx
│   ├── text-input.tsx
│   ├── card.tsx
│   ├── glass-card.tsx
│   ├── stat-card.tsx
│   ├── badge.tsx
│   ├── checkbox.tsx
│   ├── radio.tsx
│   ├── slider.tsx
│   ├── progress.tsx
│   ├── select.tsx
│   ├── time-picker.tsx
│   ├── modal.tsx
│   ├── drawer.tsx
│   ├── bottom-sheet.tsx
│   ├── floating-action-button.tsx
│   ├── fab-menu.tsx
│   ├── empty-state.tsx
│   ├── error-state.tsx
│   ├── loading-state.tsx
│   └── shimmer.tsx
│
└── constants/
    ├── theme.ts               # Palette de base et mode sombre/clair
    └── glass-theme.ts         # Générateur de tokens matériaux et interactions
```

---

## 📱 Adaptations Cross-Platform (iOS, Android, Web)

| Plateforme | Rendu du Flou (Surface) | Gestion des Ombres | Interactions Pressables |
|---|---|---|---|
| **iOS** | `BlurView` natif (`expo-blur`) avec intensité calibrée | `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` | Reanimated spring + haptics légers |
| **Android** | Fond semi-transparent solide `backgroundFallback` (évite les ralentissements matériels) | `elevation` natif | Reanimated spring + haptics |
| **Web** | CSS `backdropFilter: blur(...)` & `-webkit-backdrop-filter` | CSS `boxShadow` fluide | Reanimated spring + curseur `pointer` + `userSelect: none` |

---

## 💎 Primitives Liquid

### 1. `LiquidSurface`
Conteneur multi-couches adaptatif gérant automatiquement l'activation ou désactivation de Liquid Glass.

```tsx
import { LiquidSurface } from "@/components/ui";

<LiquidSurface material="regular" borderRadius={16} style={{ padding: 16 }}>
  <Text>Contenu de surface</Text>
</LiquidSurface>
```

**Matériaux disponibles :**
- `clear` : Verre ultra-léger (blur 8px / opacité discrète)
- `soft` : Verre subtil pour cartes et blocs de liste
- `regular` : Verre standard pour cartes principales
- `thick` : Verre dense pour modales, bottom sheets et navigation
- `solid` : Fond opaque net avec bordure fine
- `floating` : Pour éléments flottants (HUD, FAB, barres d'outils)
- `interactive` : Pour boutons et éléments actionnables

### 2. `LiquidPressable`
Composant interactif fournissant la sensation physique visqueuse / caoutchouc au clic ou au touché :
- `viscosity="soft"` : rebond délicat pour puces, tags et cartes de sélection.
- `viscosity="medium"` : rebond équilibré pour boutons principaux et FAB (défaut).
- `viscosity="strong"` : compression marquée pour boutons d'action critique.

```tsx
import { LiquidPressable } from "@/components/ui";

<LiquidPressable viscosity="medium" haptic onPress={handleAction}>
  <Text>Action Visqueuse</Text>
</LiquidPressable>
```

---

## 🚀 Catalogue des Composants & Utilisation dans les Écrans

### 1. Boutons & Actions

#### `Button` (avec support visqueux et fallback glass)
```tsx
import { Button } from "@/components/ui";

// Bouton principal
<Button variant="default" onPress={handleSubmit}>
  Valider l'annonce
</Button>

// Bouton avec variant glass (s'adapte automatiquement selon liquidGlassEnabled)
<Button variant="glass" leftIcon={<Ionicons name="sparkles" size={18} />}>
  Action Spéciale
</Button>
```

#### `IconButton` (circulaire ou arrondi avec badge)
```tsx
import { IconButton } from "@/components/ui";

<IconButton
  icon={<Ionicons name="notifications-outline" size={22} />}
  variant="ghost"
  badge={3}
  onPress={() => router.push("/notifications")}
/>
```

#### `FloatingActionButton` & `FabMenu`
```tsx
import { FloatingActionButton, FabMenu } from "@/components/ui";

// FAB simple
<FloatingActionButton
  icon={<Ionicons name="add" size={28} color="#FFF" />}
  onPress={() => router.push("/properties/create")}
/>

// Menu FAB Speed Dial
<FabMenu
  items={[
    { icon: <Ionicons name="home" size={20} color="#FFF" />, label: "Bien immobilier", onPress: () => {} },
    { icon: <Ionicons name="document-text" size={20} color="#FFF" />, label: "Contrat", onPress: () => {} },
  ]}
/>
```

### 2. Filtres, Sélections & Contrôles

#### `SegmentedControl` (ex: Vente / Location ou Liste / Carte)
```tsx
import { SegmentedControl } from "@/components/ui";

<SegmentedControl
  value={type}
  options={[
    { value: "sale", label: "Vente" },
    { value: "rent", label: "Location" },
  ]}
  onValueChange={setType}
/>
```

#### `Chip` (Filtres, critères et statuts)
```tsx
import { Chip } from "@/components/ui";

<Chip
  selected={selectedCity === "Paris"}
  variant="default"
  onPress={() => setSelectedCity("Paris")}
>
  Paris
</Chip>
```

#### `Tabs` (Navigation par onglets avec indicateur glissant)
```tsx
import { Tabs } from "@/components/ui";

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <Tabs.List>
    <Tabs.Trigger value="details">Détails</Tabs.Trigger>
    <Tabs.Trigger value="photos">Photos</Tabs.Trigger>
    <Tabs.Trigger value="map">Carte</Tabs.Trigger>
  </Tabs.List>
</Tabs>
```

### 3. Saisie & Formulaires

#### `SearchInput`
```tsx
import { SearchInput } from "@/components/ui";

<SearchInput
  value={query}
  onChangeText={setQuery}
  placeholder="Rechercher par adresse ou ville..."
  showFilterButton
  filterActive={hasActiveFilters}
  onFilterPress={openFiltersModal}
/>
```

#### `TextInput` (avec support icônes et gestion des erreurs)
```tsx
import { TextInput } from "@/components/ui";

<TextInput
  label="Prix du bien (€)"
  placeholder="350 000"
  keyboardType="numeric"
  leftIcon={<Ionicons name="pricetag-outline" size={20} />}
  error={errors.price}
/>
```

### 4. Présentation des Données & Cartes

#### `Card` & `GlassCard`
```tsx
import { Card, GlassCard } from "@/components/ui";

// Carte standard avec animation d'entrée et rebond au tap
<Card onPress={() => openProperty(property.id)}>
  <Card.Header>
    <Card.Title>{property.title}</Card.Title>
    <Card.Description>{property.city}</Card.Description>
  </Card.Header>
  <Card.Content>
    <Text>{property.price} €</Text>
  </Card.Content>
</Card>

// Carte spécialisée avec niveau de matériau
<GlassCard material="floating" borderRadius={20}>
  <GlassCard.Title>Statistiques du mois</GlassCard.Title>
  <GlassCard.Description>Vue d'ensemble de vos performances</GlassCard.Description>
</GlassCard>
```

#### `StatCard` (Métriques de tableau de bord)
```tsx
import { StatCard } from "@/components/ui";

<StatCard
  label="Biens disponibles"
  value="128"
  change="+12% ce mois"
  trend="up"
  icon={<Ionicons name="home-outline" size={20} color="#3B82F6" />}
/>
```

#### `Badge` (Statuts et tags compacts)
```tsx
import { Badge } from "@/components/ui";

<Badge variant="success">Disponible</Badge>
<Badge variant="warning">Sous compromis</Badge>
<Badge variant="destructive">Vendu</Badge>
```

---

## 🎨 Portabilité vers un Nouveau Projet

Pour importer ce système dans un autre projet Expo / React Native :
1. Copier le dossier `components/ui/` dans votre projet.
2. Copier `constants/glass-theme.ts` dans votre dossier `constants/`.
3. Vérifier que votre `ThemeContext` fournit `liquidGlassEnabled` (mettre `false` par défaut).
4. Vos composants fonctionnent immédiatement sur **iOS**, **Android** et **Web**.

