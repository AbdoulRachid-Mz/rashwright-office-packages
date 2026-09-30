---
name: rashwright-upload
description: Guide et conventions pour l'architecture d'upload et de gestion de médias dans l'écosystème Rashwright (Web et Mobile). À activer lors de l'intégration, modification ou débogage de flux d'upload d'images, vidéos ou documents.
---

# Rashwright Upload Architecture & Conventions

Le module `@rashwright/upload` fournit un moteur agnostique du fournisseur de stockage cloud (Cloudinary, AWS S3, Mock).

## 1. Règle d'or de Sécurité

> **INTERDICTION FORMELLE** de coder en dur des `cloudName`, `uploadPreset`, clés API ou secrets dans les composants, services ou helpers d'upload.
> Tous les composants (`AdvancedUpload`, `AdvancedMultiUpload`, `AdvancedVideoUpload`, `UploadImage`, `UploadVideo`) doivent recevoir leurs configurations via props ou variables d'environnement.

---

## 2. Interface Universelle `IUploadProvider`

Chaque provider implémente :

```ts
export interface IUploadProvider {
  readonly name: string;
  upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult>;
  delete?(publicId: string): Promise<boolean>;
}
```

### Types sources supportés
- **Web** : `File`, `Blob`
- **Mobile** : `{ uri: 'file://...', name: 'photo.jpg', type: 'image/jpeg' }`
- **Universel** : Chaîne Base64 / Data URI

---

## 3. Providers Disponibles

### CloudinaryProvider
Upload non signé ou signé :

```ts
import { CloudinaryProvider, createUploader } from '@rashwright/upload';

const provider = new CloudinaryProvider({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  defaultUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET!,
  defaultFolder: 'properties/images',
});

const uploader = createUploader({ provider });
```

### MockUploadProvider
Idéal pour le développement local hors-ligne, les tests unitaires et les Storybooks :

```ts
import { MockUploadProvider, createUploader } from '@rashwright/upload';

const uploader = createUploader({
  provider: new MockUploadProvider({ delayMs: 400 }),
});
```

---

## 4. Téléversements Multiples & Suivi d'État (`UploadManager`)

Pour téléverser plusieurs fichiers en gérant la concurrence et la progression individuelle :

```ts
const results = await uploader.uploadMany(files, {
  concurrency: 3,
  onTaskUpdate: (task) => {
    // task.status: 'idle' | 'compressing' | 'uploading' | 'completed' | 'error'
    // task.progress: 0..100
    console.log(`${task.fileName}: ${task.status} (${task.progress}%)`);
  },
});
```

---

## 5. Composants UI Liés

- **Web** : `@rashwright/ui/web`
  - `AdvancedUpload` : Téléversement d'image unitaire avec recadrage, compression et tiroir de sélection interne.
  - `AdvancedMultiUpload` : Téléversement par lot avec carrousel, réorganisation et suppression.
  - `AdvancedVideoUpload` : Téléversement de vidéos avec lecteur de prévisualisation et suivi du pourcentage par XMLHttpRequest.
- **Mobile** : `@rashwright/ui/mobile`
  - `UploadImage` : Sélecteur photo Expo avec optimisation et intégration Cloudinary.
  - `UploadVideo` : Sélecteur vidéo Expo.
