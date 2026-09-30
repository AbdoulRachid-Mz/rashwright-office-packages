import React, { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/hooks/useT";
import ThemedText from "@/components/ui/text";
import Button from "@/components/ui/button";

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  purpose?: "SALE" | "RENT";
  isVerified?: boolean;
  hasInstallments?: boolean;
  rooms?: number;
  bathrooms?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const { theme } = useTheme();
  const { t, lang } = useT();
  const translateY = useSharedValue(visible ? 0 : 400);
  const opacity = useSharedValue(visible ? 1 : 0);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: initialFilters?.minPrice,
    maxPrice: initialFilters?.maxPrice,
    minSurface: initialFilters?.minSurface,
    maxSurface: initialFilters?.maxSurface,
    purpose: initialFilters?.purpose,
    isVerified: initialFilters?.isVerified,
    hasInstallments: initialFilters?.hasInstallments,
    rooms: initialFilters?.rooms,
    bathrooms: initialFilters?.bathrooms,
  });

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(400, { damping: 20, stiffness: 150 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      minSurface: undefined,
      maxSurface: undefined,
      purpose: undefined,
      isVerified: undefined,
      hasInstallments: undefined,
      rooms: undefined,
      bathrooms: undefined,
    });
  };

  const priceOptions = [50_000, 100_000, 250_000, 500_000, 1_000_000];
  const surfaceOptions = [50, 100, 200, 500];
  const roomsOptions = [1, 2, 3, 4, 5];

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedOverlayStyle]}>
      <AnimatedPressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.sheet, { backgroundColor: theme.colors.card }, animatedSheetStyle]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.cardForeground }]}>
              {t("search_filters.title", "Filtres")}
            </Text>
            <Pressable onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={theme.colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Purpose */}
            <FilterSection title={t("search_filters.purpose", "Type de bien")}>
              <View style={styles.row}>
                <FilterChip
                  label={t("search.sale", "À vendre")}
                  selected={filters.purpose === "SALE"}
                  onPress={() => updateFilter("purpose", filters.purpose === "SALE" ? undefined : "SALE")}
                  theme={theme}
                />
                <FilterChip
                  label={t("search.rent", "À louer")}
                  selected={filters.purpose === "RENT"}
                  onPress={() => updateFilter("purpose", filters.purpose === "RENT" ? undefined : "RENT")}
                  theme={theme}
                />
              </View>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title={t("search_filters.price_range", "Budget max")}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {priceOptions.map((price) => (
                    <FilterChip
                      key={price}
                      label={`${new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(price)} FCFA`}
                      selected={filters.maxPrice === price}
                      onPress={() => updateFilter("maxPrice", filters.maxPrice === price ? undefined : price)}
                      theme={theme}
                    />
                  ))}
                </View>
              </ScrollView>
            </FilterSection>

            {/* Surface */}
            <FilterSection title={t("search_filters.surface_range", "Surface minimale")}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {surfaceOptions.map((surface) => (
                    <FilterChip
                      key={surface}
                      label={`${surface} m²`}
                      selected={filters.minSurface === surface}
                      onPress={() => updateFilter("minSurface", filters.minSurface === surface ? undefined : surface)}
                      theme={theme}
                    />
                  ))}
                </View>
              </ScrollView>
            </FilterSection>

            {/* Rooms */}
            <FilterSection title={t("search_filters.rooms", "Pièces")}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {roomsOptions.map((rooms) => (
                    <FilterChip
                      key={rooms}
                      label={`${rooms}+`}
                      selected={filters.rooms === rooms}
                      onPress={() => updateFilter("rooms", filters.rooms === rooms ? undefined : rooms)}
                      theme={theme}
                    />
                  ))}
                </View>
              </ScrollView>
            </FilterSection>

            {/* Toggles */}
            <FilterSection title={t("common.summary", "Options")}>
              <View style={styles.toggleRow}>
                <ToggleRow
                  label={t("search.verified_only", "Vérifié uniquement")}
                  value={filters.isVerified || false}
                  onToggle={(val) => updateFilter("isVerified", val || undefined)}
                  theme={theme}
                />
                <ToggleRow
                  label={t("search.installments_only", "Paiement par tranche")}
                  value={filters.hasInstallments || false}
                  onToggle={(val) => updateFilter("hasInstallments", val || undefined)}
                  theme={theme}
                />
              </View>
            </FilterSection>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
            <Button variant="ghost" onPress={handleReset} style={{ flex: 1 }}>
              {t("search_filters.reset_all", "Réinitialiser")}
            </Button>
            <Button onPress={handleApply} style={{ flex: 1 }}>
              {t("search_filters.apply", "Appliquer")}
            </Button>
          </View>
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
};

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
      <ThemedText variant="sm" weight="semibold" style={{ color: theme.colors.mutedForeground, marginBottom: 12 }}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
};

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress, theme }) => {
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
            backgroundColor: selected ? theme.colors.primary : theme.colors.muted,
            borderColor: selected ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: selected ? theme.colors.primaryForeground : theme.colors.mutedForeground,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onToggle, theme }) => {
  return (
    <Pressable
      onPress={() => onToggle(!value)}
      style={[styles.toggleRowItem, { borderBottomColor: theme.colors.border }]}
    >
      <Text style={[styles.toggleLabel, { color: theme.colors.cardForeground }]}>
        {label}
      </Text>
      <View
        style={[
          styles.toggleTrack,
          {
            backgroundColor: value ? theme.colors.primary : theme.colors.muted,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.toggleThumb,
            {
              transform: [{ translateX: value ? 20 : 2 }],
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  toggleRow: {
    gap: 12,
  },
  toggleRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
});

export default FilterBottomSheet;
