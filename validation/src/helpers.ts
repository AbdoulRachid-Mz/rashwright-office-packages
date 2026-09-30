/**
 * @rashwright/validation — helpers.ts
 *
 * Helpers utilitaires pour intégrer Zod avec l'écosystème d'erreurs Rashwright.
 */

import { z, type ZodError, type ZodSchema } from 'zod';
import { ValidationError, type Result, ok, err } from '@rashwright/core';

export interface FormattedZodIssue {
  field: string;
  message: string;
  code: string;
}

/**
 * Formate les erreurs Zod en un tableau lisible champ -> message.
 */
export function formatZodIssues(error: ZodError): FormattedZodIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Convertit une ZodError en ValidationError de @rashwright/core
 * avec les détails structurés des champs en erreur.
 */
export function toValidationError(error: ZodError, defaultMessage = 'Données de validation invalides'): ValidationError {
  const issues = formatZodIssues(error);
  const primaryMessage = issues[0]?.message ?? defaultMessage;
  return new ValidationError(primaryMessage, issues);
}

/**
 * Valide des données avec un schéma Zod et lève une ValidationError typée en cas d'échec.
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown, message?: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw toValidationError(result.error, message);
  }
  return result.data;
}

/**
 * Valide des données et retourne un Result<T, ValidationError> sans lever d'exception.
 */
export function safeValidate<T>(
  schema: ZodSchema<T>,
  data: unknown,
  message?: string,
): Result<T, ValidationError> {
  const result = schema.safeParse(data);
  if (result.success) {
    return ok(result.data);
  }
  return err(toValidationError(result.error, message));
}
