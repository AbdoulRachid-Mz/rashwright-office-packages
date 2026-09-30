/**
 * @rashwright/validation — schemas/id.ts
 *
 * Schémas Zod pour la validation des identifiants (UUID, CUID, chaînes non vides, entiers).
 */

import { z } from 'zod';

/** Validation d'UUID v4 standard. */
export const uuidSchema = z
  .string()
  .uuid({ message: 'Identifiant UUID invalide' });

/** Validation d'un identifiant CUID / CUID2. */
export const cuidSchema = z
  .string()
  .min(10, { message: 'Identifiant CUID invalide' })
  .regex(/^[a-z0-9]+$/i, { message: 'Format CUID invalide' });

/** Validation d'identifiant générique non vide (chaîne après trim). */
export const idSchema = z
  .string()
  .trim()
  .min(1, { message: 'Identifiant requis' });

/** Validation d'identifiant numérique (convertit les strings en int positif). */
export const numericIdSchema = z.preprocess((val) => {
  const num = Number(val);
  return Number.isInteger(num) && num > 0 ? num : undefined;
}, z.number().int().positive({ message: 'Identifiant numérique invalide' }));

/** Helpers pour créer des schémas d'identifiants personnalisés. */
export function createIdSchema(fieldName: string = 'Identifiant') {
  return z
    .string()
    .trim()
    .min(1, { message: `${fieldName} est requis` });
}
