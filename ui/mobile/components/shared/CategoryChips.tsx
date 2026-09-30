// @/components/shared/CategoryChips.tsx
import React from "react";
import { ScrollView, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Chip } from "@/components/ui/chip";
import type { Category } from "@/types";

export interface CategoryChipsProps {
  categories: Category[];
  selectedId?: string;
  onSelect: (categoryId: string | undefined) => void;
  style?: StyleProp<ViewStyle>;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedId,
  onSelect,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, style]}
    >
      <Chip
        selected={!selectedId}
        variant={!selectedId ? "primary" : "glass"}
        size="md"
        onPress={() => onSelect(undefined)}
      >
        Tous
      </Chip>
      {categories.map((category) => (
        <Chip
          key={category.id}
          selected={selectedId === category.id}
          variant={selectedId === category.id ? "primary" : "glass"}
          size="md"
          onPress={() => onSelect(category.id)}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );
};

export default CategoryChips;

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
