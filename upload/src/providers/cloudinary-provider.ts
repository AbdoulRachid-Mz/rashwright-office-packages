/**
 * @rashwright/upload — providers/cloudinary-provider.ts
 *
 * Provider d'upload Cloudinary universel (Web & Mobile).
 * Aucune clé codée en dur : tout est injecté via CloudinaryConfig.
 */

import { UploadError } from '@rashwright/core';
import type { IUploadProvider, UploadSource, UploadOptions, UploadResult } from '../types.js';

export interface CloudinaryConfig {
  /** Nom de votre cloud Cloudinary. */
  cloudName: string;
  /** Upload preset non signé par défaut (si applicable). */
  defaultUploadPreset?: string;
  /** Dossier de destination par défaut. */
  defaultFolder?: string;
  /** Clé API (optionnelle pour uploads signés côté serveur). */
  apiKey?: string;
}

export class CloudinaryProvider implements IUploadProvider {
  public readonly name = 'cloudinary';

  constructor(private readonly config: CloudinaryConfig) {
    if (!config.cloudName) {
      throw new UploadError('CloudinaryProvider requiert un cloudName valide.');
    }
  }

  async upload(source: UploadSource, options: UploadOptions = {}): Promise<UploadResult> {
    const uploadPreset = options.preset ?? this.config.defaultUploadPreset;
    const folder = options.folder ?? this.config.defaultFolder;

    if (!uploadPreset) {
      throw new UploadError("Un upload_preset est requis pour l'upload non signé vers Cloudinary.");
    }

    const isVideo = source.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('upload_preset', uploadPreset);
    if (folder) formData.append('folder', folder);
    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    // Gestion multi-plateforme du payload de fichier
    if (source.file) {
      // Côté Web (File / Blob)
      formData.append('file', source.file);
    } else if (source.base64) {
      // Données Base64 ou Data URI
      formData.append('file', source.base64.startsWith('data:') ? source.base64 : `data:${source.type};base64,${source.base64}`);
    } else if (source.uri) {
      // Côté Mobile React Native (objet avec uri, name, type)
      formData.append('file', {
        uri: source.uri,
        name: source.name,
        type: source.type,
      } as unknown as Blob);
    } else {
      throw new UploadError('Source de fichier manquante (aucun file, uri ou base64 fourni).');
    }

    // Si supporté (navigateur ou environnement avec XMLHttpRequest), utiliser XHR pour le suivi de progression
    if (typeof XMLHttpRequest !== 'undefined') {
      return new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);

        if (xhr.upload && options.onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              options.onProgress?.(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve({
                success: true,
                url: res.secure_url || res.url,
                publicId: res.public_id,
                format: res.format,
                bytes: res.bytes,
                width: res.width,
                height: res.height,
                originalSize: source.size,
              });
            } catch (err) {
              reject(new UploadError('Erreur de parsing de la réponse Cloudinary.', err));
            }
          } else {
            reject(new UploadError(`Échec upload Cloudinary (${xhr.status}): ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => {
          reject(new UploadError('Erreur réseau lors du téléversement vers Cloudinary.'));
        };

        xhr.send(formData);
      });
    }

    // Fallback avec l'API Fetch standard
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new UploadError(`Échec upload Cloudinary (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url || data.url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
      originalSize: source.size,
    };
  }
}
