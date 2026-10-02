/**
 * @rashwright/upload — vercel-blob-provider.ts
 *
 * Fournisseur de stockage pour Vercel Blob (Web & React Native).
 */

import type { IUploadProvider, UploadSource, UploadOptions, UploadResult } from '../types.js';

export interface VercelBlobConfig {
  token?: string | undefined;
  uploadEndpoint?: string | undefined; // Endpoint serveur proxy si token non exposé côté client
}

export class VercelBlobProvider implements IUploadProvider {
  readonly name = 'vercel-blob';
  private readonly token?: string | undefined;
  private readonly uploadEndpoint?: string | undefined;

  constructor(config: VercelBlobConfig) {
    this.token = config.token;
    this.uploadEndpoint = config.uploadEndpoint;
  }

  async upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult> {
    const fileName = `${options?.folder ? `${options.folder}/` : ''}${Date.now()}_${source.name}`;

    // If custom API endpoint proxy is provided (recommended for client-side uploads)
    if (this.uploadEndpoint) {
      const formData = new FormData();
      if (source.file) {
        formData.append('file', source.file);
      } else if (source.uri) {
        formData.append('file', {
          uri: source.uri,
          name: source.name,
          type: source.type || 'application/octet-stream',
        } as any);
      }
      formData.append('pathname', fileName);

      const res = await fetch(this.uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload Vercel Blob proxy failed (${res.status})`);
      }

      const blobData = await res.json();
      return {
        success: true,
        url: blobData.url,
        publicId: blobData.pathname || fileName,
        bytes: blobData.size,
      };
    }

    if (!this.token) {
      throw new Error('Vercel Blob token ou uploadEndpoint requis.');
    }

    // Direct upload to Vercel Blob API
    const response = await fetch(`https://blob.vercel-storage.com/${fileName}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${this.token}`,
        'x-add-random-suffix': 'true',
      },
      body: (source.file || (source.uri ? ({ uri: source.uri } as any) : source.base64)) as any,
    });

    if (!response.ok) {
      throw new Error(`Vercel Blob direct upload failed (${response.status})`);
    }

    const json = await response.json();
    return {
      success: true,
      url: json.url,
      publicId: json.pathname,
      bytes: json.size,
    };
  }
}
