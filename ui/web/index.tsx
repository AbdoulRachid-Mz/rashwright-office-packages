/**
 * @rashwright/ui-web
 *
 * Point d'entrée principal pour la bibliothèque de composants Web Rashwright.
 */

// Utilitaires
export { cn, formatBytes } from './lib/utils.js';

// Composants d'upload avancés
export { AdvancedUpload } from './components/uploads/advanced-upload.js';
export { AdvancedMultiUpload } from './components/uploads/advanced-multi-upload.js';
export { AdvancedVideoUpload } from './components/uploads/advanced-video-upload.js';
export { AdvancedChart } from './components/uploads/advanced-chart.js';

// Helpers et types d'upload d'images
export {
  compressImage,
  uploadToCloudinary,
  getImageCategories,
  formatFileSize,
  type UploadOptions,
  type UploadProgress,
  type ImageCategory,
  type ImageInfo,
  type ImageFilters,
} from './utils/image-upload-utils.js';
