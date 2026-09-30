// @/contexts/network-context.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import NetInfo, {
  NetInfoState,
} from "@react-native-community/netinfo";

import {
  offlineQueue,
} from "@/services/offline-queue/offline-queue.service";

interface NetworkContextType {
  isConnected: boolean;

  isInternetReachable: boolean;

  connectionType: string | null;

  isOffline: boolean;

  isSyncing: boolean;

  pendingOperations: number;

  sync: () => Promise<void>;
}

const NetworkContext =
  createContext<NetworkContextType | undefined>(
    undefined
  );

export const useNetwork =
  (): NetworkContextType => {
    const context =
      useContext(NetworkContext);

    if (!context) {
      throw new Error(
        "useNetwork must be used within a NetworkProvider"
      );
    }

    return context;
  };

export const NetworkProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  /**
   * Au démarrage, l'état réseau est inconnu.
   *
   * On évite de créer manuellement un faux NetInfoState,
   * ce qui provoquait l'erreur TypeScript sur "type".
   */
  const [
    networkState,
    setNetworkState,
  ] = useState<NetInfoState | null>(null);

  const [
    isSyncing,
    setIsSyncing,
  ] = useState(false);

  const [
    pendingOperations,
    setPendingOperations,
  ] = useState(0);

  useEffect(() => {
    /**
     * Écouter les changements réseau.
     */
    const unsubscribe =
      NetInfo.addEventListener(
        (state) => {
          setNetworkState(state);

          const stats =
            offlineQueue.getStats();

          setPendingOperations(
            stats.pending
          );
        }
      );

    /**
     * État réseau initial.
     */
    NetInfo.fetch()
      .then((state) => {
        setNetworkState(state);

        const stats =
          offlineQueue.getStats();

        setPendingOperations(
          stats.pending
        );
      })
      .catch((err) => {
        console.warn("⚠️ [NetInfo] Initial fetch error:", err);
      });

    /**
     * Mettre à jour périodiquement
     * le nombre d'opérations en attente.
     */
    const interval =
      setInterval(() => {
        const stats =
          offlineQueue.getStats();

        setPendingOperations(
          stats.pending
        );
      }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  /**
   * Synchronisation manuelle.
   */
  const sync = async (): Promise<void> => {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);

    try {
      const result =
        await offlineQueue.flushQueue();

      if (result.success > 0) {
        console.log(
          `✅ ${result.success} opérations synchronisées`
        );
      }

      if (result.failed > 0) {
        console.log(
          `⚠️ ${result.failed} opérations en échec`
        );
      }
    } catch (error) {
      console.error(
        "❌ Erreur de synchronisation:",
        error
      );
    } finally {
      setIsSyncing(false);

      const stats =
        offlineQueue.getStats();

      setPendingOperations(
        stats.pending
      );
    }
  };

  /**
   * Tant que NetInfo n'a pas répondu,
   * on considère l'état comme inconnu.
   */
  const isConnected =
    networkState?.isConnected ?? false;

  /**
   * null = NetInfo ne sait pas encore.
   * Pour l'UI, on considère donc true uniquement
   * lorsqu'il confirme explicitement l'accès Internet.
   */
  const isInternetReachable =
    networkState?.isInternetReachable ?? false;

  /**
   * On est offline seulement si NetInfo confirme
   * qu'il n'y a pas de connexion ou pas d'Internet.
   */
  const isOffline =
    networkState !== null &&
    (
      networkState.isConnected === false ||
      networkState.isInternetReachable === false
    );

  const value: NetworkContextType = {
    isConnected,

    isInternetReachable,

    connectionType:
      networkState?.type ?? null,

    isOffline,

    isSyncing,

    pendingOperations,

    sync,
  };

  return (
    <NetworkContext.Provider
      value={value}
    >
      {children}
    </NetworkContext.Provider>
  );
};
