
// @/configs/query-client.ts
import NetInfo from "@react-native-community/netinfo";
import {
  onlineManager,
  QueryClient,
  dehydrate,
  hydrate,
} from "@tanstack/react-query";
import { AppStorage } from "@/lib/storage/mmkv-storage";

/**
 * 1. Synchronisation de l'état réseau de TanStack Query avec NetInfo
 * Permet à React Query de savoir immédiatement si le device est en ligne ou hors ligne.
 */
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected === true && state.isInternetReachable !== false);
  });
});

/**
 * 2. Configuration du QueryClient en mode offline-first
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Ne pas réessayer sur les erreurs client 4xx (sauf timeout)
        if (
          error?.statusCode >= 400 &&
          error?.statusCode < 500 &&
          error?.statusCode !== 408
        ) {
          return false;
        }
        // Pas de retry en boucle si hors ligne
        if (!onlineManager.isOnline()) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5, // Données fraîches 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // Conservation en cache pendant 24h
      networkMode: "offlineFirst", // Priorité cache, aucune erreur bloquante si offline
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 0,
    },
  },
});

/**
 * 3. Persistance du cache React Query dans MMKV
 */
const CACHE_STORAGE_KEY = "immo360_react_query_cache_v1";

// Restauration immédiate au lancement depuis MMKV
try {
  const cachedData = AppStorage.getItem<any>(CACHE_STORAGE_KEY);
  if (cachedData) {
    hydrate(queryClient, cachedData);
    console.log("💾 [ReactQuery] Cache restauré avec succès depuis MMKV");
  }
} catch (error) {
  console.warn("⚠️ [ReactQuery] Échec de la restauration du cache MMKV:", error);
}

// Sauvegarde automatique du cache dans MMKV lors des mises à jour réussies (debounced)
let saveDebounce: ReturnType<typeof setTimeout> | null = null;

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "success") {
    if (saveDebounce) clearTimeout(saveDebounce);
    saveDebounce = setTimeout(() => {
      try {
        const dehydrated = dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => {
            // Exclure les données temps réel volatiles
            const queryKeyStr = JSON.stringify(query.queryKey);
            if (queryKeyStr.includes("chat") || queryKeyStr.includes("messages")) {
              return false;
            }
            return query.state.status === "success";
          },
        });
        AppStorage.setItem(CACHE_STORAGE_KEY, dehydrated);
      } catch (err) {
        console.warn("⚠️ [ReactQuery] Erreur de sauvegarde du cache MMKV:", err);
      }
    }, 1500);
  }
});

