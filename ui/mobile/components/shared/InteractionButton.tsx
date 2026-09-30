// components/shared/InteractionButton.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/hooks/useT";
import { useAppStore } from "@/stores/app-store";
import { useHasInteraction, useToggleInteractionMutation, useInteractionCounts } from "@/hooks/query";
import type { InteractionType, EntityType } from "@/types/interaction";
import type { ID } from "@/types";
import Toast from "react-native-toast-message";

// ── Types ──

export interface InteractionButtonProps {
  /** Type d'interaction (LIKE, BOOKMARK, FOLLOW, SHARE) */
  type: InteractionType;
  /** Type d'entité (PROPERTY, USER, ORGANIZATION, MESSAGE) */
  entityType: EntityType;
  /** ID de l'entité */
  entityId: ID;
  /** Compteur initial (optionnel) */
  initialCount?: number;
  /** Afficher uniquement l'icône */
  iconOnly?: boolean;
  /** Afficher le compteur */
  showCount?: boolean;
  /** Activer les confettis sur LIKE */
  withConfetti?: boolean;
  /** Callback lors du toggle */
  onToggle?: (isActive: boolean) => void;
  /** Style du conteneur */
  style?: StyleProp<ViewStyle>;
  /** Style du texte */
  textStyle?: StyleProp<TextStyle>;
  /** Taille de l'icône */
  iconSize?: number;
  /** Variante visuelle */
  variant?: "default" | "ghost" | "outline";
  /** Taille du bouton */
  size?: "sm" | "md" | "lg";
  /** Désactiver le bouton */
  disabled?: boolean;
}

// ── Configuration ──

const ICON_MAP: Record<InteractionType, keyof typeof Ionicons.glyphMap> = {
  LIKE: "heart",
  BOOKMARK: "bookmark",
  FOLLOW: "person-add",
  SHARE: "share-social",
};

const LABEL_MAP: Record<InteractionType, { active: string; inactive: string }> = {
  LIKE: { active: "Favori", inactive: "J'aime" },
  BOOKMARK: { active: "Sauvegardé", inactive: "Sauvegarder" },
  FOLLOW: { active: "Suivi", inactive: "Suivre" },
  SHARE: { active: "Partagé", inactive: "Partager" },
};

const COLOR_MAP: Record<InteractionType, string> = {
  LIKE: "#EC4899",
  BOOKMARK: "#3B82F6",
  FOLLOW: "#10B981",
  SHARE: "#8B5CF6",
};

const SIZE_MAP = {
  sm: { icon: 16, padding: 6, fontSize: 12, hitSlop: 8 },
  md: { icon: 20, padding: 10, fontSize: 14, hitSlop: 10 },
  lg: { icon: 24, padding: 14, fontSize: 16, hitSlop: 12 },
};

// ── Composant principal ──

