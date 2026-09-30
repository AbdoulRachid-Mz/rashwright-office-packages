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
import type { Conversation } from "@/types";
import ThemedText from "@/components/ui/text";

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
  style?: object;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onPress,
  style,
}) => {
  const { theme, isDark } = useTheme();
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

  const otherUser = useMemo(() => {
    return conversation.buyer;
  }, [conversation.buyer]);

  const coverImage =
    conversation.property?.coverImageUrl ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800";

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

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
        {/* Avatar */}
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: theme.colors.muted },
          ]}
        >
          {otherUser?.avatar ? (
            <Image
              source={{ uri: otherUser.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <Text style={[styles.avatarPlaceholder, { color: theme.colors.primary }]}>
              {otherUser?.fullName?.[0] || "U"}
            </Text>
          )}
          {conversation.unreadCount > 0 && (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.unreadText}>
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemedText
              variant="base"
              weight="semibold"
              numberOfLines={1}
              style={{ color: theme.colors.cardForeground, flex: 1 }}
            >
              {conversation.property?.title || "Conversation"}
            </ThemedText>
            {conversation.lastMessage && (
              <Text style={[styles.time, { color: theme.colors.mutedForeground }]}>
                {formatTime(conversation.lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <ThemedText
            variant="sm"
            numberOfLines={1}
            style={{
              color: theme.colors.mutedForeground,
              marginTop: 2,
            }}
          >
            {otherUser?.fullName || "Utilisateur"}
          </ThemedText>

          {conversation.lastMessage && (
            <Text
              numberOfLines={1}
              style={[
                styles.lastMessage,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {conversation.lastMessage.content}
            </Text>
          )}
        </View>

        {/* Property Thumbnail */}
        {conversation.property && (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: coverImage }}
              style={styles.thumbnail}
              contentFit="cover"
            />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    fontSize: 20,
    fontWeight: "bold",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: "500",
  },
  lastMessage: {
    fontSize: 13,
    marginTop: 2,
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
});

export default ConversationCard;
