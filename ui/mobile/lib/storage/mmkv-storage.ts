// @/lib/storage/mmkv-storage.ts

import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * ============================================================
 * ENVIRONMENT
 * ============================================================
 */

const isExpoGo =
  Constants.appOwnership === "expo";

const isWeb = Platform.OS === "web";

/**
 * Expo Go ne contient pas le runtime natif de MMKV/Nitro.
 *
 * IMPORTANT :
 * On ne doit surtout pas importer MMKV en haut du fichier.
 * Sinon le module natif est résolu avant même que cette condition
 * puisse être évaluée.
 */
const shouldUseMMKV =
  !isExpoGo && !isWeb;

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

type StorageValue =
  | string
  | number
  | boolean
  | object
  | null
  | undefined;

/**
 * ============================================================
 * FALLBACK MEMORY STORAGE
 * ============================================================
 *
 * Utilisé uniquement :
 * - Expo Go
 * - Web
 *
 * Ce fallback est volontairement synchrone afin de conserver
 * exactement la même API que MMKV.
 *
 * ATTENTION :
 * Les données sont perdues lors d'un reload complet de l'app.
 * Elles ne sont pas destinées à la production.
 */

const memoryStorage = new Map<string, StorageValue>();

const memoryAdapter = {
  getString(key: string): string | undefined {
    const value = memoryStorage.get(key);

    if (typeof value === "string") {
      return value;
    }

    return undefined;
  },

  set(
    key: string,
    value: string | number | boolean
  ): void {
    memoryStorage.set(key, value);
  },

  remove(key: string): void {
    memoryStorage.delete(key);
  },

  clearAll(): void {
    memoryStorage.clear();
  },

  getAllKeys(): string[] {
    return Array.from(memoryStorage.keys());
  },

  get size(): number {
    let size = 0;

    for (const value of memoryStorage.values()) {
      if (typeof value === "string") {
        size += value.length;
      } else {
        size += JSON.stringify(value)?.length ?? 0;
      }
    }

    return size;
  },
};

/**
 * ============================================================
 * MMKV ADAPTER
 * ============================================================
 *
 * Chargé uniquement hors Expo Go / Web.
 */

type StorageAdapter = {
  getString: (key: string) => string | undefined;
  set: (
    key: string,
    value: string | number | boolean
  ) => void;
  remove: (key: string) => void;
  clearAll: () => void;
  getAllKeys: () => string[];
  size: number;
};

let storage: StorageAdapter = memoryAdapter;

/**
 * Charge MMKV uniquement lorsqu'il est disponible.
 */
if (shouldUseMMKV) {
  try {
    // IMPORTANT :
    // Ne jamais transformer cet import en import statique.
    // Le require est volontairement conditionnel.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MMKVModule = require("react-native-mmkv");

    const mmkv = MMKVModule.createMMKV({
      id: "immo360-storage",

      encryptionKey:
        process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY ||
        "immo360-secure-key",
    });

    storage = mmkv;

    console.log("✅ MMKV activé");
  } catch (error) {
    /**
     * Si MMKV n'est pas disponible malgré tout :
     * on ne crash PAS l'application.
     */
    console.warn(
      "⚠️ MMKV indisponible, fallback mémoire activé.",
      error
    );

    storage = memoryAdapter;
  }
} else {
  console.log(
    isExpoGo
      ? "ℹ️ Expo Go détecté → MMKV ignoré, fallback mémoire activé."
      : "ℹ️ Web détecté → MMKV ignoré, fallback mémoire activé."
  );
}

/**
 * ============================================================
 * EXPORT MMKV
 * ============================================================
 *
 * Tu peux continuer à l'utiliser ailleurs si nécessaire.
 *
 * En Expo Go, ce n'est pas une vraie instance MMKV.
 */
export const mmkv = storage;

/**
 * ============================================================
 * ZUSTAND STORAGE
 * ============================================================
 */

