// @/components/shared/EmptyState.tsx
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { EmptyState as UIEmptyState } from "@/components/ui/empty-state";
import Button from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  withBlob?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "cube-outline",
  title,
  subtitle,
  actionLabel,
  onAction,
  withBlob = true,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <UIEmptyState
      icon={<Ionicons name={icon} size={36} color={theme.colors.primary} />}
      title={title}
      description={subtitle}
      withBlob={withBlob}
      action={
        actionLabel && onAction ? (
          <Button onPress={onAction} size="md">
            {actionLabel}
          </Button>
        ) : undefined
      }
      style={style}
    />
  );
};

export default EmptyState;