export const InteractionButton: React.FC<InteractionButtonProps> = ({
  type,
  entityType,
  entityId,
  initialCount = 0,
  iconOnly = false,
  showCount = true,
  withConfetti = false,
  onToggle,
  style,
  textStyle,
  iconSize: customIconSize,
  variant = "ghost",
  size = "md",
  disabled = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useT();
  const { user } = useAppStore();

  // ── États ──
  const [optimisticActive, setOptimisticActive] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);
  const [isHovered, setIsHovered] = useState(false);

  // ── Animations ──
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const countScale = useSharedValue(1);

  // ── Hooks ──
  const { data: exists, isLoading: checkingExists } = useHasInteraction({
    userId: user?.id,
    entityId,
    entityType,
    type,
  });

  const { data: counts, isLoading: loadingCounts } = useInteractionCounts(entityId, entityType);

  const { mutate: toggle, isPending } = useToggleInteractionMutation();

  // ── Synchro des états ──
  useEffect(() => {
    if (exists !== undefined) {
      setOptimisticActive(exists);
    }
  }, [exists]);

  useEffect(() => {
    if (counts) {
      const count = counts[type];
      if (count !== undefined) {
        setOptimisticCount(count);
      }
    }
  }, [counts, type]);

  // ── Handlers ──
  const handlePress = useCallback(() => {
    if (!user?.id) {
      Toast.show({
        type: "info",
        text1: t("auth.login", "Connexion requise"),
        text2: t("favorites.login_to_manage", "Connectez-vous pour interagir."),
      });
      return;
    }

    if (isPending || disabled) return;

    // Optimistic update
    const newActive = !optimisticActive;
    setOptimisticActive(newActive);
    setOptimisticCount((prev) => (newActive ? prev + 1 : Math.max(0, prev - 1)));

    // Animation du cœur
    if (type === "LIKE") {
      if (newActive) {
        // Animation d'explosion du cœur
        heartScale.value = withSequence(
          withSpring(1.8, { damping: 10, stiffness: 150 }),
          withSpring(1, { damping: 15, stiffness: 100 })
        );
        heartOpacity.value = withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
        );

        // Animation du compteur
        countScale.value = withSequence(
          withSpring(1.3, { damping: 10, stiffness: 150 }),
          withSpring(1, { damping: 15, stiffness: 100 })
        );

        // Confettis
        if (withConfetti) {
          runOnJS(triggerConfetti)();
        }
      } else {
        // Animation de suppression
        heartScale.value = withSpring(0, { damping: 15, stiffness: 100 });
        heartOpacity.value = withTiming(0, { duration: 200 });
      }
    }

    // Appel API
    toggle({
      userId: user.id,
      entityId,
      entityType,
      type,
    });

    onToggle?.(newActive);
  }, [user, isPending, disabled, optimisticActive, entityId, entityType, type, onToggle, withConfetti]);

  // ── Trigger confettis ──
  const triggerConfetti = useCallback(() => {
    // Ici on pourrait importer un package de confettis comme react-native-confetti
    // ou utiliser une implémentation personnalisée
    console.log("🎊 Confettis !");
    // TODO: Implémenter les confettis avec react-native-confetti ou un composant personnalisé
  }, []);

  // ── Animated styles ──
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
    position: "absolute",
    alignSelf: "center",
  }));

  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  // ── Rendering ──
  const isLoading = checkingExists || loadingCounts || isPending;
  const IconName = ICON_MAP[type];

  const LABEL_MAP_TR: Record<InteractionType, { active: string; inactive: string }> = {
    LIKE: { active: t("favorites.liked", "Favori"), inactive: t("favorites.like", "J'aime") },
    BOOKMARK: { active: t("favorites.added_to_favorites", "Sauvegardé"), inactive: t("favorites.add_favorite", "Sauvegarder") },
    FOLLOW: { active: t("agency.unfollow", "Suivi"), inactive: t("agency.follow", "Suivre") },
    SHARE: { active: t("common.summary", "Partagé"), inactive: t("property.share", "Partager") },
  };

  const labels = LABEL_MAP_TR[type];
  const color = COLOR_MAP[type];
  const isActive = optimisticActive;
  const sizeConfig = SIZE_MAP[size];
  const iconSize = customIconSize || sizeConfig.icon;

  const shouldShowCount = showCount && optimisticCount > 0;

  // Styles de base
  const buttonStyles = [
    styles.button,
    {
      paddingHorizontal: iconOnly ? sizeConfig.padding : sizeConfig.padding + 4,
      paddingVertical: sizeConfig.padding,
      borderRadius: theme.borderRadius.md,
      gap: 6,
    },
    variant === "ghost" && {
      backgroundColor: isActive ? `${color}20` : "transparent",
    },
    variant === "outline" && {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: isActive ? color : theme.colors.border,
    },
    variant === "default" && {
      backgroundColor: isActive ? color : theme.colors.muted,
    },
    isActive && variant !== "default" && {
      backgroundColor: `${color}15`,
    },
    disabled && { opacity: 0.5 },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      fontSize: sizeConfig.fontSize,
      color: isActive ? color : isDark ? "#CBD5E1" : "#475569",
      fontWeight: isActive ? "700" : "500",
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading || disabled}
      activeOpacity={0.7}
      hitSlop={{ top: sizeConfig.hitSlop, bottom: sizeConfig.hitSlop, left: sizeConfig.hitSlop, right: sizeConfig.hitSlop }}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={buttonStyles}
    >
      <Animated.View style={[styles.content, pressStyle]}>
        {/* Icône avec animation */}
        <View style={styles.iconWrapper}>
          {isLoading ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <Animated.View>
              <Ionicons
                name={isActive ? IconName : `${IconName}-outline` as any}
                size={iconSize}
                color={isActive ? color : isDark ? "#94A3B8" : "#64748B"}
              />
            </Animated.View>
          )}

          {/* Cœur flottant pour LIKE */}
          {type === "LIKE" && (
            <Animated.View style={[heartStyle, { zIndex: 10 }]} pointerEvents="none">
              <Ionicons name="heart" size={iconSize * 2.5} color="#EC4899" />
            </Animated.View>
          )}

          {/* Badge actif */}
          {isActive && !iconOnly && (
            <View style={[styles.activeDot, { backgroundColor: color }]} />
          )}
        </View>

        {/* Label */}
        {!iconOnly && (
          <Animated.Text style={textStyles as StyleProp<TextStyle>}>
            {isActive ? labels.active : labels.inactive}
          </Animated.Text>
        )}

        {/* Compteur */}
        {shouldShowCount && (
          <Animated.Text
            style={[
              styles.count,
              {
                color: isActive ? color : isDark ? "#94A3B8" : "#64748B",
                fontSize: sizeConfig.fontSize * 0.85,
              },
              countStyle,
            ]}
          >
            {optimisticCount}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Styles ──
const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  text: {
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  count: {
    fontWeight: "600",
    marginLeft: 2,
  },
});

// ── Variantes pré-configurées ──

export const LikeButton = (props: Omit<InteractionButtonProps, "type">) => (
  <InteractionButton {...props} type="LIKE" withConfetti />
);

export const BookmarkButton = (props: Omit<InteractionButtonProps, "type">) => (
  <InteractionButton {...props} type="BOOKMARK" />
);

export const FollowButton = (props: Omit<InteractionButtonProps, "type">) => (
  <InteractionButton {...props} type="FOLLOW" />
);

export const ShareButton = (props: Omit<InteractionButtonProps, "type">) => (
  <InteractionButton {...props} type="SHARE" />
);

// ── Export par défaut ──
export default InteractionButton;