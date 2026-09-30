// @/components/shared/PropertyMiniCard.tsx
import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { PropertyWithRelations } from "@/types";
import { useAppStore } from "@/stores/app-store";
import { useToggleInteractionMutation } from "@/hooks/query";
import Toast from "react-native-toast-message";
import ThemedText from "@/components/ui/text";
import LiquidSurface from "@/components/ui/liquid/liquid-surface";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PropertyMiniCardProps {
  property: PropertyWithRelations;
  onPress?: () => void;
  width?: number | "100%";
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string) => void;
  style?: object;
}

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800";

export default function PropertyMiniCard({
  property,
  onPress,
  width,
  isFavorited,
  onFavoriteToggle,
  style,
}: PropertyMiniCardProps) {
  const { theme, isDark } = useTheme();
  const { user } = useAppStore();
  const toggleLike = useToggleInteractionMutation();

  const coverUrl =
    property.media?.[0]?.url ||
    (typeof property.media?.[0] === "string" ? property.media[0] : null) ||
    (property as any)?.coverImage ||
    (property as any)?.coverUrl ||
    (property as any)?.thumbnailUrl ||
    (property as any)?.images?.[0]?.url ||
    (typeof (property as any)?.images?.[0] === "string" ? (property as any).images[0] : null) ||
    DEFAULT_COVER;

  const hasVideo = useMemo(() => {
    const anyProp = property as any;
    if (anyProp.video || anyProp.videoUrl) return true;
    if (Array.isArray(property.media)) {
      return property.media.some((m: any) =>
        m?.type === "VIDEO" ||
        m?.mimeType?.includes("video") ||
        (typeof m?.url === "string" && m.url.match(/\.(mp4|mov|webm|m3u8)/i))
      );
    }
    return false;
  }, [property]);

  const formattedPrice = useMemo(() => {
    const p = typeof property.price === "string" ? parseFloat(property.price) : property.price;
    if (!p || isNaN(p)) return "Prix sur demande";
    return `${p.toLocaleString("fr-FR")} ${property.currency || "FCFA"}`;
  }, [property.price, property.currency]);

  const isLiked = isFavorited ?? (property.hasCurrentUserLiked || false);

  const handleToggleFavorite = () => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Connexion requise",
        text2: "Connectez-vous pour ajouter aux favoris.",
      });
      return;
    }
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id);
    } else {
      toggleLike.mutate({
        userId: user.id,
        entityId: property.id,
        entityType: "PROPERTY",
        type: "LIKE",
      });
    }
  };

  const isSale = property.purpose === "SALE";
  const locationText = property.location?.city || property.location?.name || "Niamey";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.cardContainer,
        width ? { width: width as any } : { flex: 1 },
        style,
      ]}
    >
      <LiquidSurface
        material="soft"
        borderRadius={16}
        style={[
          styles.surface,
          {
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            borderColor: isDark ? "#1E293B" : "#E2E8F0",
          },
        ]}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: coverUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />

          {/* Badge Purpose */}
          <View
            style={[
              styles.purposeBadge,
              { backgroundColor: isSale ? "#059669" : "#2563EB" },
            ]}
          >
            <Text style={styles.purposeBadgeText}>
              {isSale ? "Vente" : "Location"}
            </Text>
          </View>

          {/* Video indicator badge if property has video */}
          {hasVideo && (
            <View style={styles.videoBadge}>
              <Ionicons name="videocam" size={12} color="#FFF" />
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleFavorite}
            style={[
              styles.favBtn,
              {
                backgroundColor: isDark
                  ? "rgba(15, 23, 42, 0.75)"
                  : "rgba(255, 255, 255, 0.85)",
              },
            ]}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={16}
              color={isLiked ? "#EC4899" : isDark ? "#FFF" : "#0F172A"}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price */}
          <ThemedText
            variant="sm"
            weight="bold"
            color="accent"
            numberOfLines={1}
            style={styles.price}
          >
            {formattedPrice}
          </ThemedText>

          {/* Title */}
          <ThemedText
            variant="xs"
            weight="semibold"
            numberOfLines={1}
            style={styles.title}
          >
            {property.title}
          </ThemedText>

          {/* Location & Specs Chips */}
          <View style={styles.footerRow}>
            <View style={styles.locRow}>
              <Ionicons name="location-sharp" size={11} color={theme.colors.mutedForeground} />
              <ThemedText variant="xs" color="mutedForeground" numberOfLines={1} style={{ fontSize: 10 }}>
                {locationText}
              </ThemedText>
            </View>

            {property.surface ? (
              <ThemedText variant="xs" color="mutedForeground" style={{ fontSize: 10 }}>
                {property.surface} m²
              </ThemedText>
            ) : property.rooms ? (
              <ThemedText variant="xs" color="mutedForeground" style={{ fontSize: 10 }}>
                {property.rooms} ch.
              </ThemedText>
            ) : null}
          </View>
        </View>
      </LiquidSurface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  surface: {
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 120,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  purposeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  purposeBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  videoBadge: {
    position: "absolute",
    top: 8,
    left: 62,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 10,
  },
  price: {
    fontSize: 13,
    marginBottom: 2,
  },
  title: {
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flex: 1,
    marginRight: 4,
  },
});
