/**
 * packages/ui/web/lib/utils.ts
 *
 * Utilitaires locaux pour les composants UI Web.
 * cn() est requis par shadcn/ui — dépendance sur clsx + tailwind-merge.
 * formatBytes est exposé depuis @rashwright/utils.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export { formatBytes } from '@rashwright/utils';

/**
 * Utilitaire de fusion de classes Tailwind sécurisé.
 * Compatible avec shadcn/ui.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
