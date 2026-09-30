// @/components/shared/StatsCard.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "@/components/ui/text";
import LiquidSurface from "@/components/ui/liquid/liquid-surface";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  delta?: number;
  deltaLabel?: string;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  delta,
  deltaLabel,
  accentColor,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(50, withSpring(1, { damping: 16, stiffness: 120 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 16 }],
  }));

  const color = accentColor || theme.colors.primary;
  const isPositive = delta !== undefined && delta >= 0;
  const deltaColor =
    delta !== undefined
      ? isPositive
        ? "#16A34A"
        : "#DC2626"
      : theme.colors.mutedForeground;

  const formattedValue =
    typeof value === "number"
      ? new Intl.NumberFormat("fr-FR").format(value)
      : value;

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <LiquidSurface
        material="regular"
        borderRadius={theme.borderRadius.lg}
        style={[styles.container, style]}
      >
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
              <Ionicons name={icon} size={18} color={color} />
            </View>
          )}
          <ThemedText variant="xs" color="mutedForeground" numberOfLines={1}>
            {title}
          </ThemedText>
        </View>

        <ThemedText
          variant="3xl"
          weight="bold"
          color="foreground"
          style={{ marginTop: 8 }}
        >
          {formattedValue}
        </ThemedText>

        {delta !== undefined && (
          <View style={styles.deltaRow}>
            <Ionicons
              name={isPositive ? "arrow-up" : "arrow-down"}
              size={14}
              color={deltaColor}
            />
            <ThemedText
              variant="xs"
              weight="bold"
              style={{ color: deltaColor }}
            >
              {Math.abs(delta)}%
            </ThemedText>
            {deltaLabel && (
              <ThemedText variant="xs" color="mutedForeground">
                {deltaLabel}
              </ThemedText>
            )}
          </View>
        )}
      </LiquidSurface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    minHeight: 110,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
});

export default StatsCard;
