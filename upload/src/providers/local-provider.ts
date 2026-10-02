/**
 * @rashwright/upload — local-provider.ts
 *
 * Fournisseur de stockage pour serveur Local / API REST personnalisée (ex: /api/upload, express, nest).
 */

import type { IUploadProvider, UploadSource, UploadOptions, UploadResult } from '../types.js';

export interface LocalUploadConfig {
  endpoint: string;
  headers?: Record<string, string> | undefined;
  fieldName?: string | undefined;
}

export class LocalUploadProvider implements IUploadProvider {
  readonly name = 'local';
  private readonly endpoint: string;
  private readonly headers: Record<string, string>;
  private readonly fieldName: string;

  constructor(config: LocalUploadConfig) {
    this.endpoint = config.endpoint;
    this.headers = config.headers || {};
    this.fieldName = config.fieldName || 'file';
  }

  async upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult> {
    const formData = new FormData();

    if (source.file) {
      formData.append(this.fieldName, source.file);
    } else if (source.uri) {
      formData.append(this.fieldName, {
        uri: source.uri,
        name: source.name,
        type: source.type || 'application/octet-stream',
      } as any);
    } else if (source.base64) {
      formData.append(this.fieldName, source.base64);
    }

    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload Local/API failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url || data.path || data.secureUrl,
      publicId: data.id || data.publicId || data.filename,
      bytes: data.size || data.bytes,
    };
  }

  async delete(publicId: string): Promise<boolean> {
    const response = await fetch(`${this.endpoint}/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    return response.ok;
  }
}
