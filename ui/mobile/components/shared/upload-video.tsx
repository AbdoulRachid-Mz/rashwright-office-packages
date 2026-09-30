// @/components/shared/upload-video.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { CloudinaryUploadService } from "@/services/cloudinary/upload.service";
import ThemedText from "@/components/ui/text";
import LiquidSurface from "@/components/ui/liquid/liquid-surface";
import Toast from "react-native-toast-message";

interface UploadVideoProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export default function UploadVideo({
  value,
  onChange,
  onRemove,
}: UploadVideoProps) {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [uploading, setUploading] = useState(false);

  const handlePickVideo = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission requise",
          "Veuillez autoriser l'accès à vos vidéos pour ajouter une vidéo à votre annonce."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 120, // 2 minutes max
      });

      if (result.canceled || !result.assets || !result.assets.length) {
        return;
      }

      const asset = result.assets[0];
      setUploading(true);

      Toast.show({
        type: "info",
        text1: "Envoi de la vidéo...",
        text2: "Votre vidéo est en cours de téléversement en haute qualité.",
      });

      const uploadResult =
        await CloudinaryUploadService.getInstance().uploadVideo(
          asset.uri,
          asset.fileName || `property_video_${Date.now()}.mp4`,
          asset.mimeType || "video/mp4"
        );

      onChange(uploadResult.secureUrl || uploadResult.url);

      Toast.show({
        type: "success",
        text1: "Vidéo ajoutée !",
        text2: "La vidéo a été téléversée avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur upload vidéo:", error);
      Alert.alert(
        "Erreur d'envoi",
        error?.message || "Impossible d'envoyer la vidéo. Veuillez réessayer."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
  };

  const handlePlayVideo = () => {
    if (value) {
      router.push({
        pathname: "/video-viewer",
        params: { video: value },
      });
    }
  };

  return (
    <View style={styles.container}>
      {value ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePlayVideo}
        >
          <LiquidSurface
            material="soft"
            borderRadius={14}
            style={[
              styles.videoPreviewCard,
              {
                backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                borderColor: "#2563EB",
              },
            ]}
          >
            <View style={styles.videoIconContainer}>
              <Ionicons name="play" size={24} color="#2563EB" />
            </View>

            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <ThemedText variant="xs" weight="bold" color="foreground">
                Vidéo de l'annonce ajoutée
              </ThemedText>
              <ThemedText
                variant="xs"
                color="primary"
                style={{ fontSize: 11, marginTop: 2, fontWeight: "600" }}
              >
                Appuyer pour lire / prévisualiser ▶
              </ThemedText>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity
                onPress={handlePlayVideo}
                style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
                activeOpacity={0.7}
              >
                <Ionicons name="play" size={16} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRemove}
                style={[styles.removeBtn, { backgroundColor: isDark ? "#1E293B" : "#FEE2E2" }]}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </LiquidSurface>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handlePickVideo}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <LiquidSurface
            material="soft"
            borderRadius={14}
            style={[
              styles.uploadPlaceholder,
              {
                backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                borderColor: isDark ? "#334155" : "#CBD5E1",
              },
            ]}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.accent} />
                <ThemedText variant="xs" weight="semibold" style={{ marginTop: 8 }}>
                  Téléversement de la vidéo en cours...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.placeholderContent}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: theme.colors.accent + "20" },
                  ]}
                >
                  <Ionicons name="videocam-outline" size={24} color={theme.colors.accent} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <ThemedText variant="xs" weight="bold">
                    Ajouter une vidéo (visite virtuelle)
                  </ThemedText>
                  <ThemedText variant="xs" color="mutedForeground" style={{ fontSize: 11, marginTop: 2 }}>
                    MP4, MOV (max 2 minutes)
                  </ThemedText>
                </View>
                <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.accent} />
              </View>
            )}
          </LiquidSurface>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  uploadPlaceholder: {
    padding: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  placeholderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  videoPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1.5,
  },
  videoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
