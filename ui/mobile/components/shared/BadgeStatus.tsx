// @/components/shared/BadgeStatus.tsx
import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "@/components/ui/text";
import LiquidHighlight from "@/components/ui/liquid/liquid-highlight";
import LiquidBorder from "@/components/ui/liquid/liquid-border";
import type { PropertyStatus } from "@/types";

export interface BadgeStatusProps {
  status: PropertyStatus;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
}

export const BadgeStatus: React.FC<BadgeStatusProps> = ({
  status,
  size = "md",
  style,
}) => {
  const { theme } = useTheme();

  const config = getStatusConfig(status, theme);

  const sizeStyles =
    size === "sm"
      ? { paddingHorizontal: 8, paddingVertical: 2, fontSize: 10 }
      : size === "lg"
      ? { paddingHorizontal: 14, paddingVertical: 5, fontSize: 13 }
      : { paddingHorizontal: 10, paddingVertical: 3.5, fontSize: 11 };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      <LiquidHighlight type="top" borderRadius={12} opacity={0.5} />
      <LiquidBorder variant="subtle" borderRadius={12} />
      <ThemedText
        style={[
          styles.text,
          { color: config.textColor, fontSize: sizeStyles.fontSize },
        ]}
      >
        {config.label}
      </ThemedText>
    </View>
  );
};

function getStatusConfig(
  status: PropertyStatus,
  theme: ReturnType<typeof useTheme>["theme"]
) {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "DISPONIBLE",
        backgroundColor: `${theme.propertyColors.sale}22`,
        textColor: theme.propertyColors.sale,
      };
    case "RESERVED":
      return {
        label: "RÉSERVÉ",
        backgroundColor: `${theme.propertyColors.reserved}22`,
        textColor: theme.propertyColors.reserved,
      };
    case "SOLD":
      return {
        label: "VENDU",
        backgroundColor: `${theme.propertyColors.sold}22`,
        textColor: theme.propertyColors.sold,
      };
    case "RENTED":
      return {
        label: "LOUÉ",
        backgroundColor: `${theme.propertyColors.rent}22`,
        textColor: theme.propertyColors.rent,
      };
    case "DRAFT":
      return {
        label: "BROUILLON",
        backgroundColor: `${theme.colors.muted}99`,
        textColor: theme.colors.mutedForeground,
      };
    case "PUBLISHED":
      return {
        label: "PUBLIÉ",
        backgroundColor: `${theme.propertyColors.newProperty}22`,
        textColor: theme.propertyColors.newProperty,
      };
    case "ARCHIVED":
      return {
        label: "ARCHIVÉ",
        backgroundColor: `${theme.colors.muted}99`,
        textColor: theme.colors.mutedForeground,
      };
    default:
      return {
        label: status,
        backgroundColor: `${theme.colors.muted}99`,
        textColor: theme.colors.mutedForeground,
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: "flex-start",
    position: "relative",
    overflow: "hidden",
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default BadgeStatus;
