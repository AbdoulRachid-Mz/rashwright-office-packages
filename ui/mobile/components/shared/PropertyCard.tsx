import React, { useMemo, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated as RNAnimated,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useTheme } from "@/contexts/theme-context";
import type { PropertyWithRelations } from "@/types";
import ThemedText from "@/components/ui/text";
import LiquidSurface from "@/components/ui/liquid/liquid-surface";
import LiquidHighlight from "@/components/ui/liquid/liquid-highlight";
import LiquidBorder from "@/components/ui/liquid/liquid-border";
import PropertyOwnerHeader from "./PropertyOwnerHeader";
import { useAppStore } from "@/stores/app-store";
import {
  useHasInteraction,
  useToggleInteractionMutation,
} from "@/hooks/query/useInteractionsQueries";

import { useT } from "@/hooks/useT";

/**
 * ============================================================
 * HAPTICS DYNAMIQUES
 * ------------------------------------------------------------
 * expo-haptics est chargé à la demande pour éviter tout crash
 * si le module n'est pas installé.
 * Pattern identique à mmkv-storage / notifications.
 * ============================================================
 */

type HapticsImpactStyle = "Light" | "Medium" | "Heavy";
type HapticsNotificationType = "Success" | "Warning" | "Error";

interface HapticsAdapter {
  impactAsync: (style: HapticsImpactStyle) => Promise<void>;
  notificationAsync: (type: HapticsNotificationType) => Promise<void>;
}

const noopHaptics: HapticsAdapter = {
  impactAsync: async () => {},
  notificationAsync: async () => {},
};

let haptics: HapticsAdapter = noopHaptics;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const HapticsModule = require("expo-haptics");
  haptics = {
    impactAsync: (style) =>
      HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle[style]),
    notificationAsync: (type) =>
      HapticsModule.notificationAsync(
        HapticsModule.NotificationFeedbackType[type],
      ),
  };
} catch {
  haptics = noopHaptics;
}

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

interface PropertyCardProps {
  property: PropertyWithRelations;
  onPress?: () => void;
  onFavoriteToggle?: (id: string) => void;
  onShare?: () => void;
  onContact?: () => void;
  onViewDetail?: () => void;
  onOwnerPress?: () => void;
  isFavorited?: boolean;
  showFavoriteButton?: boolean;
  showOwnerHeader?: boolean;
  enableSwipe?: boolean;
  enableDoubleTapLike?: boolean;
  style?: object;
}

