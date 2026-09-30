// @/components/shared/AppLockOverlay.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/hooks/useT";
import LiquidSurface from "@/components/ui/liquid/liquid-surface";
import LiquidPressable from "@/components/ui/liquid/liquid-pressable";
import ThemedText from "@/components/ui/text";
import Button from "@/components/ui/button";

interface AppLockOverlayProps {
  isLocked: boolean;
  onUnlock: () => Promise<boolean>;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AppLockOverlay({
  isLocked,
  onUnlock,
}: AppLockOverlayProps) {
  const { isDark, theme } = useTheme();
  const { t } = useT();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  // Déclencher automatiquement la biométrie quand l'écran se verrouille
  useEffect(() => {
    if (!isLocked) {
      setAuthFailed(false);
      return;
    }

    let isMounted = true;
    const autoAuthTimer = setTimeout(async () => {
      if (!isMounted) return;
      setIsAuthenticating(true);
      const success = await onUnlock();
      if (isMounted) {
        setIsAuthenticating(false);
        if (!success) {
          setAuthFailed(true);
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(autoAuthTimer);
    };
  }, [isLocked, onUnlock]);

  if (!isLocked) return null;

  const handleManualUnlock = async () => {
    setIsAuthenticating(true);
    setAuthFailed(false);
    const success = await onUnlock();
    setIsAuthenticating(false);
    if (!success) {
      setAuthFailed(true);
    }
  };

  return (
    <View
      style={[
        styles.overlay,
        {
          backgroundColor: isDark ? "rgba(2, 6, 23, 0.98)" : "rgba(248, 250, 252, 0.98)",
        },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.content}>
        {/* Lock Icon Emblem */}
        <View style={styles.iconCircleWrapper}>
          <LiquidSurface
            material="regular"
            borderRadius={50}
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                borderColor: authFailed ? "#EF4444" : "#2563EB",
              },
            ]}
          >
            <Ionicons
              name={authFailed ? "lock-closed" : "finger-print"}
              size={48}
              color={authFailed ? "#EF4444" : "#2563EB"}
            />
          </LiquidSurface>
        </View>

        {/* Title and subtitle */}
        <ThemedText variant="xl" weight="bold" style={styles.title}>
          {t("security.app_locked", "Application Verrouillée")}
        </ThemedText>

        <ThemedText
          variant="sm"
          color="mutedForeground"
          style={styles.subtitle}
        >
          {authFailed
            ? t(
                "security.auth_failed_desc",
                "Authentification échouée. Appuyez ci-dessous pour réessayer.",
              )
            : t(
                "security.auth_required_desc",
                "Veuillez vous authentifier avec Face ID, votre empreinte ou le code de l'appareil.",
              )}
        </ThemedText>

        {/* Unlock Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant="default"
            size="lg"
            isFullWidth
            onPress={handleManualUnlock}
            loading={isAuthenticating}
            leftIcon={
              !isAuthenticating ? (
                <Ionicons name="key-outline" size={20} color="#FFFFFF" />
              ) : undefined
            }
          >
            {t("security.unlock_button", "Déverrouiller")}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 999999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 340,
    width: "100%",
  },
  iconCircleWrapper: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 22,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
  },
});
