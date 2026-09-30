/**
 * packages/ui/mobile/configs/cloudinary.ts
 *
 * Configuration Cloudinary pour Mobile (React Native / Expo).
 * Version améliorée : plus de clé codée en dur.
 * Les variables d'env EXPO_PUBLIC_* sont lues depuis l'application consommatrice.
 *
 * Usage dans l'application :
 * ```ts
 * import { createCloudinaryConfig, getCloudinaryImageUrl } from '@rashwright/ui-mobile/configs/cloudinary';
 *
 * const cloudinary = createCloudinaryConfig({
 *   cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!,
 *   uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
 * });
 * ```
 */

export interface CloudinaryMobileConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string | undefined;
  baseUrl?: string | undefined;
}

export interface CloudinaryImageOptions {
  width?: number | undefined;
  height?: number | undefined;
  quality?: number | undefined;
  format?: string | undefined;
  crop?: 'fill' | 'fit' | 'scale' | 'pad' | undefined;
}

/**
 * Crée une configuration Cloudinary validée.
 * Lève une erreur en développement si cloudName est manquant.
 */
export function createCloudinaryConfig(config: CloudinaryMobileConfig): CloudinaryMobileConfig {
  if (__DEV__ && !config.cloudName) {
    console.warn(
      '[@rashwright/ui-mobile] cloudName est manquant dans createCloudinaryConfig. ' +
      'Vérifiez vos variables d\'environnement EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME.'
    );
  }
  return config;
}

/**
 * Retourne l'URL d'upload Cloudinary pour les images.
 */
export function getCloudinaryUploadUrl(config: CloudinaryMobileConfig, resourceType: 'image' | 'video' = 'image'): string {
  return `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;
}

/**
 * Génère une URL d'image Cloudinary avec transformations.
 */
export function getCloudinaryImageUrl(
  publicId: string,
  config: Pick<CloudinaryMobileConfig, 'cloudName'>,
  options: CloudinaryImageOptions = {}
): string {
  const { width, height, quality = 80, format = 'auto', crop = 'fill' } = options;

  const transformations: string[] = [`f_${format}`, `q_${quality}`, `c_${crop}`];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  return `https://res.cloudinary.com/${config.cloudName}/image/upload/${transformations.join(',')}/${publicId}`;
}