/**
 * @rashwright/core — result.ts
 *
 * Type Result<T, E> pour la gestion explicite succès / échec
 * sans lever d'exception (pattern Railway-Oriented Programming).
 */

export type Ok<T> = {
  readonly success: true
  readonly data: T
}

export type Err<E = Error> = {
  readonly success: false
  readonly error: E
}

export type Result<T, E = Error> = Ok<T> | Err<E>

/** Crée un résultat de succès. */
export function ok<T>(data: T): Ok<T> {
  return { success: true, data }
}

/** Crée un résultat d'échec. */
export function err<E = Error>(error: E): Err<E> {
  return { success: false, error }
}

/** Type-guard : retourne true si le résultat est Ok. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.success === true
}

/** Type-guard : retourne true si le résultat est Err. */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.success === false
}

/**
 * Exécute une fonction susceptible de lever une exception
 * et retourne un Result plutôt que de propager l'erreur.
 */
export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return ok(fn())
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)))
  }
}

/**
 * Version asynchrone de tryCatch.
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    return ok(await fn())
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)))
  }
}
