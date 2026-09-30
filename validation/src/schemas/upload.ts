/**
 * @rashwright/validation — schemas/upload.ts
 *
 * Schémas Zod pour la validation de fichiers et payloads d'upload.
 */

import { z } from 'zod';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: readonly string[];
}

/**
 * Schéma de validation des métadonnées d'un fichier sélectionné.
 */
export function createFileMetadataSchema(options: FileValidationOptions = {}) {
  const maxSizeMB = options.maxSizeMB ?? 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = options.allowedMimeTypes ?? [
    ...ALLOWED_IMAGE_MIME_TYPES,
    ...ALLOWED_VIDEO_MIME_TYPES,
  ];

  return z.object({
    name: z.string().min(1, 'Nom de fichier requis'),
    size: z
      .number()
      .positive('Taille invalide')
      .max(maxSizeBytes, `La taille du fichier ne doit pas dépasser ${maxSizeMB} Mo`),
    type: z
      .string()
      .refine(
        (type) => allowedTypes.includes(type),
        `Format non autorisé. Formats acceptés : ${allowedTypes.join(', ')}`,
      ),
  });
}

/** Schéma de validation d'un payload média enregistré en base. */
export const mediaRecordSchema = z.object({
  url: z.string().url('URL de média invalide'),
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']).default('IMAGE'),
  size: z.number().int().nonnegative().optional(),
  name: z.string().optional(),
  position: z.number().int().default(0),
});

export type MediaRecordInput = z.infer<typeof mediaRecordSchema>;
