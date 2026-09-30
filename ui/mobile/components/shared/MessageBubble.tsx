// @/components/shared/MessageBubble.tsx 
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/hooks/useT";
import { useAppStore } from "@/stores/app-store";
import { useToggleMessageLikeMutation } from "@/hooks/query";
import type { Message } from "@/types";
import Toast from "react-native-toast-message";
import { copyText, shareText } from "@/utils/share";

interface MessageBubbleProps {
  message: Message;
  conversationId: string;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  senderAvatar?: string;
  senderName?: string;
  onReply?: (message: Message) => void;
  onLongPress?: (message: Message) => void;
  onOpenImage?: (url: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  conversationId,
  isOwnMessage,
  showAvatar = true,
  senderAvatar,
  senderName,
  onReply,
  onLongPress,
  onOpenImage,
}) => {
  const { theme, isDark } = useTheme();
  const { t, lang } = useT();
  const { user } = useAppStore();
  const [showActions, setShowActions] = useState(false);

  const likeMutation = useToggleMessageLikeMutation();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  React.useEffect(() => {
    opacity.value = withDelay(0, withSpring(1, { damping: 15, stiffness: 80 }));
    translateY.value = withDelay(
      0,
      withSpring(0, { damping: 15, stiffness: 80 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const bubbleColor = isOwnMessage
    ? theme.colors.primary
    : isDark
      ? "#1E293B"
      : "#F1F5F9";
  const textColor = isOwnMessage ? "#FFFFFF" : isDark ? "#F8FAFC" : "#0F172A";

  const handleLike = useCallback(() => {
    if (!user) return;
    likeMutation.mutate({
      messageId: message.id,
      userId: user.id,
      conversationId,
    });
  }, [message.id, user, conversationId]);

  const handleReply = useCallback(() => {
    onReply?.(message);
    setShowActions(false);
  }, [message, onReply]);

  const handleCopy = useCallback(async () => {
    const success = await copyText(message.content);
    if (success) {
      Toast.show({
        type: "success",
        text1: t("common.done", "Copié"),
        text2: t("chat.copy_success", "Message copié dans le presse-papier"),
      });
      setShowActions(false);
    } else {
      Toast.show({
        type: "error",
        text1: t("common.error", "Erreur"),
        text2: t("chat.copy_failed", "Impossible de copier le message"),
      });
    }
  }, [message.content]);

  const handleShare = useCallback(async () => {
    const success = await shareText(message.content);
    if (success) {
      Toast.show({
        type: "success",
        text1: t("common.done", "Partagé"),
        text2: t("chat.share_success", "Message partagé avec succès"),
      });
      setShowActions(false);
    } else {
      Toast.show({
        type: "error",
        text1: t("common.error", "Erreur"),
        text2: t("chat.share_failed", "Impossible de partager le message"),
      });
    }
  }, [message.content]);

  const handleImagePress = useCallback(() => {
    const imageUrl = message.attachments?.[0]?.url;
    if (imageUrl && onOpenImage) {
      onOpenImage(imageUrl);
    }
  }, [message.attachments, onOpenImage]);

  const renderAttachment = () => {
    if (!message.attachments?.length) return null;
    const attachment = message.attachments[0];

    if (attachment.type === "IMAGE") {
      return (
        <Pressable onPress={handleImagePress}>
          <Image
            source={{ uri: attachment.url }}
            style={styles.attachmentImage}
            contentFit="cover"
            transition={300}
          />
        </Pressable>
      );
    }
    return (
      <View
        style={[styles.fileAttachment, { backgroundColor: `${textColor}15` }]}
      >
        <Ionicons name="document-outline" size={20} color={textColor} />
        <Text style={[styles.fileName, { color: textColor }]}>
          {attachment.name || t("chat.attachment", "Fichier")}
        </Text>
      </View>
    );
  };

  const renderLocation = () => {
    if (!message.location) return null;
    return (
      <View
        style={[
          styles.locationAttachment,
          { backgroundColor: `${textColor}10` },
        ]}
      >
        <Ionicons name="location" size={16} color={textColor} />
        <Text style={[styles.locationText, { color: textColor }]}>
          {message.location.address || t("chat.location", "Localisation partagée")}
        </Text>
      </View>
    );
  };

  const renderReplyIndicator = () => {
    if (!message.parent) return null;
    return (
      <View
        style={[
          styles.replyIndicator,
          { borderLeftColor: theme.colors.accent },
        ]}
      >
        <Text style={[styles.replyName, { color: theme.colors.accent }]}>
          {message.parent.senderId === message.senderId ? t("chat.me", "Moi") : t("chat.reply_to", "Réponse à")}
        </Text>
        <Text
          style={[
            styles.replyContent,
            { color: isDark ? "#94A3B8" : "#64748B" },
          ]}
          numberOfLines={1}
        >
          {message.parent.content}
        </Text>
      </View>
    );
  };

  const likeCount = message.stats?.interactions?.LIKE || 0;
  const isLiked = message.hasCurrentUserLiked || false;
  const repliesCount = message.stats?.repliesCount || 0;

  return (
    <Animated.View
      style={[
        styles.container,
        isOwnMessage ? styles.ownContainer : styles.otherContainer,
        animatedStyle,
      ]}
    >
      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowActions(false)}
        >
          <View
            style={[styles.actionsMenu, { backgroundColor: theme.colors.card }]}
          >
            <TouchableOpacity style={styles.actionItem} onPress={handleReply}>
              <Ionicons
                name="return-up-back-outline"
                size={20}
                color={theme.colors.foreground}
              />
              <Text style={{ color: theme.colors.foreground }}>{t("chat.reply", "Répondre")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={handleCopy}>
              <Ionicons
                name="copy-outline"
                size={20}
                color={theme.colors.foreground}
              />
              <Text style={{ color: theme.colors.foreground }}>{t("common.copy", "Copier")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
              <Ionicons
                name="share-outline"
                size={20}
                color={theme.colors.foreground}
              />
              <Text style={{ color: theme.colors.foreground }}>{t("common.share", "Partager")}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {!isOwnMessage && showAvatar && (
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: theme.colors.muted },
          ]}
        >
          {senderAvatar ? (
            <Image
              source={{ uri: senderAvatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <Text
              style={[
                styles.avatarPlaceholder,
                { color: theme.colors.primary },
              ]}
            >
              {senderName?.[0] || "U"}
            </Text>
          )}
        </View>
      )}

      <Pressable
        onLongPress={() => setShowActions(true)}
        delayLongPress={500}
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleColor,
            borderBottomLeftRadius: isOwnMessage ? 16 : 4,
            borderBottomRightRadius: isOwnMessage ? 4 : 16,
          },
        ]}
      >
        {!isOwnMessage && senderName && (
          <Text style={[styles.senderName, { color: theme.colors.accent }]}>
            {senderName}
          </Text>
        )}

        {renderReplyIndicator()}

        <Text style={[styles.messageText, { color: textColor }]}>
          {message.content}
        </Text>

        {renderAttachment()}
        {renderLocation()}

        <View style={styles.metaRow}>
          <Text
            style={[
              styles.timeText,
              {
                color: isOwnMessage
                  ? "rgba(255,255,255,0.7)"
                  : theme.colors.mutedForeground,
              },
            ]}
          >
            {new Date(message.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : lang, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {/* Like Button */}
          <Pressable
            onPress={handleLike}
            style={styles.likeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={14}
              color={
                isLiked
                  ? "#EC4899"
                  : isOwnMessage
                    ? "rgba(255,255,255,0.7)"
                    : theme.colors.mutedForeground
              }
            />
            {likeCount > 0 && (
              <Text
                style={[
                  styles.likeCount,
                  {
                    color: isOwnMessage
                      ? "rgba(255,255,255,0.7)"
                      : theme.colors.mutedForeground,
                  },
                ]}
              >
                {likeCount}
              </Text>
            )}
          </Pressable>

          {/* Replies Count */}
          {repliesCount > 0 && (
            <Pressable
              onPress={() => onReply?.(message)}
              style={styles.replyCountButton}
            >
              <Ionicons
                name="return-up-back-outline"
                size={12}
                color={
                  isOwnMessage
                    ? "rgba(255,255,255,0.7)"
                    : theme.colors.mutedForeground
                }
              />
              <Text
                style={[
                  styles.replyCountText,
                  {
                    color: isOwnMessage
                      ? "rgba(255,255,255,0.7)"
                      : theme.colors.mutedForeground,
                  },
                ]}
              >
                {repliesCount}
              </Text>
            </Pressable>
          )}

          {isOwnMessage && (
            <Ionicons
              name={message.read ? "checkmark-done" : "checkmark"}
              size={14}
              color="rgba(255,255,255,0.7)"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 2,
    marginHorizontal: 12,
    alignItems: "flex-end",
  },
  ownContainer: { justifyContent: "flex-end" },
  otherContainer: { justifyContent: "flex-start" },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { fontSize: 12, fontWeight: "bold" },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  senderName: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  messageText: { fontSize: 14, lineHeight: 20 },
  attachmentImage: { width: 200, height: 150, borderRadius: 12, marginTop: 6 },
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  fileName: { fontSize: 13, fontWeight: "500" },
  locationAttachment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  locationText: { fontSize: 13, fontWeight: "500" },
  replyIndicator: {
    borderLeftWidth: 2,
    paddingLeft: 8,
    marginBottom: 4,
  },
  replyName: { fontSize: 11, fontWeight: "600" },
  replyContent: { fontSize: 12 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 6,
  },
  timeText: { fontSize: 10, fontWeight: "500" },
  likeButton: { flexDirection: "row", alignItems: "center", gap: 2 },
  likeCount: { fontSize: 10, fontWeight: "600" },
  replyCountButton: { flexDirection: "row", alignItems: "center", gap: 2 },
  replyCountText: { fontSize: 10, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsMenu: {
    borderRadius: 12,
    padding: 8,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
});

export default MessageBubble;