/**
 * ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================
 */

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onFavoriteToggle,
  onShare,
  onContact,
  onViewDetail,
  onOwnerPress,
  isFavorited = false,
  showFavoriteButton = true,
  showOwnerHeader = false,
  enableSwipe = true,
  enableDoubleTapLike = true,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const { user } = useAppStore();
  const { t } = useT();
  const swipeableRef = useRef<Swipeable>(null);
  const lastTap = useRef<number>(0);
  const toggleLike = useToggleInteractionMutation();

  const { data: hasLiked } = useHasInteraction({
    userId: user?.id,
    entityId: property.id,
    entityType: "PROPERTY",
    type: "LIKE",
  });

  const liked =
    hasLiked ?? isFavorited ?? property.hasCurrentUserLiked ?? false;

  const coverImage =
    property.media?.[0]?.url ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const purposeColor = useMemo(() => {
    if (property.purpose === "SALE") {
      return theme.propertyColors.sale;
    }
    return theme.propertyColors.rent;
  }, [property.purpose, theme.propertyColors]);

  /**
   * ============================================================
   * GESTION DES TAPS
   * ============================================================
   */

  const handleLike = React.useCallback(() => {
    if (!user) return;

    void haptics.impactAsync("Medium");

    toggleLike.mutate({
      userId: user.id,
      entityId: property.id,
      entityType: "PROPERTY",
      type: "LIKE",
    });

    onFavoriteToggle?.(property.id);
  }, [user, toggleLike, property.id, onFavoriteToggle]);

  const handlePress = React.useCallback(() => {
    if (!enableDoubleTapLike) {
      void haptics.impactAsync("Light");
      onPress?.();
      return;
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap → like
      if (onFavoriteToggle) {
        handleLike();
      }
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current !== 0) {
          void haptics.impactAsync("Light");
          onPress?.();
        }
        lastTap.current = 0;
      }, DOUBLE_TAP_DELAY + 50);
    }
  }, [enableDoubleTapLike, onPress, onFavoriteToggle, handleLike]);

  const handleLongPress = React.useCallback(() => {
    void haptics.notificationAsync("Warning");
  }, []);

  /**
   * ============================================================
   * SWIPE ACTIONS (pattern Ajiyata)
   * ============================================================
   */

  // ── SWIPE DROITE : actions à gauche (like, partager) ──

  const renderLeftActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-120, 0],
    });

    return (
      <RNAnimated.View
        style={[styles.swipeActionsRow, { transform: [{ translateX }] }]}
      >
        {/* Like */}
        <TouchableOpacity
          style={[
            styles.swipeAction,
            { backgroundColor: theme.propertyColors.favorite },
          ]}
          onPress={() => {
            void haptics.impactAsync("Medium");
            handleLike();
            swipeableRef.current?.close();
          }}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={26}
            color="#fff"
          />
          <Text style={styles.swipeActionText}>
            {liked ? t("favorites.remove_favorite", "Favori") : t("favorites.added_to_favorites", "J'aime")}
          </Text>
        </TouchableOpacity>

        {/* Partager */}
        {onShare && (
          <TouchableOpacity
            style={[
              styles.swipeAction,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {
              void haptics.impactAsync("Light");
              onShare();
              swipeableRef.current?.close();
            }}
          >
            <Ionicons name="share-social-outline" size={24} color="#fff" />
            <Text style={styles.swipeActionText}>{t("property.share", "Partager")}</Text>
          </TouchableOpacity>
        )}
      </RNAnimated.View>
    );
  };

  // ── SWIPE GAUCHE : actions à droite (voir, contacter) ──

  const renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [120, 0],
    });

    const hasRightActions = !!onViewDetail || !!onContact;
    if (!hasRightActions) return null;

    return (
      <RNAnimated.View
        style={[styles.swipeActionsRow, { transform: [{ translateX }] }]}
      >
        {/* Contacter */}
        {onContact && (
          <TouchableOpacity
            style={[
              styles.swipeAction,
              { backgroundColor: theme.colors.accent },
            ]}
            onPress={() => {
              void haptics.impactAsync("Light");
              onContact();
              swipeableRef.current?.close();
            }}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            <Text style={styles.swipeActionText}>{t("property.contact_seller", "Contacter")}</Text>
          </TouchableOpacity>
        )}

        {/* Voir détail */}
        {onViewDetail && (
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: "#0EA5E9" }]}
            onPress={() => {
              void haptics.impactAsync("Light");
              onViewDetail();
              swipeableRef.current?.close();
            }}
          >
            <Ionicons name="eye-outline" size={24} color="#fff" />
            <Text style={styles.swipeActionText}>{t("common.expand", "Voir")}</Text>
          </TouchableOpacity>
        )}
      </RNAnimated.View>
    );
  };

  /**
   * ============================================================
   * CONTENU DE LA CARTE
   * ============================================================
   */

  const cardContent = (
    <View style={[styles.cardContainer, style]}>
      {showOwnerHeader && (
        <PropertyOwnerHeader property={property} onPress={onOwnerPress} />
      )}

      <LiquidSurface
        material="regular"
        borderRadius={20}
        style={styles.card}
      >
        {/* ── Cover image ── */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: coverImage }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />

          {/* Badges */}
          <View style={styles.badgeTopLeft}>
            <View
              style={[styles.purposeBadge, { backgroundColor: purposeColor }]}
            >
              <LiquidHighlight type="top" borderRadius={8} opacity={0.6} />
              <LiquidBorder variant="subtle" borderRadius={8} />
              <Text style={styles.purposeText}>
                {property.purpose === "SALE" ? t("property.for_sale", "À VENDRE") : t("property.for_rent", "À LOUER")}
              </Text>
            </View>

            {property.hasInstallments && (
              <View
                style={[
                  styles.installmentBadge,
                  { backgroundColor: theme.propertyColors.installment },
                ]}
              >
                <LiquidHighlight type="top" borderRadius={8} opacity={0.6} />
                <LiquidBorder variant="subtle" borderRadius={8} />
                <Ionicons name="flash-outline" size={12} color="#FFFFFF" />
                <Text style={styles.installmentText}>{t("property.installments", "PAR TRANCHE")}</Text>
              </View>
            )}
          </View>

          {/* Verified badge */}
          {property.organization?.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={theme.propertyColors.verified}
              />
              <Text
                style={[
                  styles.verifiedText,
                  { color: theme.propertyColors.verified },
                ]}
              >
                {t("property.verified", "Vérifié")}
              </Text>
            </View>
          )}

          {/* Favorite button */}
          {showFavoriteButton && onFavoriteToggle && (
            <Pressable
              onPress={handleLike}
              style={({ pressed }) => [
                styles.favoriteButton,
                pressed && styles.favoritePressed,
              ]}
              hitSlop={8}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? theme.propertyColors.favorite : "#FFFFFF"}
              />
            </Pressable>
          )}
        </View>

        {/* ── Contenu ── */}
        <View style={styles.content}>
          {/* Prix + catégorie */}
          <View style={styles.priceRow}>
            <ThemedText
              variant="xl"
              weight="bold"
              style={{ color: theme.colors.primary }}
            >
              {formatPrice(property.price)}
            </ThemedText>

            <View
              style={[
                styles.categoryPill,
                { backgroundColor: `${theme.colors.accent}20` },
              ]}
            >
              <ThemedText
                variant="xs"
                weight="semibold"
                style={{ color: theme.colors.accent }}
              >
                {property.category?.name || "Immobilier"}
              </ThemedText>
            </View>
          </View>

          {/* Titre */}
          <ThemedText
            variant="base"
            weight="semibold"
            numberOfLines={1}
            style={{ color: theme.colors.cardForeground }}
          >
            {property.title}
          </ThemedText>

          {/* Localisation */}
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={theme.colors.accent}
            />
            <ThemedText
              variant="sm"
              numberOfLines={1}
              style={{ color: theme.colors.mutedForeground }}
            >
              {property.location?.name
                ? `${property.location.name}, ${
                    property.location.city || "Niamey"
                  }`
                : "Niamey, Niger"}
            </ThemedText>
          </View>

          {/* Spécificités */}
          <View
            style={[
              styles.specsRow,
              {
                borderColor: isDark ? theme.colors.border : theme.colors.muted,
              },
            ]}
          >
            {property.surface ? (
              <View style={styles.specItem}>
                <MaterialCommunityIcons
                  name="ruler-square"
                  size={16}
                  color={theme.colors.mutedForeground}
                />
                <ThemedText
                  variant="xs"
                  style={{ color: theme.colors.mutedForeground }}
                >
                  {property.surface} m²
                </ThemedText>
              </View>
            ) : null}

            {property.rooms ? (
              <View style={styles.specItem}>
                <Ionicons
                  name="bed-outline"
                  size={16}
                  color={theme.colors.mutedForeground}
                />
                <ThemedText
                  variant="xs"
                  style={{ color: theme.colors.mutedForeground }}
                >
                  {property.rooms} {t("property.rooms", "ch.")}
                </ThemedText>
              </View>
            ) : null}

            {property.bathrooms ? (
              <View style={styles.specItem}>
                <MaterialCommunityIcons
                  name="shower-head"
                  size={16}
                  color={theme.colors.mutedForeground}
                />
                <ThemedText
                  variant="xs"
                  style={{ color: theme.colors.mutedForeground }}
                >
                  {property.bathrooms} {t("property.bathrooms", "sdb.")}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      </LiquidSurface>
    </View>
  );

  /**
   * ============================================================
   * RENDU FINAL : Swipeable + TouchableOpacity
   * ============================================================
   */

  // Nombre total d'actions pour décider si on swipe
  const hasAnyAction =
    !!onFavoriteToggle || !!onShare || !!onContact || !!onViewDetail;
  const canSwipe = enableSwipe && hasAnyAction;

  const wrappedContent = (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      disabled={!onPress && !enableDoubleTapLike}
    >
      {cardContent}
    </TouchableOpacity>
  );

  if (!canSwipe) {
    return wrappedContent;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      {wrappedContent}
    </Swipeable>
  );
};

/**
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
    marginHorizontal: 16,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  // ── Swipe actions ──
  swipeActionsRow: {
    flexDirection: "column",
    height: "100%",
    gap: 5,
  },

  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    minWidth: 80,
    height: "auto",
    flex: 1,
    borderRadius: 12,
  },

  swipeActionText: {
    color: "#ffffff",
    fontSize: 11,
    marginTop: 3,
    fontWeight: "700",
  },

  // ── Cover ──
  imageContainer: {
    height: 190,
    width: "100%",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  badgeTopLeft: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },

  purposeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  purposeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  installmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  installmentText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  verifiedBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
  },

  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  favoritePressed: {
    transform: [{ scale: 0.88 }],
    opacity: 0.8,
  },

  // ── Contenu ──
  content: {
    padding: 16,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },

  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },

  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

export default PropertyCard;
