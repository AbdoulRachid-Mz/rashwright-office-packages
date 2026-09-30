# @rashwright/upload

Moteur d'upload et de gestion de médias agnostique pour Web et Mobile.

## Installation

```bash
bun add @rashwright/upload @rashwright/core @rashwright/utils @rashwright/logger
```

## Utilisation

```ts
import { createUploader, CloudinaryProvider, MockUploadProvider } from '@rashwright/upload';

// Initialisation du provider sans clé codée en dur
const provider = new CloudinaryProvider({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  defaultUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET!,
  defaultFolder: 'properties',
});

const uploader = createUploader({ provider });

// Upload unitaire (Web File / Blob ou Mobile URI)
const result = await uploader.upload(
  {
    file: myFile, // ou uri: 'file://...'
    name: 'photo.jpg',
    type: 'image/jpeg',
  },
  {
    onProgress: (p) => console.log(`Progression: ${p}%`),
  }
);

console.log(result.url, result.publicId);

// Upload multiple concurrent avec suivi
const results = await uploader.uploadMany(files, {
  concurrency: 3,
  onTaskUpdate: (task) => {
    console.log(`Fichier ${task.fileName} : ${task.status} (${task.progress}%)`);
  },
});
```
