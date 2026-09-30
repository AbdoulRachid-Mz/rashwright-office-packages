// @/hooks/useOfflineMutation.ts

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  offlineQueue,
  QueuedOperation,
} from "@/services/offline-queue/offline-queue.service";
import Toast from "react-native-toast-message";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface OfflineMutationOptions<TData, TVariables>
  extends UseMutationOptions<TData, Error, TVariables> {
  /** Clé de l'entité pour la déduplication */
  entityKey?: string;

  /** ID de l'entité */
  entityId?: string | ((variables: TVariables) => string | undefined);

  /** Type d'opération */
  operationType: QueuedOperation["type"];

  /**
   * Endpoint fixe ou dynamique.
   *
   * Exemple :
   * endpoint: ENDPOINTS.properties.create
   *
   * ou :
   * endpoint: ([id]) => ENDPOINTS.properties.update(id)
   */
  endpoint:
    | string
    | ((variables: TVariables) => string);

  /** Données à mettre en queue */
  getData?: (variables: TVariables) => unknown;

  /** Message de succès */
  successMessage?: string;

  /** Message d'erreur */
  errorMessage?: string;
}

export function useOfflineMutation<
  TData = unknown,
  TVariables = void
>(
  options: OfflineMutationOptions<TData, TVariables>
): UseMutationResult<TData, Error, TVariables> {
  const {
    entityKey,
    entityId,
    operationType,
    endpoint,
    getData,
    successMessage = "Opération réussie",
    errorMessage = "Une erreur est survenue",
    ...mutationOptions
  } = options;

  const { isOffline, isSyncing } =
    useNetworkStatus();

  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,

    mutationFn: async (
      variables,
      context
    ) => {
      /**
       * Résout l'endpoint.
       */
      const resolvedEndpoint =
        typeof endpoint === "function"
          ? endpoint(variables)
          : endpoint;

      /**
       * Résout l'ID de l'entité.
       */
      const resolvedEntityId =
        typeof entityId === "function"
          ? entityId(variables)
          : entityId;

      /**
       * Données à envoyer.
       */
      const data = getData
        ? getData(variables)
        : variables;

      /**
       * MODE OFFLINE
       */
      if (isOffline) {
        await offlineQueue.enqueue({
          type: operationType,
          endpoint: resolvedEndpoint,
          data,
          entityType: entityKey,
          entityId: resolvedEntityId,
        });

        Toast.show({
          type: "info",
          text1: "Mode hors ligne",
          text2:
            "L'opération sera synchronisée automatiquement.",
        });

        /**
         * Résultat optimiste.
         */
        return {} as TData;
      }

      /**
       * MODE ONLINE
       */
      try {
        if (!mutationOptions.mutationFn) {
          throw new Error(
            "useOfflineMutation nécessite une mutationFn."
          );
        }

        return await mutationOptions.mutationFn(
          variables,
          context
        );
      } catch (error) {
        /**
         * Détecter une erreur réseau.
         */
        const isNetworkError =
          error instanceof Error &&
          (
            error.message
              .toLowerCase()
              .includes("network") ||
            error.message
              .toLowerCase()
              .includes("offline") ||
            error.message
              .toLowerCase()
              .includes("internet") ||
            error.message
              .toLowerCase()
              .includes("timeout")
          );

        if (isNetworkError) {
          await offlineQueue.enqueue({
            type: operationType,
            endpoint: resolvedEndpoint,
            data,
            entityType: entityKey,
            entityId: resolvedEntityId,
          });

          Toast.show({
            type: "info",
            text1: "Connexion perdue",
            text2:
              "L'opération sera synchronisée automatiquement.",
          });

          return {} as TData;
        }

        throw error;
      }
    },

    onSuccess: (
      data,
      variables,
      onMutateResult,
      context
    ) => {
      if (!isOffline && !isSyncing) {
        Toast.show({
          type: "success",
          text1: "Succès",
          text2: successMessage,
        });
      }

      mutationOptions.onSuccess?.(
        data,
        variables,
        onMutateResult,
        context
      );
    },

    onError: (
      error,
      variables,
      onMutateResult,
      context
    ) => {
      const isNetworkError =
        error.message
          .toLowerCase()
          .includes("network") ||
        error.message
          .toLowerCase()
          .includes("offline") ||
        error.message
          .toLowerCase()
          .includes("internet") ||
        error.message
          .toLowerCase()
          .includes("timeout");

      if (!isNetworkError) {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: errorMessage,
        });
      }

      mutationOptions.onError?.(
        error,
        variables,
        onMutateResult,
        context
      );
    },
  });
}
