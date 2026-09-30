// @/components/shared/LocationPickerDrawer.tsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput as RNTextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as ExpoLocation from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import Drawer from "@/components/ui/drawer";
import ThemedText from "@/components/ui/text";
import Button from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/hooks/useT";
import { useCreateLocationMutation } from "@/hooks/query";
import type { Location } from "@/types";
import Toast from "react-native-toast-message";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// Niamey par défaut
const DEFAULT_COORDS = {
  latitude: 13.5137,
  longitude: 2.1098,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export interface SelectedLocationData {
  id: string;
  name: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationPickerDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: SelectedLocationData) => void;
  locations?: Location[];
  selectedLocationId?: string;
}

export const LocationPickerDrawer: React.FC<LocationPickerDrawerProps> = ({
  visible,
  onClose,
  onSelect,
  locations = [],
  selectedLocationId,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useT();
  const mapRef = useRef<MapView>(null);
  const createLocationMutation = useCreateLocationMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_COORDS);
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [customName, setCustomName] = useState("");
  const [customCity, setCustomCity] = useState("Niamey");
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState<any[]>([]);

  // Initialisation à l'ouverture
  useEffect(() => {
    if (visible) {
      if (selectedLocationId) {
        const found = locations.find((l) => l.id === selectedLocationId);
        if (found) {
          setActiveLocation(found);
          setCustomName(found.name);
          setCustomCity(found.city || "Niamey");
          if (found.latitude && found.longitude) {
            const lat = Number(found.latitude);
            const lng = Number(found.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              setSelectedCoords({ latitude: lat, longitude: lng });
              setRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              });
            }
          }
        }
      } else {
        setSelectedCoords(DEFAULT_COORDS);
      }
    }
  }, [visible, selectedLocationId, locations]);

  // Filtrer les localisations existantes selon la recherche
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations.slice(0, 15);
    const q = searchQuery.toLowerCase().trim();
    return locations.filter(
      (loc) =>
        loc.name?.toLowerCase().includes(q) ||
        loc.city?.toLowerCase().includes(q) ||
        loc.quarter?.toLowerCase().includes(q)
    );
  }, [locations, searchQuery]);

  // Obtenir la position GPS actuelle
  const handleGetGPS = async () => {
    setIsLoadingGPS(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission refusée",
          text2: "Veuillez autoriser l'accès à la géolocalisation.",
        });
        return;
      }

      const loc = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      const newCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setSelectedCoords(newCoords);
      const newRegion = {
        ...newCoords,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 600);

      // Reverse geocode pour trouver le nom du quartier / ville
      try {
        const reverse = await ExpoLocation.reverseGeocodeAsync(newCoords);
        if (reverse && reverse.length > 0) {
          const rev = reverse[0];
          const name = rev.district || rev.street || rev.subregion || rev.name || "Position GPS";
          setCustomName(name);
          if (rev.city) setCustomCity(rev.city);
        }
      } catch (revErr) {
        // Silencieux si reverse geocode échoue
      }

      Toast.show({
        type: "success",
        text1: "Position détectée",
        text2: "Votre position actuelle a été positionnée sur la carte.",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erreur GPS",
        text2: err.message || "Impossible de récupérer votre position.",
      });
    } finally {
      setIsLoadingGPS(false);
    }
  };

  // Clic sur la carte
  const handleMapPress = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    setActiveLocation(null);
    if (!customName) {
      setCustomName("Emplacement sélectionné");
    }
  };

  // Recherche en ligne via OpenStreetMap Nominatim
  const handleSearchOnline = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingOnline(true);
    try {
      const encoded = encodeURIComponent(`${searchQuery.trim()}, Niger`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5`, {
        headers: { "User-Agent": "Immo360-MobileApp" },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setOnlineResults(data);
      } else {
        setOnlineResults([]);
        Toast.show({
          type: "info",
          text1: "Aucun résultat trouvé",
          text2: "Vous pouvez pointer directement sur la carte.",
        });
      }
    } catch (err) {
      setOnlineResults([]);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Sélectionner un résultat de recherche en ligne
  const handleSelectOnlineResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const newCoords = { latitude: lat, longitude: lon };
    setSelectedCoords(newCoords);
    setCustomName(item.name || item.display_name.split(",")[0]);
    const newRegion = {
      ...newCoords,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 600);
    setOnlineResults([]);
    setActiveLocation(null);
  };

  // Sélectionner une localisation de la base de données
  const handleSelectExistingLocation = (loc: Location) => {
    setActiveLocation(loc);
    setCustomName(loc.name);
    setCustomCity(loc.city || "Niamey");
    if (loc.latitude && loc.longitude) {
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const coords = { latitude: lat, longitude: lng };
        setSelectedCoords(coords);
        const newRegion = {
          ...coords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 600);
      }
    }
  };

  // Confirmer la sélection
  const handleConfirm = async () => {
    // 1. Si une localisation existante est sélectionnée
    if (activeLocation) {
      onSelect({
        id: activeLocation.id,
        name: activeLocation.name,
        city: activeLocation.city || "Niamey",
        latitude: activeLocation.latitude ? Number(activeLocation.latitude) : selectedCoords?.latitude,
        longitude: activeLocation.longitude ? Number(activeLocation.longitude) : selectedCoords?.longitude,
      });
      onClose();
      return;
    }

    // 2. Si une nouvelle localisation est pointée ou renseignée
    const nameToSave = customName.trim() || searchQuery.trim() || "Emplacement Niamey";
    const cityToSave = customCity.trim() || "Niamey";

    // Vérifier si un lieu existant porte déjà ce nom
    const existing = locations.find(
      (l) => l.name?.toLowerCase().trim() === nameToSave.toLowerCase().trim()
    );
    if (existing) {
      onSelect({
        id: existing.id,
        name: existing.name,
        city: existing.city || cityToSave,
        latitude: selectedCoords?.latitude,
        longitude: selectedCoords?.longitude,
      });
      onClose();
      return;
    }

    // Créer la localisation via l'API
    try {
      const created = await createLocationMutation.mutateAsync({
        name: nameToSave,
        city: cityToSave,
        country: "Niger",
        latitude: selectedCoords ? selectedCoords.latitude.toString() : undefined,
        longitude: selectedCoords ? selectedCoords.longitude.toString() : undefined,
      });

      const locResult = (created as any)?.location || created;

      onSelect({
        id: locResult.id,
        name: locResult.name || nameToSave,
        city: locResult.city || cityToSave,
        latitude: selectedCoords?.latitude,
        longitude: selectedCoords?.longitude,
      });
      Toast.show({
        type: "success",
        text1: "Localisation enregistrée",
        text2: `${nameToSave} (${cityToSave})`,
      });
      onClose();
    } catch (err: any) {
      // Fallback : si la création API échoue mais qu'on a au moins une localisation par défaut
      if (locations.length > 0) {
        const fallback = locations[0];
        onSelect({
          id: fallback.id,
          name: nameToSave,
          city: cityToSave,
          latitude: selectedCoords?.latitude,
          longitude: selectedCoords?.longitude,
        });
        onClose();
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de créer la localisation. Veuillez choisir un quartier de la liste.",
        });
      }
    }
  };

  return (
    <Drawer visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header Drawer */}
        <View style={styles.header}>
          <View>
            <ThemedText variant="base" weight="bold">
              Sélectionner la Localisation
            </ThemedText>
            <ThemedText variant="xs" color="mutedForeground">
              Recherchez ou pointez directement sur la carte
            </ThemedText>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Barre de Recherche & GPS */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.colors.mutedForeground} />
            <RNTextInput
              style={[styles.searchInput, { color: theme.colors.foreground }]}
              placeholder="Ex: Koira Kano, Plateau, Niamey 2000..."
              placeholderTextColor={theme.colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchOnline}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleGetGPS}
            style={[styles.gpsBtn, { backgroundColor: theme.colors.primary }]}
            disabled={isLoadingGPS}
          >
            {isLoadingGPS ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="navigate" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Résultats recherche en ligne */}
        {onlineResults.length > 0 && (
          <View style={[styles.onlineResultsBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {onlineResults.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.onlineResultItem}
                onPress={() => handleSelectOnlineResult(item)}
              >
                <Ionicons name="location" size={16} color={theme.colors.primary} />
                <ThemedText variant="xs" numberOfLines={1} style={{ flex: 1 }}>
                  {item.display_name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Carte Interactive */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {selectedCoords && (
              <Marker
                coordinate={selectedCoords}
                title={customName || "Emplacement du bien"}
                description={customCity}
                pinColor="#1E3A8A"
              />
            )}
          </MapView>

          {/* Badge informatif en overlay */}
          <View style={[styles.mapHintBadge, { backgroundColor: isDark ? "rgba(15,23,42,0.88)" : "rgba(255,255,255,0.92)" }]}>
            <Ionicons name="finger-print" size={14} color={theme.colors.primary} />
            <ThemedText variant="xs" weight="medium">
              Touchez la carte pour déplacer le repère
            </ThemedText>
          </View>
        </View>

        {/* Quartiers & Villes suggérés */}
        <ThemedText variant="xs" weight="bold" color="mutedForeground" style={{ marginTop: 10, marginBottom: 6 }}>
          QUARTIERS & EMPLACEMENTS POPULAIRES :
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {filteredLocations.map((loc) => {
            const isSelected = activeLocation?.id === loc.id;
            return (
              <TouchableOpacity
                key={loc.id}
                onPress={() => handleSelectExistingLocation(loc)}
                style={[
                  styles.locChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : isDark ? "#0F172A" : "#F1F5F9",
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={isSelected ? "#FFF" : theme.colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.locChipText,
                    { color: isSelected ? "#FFF" : theme.colors.foreground },
                  ]}
                >
                  {loc.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Détails & Confirmation */}
        <View style={[styles.confirmSection, { borderTopColor: theme.colors.border }]}>
          <View style={styles.selectedInfo}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <ThemedText variant="sm" weight="bold" numberOfLines={1}>
                {customName || "Aucun lieu sélectionné"}
              </ThemedText>
              <ThemedText variant="xs" color="mutedForeground">
                {customCity || "Niamey, Niger"} •{" "}
                {selectedCoords ? `${selectedCoords.latitude.toFixed(4)}, ${selectedCoords.longitude.toFixed(4)}` : "GPS non défini"}
              </ThemedText>
            </View>
          </View>

          <Button
            variant="default"
            onPress={handleConfirm}
            loading={createLocationMutation.isPending}
            style={{ width: "100%", marginTop: 8 }}
          >
            Confirmer cet emplacement
          </Button>
        </View>
      </View>
    </Drawer>
  );
};

export default LocationPickerDrawer;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeBtn: {
    padding: 6,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  gpsBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineResultsBox: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
    maxHeight: 120,
    overflow: "hidden",
  },
  onlineResultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150,150,150,0.2)",
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.26,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 6,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  mapHintBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  chipsScroll: {
    maxHeight: 40,
    marginBottom: 8,
  },
  locChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  locChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  confirmSection: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
});
