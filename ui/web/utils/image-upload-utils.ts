/**
 * packages/ui/web/utils/image-upload-utils.ts
 *
 * Version améliorée — Sans couplage Cloudinary codé en dur.
 * Les composants UI reçoivent cloudName / uploadPreset via leurs props.
 *
 * Cette version expose uniquement :
 * - compressImage : compression via browser-image-compression
 * - uploadToCloudinary : délègue à @rashwright/upload CloudinaryProvider
 * - getImageCategories : récupération de dossiers depuis l'API Next.js
 * - formatFileSize : alias de @rashwright/utils formatBytes
 */

import { CloudinaryProvider } from '@rashwright/upload';
import type { UploadResult } from '@rashwright/upload';
import { formatBytes } from '@rashwright/utils';

// Re-export formatBytes sous l'ancien nom pour la compatibilité descendante
export const formatFileSize = (bytes: number): string => formatBytes(bytes, 2);

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  uploadPath?: string;
  uploadPreset?: string;
  cloudName?: string;
}

export interface UploadProgress {
  progress: number;
  status: 'compressing' | 'uploading' | 'complete' | 'error';
}

export interface ImageCategory {
  name: string;
  path: string;
  displayName: string;
  images: ImageInfo[];
  hasSubfolders: boolean;
  totalImages: number;
  icon?: string;
}

export interface ImageInfo {
  url: string;
  name: string;
  size: number;
  extension: string;
  lastModified: number;
}

export interface ImageFilters {
  withSubfolders?: boolean;
  maxSize?: number;
  minSize?: number;
  extensions?: string[];
  limit?: number;
  sortBy?: 'name' | 'size' | 'date';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  folder?: string;
}

// ─── Compression ─────────────────────────────────────────────────────────────

/**
 * Compresse une image côté client via browser-image-compression.
 * browser-image-compression doit être installé dans le projet consommateur.
 */
export const compressImage = async (
  file: File,
  options: {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    onProgress?: (progress: number) => void;
  }
): Promise<File> => {
  // Import dynamique pour éviter le bundle côté serveur
  const { default: imageCompression } = await import('browser-image-compression');

  return await imageCompression(file, {
    maxSizeMB: options.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight,
    useWebWorker: true,
    onProgress: options.onProgress,
  });
};

// ─── Upload vers Cloudinary ───────────────────────────────────────────────────

/**
 * Téléverse un fichier vers Cloudinary via @rashwright/upload CloudinaryProvider.
 * cloudName et uploadPreset sont OBLIGATOIRES — aucune valeur codée en dur.
 */
export const uploadToCloudinary = async (
  file: File,
  options: UploadOptions & { onProgress?: (progress: number) => void } = {}
): Promise<{ success: boolean; url?: string; error?: string; originalSize?: number; compressedSize?: number }> => {
  const { cloudName, uploadPreset, uploadPath, onProgress } = options;

  if (!cloudName) {
    return { success: false, error: 'cloudName est requis pour l\'upload Cloudinary.' };
  }

  if (!uploadPreset) {
    return { success: false, error: 'uploadPreset est requis pour l\'upload Cloudinary.' };
  }

  try {
    const provider = new CloudinaryProvider({
      cloudName,
      defaultUploadPreset: uploadPreset,
      defaultFolder: uploadPath,
    });

    const result: UploadResult = await provider.upload(
      {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      },
      {
        folder: uploadPath,
        preset: uploadPreset,
        onProgress,
      }
    );

    return {
      success: true,
      url: result.url,
      originalSize: result.originalSize,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur d\'upload inconnue';
    return { success: false, error: message };
  }
};

// ─── Sélection d'images internes ─────────────────────────────────────────────

/**
 * Récupère les catégories d'images depuis une API Next.js locale.
 * Le chemin de l'endpoint doit être configuré dans l'application consommatrice.
 */
export const getImageCategories = async (
  folder: string,
  filters: ImageFilters = {},
  apiEndpoint: string = '/api/images/categories'
): Promise<ImageCategory[]> => {
  try {
    const params = new URLSearchParams();
    params.set('folder', folder);
    if (filters.withSubfolders !== undefined) params.set('withSubfolders', String(filters.withSubfolders));
    if (filters.maxSize !== undefined) params.set('maxSize', String(filters.maxSize));
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.search) params.set('search', filters.search);

    const response = await fetch(`${apiEndpoint}?${params.toString()}`);
    if (!response.ok) return [];

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as ImageCategory[]) : [];
  } catch {
    return [];
  }
};