import i18n, { type SupportedLanguage } from "@/configs/i18n";
import { ThemeMode } from "@/constants/theme";
import { mmkvStorage } from "@/lib/storage/mmkv-storage";
import { authApi, usersApi } from "@/services/api";
import { authService } from "@/services/firebase/auth.service";
import type {
  Organization,
  OrganizationWithStats,
  User,
  UserPreferences,
} from "@/types";
import { I18nManager } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/* ───────────────────────────────────────────────────────────────────── */
/* 1. ÉTAT SESSION AUTH                                                  */
/* ───────────────────────────────────────────────────────────────────── */

interface AuthSessionState {
  user: User | null;
  currentOrganization: Organization | null;
  firebaseUid: string | null;
  authToken: string | null;
  isOnboarded: boolean;
  isAnonymous: boolean;
  // ← NOUVEAU : pour suivre l'état de synchronisation
  isSessionHydrated: boolean;
  setUser: (user: User | null) => void;
  setCurrentOrganization: (org: OrganizationWithStats | null) => void;
  setAuthSession: (data: {
    user: User;
    firebaseUid: string;
    authToken: string;
    isAnonymous?: boolean;
  }) => void;
  clearAuth: () => void;
  setOnboarded: (val: boolean) => void;
  updateUser: (patch: Partial<User>) => void;
  hydrateSession: (data: {
    user: User;
    currentOrganization?: Organization | null;
    firebaseUid?: string | null;
    authToken?: string | null;
  }) => void;
  /** Appelle /auth/me pour hydrater la session depuis l'API */
  hydrateSessionFromApi: () => Promise<{
    user: User | null;
    organization: Organization | null;
  }>;
  /** Rafraîchit user + organization depuis /auth/me */
  refreshSession: () => Promise<{
    user: User | null;
    organization: Organization | null;
  }>;
  persistPreferencesToApi: () => void;
  /** Marque la session comme hydratée */
  setSessionHydrated: (hydrated: boolean) => void;
}

/* ───────────────────────────────────────────────────────────────────── */
/* 2. ÉTAT SÉCURITÉ                                                      */
/* ───────────────────────────────────────────────────────────────────── */

