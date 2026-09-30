// @/components/shared/PropertyFormSteps.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "@/components/ui/text";
import TextInput from "@/components/ui/text-input";
import Button from "@/components/ui/button";
import Switch from "@/components/ui/switch";
import Drawer from "@/components/ui/drawer";
import CategoryChips from "@/components/shared/CategoryChips";
import UploadImage from "@/components/shared/upload-image";
import UploadVideo from "@/components/shared/upload-video";
import LocationPickerDrawer, { SelectedLocationData } from "@/components/shared/LocationPickerDrawer";
import { generateSmartPropertyDescription } from "@/utils/property-description-generator";
import type { Category, Location } from "@/types";
import Toast from "react-native-toast-message";

export { CategoryChips };

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ───────────────────────────────────────────────────────────────────── */
/* TYPES                                                                 */
/* ───────────────────────────────────────────────────────────────────── */

export interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  categoryId: string;
  locationId: string;
  locationName?: string;
  locationCity?: string;
  latitude?: number;
  longitude?: number;
  surface: string;
  rooms: string;
  bathrooms: string;
  floors: string;
  features: string[];
  media: string[];
  video?: string;
  purpose: "SALE" | "RENT";
  hasInstallments: boolean;
  installmentMonths: string;
  installmentDeposit: string;
}

export interface PropertyFormStepProps {
  data: PropertyFormData;
  onChange: (patch: Partial<PropertyFormData>) => void;
  categories?: Category[];
  locations?: Location[];
}

export const DEFAULT_DATA: PropertyFormData = {
  title: "",
  description: "",
  price: "",
  currency: "XOF",
  categoryId: "",
  locationId: "",
  locationName: "",
  locationCity: "Niamey",
  surface: "",
  rooms: "",
  bathrooms: "",
  floors: "",
  features: [],
  media: [],
  video: "",
  purpose: "SALE",
  hasInstallments: false,
  installmentMonths: "",
  installmentDeposit: "",
};

/* ───────────────────────────────────────────────────────────────────── */
/* CHIP COMPONENT                                                        */
/* ───────────────────────────────────────────────────────────────────── */

interface PressableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
  style?: object;
}

const PressableChip: React.FC<PressableChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.chip,
          {
            backgroundColor: selected
              ? theme.colors.primary
              : isDark
              ? "#0F172A"
              : "#F1F5F9",
            borderColor: selected ? theme.colors.primary : theme.colors.border,
          },
          style,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={14}
            color={selected ? "#FFF" : theme.colors.mutedForeground}
          />
        )}
        <Text
          style={[
            styles.chipText,
            {
              color: selected ? "#FFF" : theme.colors.foreground,
              fontWeight: selected ? "700" : "500",
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

/* ───────────────────────────────────────────────────────────────────── */
/* DEVISES & CURRENCY DRAWER                                             */
/* ───────────────────────────────────────────────────────────────────── */

export const CURRENCIES = [
  { code: "XOF", label: "FCFA (BCEAO - UEMOA)", symbol: "F CFA" },
  { code: "XAF", label: "FCFA (BEAC - CEMAC)", symbol: "F CFA" },
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "USD", label: "Dollar américain ($)", symbol: "$" },
  { code: "GBP", label: "Livre sterling (£)", symbol: "£" },
  { code: "NGN", label: "Naira nigérian (₦)", symbol: "₦" },
  { code: "GHS", label: "Cedi ghanéen (₵)", symbol: "₵" },
  { code: "MAD", label: "Dirham marocain", symbol: "د.م." },
  { code: "TND", label: "Dinar tunisien", symbol: "DT" },
  { code: "DZD", label: "Dinar algérien", symbol: "دج" },
  { code: "KES", label: "Shilling kényan", symbol: "KSh" },
  { code: "ZAR", label: "Rand sud-africain", symbol: "R" },
  { code: "CAD", label: "Dollar canadien", symbol: "CA$" },
  { code: "CHF", label: "Franc suisse", symbol: "CHF" },
  { code: "GNF", label: "Franc guinéen", symbol: "FG" },
];

export interface CurrencyPickerDrawerProps {
  visible: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (currency: string) => void;
}

export const CurrencyPickerDrawer: React.FC<CurrencyPickerDrawerProps> = ({
  visible,
  onClose,
  selected,
  onSelect,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Drawer visible={visible} onClose={onClose}>
      <View style={styles.currencyDrawerContainer}>
        <View style={styles.currencyDrawerHeader}>
          <ThemedText variant="lg" weight="bold">
            Choisir la devise
          </ThemedText>
          <ThemedText variant="xs" color="mutedForeground">
            Monnaie affichée pour le montant de l'annonce
          </ThemedText>
        </View>

        <FlatList
          data={CURRENCIES}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 380 }}
          renderItem={({ item }) => {
            const isSelected = selected === item.code;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(item.code);
                  onClose();
                }}
                style={[
                  styles.currencyRow,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(30, 58, 138, 0.25)"
                        : "rgba(30, 58, 138, 0.08)"
                      : "transparent",
                    borderColor: isSelected ? theme.colors.primary : "transparent",
                  },
                ]}
              >
                <View style={styles.currencyRowLeft}>
                  <View
                    style={[
                      styles.currencyCodeBadge,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : isDark
                          ? "#1E293B"
                          : "#E2E8F0",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.currencyCodeText,
                        { color: isSelected ? "#FFF" : theme.colors.foreground },
                      ]}
                    >
                      {item.code}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="sm" weight="semibold">
                      {item.label}
                    </ThemedText>
                    <ThemedText variant="xs" color="mutedForeground">
                      Symbole : {item.symbol}
                    </ThemedText>
                  </View>
                </View>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.mutedForeground} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Drawer>
  );
};