export const mmkvStorage = {
  getItem: (
    key: string
  ): string | null => {
    try {
      return storage.getString(key) ?? null;
    } catch (error) {
      console.error(
        `Storage getItem error [${key}]`,
        error
      );

      return null;
    }
  },

  setItem: (
    key: string,
    value: string
  ): void => {
    try {
      storage.set(key, value);
    } catch (error) {
      console.error(
        `Storage setItem error [${key}]`,
        error
      );
    }
  },

  removeItem: (
    key: string
  ): void => {
    try {
      storage.remove(key);
    } catch (error) {
      console.error(
        `Storage removeItem error [${key}]`,
        error
      );
    }
  },
};

/**
 * ============================================================
 * APP STORAGE
 * ============================================================
 */

export const AppStorage = {
  // ----------------------------------------------------------
  // Général
  // ----------------------------------------------------------

  getItem<T = string>(
    key: string
  ): T | null {
    try {
      const value = storage.getString(key);

      if (value === undefined) {
        return null;
      }

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(
        `Storage getItem error [${key}]`,
        error
      );

      return null;
    }
  },

  setItem<T>(
    key: string,
    value: T
  ): boolean {
    try {
      const valueToStore =
        typeof value === "string"
          ? value
          : JSON.stringify(value);

      storage.set(
        key,
        valueToStore
      );

      return true;
    } catch (error) {
      console.error(
        `Storage setItem error [${key}]`,
        error
      );

      return false;
    }
  },

  removeItem(
    key: string
  ): boolean {
    try {
      storage.remove(key);

      return true;
    } catch (error) {
      console.error(
        `Storage removeItem error [${key}]`,
        error
      );

      return false;
    }
  },

  clear(): boolean {
    try {
      storage.clearAll();

      return true;
    } catch (error) {
      console.error(
        "Storage clear error",
        error
      );

      return false;
    }
  },

  // ----------------------------------------------------------
  // Session
  // ----------------------------------------------------------

  getSession(): string | null {
    return AppStorage.getItem<string>(
      "immo360_session_uid"
    );
  },

  setSession(
    uid: string
  ): boolean {
    return AppStorage.setItem(
      "immo360_session_uid",
      uid
    );
  },

  removeSession(): boolean {
    return AppStorage.removeItem(
      "immo360_session_uid"
    );
  },

  // ----------------------------------------------------------
  // Device
  // ----------------------------------------------------------

  getCurrentDeviceId(): string | null {
    return AppStorage.getItem<string>(
      "immo360_device_id"
    );
  },

  setCurrentDeviceId(
    deviceId: string
  ): boolean {
    return AppStorage.setItem(
      "immo360_device_id",
      deviceId
    );
  },

  // ----------------------------------------------------------
  // Queue
  // ----------------------------------------------------------

  getQueue<T = unknown>(
    key: string
  ): T[] {
    return (
      AppStorage.getItem<T[]>(key) ?? []
    );
  },

  setQueue<T>(
    key: string,
    items: T[]
  ): boolean {
    return AppStorage.setItem(
      key,
      items
    );
  },

  // ----------------------------------------------------------
  // Query cache
  // ----------------------------------------------------------

  getQueryCache<T = unknown>(
    key: string
  ): T | null {
    return AppStorage.getItem<T>(
      `query_cache_${key}`
    );
  },

  setQueryCache<T>(
    key: string,
    data: T
  ): boolean {
    return AppStorage.setItem(
      `query_cache_${key}`,
      data
    );
  },

  // ----------------------------------------------------------
  // Stats
  // ----------------------------------------------------------

  getStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: storage.size,
      keys: storage.getAllKeys(),
    };
  },

  // ----------------------------------------------------------
  // Environment
  // ----------------------------------------------------------

  isMMKVEnabled(): boolean {
    return shouldUseMMKV &&
      storage !== memoryAdapter;
  },

  isFallbackStorage(): boolean {
    return storage === memoryAdapter;
  },

  isExpoGo(): boolean {
    return isExpoGo;
  },
};

export default AppStorage;