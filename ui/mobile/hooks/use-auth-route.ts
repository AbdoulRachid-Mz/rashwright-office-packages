import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAppStore } from "@/stores/app-store";

export const useAuthRoute = () => {
  const isAuthenticated = useAppStore((state) => !!state.user && !!state.firebaseUid);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === ("auth" as any);

    if (!isAuthenticated && !inAuthGroup) {
      // Rediriger vers la page de connexion
      router.replace("/(auth)/login" as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Rediriger vers les onglets principaux
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, segments]);
};