/* ───────────────────────────────────────────────────────────────────── */
/* ÉTAPE 1 : INFOS GÉNÉRALES & PHOTOS                                    */
/* ───────────────────────────────────────────────────────────────────── */

export const PropertyFormStep1: React.FC<PropertyFormStepProps> = ({
  data,
  onChange,
  categories = [],
}) => {
  const { theme, isDark } = useTheme();
  const [showCurrencyDrawer, setShowCurrencyDrawer] = useState(false);

  return (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <ThemedText variant="lg" weight="bold" style={{ marginBottom: 4 }}>
        Informations Générales & Photos
      </ThemedText>
      <ThemedText variant="sm" color="mutedForeground" style={{ marginBottom: 16 }}>
        Définissez le type de bien, son prix et ajoutez les photos.
      </ThemedText>

      {/* Type de transaction : Vente / Location */}
      <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginBottom: 8 }}>
        TYPE DE TRANSACTION :
      </ThemedText>
      <View style={styles.purposeToggleRow}>
        <TouchableOpacity
          onPress={() => onChange({ purpose: "SALE" })}
          style={[
            styles.purposeBtn,
            {
              backgroundColor:
                data.purpose === "SALE"
                  ? theme.colors.primary
                  : isDark
                  ? "#0F172A"
                  : "#F1F5F9",
              borderColor:
                data.purpose === "SALE" ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name="pricetag"
            size={16}
            color={data.purpose === "SALE" ? "#FFF" : theme.colors.mutedForeground}
          />
          <Text
            style={[
              styles.purposeBtnText,
              {
                color:
                  data.purpose === "SALE" ? "#FFF" : theme.colors.foreground,
              },
            ]}
          >
            À Vendre (Vente)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChange({ purpose: "RENT" })}
          style={[
            styles.purposeBtn,
            {
              backgroundColor:
                data.purpose === "RENT"
                  ? theme.colors.primary
                  : isDark
                  ? "#0F172A"
                  : "#F1F5F9",
              borderColor:
                data.purpose === "RENT" ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name="key"
            size={16}
            color={data.purpose === "RENT" ? "#FFF" : theme.colors.mutedForeground}
          />
          <Text
            style={[
              styles.purposeBtnText,
              {
                color:
                  data.purpose === "RENT" ? "#FFF" : theme.colors.foreground,
              },
            ]}
          >
            À Louer (Location)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Catégorie */}
      <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginTop: 16, marginBottom: 8 }}>
        CATÉGORIE DE BIEN :
      </ThemedText>
      <CategoryChips
        categories={categories}
        selectedId={data.categoryId || undefined}
        onSelect={(catId) => onChange({ categoryId: catId || "" })}
      />

      {/* Titre */}
      <View style={{ marginTop: 16 }}>
        <TextInput
          label="Titre de l'annonce *"
          placeholder="Ex: Belle Villa F5 avec Piscine à Koira Kano"
          value={data.title}
          onChangeText={(text) => onChange({ title: text })}
          maxLength={120}
        />
      </View>

      {/* Prix & Devise */}
      <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginTop: 14, marginBottom: 8 }}>
        PRIX DU BIEN :
      </ThemedText>
      <View style={styles.priceRow}>
        <View style={{ flex: 2 }}>
          <TextInput
            placeholder="Ex: 85000000"
            value={data.price}
            onChangeText={(text) => onChange({ price: text.replace(/[^0-9]/g, "") })}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1.2, marginLeft: 10 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowCurrencyDrawer(true)}
            style={[
              styles.currSelectBtn,
              {
                backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.currSelectBtnText,
                { color: theme.colors.foreground },
              ]}
              numberOfLines={1}
            >
              {data.currency || "XOF"}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer Sélecteur de Devise */}
      <CurrencyPickerDrawer
        visible={showCurrencyDrawer}
        onClose={() => setShowCurrencyDrawer(false)}
        selected={data.currency || "XOF"}
        onSelect={(newCurr) => onChange({ currency: newCurr })}
      />

      {/* Photos du bien */}
      <View style={{ marginTop: 20 }}>
        <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginBottom: 4 }}>
          PHOTOS DE L'ANNONCE (MAX 10) :
        </ThemedText>
        <ThemedText variant="xs" color="mutedForeground" style={{ marginBottom: 10 }}>
          Ajoutez des photos nettes pour booster la visibilité de votre annonce.
        </ThemedText>

        <UploadImage
          value={data.media}
          onChange={(urls) => onChange({ media: urls })}
          maxImages={10}
          multiple
          enableCamera
          enableGallery
          size={90}
          borderRadius={12}
        />
      </View>

      {/* Vidéo du bien */}
      <View style={{ marginTop: 20 }}>
        <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginBottom: 4 }}>
          VIDÉO DE L'ANNONCE (OPTIONNEL) :
        </ThemedText>
        <ThemedText variant="xs" color="mutedForeground" style={{ marginBottom: 8 }}>
          Ajoutez une courte vidéo ou visite virtuelle pour multiplier vos prises de contact.
        </ThemedText>

        <UploadVideo
          value={data.video}
          onChange={(url) => onChange({ video: url })}
          onRemove={() => onChange({ video: "" })}
        />
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

