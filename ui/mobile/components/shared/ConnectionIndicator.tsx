// @/components/shared/ConnectionIndicator.tsx
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "@/components/ui";
import { useTheme } from "@/contexts/theme-context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useT } from "@/hooks/useT";

interface ConnectionIndicatorProps {
  showDetails?: boolean;
  onPress?: () => void;
}

type BannerState = "hidden" | "offline" | "restored" | "syncing";

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  showDetails = false,
  onPress,
}) => {
  const { isDark } = useTheme();
  const { t } = useT();
  const {
    isOffline,
    isSyncing,
    pendingOperations,
    sync,
    connectionQuality,
  } = useNetworkStatus();

  const [bannerState, setBannerState] = useState<BannerState>("hidden");
  const wasOffline = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-60);

  useEffect(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (isOffline) {
      wasOffline.current = true;
      setBannerState("offline");
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
    } else if (wasOffline.current && !isOffline) {
      // Transition offline -> online (reconnexion)
      wasOffline.current = false;
      setBannerState("restored");
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 14, stiffness: 120 });

      hideTimer.current = setTimeout(() => {
        opacity.value = withTiming(0, {
          duration: 350,
          easing: Easing.out(Easing.ease),
        });
        translateY.value = withTiming(-60, { duration: 350 });
        setTimeout(() => setBannerState("hidden"), 350);
      }, 2500);
    } else if (isSyncing) {
      setBannerState("syncing");
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
    } else if (pendingOperations === 0 && !isOffline && bannerState !== "restored") {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(-60, { duration: 300 });
      const timer = setTimeout(() => setBannerState("hidden"), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isOffline, isSyncing, pendingOperations]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (bannerState === "hidden" && !isOffline && pendingOperations === 0 && !isSyncing) {
    return null;
  }

  const isRestored = bannerState === "restored";

  const getStatusColor = () => {
    if (isRestored) return "#10B981"; // Vert émeraude quand rétabli
    if (isOffline) return "#EF4444";  // Rouge doux quand hors ligne
    if (isSyncing) return "#F59E0B";  // Ambre quand synchro
    if (pendingOperations > 0) return "#F59E0B";
    return "#10B981";
  };

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    if (isRestored) return "cloud-done";
    if (isOffline) return "cloud-offline";
    if (isSyncing) return "sync-outline";
    if (pendingOperations > 0) return "time-outline";
    return "checkmark-circle";
  };

  const getStatusText = () => {
    if (isRestored) return t("auth.connection_restored", "Connexion rétablie");
    if (isOffline) return t("auth.offline_title", "Aucune connexion • Mode hors ligne");
    if (isSyncing) return t("auth.syncing", "Synchronisation des données...");
    if (pendingOperations > 0)
      return t("auth.pending_ops", { count: pendingOperations });
    return t("auth.synced", "Synchronisé");
  };

  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();
  const statusText = getStatusText();

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor: isDark ? "#0B1120" : "#FFFFFF",
          borderColor: statusColor,
          shadowColor: statusColor,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress || sync}
        style={styles.content}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${statusColor}22` },
          ]}
        >
          <Ionicons
            name={statusIcon}
            size={16}
            color={statusColor}
          />
        </View>

        <View style={styles.textColumn}>
          <Text
            variant="xs"
            weight="bold"
            style={[styles.statusText, { color: isDark ? "#F8FAFC" : "#0F172A" }]}
          >
            {statusText}
          </Text>

          {isOffline && (
            <Text
              variant="xs"
              style={[styles.hintText, { color: isDark ? "#94A3B8" : "#64748B" }]}
            >
              {t("auth.offline_hint", "Vos actions locales seront synchronisées")}
            </Text>
          )}

          {isSyncing && (
            <Text
              variant="xs"
              style={[styles.hintText, { color: isDark ? "#94A3B8" : "#64748B" }]}
            >
              {t("auth.in_progress", "Mise à jour en cours...")}
            </Text>
          )}
        </View>

        {pendingOperations > 0 && !isSyncing && !isOffline && (
          <TouchableOpacity onPress={sync} style={styles.syncBtn}>
            <Text variant="xs" weight="bold" style={{ color: "#2563EB" }}>
              {t("auth.sync_now", "Sync")}
            </Text>
          </TouchableOpacity>
        )}

        {showDetails && (
          <View style={styles.details}>
            <Text variant="xs" color="mutedForeground">
              {t("auth.quality", { value: connectionQuality })}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 44,
    left: 14,
    right: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.2,
    zIndex: 9999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  textColumn: {
    flex: 1,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  hintText: {
    fontSize: 10.5,
    marginTop: 1,
  },
  syncBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(37,99,235,0.12)",
    borderRadius: 8,
  },
  details: {
    flexDirection: "row",
    gap: 8,
  },
});

export default ConnectionIndicator;
