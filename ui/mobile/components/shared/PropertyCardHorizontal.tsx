import React, { useRef } from "react";
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
import {
  Swipeable,
} from "react-native-gesture-handler";
import { useTheme } from "@/contexts/theme-context";
import type { PropertyWithRelations } from "@/types";
import ThemedText from "@/components/ui/text";
import { useAppStore } from "@/stores/app-store";
import { useT } from "@/hooks/useT";
import {
  useHasInteraction,
  useToggleInteractionMutation,
} from "@/hooks/query/useInteractionsQueries";

/* ---------------------------------------------------------------- */
/*  Haptics dynamiques (pattern mmkv-storage)                        */
/* ---------------------------------------------------------------- */

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
      HapticsModule.impactAsync(
        HapticsModule.ImpactFeedbackStyle[style],
      ),
    notificationAsync: (type) =>
      HapticsModule.notificationAsync(
        HapticsModule.NotificationFeedbackType[type],
      ),
  };
} catch {
  haptics = noopHaptics;
}

/* ---------------------------------------------------------------- */
/*  Types                                                            */
/* ---------------------------------------------------------------- */

interface PropertyCardHorizontalProps {
  property: PropertyWithRelations;
  onPress?: () => void;
  onFavoriteToggle?: (id: string) => void;
  onShare?: () => void;
  onContact?: () => void;
  onViewDetail?: () => void;
  isFavorited?: boolean;
  showFavoriteButton?: boolean;
  enableSwipe?: boolean;
  enableDoubleTapLike?: boolean;
  compact?: boolean;
  style?: object;
}

/* ---------------------------------------------------------------- */
/*  Composant principal                                             */
/* ---------------------------------------------------------------- */

const PropertyCardHorizontal: React.FC<PropertyCardHorizontalProps> = ({
  property,
  onPress,
  onFavoriteToggle,
  onShare,
  onContact,
  onViewDetail,
  isFavorited = false,
  showFavoriteButton = true,
  enableSwipe = true,
  enableDoubleTapLike = true,
  compact = false,
  style,
}) => {
  const { theme } = useTheme();
  const { t, lang } = useT();
  const { user } = useAppStore();
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
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(price) + " FCFA";
  };

  /* -------------------------------------------------------------- */
  /*  Gestion des taps                                              */
  /* -------------------------------------------------------------- */

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
      if (onFavoriteToggle) handleLike();
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

  /* -------------------------------------------------------------- */
  /*  Swipe actions                                                 */
  /* -------------------------------------------------------------- */

  const renderLeftActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    });

    return (
      <RNAnimated.View
        style={[styles.swipeActions, { transform: [{ translateX }] }]}
      >
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
            size={24}
            color="#fff"
          />
          <Text style={styles.swipeText}>
            {liked ? t("favorites.liked", "Favori") : t("favorites.like", "J'aime")}
          </Text>
        </TouchableOpacity>

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
            <Ionicons name="share-social-outline" size={22} color="#fff" />
            <Text style={styles.swipeText}>{t("property.share", "Partager")}</Text>
          </TouchableOpacity>
        )}
      </RNAnimated.View>
    );
  };

  const renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
  ) => {
    const hasRight = !!onViewDetail || !!onContact;
    if (!hasRight) return null;

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });

    return (
      <RNAnimated.View
        style={[styles.swipeActions, { transform: [{ translateX }] }]}
      >
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
            <Ionicons name="chatbubble-outline" size={22} color="#fff" />
            <Text style={styles.swipeText}>{t("property.contact_seller", "Contacter")}</Text>
          </TouchableOpacity>
        )}

        {onViewDetail && (
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: "#0EA5E9" }]}
            onPress={() => {
              void haptics.impactAsync("Light");
              onViewDetail();
              swipeableRef.current?.close();
            }}
          >
            <Ionicons name="eye-outline" size={22} color="#fff" />
            <Text style={styles.swipeText}>{t("common.expand", "Voir")}</Text>
          </TouchableOpacity>
        )}
      </RNAnimated.View>
    );
  };

  /* -------------------------------------------------------------- */
  /*  Contenu carte                                                 */
  /* -------------------------------------------------------------- */

  const cardContent = (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        style,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Cover image */}
      <View style={[styles.imageWrapper, compact && styles.imageCompact]}>
        <Image
          source={{ uri: coverImage }}
          style={styles.image}
          contentFit="cover"
          transition={250}
        />

        <View
          style={[
            styles.purposeBadge,
            {
              backgroundColor:
                property.purpose === "SALE"
                  ? theme.propertyColors.sale
                  : theme.propertyColors.rent,
            },
          ]}
        >
          <Text style={styles.purposeText}>
            {property.purpose === "SALE" ? t("property.for_sale", "VENDRE") : t("property.for_rent", "LOUER")}
          </Text>
        </View>

        {showFavoriteButton && onFavoriteToggle && (
          <Pressable
            onPress={handleLike}
            style={({ pressed }) => [
              styles.favButton,
              pressed && styles.favPressed,
            ]}
            hitSlop={6}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={16}
              color={liked ? theme.propertyColors.favorite : "#FFFFFF"}
            />
          </Pressable>
        )}
      </View>

      {/* Contenu texte */}
      <View style={[styles.content, compact && styles.contentCompact]}>
        {/* Prix */}
        <ThemedText
          variant="lg"
          weight="bold"
          style={{ color: theme.colors.primary }}
        >
          {formatPrice(property.price)}
        </ThemedText>

        {/* Titre */}
        <ThemedText
          variant="sm"
          weight="semibold"
          numberOfLines={1}
          style={{
            color: theme.colors.cardForeground,
            marginTop: 2,
          }}
        >
          {property.title}
        </ThemedText>

        {/* Localisation */}
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={13}
            color={theme.colors.mutedForeground}
          />
          <ThemedText
            variant="xs"
            numberOfLines={1}
            style={{ color: theme.colors.mutedForeground }}
          >
            {property.location?.name
              ? `${property.location.name}, ${
                  property.location.city || t("search.niamey", "Niamey")
                }`
              : t("home.location", "Niamey, Niger")}
          </ThemedText>
        </View>

        {/* Spécificités */}
        <View style={styles.specsRow}>
          {property.surface ? (
            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="ruler-square"
                size={13}
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
                size={13}
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
                size={13}
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
    </View>
  );

  /* -------------------------------------------------------------- */
  /*  Rendu final                                                   */
  /* -------------------------------------------------------------- */

  const hasAnyAction =
    !!onFavoriteToggle || !!onShare || !!onContact || !!onViewDetail;
  const canSwipe = enableSwipe && hasAnyAction;

  const wrapped = (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={!onPress && !enableDoubleTapLike}
    >
      {cardContent}
    </TouchableOpacity>
  );

  if (!canSwipe) return wrapped;

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
    >
      {wrapped}
    </Swipeable>
  );
};

/* ---------------------------------------------------------------- */
/*  Styles                                                           */
/* ---------------------------------------------------------------- */

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardCompact: {
    borderRadius: 12,
  },

  imageWrapper: {
    width: 130,
    height: 130,
    position: "relative",
  },

  imageCompact: {
    width: 100,
    height: 100,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  purposeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  purposeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  favButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  favPressed: {
    transform: [{ scale: 0.88 }],
    opacity: 0.8,
  },

  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },

  contentCompact: {
    padding: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },

  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },

  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  swipeActions: {
    flexDirection: "row",
    height: "100%",
  },

  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    minWidth: 66,
  },

  swipeText: {
    color: "#ffffff",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "700",
  },
});

export default PropertyCardHorizontal;
