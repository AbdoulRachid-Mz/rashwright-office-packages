// contexts/notification-context.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAppStore } from "@/stores/app-store";
import { notificationService } from "@/services/notifications/notification.service";
import { useQueryClient } from "@tanstack/react-query";
import { NOTIFICATION_QUERY_KEYS } from "@/hooks/query";

interface NotificationContextType {
  isInitialized: boolean;
  isEnabled: boolean;
  pushToken: string | null;
  setEnabled: (enabled: boolean) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, notificationsEnabled } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(notificationsEnabled);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialisation du service
  useEffect(() => {
    const init = async () => {
      if (!user) {
        console.log("⚠️ Utilisateur non connecté, notifications désactivées");
        setIsInitialized(true);
        return;
      }

      if (!isEnabled) {
        console.log("🔕 Notifications désactivées par l'utilisateur");
        setIsInitialized(true);
        return;
      }

      try {
        await notificationService.initialize();
        const token = notificationService.getPushToken();
        setPushToken(token);
        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Erreur initialisation notifications:", error);
        setIsInitialized(true);
      }
    };

    init();

    return () => {
      notificationService.cleanup();
    };
  }, [user, isEnabled]);

  // Met à jour le badge quand les notifications changent
  useEffect(() => {
    if (!isInitialized) return;

    const updateBadge = async () => {
      try {
        // Récupérer le nombre de notifications non lues
        const data = queryClient.getQueryData<{
          pages: Array<{ items: any[] }>;
        }>(["notifications", "list", { page: 1, limit: 1 }]);

        if (data?.pages?.[0]?.items) {
          const unread = data.pages[0].items.filter((n) => !n.read).length;
          await notificationService.updateBadge(unread);
        }
      } catch (error) {
        console.error("Erreur mise à jour badge:", error);
      }
    };

    updateBadge();
  }, [isInitialized, queryClient]);

  // Invalide le cache des notifications quand une notification est reçue
  useEffect(() => {
    if (!isInitialized) return;

    const originalHandler = (notification: any) => {
      // Invalider le cache
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.all,
      });
    };

    // On va utiliser le callback du service
    // Pour l'instant on utilise le context

    return () => {
      // Cleanup
    };
  }, [isInitialized, queryClient]);

  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: NOTIFICATION_QUERY_KEYS.all,
    });
  }, [queryClient]);

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      setIsEnabled(enabled);
      if (!enabled) {
        await notificationService.cleanup();
        await notificationService.updateBadge(0);
      } else if (user) {
        await notificationService.initialize();
        const token = notificationService.getPushToken();
        setPushToken(token);
      }
    },
    [user]
  );

  const value: NotificationContextType = {
    isInitialized,
    isEnabled,
    pushToken,
    setEnabled,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};