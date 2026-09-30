import { useEffect, useRef, useState, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAppStore } from "@/stores/app-store";
import { useBiometricAuth } from "./use-biometric-auth";

export function useAppLock() {
  const {
    isAppLockEnabled,
    lockTimeoutMinutes,
    lastBackgroundTime,
    setLastBackgroundTime,
  } = useAppStore();

  const { authenticate } = useBiometricAuth();

  /**
   * Important :
   * L'activation du App Lock ne signifie pas que l'application
   * doit être verrouillée immédiatement.
   *
   * Elle sera verrouillée uniquement lorsque l'utilisateur
   * reviendra après avoir dépassé le délai configuré.
   */
  const [isLocked, setIsLocked] = useState(false);

  /**
   * Ref utilisée pour conserver l'heure exacte de sortie
   * sans dépendre d'un nouveau render.
   */
  const backgroundTimeRef = useRef<number | null>(
    lastBackgroundTime ?? null,
  );

  const appState = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Synchroniser la ref avec la valeur persistée du store.
   *
   * Cela permet notamment de récupérer lastBackgroundTime
   * après la réhydratation de Zustand/MMKV.
   */
  useEffect(() => {
    backgroundTimeRef.current = lastBackgroundTime ?? null;
  }, [lastBackgroundTime]);

  /**
   * Vérifie si le délai configuré par l'utilisateur
   * est dépassé.
   */
  const checkLock = useCallback(() => {
    if (!isAppLockEnabled) {
      setIsLocked(false);
      return;
    }

    const backgroundTime = backgroundTimeRef.current;

    /**
     * Pas de sortie enregistrée.
     *
     * Exemple :
     * - première ouverture
     * - App Lock vient juste d'être activé
     */
    if (backgroundTime === null) {
      setIsLocked(false);
      return;
    }

    const elapsed = Date.now() - backgroundTime;

    const timeoutMinutes = lockTimeoutMinutes ?? 5;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    /**
     * 0 = verrouillage immédiat au retour.
     *
     * Sinon :
     * verrouillage uniquement si le délai choisi
     * par l'utilisateur est dépassé.
     */
    const shouldLock =
      timeoutMinutes === 0 ||
      elapsed >= timeoutMs;

    setIsLocked(shouldLock);
  }, [isAppLockEnabled, lockTimeoutMinutes]);

  /**
   * Surveillance du cycle de vie de l'application.
   */
  useEffect(() => {
    if (!isAppLockEnabled) {
      setIsLocked(false);
      return;
    }

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        const previousAppState = appState.current;

        /**
         * L'utilisateur quitte réellement l'application.
         *
         * On enregistre le timestamp une seule fois,
         * lors du passage ACTIVE → BACKGROUND.
         */
        if (
          previousAppState === "active" &&
          nextAppState === "background"
        ) {
          const now = Date.now();

          backgroundTimeRef.current = now;
          setLastBackgroundTime(now);
        }

        /**
         * L'utilisateur revient dans l'application.
         *
         * On utilise alors le délai configuré dans Settings.
         */
        if (
          previousAppState !== "active" &&
          nextAppState === "active"
        ) {
          checkLock();
        }

        appState.current = nextAppState;
      },
    );

    /**
     * Vérification initiale.
     *
     * Utile lorsqu'une ancienne valeur lastBackgroundTime
     * a été restaurée depuis MMKV.
     */
    /**
     * Vérification initiale différée.
     *
     * On attend que la navigation du splash soit terminée
     * avant de déclencher le verrou biométrique, sinon
     * l'application semble "crasher" au démarrage.
     */
    if (AppState.currentState === "active") {
      const initDelay = setTimeout(() => {
        checkLock();
      }, 1500);

      return () => {
        subscription.remove();
        clearTimeout(initDelay);
      };
    }

    return () => {
      subscription.remove();
    };
  }, [
    isAppLockEnabled,
    checkLock,
    setLastBackgroundTime,
  ]);

  /**
   * Déverrouillage biométrique / code appareil.
   */
  const unlock = useCallback(async () => {
    const success = await authenticate(
      "Déverrouiller Immo360",
    );

    if (success) {
      setIsLocked(false);

      /**
       * Une fois authentifié, l'ancien timestamp
       * ne doit plus provoquer un nouveau verrouillage.
       */
      backgroundTimeRef.current = null;
      setLastBackgroundTime(null);
    }

    return success;
  }, [authenticate, setLastBackgroundTime]);

  return {
    isLocked,
    unlock,
  };
}