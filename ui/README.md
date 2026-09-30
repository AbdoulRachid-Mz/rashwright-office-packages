# @rashwright/ui

Bibliothèque unifiée de composants UI Web (shadcn/ui + Tailwind v4) et Mobile (Liquid Glass UI + NativeWind + Expo) pour l'écosystème Rashwright.

## Structure

- `@rashwright/ui/web` (`packages/ui/web`) :
  - Composants shadcn/ui complets
  - Composants d'upload avancés découplés (`AdvancedUpload`, `AdvancedMultiUpload`, `AdvancedVideoUpload`, `AdvancedChart`)
  - Helpers d'images (`compressImage`, `uploadToCloudinary`, `getImageCategories`)
  - Utilitaires de classes (`cn`) et formatage (`formatBytes`)

- `@rashwright/ui/mobile` (`packages/ui/mobile`) :
  - Primitives Liquid Glass UI (`LiquidSurface`, `LiquidPressable`, `LiquidBorder`, `LiquidHighlight`, `LiquidGlow`, `LiquidBlob`, `GlassCard`)
  - Composants UI Mobile (`Button`, `Card`, `Badge`, `Avatar`, `Text`, `TextInput`, `Modal`, `BottomSheet`, `Shimmer`)
  - Composants partagés (`UploadImage`, `UploadVideo`, `ConnectionIndicator`)
  - Service Cloudinary Mobile découplé

## Importations

### Web
```tsx
import { AdvancedUpload, AdvancedMultiUpload, cn } from '@rashwright/ui/web';
```

### Mobile
```tsx
import { LiquidSurface, LiquidPressable, Button, UploadImage } from '@rashwright/ui/mobile';
```
