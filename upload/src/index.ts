/**
 * @rashwright/upload
 *
 * Barrel d'export principal pour le système d'upload Rashwright.
 */

// Types & Contrats
export type {
  UploadSource,
  UploadOptions,
  UploadResult,
  UploadStatus,
  UploadTaskState,
  IUploadProvider,
} from './types.js';

// Gestionnaire principal
export {
  UploadManager,
  createUploader,
  type UploadManagerOptions,
} from './upload-manager.js';

// Providers
export {
  CloudinaryProvider,
  type CloudinaryConfig,
} from './providers/cloudinary-provider.js';

export {
  FirebaseStorageProvider,
  type FirebaseStorageConfig,
} from './providers/firebase-provider.js';

export {
  VercelBlobProvider,
  type VercelBlobConfig,
} from './providers/vercel-blob-provider.js';

export {
  LocalUploadProvider,
  type LocalUploadConfig,
} from './providers/local-provider.js';

export {
  MockUploadProvider,
  type MockProviderOptions,
} from './providers/mock-provider.js';
