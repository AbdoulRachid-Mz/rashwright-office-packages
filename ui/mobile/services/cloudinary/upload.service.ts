/**
 * packages/ui/mobile/services/cloudinary/upload.service.ts
 *
 * Service d'upload Cloudinary pour Mobile (React Native / Expo).
 * Découplé et paramétrable via @rashwright/upload et les configurations d'environnement.
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { CloudinaryProvider } from '@rashwright/upload';

export interface MobileUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface MobileUploadOptions {
  onProgress?: (progress: number) => void;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  skipOptimization?: boolean;
  minSizeKb?: number;
  folder?: string;
  uploadPreset?: string;
  cloudName?: string;
}

export class CloudinaryUploadService {
  private static instance: CloudinaryUploadService;

  private constructor() {}

  static getInstance(): CloudinaryUploadService {
    if (!CloudinaryUploadService.instance) {
      CloudinaryUploadService.instance = new CloudinaryUploadService();
    }
    return CloudinaryUploadService.instance;
  }

  private async getFileSizeKb(uri: string): Promise<number> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || typeof (info as { size?: number }).size !== 'number') {
        return 0;
      }
      return ((info as { size: number }).size || 0) / 1024;
    } catch {
      return 0;
    }
  }

  async optimizeImage(uri: string, options: MobileUploadOptions = {}): Promise<string> {
    const {
      quality = 80,
      maxWidth = 1920,
      maxHeight = 1080,
      skipOptimization = false,
      minSizeKb = 300,
    } = options;

    if (skipOptimization) return uri;

    const currentSizeKb = await this.getFileSizeKb(uri);
    if (currentSizeKb > 0 && currentSizeKb <= minSizeKb) {
      return uri;
    }

    try {
      const actions: ImageManipulator.Action[] = [];
      if (maxWidth || maxHeight) {
        actions.push({
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        });
      }

      const result = await ImageManipulator.manipulateAsync(uri, actions, {
        compress: Math.max(0.1, Math.min(1, quality / 100)),
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return result.uri;
    } catch {
      return uri;
    }
  }

  async uploadImage(uri: string, options: MobileUploadOptions = {}): Promise<MobileUploadResult> {
    const cloudName = options.cloudName || process.env['EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME'] || '';
    const uploadPreset = options.uploadPreset || process.env['EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET'] || '';
    const folder = options.folder || 'uploads';

    if (!cloudName) {
      throw new Error('cloudName est requis pour l\'upload Cloudinary mobile.');
    }
    if (!uploadPreset) {
      throw new Error('uploadPreset est requis pour l\'upload Cloudinary mobile.');
    }

    const optimizedUri = await this.optimizeImage(uri, options);
    const provider = new CloudinaryProvider({
      cloudName,
      defaultUploadPreset: uploadPreset,
      defaultFolder: folder,
    });

    const res = await provider.upload(
      {
        uri: optimizedUri,
        name: `upload_${Date.now()}.jpg`,
        type: 'image/jpeg',
      },
      {
        folder,
        preset: uploadPreset,
        onProgress: options.onProgress,
      }
    );

    return {
      publicId: res.publicId || '',
      url: res.url,
      secureUrl: res.url,
      format: res.format || 'jpg',
      width: res.width || 0,
      height: res.height || 0,
      bytes: res.bytes || 0,
    };
  }
}
