/**
 * @rashwright/upload — providers/mock-provider.ts
 *
 * Provider d'upload factice pour le développement hors-ligne et les tests.
 */

import type { IUploadProvider, UploadSource, UploadOptions, UploadResult } from '../types.js';

export interface MockProviderOptions {
  /** Durée simulée de l'upload en millisecondes. Par défaut : 500ms. */
  delayMs?: number;
  /** Simuler un échec. */
  shouldFail?: boolean;
}

export class MockUploadProvider implements IUploadProvider {
  public readonly name = 'mock';

  constructor(private readonly options: MockProviderOptions = {}) {}

  async upload(source: UploadSource, options: UploadOptions = {}): Promise<UploadResult> {
    const delay = this.options.delayMs ?? 500;

    if (options.onProgress) {
      options.onProgress(25);
      await new Promise((r) => setTimeout(r, delay / 3));
      options.onProgress(65);
      await new Promise((r) => setTimeout(r, delay / 3));
      options.onProgress(100);
      await new Promise((r) => setTimeout(r, delay / 3));
    } else {
      await new Promise((r) => setTimeout(r, delay));
    }

    if (this.options.shouldFail) {
      throw new Error('Échec simulé du téléversement.');
    }

    const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const mockUrl = `https://mock-storage.rashwright.dev/${mockId}/${source.name}`;

    return {
      success: true,
      url: mockUrl,
      publicId: mockId,
      bytes: source.size ?? 1024,
      format: source.name.split('.').pop() ?? 'bin',
      originalSize: source.size,
    };
  }

  async delete(): Promise<boolean> {
    return true;
  }
}
