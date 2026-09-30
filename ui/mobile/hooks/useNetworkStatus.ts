// hooks/useNetworkStatus.ts (NOUVEAU)

import { useNetwork } from "@/contexts/network-context";

export function useNetworkStatus() {
  const { isConnected, isInternetReachable, isOffline, isSyncing, pendingOperations, sync } = useNetwork();

  return {
    isConnected,
    isInternetReachable,
    isOffline,
    isSyncing,
    pendingOperations,
    sync,
    /** Indicateur de qualité de connexion */
    connectionQuality: isOffline ? "offline" : isInternetReachable ? "good" : "poor",
  };
}