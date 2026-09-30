import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/hooks/useT";
import type { OrganizationWithStats } from "@/types";
import ThemedText from "@/components/ui/text";

interface OrganizationCardProps {
  organization: OrganizationWithStats;
  onPress?: () => void;
  onFollow?: (id: string) => void;
  isFollowed?: boolean;
  style?: object;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onPress,
  onFollow,
  isFollowed = false,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useT();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const activeProperties = organization.stats?.activeProperties ?? 0;
  const followersCount = organization.stats?.totalPropertyFavorites ?? 0;

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Banner */}
        {organization.banner && (
          <Image
            source={{ uri: organization.banner }}
            style={styles.banner}
            contentFit="cover"
            transition={300}
          />
        )}

        <View style={styles.content}>
          {/* Logo */}
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: theme.colors.muted },
            ]}
          >
            {organization.logo ? (
              <Image
                source={{ uri: organization.logo }}
                style={styles.logo}
                contentFit="cover"
              />
            ) : (
              <Text style={[styles.logoPlaceholder, { color: theme.colors.primary }]}>
                {organization.name?.[0] || "A"}
              </Text>
            )}
          </View>

          {/* Info */}
          <View style={styles.infoRow}>
            <View style={styles.titleRow}>
              <ThemedText
                variant="lg"
                weight="bold"
                numberOfLines={1}
                style={{ color: theme.colors.cardForeground, flex: 1 }}
              >
                {organization.name}
              </ThemedText>
              {organization.verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={theme.propertyColors.verified}
                />
              )}
            </View>

            <ThemedText
              variant="sm"
              numberOfLines={1}
              style={{ color: theme.colors.mutedForeground }}
            >
              {organization.address || "Niamey, Niger"}
            </ThemedText>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="home-outline" size={16} color={theme.colors.primary} />
                <ThemedText variant="xs" style={{ color: theme.colors.mutedForeground }}>
                  {activeProperties} {t("agency.listings", "annonces")}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={16} color={theme.colors.accent} />
                <ThemedText variant="xs" style={{ color: theme.colors.mutedForeground }}>
                  {followersCount} {t("agency.followers", "followers")}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Follow Button */}
          {onFollow && (
            <Pressable
              onPress={() => onFollow(organization.id)}
              style={[
                styles.followButton,
                {
                  backgroundColor: isFollowed
                    ? theme.colors.muted
                    : theme.colors.primary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.followText,
                  { color: isFollowed ? theme.colors.foreground : theme.colors.primaryForeground },
                ]}
              >
                {isFollowed ? t("agency.unfollow", "Suivi") : t("agency.follow", "Suivre")}
              </Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  banner: {
    width: "100%",
    height: 100,
  },
  content: {
    padding: 16,
    alignItems: "center",
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: -40,
    borderWidth: 3,
    borderColor: "white",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    fontSize: 24,
    fontWeight: "bold",
  },
  infoRow: {
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  followButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    alignItems: "center",
  },
  followText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default OrganizationCard;
