import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "@/components/ui/text";
import { useTheme } from "@/contexts/theme-context";
import type { PropertyWithRelations } from "@/types";

interface PropertyOwnerHeaderProps {
  property: PropertyWithRelations;
  onPress?: () => void;
}

const PropertyOwnerHeader: React.FC<
  PropertyOwnerHeaderProps
> = ({
  property,
  onPress,
}) => {
  const { theme } = useTheme();

  const organization = property.organization;
  const owner = organization?.owner;

  const name =
    organization?.name ||
    owner?.fullName ||
    "Propriétaire";

  const avatar =
    organization?.logo ||
    owner?.avatar ||
    undefined;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={styles.identity}
      >
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor:
                `${theme.colors.primary}12`,
            },
          ]}
        >
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <Ionicons
              name="business-outline"
              size={20}
              color={theme.colors.primary}
            />
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <ThemedText
              variant="sm"
              weight="semibold"
              numberOfLines={1}
              style={{
                color: theme.colors.cardForeground,
                flexShrink: 1,
              }}
            >
              {name}
            </ThemedText>

            {organization?.verified && (
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={theme.propertyColors.verified}
              />
            )}
          </View>

          <ThemedText
            variant="xs"
            numberOfLines={1}
            style={{
              color: theme.colors.mutedForeground,
            }}
          >
            {organization?.type === "AGENCY"
              ? "Agence immobilière"
              : "Propriétaire"}
          </ThemedText>
        </View>
      </Pressable>

      {onPress && (
        <Pressable
          onPress={onPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.viewButton,
            {
              backgroundColor:
                `${theme.colors.primary}10`,
            },
            pressed && {
              opacity: 0.6,
            },
          ]}
        >
          <ThemedText
            variant="xs"
            weight="semibold"
            style={{
              color: theme.colors.primary,
            }}
          >
            Voir
          </ThemedText>

          <Ionicons
            name="chevron-forward"
            size={14}
            color={theme.colors.primary}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderBottomWidth: 1,
  },

  identity: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,
  },

  avatarContainer: {
    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  info: {
    marginLeft: 10,
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 10,

    gap: 2,
  },
});

export default PropertyOwnerHeader;