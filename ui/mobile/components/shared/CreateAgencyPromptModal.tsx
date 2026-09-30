// src/components/shared/CreateAgencyPromptModal.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/hooks/useT";
import { useAppStore } from "@/stores/app-store";
import {
  ThemedText,
  Button,
  TextInput,
  LiquidSurface,
} from "@/components/ui";
import { useCreateOrganizationMutation } from "@/hooks/query";
import Toast from "react-native-toast-message";

interface CreateAgencyPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ORG_TYPES = [
  { label: "Particulier", value: "PERSONAL", icon: "person" },
  { label: "Agence", value: "AGENCY", icon: "business" },
  { label: "Promoteur", value: "PROMOTER", icon: "construct" },
  { label: "Société", value: "COMPANY", icon: "briefcase" },
] as const;

export default function CreateAgencyPromptModal({
  visible,
  onClose,
  onSuccess,
}: CreateAgencyPromptModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useT();
  const { user, setCurrentOrganization } = useAppStore();

  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<"PERSONAL" | "AGENCY" | "PROMOTER" | "COMPANY">("AGENCY");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.city || "");

  const createMutation = useCreateOrganizationMutation();

  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: t("errors.required_field", "Champ requis"),
        text2: "Veuillez entrer le nom de votre agence ou espace.",
      });
      return;
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);

    try {
      const res = await createMutation.mutateAsync({
        name: name.trim(),
        slug: slug || `org-${Date.now()}`,
        type: selectedType,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        status: "ACTIVE",
      });

      if (res?.data) {
        // @ts-ignore
        const createdOrg = res.data.organization || res.data;
        setCurrentOrganization(createdOrg);
      }

      Toast.show({
        type: "success",
        text1: "Espace créé !",
        text2: `Votre organisation "${name}" a été configurée avec succès.`,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Erreur lors de la création.";
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: msg,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={24} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText variant="lg" weight="bold">
                Créez votre agence
              </ThemedText>
              <ThemedText variant="sm" color="mutedForeground">
                Publiez vos biens et développez votre visibilité.
              </ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Type selector */}
            <ThemedText variant="sm" weight="semibold" style={styles.fieldLabel}>
              Type d'organisation
            </ThemedText>
            <View style={styles.typeGrid}>
              {ORG_TYPES.map((tItem) => {
                const isSelected = selectedType === tItem.value;
                return (
                  <TouchableOpacity
                    key={tItem.value}
                    onPress={() => setSelectedType(tItem.value as any)}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.accent
                          : isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)",
                        borderColor: isSelected
                          ? theme.colors.accent
                          : isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.08)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={tItem.icon as any}
                      size={16}
                      color={isSelected ? "#FFF" : theme.colors.foreground}
                      style={{ marginRight: 6 }}
                    />
                    <ThemedText
                      variant="xs"
                      weight={isSelected ? "bold" : "medium"}
                      style={{ color: isSelected ? "#FFF" : theme.colors.foreground }}
                    >
                      {tItem.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nom */}
            <ThemedText variant="sm" weight="semibold" style={styles.fieldLabel}>
              Nom de l'agence / entreprise *
            </ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Immo Sahel, Cabinet Al-Baraka..."
              style={styles.input}
            />

            {/* Téléphone */}
            <ThemedText variant="sm" weight="semibold" style={styles.fieldLabel}>
              Numéro de téléphone
            </ThemedText>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+227 90 00 00 00"
              keyboardType="phone-pad"
              style={styles.input}
            />

            {/* Ville / Adresse */}
            <ThemedText variant="sm" weight="semibold" style={styles.fieldLabel}>
              Ville / Adresse
            </ThemedText>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Ex: Niamey, Plateau"
              style={styles.input}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Button
              variant="ghost"
              size="md"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            >
              Plus tard
            </Button>
            <Button
              variant="default"
              size="md"
              onPress={handleCreate}
              loading={createMutation.isPending}
              disabled={createMutation.isPending}
              style={{ flex: 2 }}
            >
              Créer mon agence
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(235, 94, 40, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginTop: 12,
    marginBottom: 6,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150,150,150,0.2)",
  },
});