/* ───────────────────────────────────────────────────────────────────── */
/* ÉTAPE 2 : LOCALISATION & CARTE                                        */
/* ───────────────────────────────────────────────────────────────────── */

export const PropertyFormStep2: React.FC<PropertyFormStepProps> = ({
  data,
  onChange,
  locations = [],
}) => {
  const { theme, isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  // Retrouver le nom de la localisation si sélectionnée
  const selectedLocation = locations.find((l) => l.id === data.locationId);
  const locationDisplayName =
    data.locationName || selectedLocation?.name || "Aucun lieu sélectionné";
  const locationCity =
    data.locationCity || selectedLocation?.city || "Niamey, Niger";

  const hasCoords =
    data.latitude !== undefined &&
    data.longitude !== undefined &&
    !isNaN(Number(data.latitude)) &&
    !isNaN(Number(data.longitude));

  const mapCoords = hasCoords
    ? { latitude: Number(data.latitude), longitude: Number(data.longitude) }
    : selectedLocation?.latitude && selectedLocation?.longitude
    ? {
        latitude: Number(selectedLocation.latitude),
        longitude: Number(selectedLocation.longitude),
      }
    : { latitude: 13.5137, longitude: 2.1098 };

  const handleLocationPicked = (loc: SelectedLocationData) => {
    onChange({
      locationId: loc.id,
      locationName: loc.name,
      locationCity: loc.city,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
  };

  return (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <ThemedText variant="lg" weight="bold" style={{ marginBottom: 4 }}>
        Localisation Géographique
      </ThemedText>
      <ThemedText variant="sm" color="mutedForeground" style={{ marginBottom: 16 }}>
        Indiquez précisément l'emplacement de votre bien sur la carte.
      </ThemedText>

      {/* Carte d'Aperçu / Sélecteur */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setShowPicker(true)}
        style={[
          styles.mapPreviewCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: data.locationId ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <MapView
          style={styles.mapPreview}
          region={{
            ...mapCoords,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker coordinate={mapCoords} pinColor="#1E3A8A" />
        </MapView>

        {/* Overlay d'action */}
        <View style={styles.mapOverlay}>
          <View style={styles.mapOverlayHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="base" weight="bold">
                {locationDisplayName}
              </ThemedText>
              <ThemedText variant="xs" color="mutedForeground">
                {locationCity}
              </ThemedText>
            </View>
            <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="map" size={14} color="#FFF" />
              <Text style={styles.editBadgeText}>Modifier sur la carte</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Bouton direct d'ouverture du Drawer */}
      <Button
        variant="outline"
        onPress={() => setShowPicker(true)}
        leftIcon={<Ionicons name="navigate-outline" size={18} color={theme.colors.primary} />}
        style={{ marginTop: 14 }}
      >
        Ouvrir le Sélecteur de Localisation (GPS & Carte)
      </Button>

      {/* Raccourcis quartiers populaires */}
      <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginTop: 24, marginBottom: 10 }}>
        CHOISIR UN QUARTIER DE NIAMEY :
      </ThemedText>
      <View style={styles.quickLocGrid}>
        {locations.slice(0, 12).map((loc) => {
          const isSel = data.locationId === loc.id;
          return (
            <PressableChip
              key={loc.id}
              label={loc.name}
              selected={isSel}
              icon="location-sharp"
              onPress={() => {
                const lat = loc.latitude ? Number(loc.latitude) : undefined;
                const lng = loc.longitude ? Number(loc.longitude) : undefined;
                onChange({
                  locationId: loc.id,
                  locationName: loc.name,
                  locationCity: loc.city || "Niamey",
                  latitude: lat,
                  longitude: lng,
                });
              }}
            />
          );
        })}
      </View>

      {/* Drawer Map Modal */}
      <LocationPickerDrawer
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleLocationPicked}
        locations={locations}
        selectedLocationId={data.locationId}
      />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

/* ───────────────────────────────────────────────────────────────────── */
/* ÉTAPE 3 : CARACTÉRISTIQUES & DESCRIPTION ASSISTÉE                     */
/* ───────────────────────────────────────────────────────────────────── */

const FEATURES_LIST = [
  { key: "parking", label: "Parking", icon: "car-outline" },
  { key: "airConditioning", label: "Climatisation", icon: "snow-outline" },
  { key: "swimmingPool", label: "Piscine", icon: "water-outline" },
  { key: "garden", label: "Jardin", icon: "leaf-outline" },
  { key: "terrace", label: "Terrasse", icon: "sunny-outline" },
  { key: "balcony", label: "Balcon", icon: "business-outline" },
  { key: "garage", label: "Garage", icon: "construct-outline" },
  { key: "furnished", label: "Meublé", icon: "bed-outline" },
  { key: "security", label: "Sécurité 24h", icon: "shield-checkmark-outline" },
  { key: "elevator", label: "Ascenseur", icon: "arrow-up-outline" },
  { key: "generator", label: "Groupe électrogène", icon: "flash-outline" },
  { key: "waterDrilling", label: "Forage d'eau", icon: "funnel-outline" },
];

export const PropertyFormStep3: React.FC<PropertyFormStepProps> = ({
  data,
  onChange,
  categories = [],
}) => {
  const { theme, isDark } = useTheme();

  const toggleFeature = (featureKey: string) => {
    const current = data.features || [];
    const next = current.includes(featureKey)
      ? current.filter((f) => f !== featureKey)
      : [...current, featureKey];
    onChange({ features: next });
  };

  // Moteur de génération automatique
  const handleAutoGenerateDescription = () => {
    const selectedCategory = categories.find((c) => c.id === data.categoryId);
    const generated = generateSmartPropertyDescription({
      title: data.title,
      purpose: data.purpose,
      categoryName: selectedCategory?.name,
      price: data.price,
      currency: data.currency,
      locationName: data.locationName,
      surface: data.surface,
      rooms: data.rooms,
      bathrooms: data.bathrooms,
      floors: data.floors,
      features: data.features,
      hasInstallments: data.hasInstallments,
      installmentMonths: data.installmentMonths,
      installmentDeposit: data.installmentDeposit,
    });

    onChange({ description: generated });

    Toast.show({
      type: "success",
      text1: "✨ Description générée !",
      text2: "La description a été rédigée à partir de vos informations.",
    });
  };

  return (
    <ScrollView
      style={styles.stepContainer}
      contentContainerStyle={{ paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText variant="lg" weight="bold" style={{ marginBottom: 4 }}>
        Description & Caractéristiques
      </ThemedText>
      <ThemedText variant="sm" color="mutedForeground" style={{ marginBottom: 16 }}>
        Rédigez ou générez une description professionnelle et complétez les détails.
      </ThemedText>

      {/* Description avec Générateur Intelligent (placé en haut pour une visibilité immédiate) */}
      <View
        style={[
          styles.descSectionCard,
          {
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <View style={styles.descHeaderRow}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="xs" weight="bold" color="foreground">
              DESCRIPTION DE L'ANNONCE
            </ThemedText>
            <ThemedText variant="xs" color="mutedForeground" style={{ fontSize: 11, marginTop: 2 }}>
              Générez automatiquement un texte de qualité ou rédigez le vôtre
            </ThemedText>
          </View>

          <TouchableOpacity
            onPress={handleAutoGenerateDescription}
            style={[styles.magicGenBtn, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={15} color="#FFF" />
            <Text style={styles.magicGenText}>✨ Générer</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Décrivez les atouts, l'environnement, le cadre et les points forts du bien..."
          value={data.description}
          onChangeText={(text) => onChange({ description: text })}
          multiline
          numberOfLines={6}
          style={{ minHeight: 120, textAlignVertical: "top", marginTop: 10 }}
        />
      </View>

      {/* Dimensions */}
      <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginTop: 16, marginBottom: 8 }}>
        DIMENSIONS & STRUCTURE :
      </ThemedText>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Surface (m²)"
            placeholder="Ex: 250"
            value={data.surface}
            onChangeText={(text) => onChange({ surface: text.replace(/[^0-9]/g, "") })}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <TextInput
            label="Pièces (chambres)"
            placeholder="Ex: 5"
            value={data.rooms}
            onChangeText={(text) => onChange({ rooms: text.replace(/[^0-9]/g, "") })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Salles de bain / eau"
            placeholder="Ex: 3"
            value={data.bathrooms}
            onChangeText={(text) => onChange({ bathrooms: text.replace(/[^0-9]/g, "") })}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <TextInput
            label="Étages / Niveaux"
            placeholder="Ex: 1"
            value={data.floors}
            onChangeText={(text) => onChange({ floors: text.replace(/[^0-9]/g, "") })}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Équipements */}
      <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginTop: 14, marginBottom: 8 }}>
        ÉQUIPEMENTS & COMMODITÉS :
      </ThemedText>
      <View style={styles.featuresGrid}>
        {FEATURES_LIST.map((feat) => {
          const isSel = (data.features || []).includes(feat.key);
          return (
            <PressableChip
              key={feat.key}
              label={feat.label}
              selected={isSel}
              icon={feat.icon}
              onPress={() => toggleFeature(feat.key)}
              style={{ marginBottom: 6 }}
            />
          );
        })}
      </View>

      {/* Facilité de paiement échelonné */}
      <View
        style={[
          styles.installmentsCard,
          {
            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
            borderColor: theme.colors.border,
            marginTop: 14,
          },
        ]}
      >
        <View style={styles.installmentsHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="sm" weight="bold">
              Paiement échelonné / par tranches
            </ThemedText>
            <ThemedText variant="xs" color="mutedForeground">
              Autoriser le paiement progressif de ce bien
            </ThemedText>
          </View>
          <Switch
            value={data.hasInstallments}
            onValueChange={(val) => onChange({ hasInstallments: val })}
          />
        </View>

        {data.hasInstallments && (
          <View style={[styles.row, { marginTop: 12, marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Acompte initial"
                placeholder="Ex: 20000000"
                value={data.installmentDeposit}
                onChangeText={(text) => onChange({ installmentDeposit: text.replace(/[^0-9]/g, "") })}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TextInput
                label="Durée (mois)"
                placeholder="Ex: 12"
                value={data.installmentMonths}
                onChangeText={(text) => onChange({ installmentMonths: text.replace(/[^0-9]/g, "") })}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

/* ───────────────────────────────────────────────────────────────────── */
/* STYLES                                                                */
/* ───────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  purposeToggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  purposeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  purposeBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  currBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  currSelectBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  currSelectBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  currencyDrawerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  currencyDrawerHeader: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150,150,150,0.2)",
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  currencyRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  currencyCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 50,
    alignItems: "center",
  },
  currencyCodeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
  mapPreviewCard: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
  },
  mapPreview: {
    ...StyleSheet.absoluteFill,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
  },
  mapOverlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  quickLocGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  installmentsCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  installmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  descHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  magicGenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  magicGenText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  descSectionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
});