interface SecurityState {
  isAppLockEnabled: boolean;
  lockTimeoutMinutes: number;
  lastBackgroundTime: number | null;
  biometricEnabled: boolean;
  setAppLockEnabled: (enabled: boolean) => void;
  setLockTimeoutMinutes: (minutes: number) => void;
  setLastBackgroundTime: (time: number | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
}

/* ───────────────────────────────────────────────────────────────────── */
/* 3. ÉTAT PRÉFÉRENCES                                                   */
/* ───────────────────────────────────────────────────────────────────── */

interface PreferencesState {
  themeMode: ThemeMode;
  liquidGlassEnabled: boolean;
  language: SupportedLanguage;
  notificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  marketingEmailsEnabled: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setLiquidGlassEnabled: (enabled: boolean) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  setMarketingEmailsEnabled: (enabled: boolean) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  /** Applique la langue immédiatement (i18n + I18nManager RTL) */
  applyLanguage: (lang: SupportedLanguage) => void;
  /** Persiste préférences vers PATCH /users/:id (debounced 1s) */
  persistPreferencesToApi: () => void;
}

export type AppStoreState = AuthSessionState &
  SecurityState &
  PreferencesState & {
    /* ─── Meta helpers ─── */
    /** Selecteur pur — utile sans hook */
    isAuthenticated: boolean;
    /** true si connecté et non-anonyme */
    isFullyAuthenticated: boolean;
  };

/* ───────────────────────────────────────────────────────────────────── */
/* 4. Mise à jour de la langue i18n + I18nManager (effet de bord)       */
/* ───────────────────────────────────────────────────────────────────── */

function applyI18nSideEffects(lang: SupportedLanguage): void {
  try {
    if (i18n.isInitialized && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  } catch {
    /* silence */
  }
  try {
    const rtlWanted = lang === "ar";
    if (I18nManager.isRTL !== rtlWanted) {
      I18nManager.allowRTL(rtlWanted);
      I18nManager.forceRTL(rtlWanted);
    }
  } catch {
    /* silence */
  }
}

/* ───────────────────────────────────────────────────────────────────── */
/* 5. STORE FINAL                                                        */
/* ───────────────────────────────────────────────────────────────────── */

let _prefDebounce: ReturnType<typeof setTimeout> | null = null;

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      /* ─────────────────────────────────────────────── */
      /* SESSION AUTH                                    */
      /* ─────────────────────────────────────────────── */
      user: null,
      currentOrganization: null,
      firebaseUid: null,
      authToken: null,
      isOnboarded: false,
      isAnonymous: false,
      isAuthenticated: false,
      isFullyAuthenticated: false,
      isSessionHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user && !!get().firebaseUid,
          isFullyAuthenticated:
            !!user && !!get().firebaseUid && !get().isAnonymous,
        }),

      setCurrentOrganization: (currentOrganization) =>
        set({ currentOrganization }),

      setAuthSession: ({ user, firebaseUid, authToken, isAnonymous = false }) =>
        set({
          user,
          firebaseUid,
          authToken,
          isAnonymous,
          isAuthenticated: true,
          isFullyAuthenticated: !isAnonymous,
          isSessionHydrated: false, // ← Réinitialiser l'état hydraté
        }),

      clearAuth: () =>
        set({
          user: null,
          currentOrganization: null,
          firebaseUid: null,
          authToken: null,
          isAnonymous: false,
          isAuthenticated: false,
          isFullyAuthenticated: false,
          isSessionHydrated: false,
        }),

      setOnboarded: (isOnboarded) => set({ isOnboarded }),

      setSessionHydrated: (isSessionHydrated) => set({ isSessionHydrated }),

      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),

      hydrateSession: ({ user, currentOrganization, firebaseUid, authToken }) =>
        set((state) => ({
          user,
          currentOrganization: currentOrganization ?? state.currentOrganization,
          firebaseUid: firebaseUid ?? state.firebaseUid,
          authToken: authToken ?? state.authToken,
          isAuthenticated: true,
          isSessionHydrated: true,
        })),

      hydrateSessionFromApi: async () => {
        try {
          const liveToken = await authService.getIdToken(false);
          if (!liveToken) {
            console.warn(
              "⚠️ Pas de session Firebase active pour hydrateSessionFromApi",
            );
            return { user: null, organization: null };
          }

          let res = await authApi.syncUser().catch(() => null);
          if (!res?.data?.user) {
            res = await authApi.getMe().catch(() => null);
          }

          const data = res?.data as unknown as {
            user: User;
            organization?: Organization | null;
            firebase?: { uid: string };
          };

          if (data?.user) {
            // Priorité : organisation retournée par l'API, sinon celle déjà en store
            let org: Organization | null =
              data.organization ?? get().currentOrganization ?? null;

            set({
              user: data.user,
              currentOrganization: org,
              isAuthenticated: true,
              isSessionHydrated: true,
            });
            return { user: data.user, organization: org };
          }

          return { user: null, organization: null };
        } catch (error: any) {
          console.error("❌ Erreur hydrateSessionFromApi:", {
            message: error.message,
            status: error.statusCode || error.status,
            code: error.code,
            data: error.data,
          });
          return { user: null, organization: null };
        }
      },

      refreshSession: async () => {
        try {
          let res = await authApi.syncUser().catch(() => null);
          if (!res?.data?.user) {
            res = await authApi.getMe().catch(() => null);
          }

          const data = res?.data as unknown as {
            user: User;
            organization: Organization | null;
          };

          if (data?.user) {
            set({
              user: data.user,
              currentOrganization:
                data.organization ?? get().currentOrganization,
              isAuthenticated: true,
              isSessionHydrated: true,
            });
            return { user: data.user, organization: data.organization ?? null };
          }

          return { user: null, organization: null };
        } catch (error: any) {
          console.error("❌ Erreur refreshSession:", {
            message: error.message,
            status: error.statusCode || error.status,
            code: error.code,
            data: error.data,
          });
          return { user: null, organization: null };
        }
      },

      /* ─────────────────────────────────────────────── */
      /* SÉCURITÉ                                        */
      /* ─────────────────────────────────────────────── */
      isAppLockEnabled: false,
      lockTimeoutMinutes: 5,
      lastBackgroundTime: null,
      biometricEnabled: false,

      setAppLockEnabled: (isAppLockEnabled) => set({ isAppLockEnabled }),
      setLockTimeoutMinutes: (lockTimeoutMinutes) =>
        set({ lockTimeoutMinutes }),
      setLastBackgroundTime: (lastBackgroundTime) =>
        set({ lastBackgroundTime }),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),

      /* ─────────────────────────────────────────────── */
      /* PRÉFÉRENCES                                     */
      /* ─────────────────────────────────────────────── */
      themeMode: "system",
      liquidGlassEnabled: false,
      language: "fr",
      notificationsEnabled: true,
      pushNotificationsEnabled: true,
      marketingEmailsEnabled: false,

      setThemeMode: (themeMode) => {
        set({ themeMode });
        set((s) =>
          s.user
            ? {
                user: {
                  ...s.user,
                  preferences: {
                    ...s.user.preferences,
                    theme: themeMode as UserPreferences["theme"],
                  },
                },
              }
            : {},
        );
        get().persistPreferencesToApi();
      },

      setLiquidGlassEnabled: (liquidGlassEnabled) => {
        set({ liquidGlassEnabled });
      },

      applyLanguage: (lang) => {
        applyI18nSideEffects(lang);
        set({ language: lang });
        set((s) =>
          s.user
            ? {
                user: {
                  ...s.user,
                  language: lang as User["language"],
                  preferences: {
                    ...s.user.preferences,
                    language: lang as UserPreferences["language"],
                  },
                },
              }
            : {},
        );
        get().persistPreferencesToApi();
      },

      setLanguage: (lang) => get().applyLanguage(lang),

      setNotificationsEnabled: (notificationsEnabled) => {
        set({ notificationsEnabled });
        set((s) =>
          s.user
            ? {
                user: {
                  ...s.user,
                  preferences: {
                    ...s.user.preferences,
                    notifications: notificationsEnabled,
                  },
                },
              }
            : {},
        );
        get().persistPreferencesToApi();
      },

      setPushNotificationsEnabled: (pushNotificationsEnabled) =>
        set({ pushNotificationsEnabled }),

      setMarketingEmailsEnabled: (marketingEmailsEnabled) =>
        set({ marketingEmailsEnabled }),

      setPreferences: (prefs) => {
        const s = get();
        if (prefs.language) {
          s.applyLanguage(prefs.language as SupportedLanguage);
        }
        set((state) => ({
          themeMode: (prefs.theme as ThemeMode) ?? state.themeMode,
          language: (prefs.language as SupportedLanguage) ?? state.language,
          notificationsEnabled:
            prefs.notifications ?? state.notificationsEnabled,
        }));
      },

      persistPreferencesToApi: () => {
        if (_prefDebounce) clearTimeout(_prefDebounce);
        _prefDebounce = setTimeout(async () => {
          _prefDebounce = null;
          const s = get();
          if (!s.user) return;
          try {
            await usersApi.update(s.user.id, {
              preferences: {
                theme:
                  (s.themeMode as UserPreferences["theme"]) ??
                  s.user.preferences?.theme,
                language:
                  (s.language as UserPreferences["language"]) ??
                  s.user.preferences?.language,
                notifications: s.notificationsEnabled,
              },
            });
          } catch {
            /* Silencieux : la persistance AsyncStorage (persist middleware) fera office de fallback */
          }
        }, 1000);
      },
    }),
    {
      name: "immo360-app-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
        currentOrganization: state.currentOrganization,
        firebaseUid: state.firebaseUid,
        isOnboarded: state.isOnboarded,
        isSessionHydrated: state.isSessionHydrated,

        // Sécurité
        isAppLockEnabled: state.isAppLockEnabled,
        lockTimeoutMinutes: state.lockTimeoutMinutes,
        lastBackgroundTime: state.lastBackgroundTime,
        biometricEnabled: state.biometricEnabled,

        // Préférences
        themeMode: state.themeMode,
        liquidGlassEnabled: state.liquidGlassEnabled,
        language: state.language,
        notificationsEnabled: state.notificationsEnabled,
        pushNotificationsEnabled: state.pushNotificationsEnabled,
        marketingEmailsEnabled: state.marketingEmailsEnabled,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) return;
          if (state) {
            applyI18nSideEffects(state.language);
            state.isAuthenticated = !!state.firebaseUid;
            state.isFullyAuthenticated =
              !!state.firebaseUid && !state.isAnonymous;
            // Ne pas auto-sync ici car on a besoin du x-app-id
          }
        };
      },
    },
  ),
);

/* ───────────────────────────────────────────────────────────────────── */
/* 6. SELECTORS exportés (utilisables dans useAppStore.withSelector)     */
/* ───────────────────────────────────────────────────────────────────── */

export function selectAuthToken(state: AppStoreState): string | null {
  return state.authToken;
}

export function selectCurrentUser(state: AppStoreState): User | null {
  return state.user;
}

export function selectIsAuthenticated(state: AppStoreState): boolean {
  return !!state.user && !!state.firebaseUid;
}

export function selectThemeMode(state: AppStoreState): ThemeMode {
  return state.themeMode;
}

export function selectLanguage(state: AppStoreState): SupportedLanguage {
  return state.language;
}
