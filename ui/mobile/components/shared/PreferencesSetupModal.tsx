// @/components/shared/PreferencesSetupModal.tsx
import { useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemedText from "@/components/ui/text";
import Button from "@/components/ui/button";
import LiquidSurface from "@/components/ui/liquid/liquid-surface";
import { Category } from "@/types";

export interface UserPrefs {
  purpose: "RENT" | "SALE" | "BOTH";
  minPrice: string;
  maxPrice: string;
  categoryIds: string[];
  city: string;
}

const PREFS_KEY = "@immo360_user_prefs";
const PREFS_SHOWN_KEY = "@immo360_prefs_shown";

export async function loadUserPrefs(): Promise<UserPrefs | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveUserPrefs(prefs: UserPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  await AsyncStorage.setItem(PREFS_SHOWN_KEY, "1");
}

export async function hasShownPrefs(): Promise<boolean> {
  const v = await AsyncStorage.getItem(PREFS_SHOWN_KEY);
  return v === "1";
}

interface Props {
  visible: boolean;
  categories: Category[];
  onDone: (prefs: UserPrefs) => void;
  onSkip: () => void;
}

const PURPOSE_OPTIONS = [
  { value: "SALE" as const, label: "A vendre", icon: "home-outline" },
  { value: "RENT" as const, label: "A louer", icon: "key-outline" },
  { value: "BOTH" as const, label: "Les deux", icon: "layers-outline" },
];

export default function PreferencesSetupModal({ visible, categories, onDone, onSkip }: Props) {
  const { theme, isDark } = useTheme();

  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState<UserPrefs["purpose"]>("BOTH");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [city, setCity] = useState("");

  const toggleCat = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDone = async () => {
    const prefs: UserPrefs = { purpose, minPrice, maxPrice, categoryIds: selectedCats, city };
    await saveUserPrefs(prefs);
    onDone(prefs);
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(PREFS_SHOWN_KEY, "1");
    onSkip();
  };

  const bg = isDark ? theme.colors.card : theme.colors.background;
  const border = theme.colors.border;
  const accent = theme.colors.accent;

  const steps = [
    <View key="purpose" style={styles.stepContent}>
      <ThemedText variant="2xl" weight="bold" style={{ textAlign: "center", marginBottom: 6 }}>
        Que cherchez-vous ?
      </ThemedText>
      <ThemedText variant="sm" color="mutedForeground" style={{ textAlign: "center", marginBottom: 24 }}>
        Personnalisez votre experience en quelques secondes.
      </ThemedText>
      <View style={{ gap: 12 }}>
        {PURPOSE_OPTIONS.map((opt) => {
          const selected = purpose === opt.value;
          return (
            <TouchableOpacity key={opt.value} onPress={() => setPurpose(opt.value)} activeOpacity={0.8}>
              <LiquidSurface
                material={selected ? "regular" : "soft"}
                borderRadius={14}
                style={[styles.purposeOption, selected && { borderColor: accent, borderWidth: 2 }]}
              >
                <Ionicons name={opt.icon as any} size={24} color={selected ? accent : theme.colors.mutedForeground} />
                <ThemedText weight="semibold" color={selected ? "accent" : "foreground"}>
                  {opt.label}
                </ThemedText>
                {selected && (
                  <Ionicons name="checkmark-circle" size={20} color={accent} style={{ marginLeft: "auto" }} />
                )}
              </LiquidSurface>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>,

    <View key="budget" style={styles.stepContent}>
      <ThemedText variant="2xl" weight="bold" style={{ textAlign: "center", marginBottom: 6 }}>
        Votre budget
      </ThemedText>
      <ThemedText variant="sm" color="mutedForeground" style={{ textAlign: "center", marginBottom: 24 }}>
        Laissez vide pour voir toutes les annonces.
      </ThemedText>
      <View style={{ gap: 14 }}>
        <View>
          <ThemedText variant="xs" weight="medium" color="mutedForeground" style={{ marginBottom: 6 }}>
            Budget minimum (FCFA)
          </ThemedText>
          <TextInput
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder="Ex: 50 000"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.mutedForeground}
            style={[styles.input, { color: theme.colors.foreground, borderColor: border, backgroundColor: isDark ? "#1e2530" : "#f4f5f7" }]}
          />
        </View>
        <View>
          <ThemedText variant="xs" weight="medium" color="mutedForeground" style={{ marginBottom: 6 }}>
            Budget maximum (FCFA)
          </ThemedText>
          <TextInput
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Ex: 500 000"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.mutedForeground}
            style={[styles.input, { color: theme.colors.foreground, borderColor: border, backgroundColor: isDark ? "#1e2530" : "#f4f5f7" }]}
          />
        </View>
        <View>
          <ThemedText variant="xs" weight="medium" color="mutedForeground" style={{ marginBottom: 6 }}>
            Ville preferee
          </ThemedText>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Ex: Niamey"
            placeholderTextColor={theme.colors.mutedForeground}
            style={[styles.input, { color: theme.colors.foreground, borderColor: border, backgroundColor: isDark ? "#1e2530" : "#f4f5f7" }]}
          />
        </View>
      </View>
    </View>,

    <View key="cats" style={styles.stepContent}>
      <ThemedText variant="2xl" weight="bold" style={{ textAlign: "center", marginBottom: 6 }}>
        Vos categories
      </ThemedText>
      <ThemedText variant="sm" color="mutedForeground" style={{ textAlign: "center", marginBottom: 16 }}>
        Selectionnez ce qui vous interesse.
      </ThemedText>
      <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
        <View style={styles.catsGrid}>
          {categories.map((cat) => {
            const sel = selectedCats.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => toggleCat(cat.id)}
                activeOpacity={0.8}
                style={[styles.catChip, { backgroundColor: sel ? accent : (isDark ? "#1e2530" : "#f4f5f7"), borderColor: sel ? accent : border }]}
              >
                <ThemedText
                  variant="xs"
                  weight="medium"
                  style={{ color: sel ? "#fff" : theme.colors.foreground }}
                  numberOfLines={1}
                >
                  {cat.name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>,
  ];

  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.sheet, { backgroundColor: bg }]}>
          <View style={[styles.progressBar, { backgroundColor: border }]}>
            <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: accent }]} />
          </View>
          <View style={styles.stepIndicator}>
            <ThemedText variant="xs" color="mutedForeground">Etape {step + 1} / {steps.length}</ThemedText>
            <TouchableOpacity onPress={handleSkip}>
              <ThemedText variant="xs" color="mutedForeground" style={{ textDecorationLine: "underline" }}>Passer</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            {steps[step]}
          </ScrollView>
          <View style={styles.actions}>
            {step > 0 && (
              <Button variant="outline" size="md" style={{ flex: 1 }} onPress={() => setStep((s) => s - 1)}>Retour</Button>
            )}
            <Button variant="default" size="md" style={{ flex: 1 }} onPress={isLast ? handleDone : () => setStep((s) => s + 1)}>
              {isLast ? "Commencer !" : "Suivant"}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, maxHeight: "92%" },
  progressBar: { height: 4, borderRadius: 2, marginBottom: 14, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  stepIndicator: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  stepContent: { paddingBottom: 8 },
  purposeOption: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  catsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  actions: { flexDirection: "row", gap: 10, marginTop: 20 },
});
