// components/shared/PlanCard.tsx (NOUVEAU)

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/hooks/useT";
import type { Plan } from "@/types/billing";

interface PlanCardProps {
  plan: Plan;
  isCurrent?: boolean;
  isPopular?: boolean;
  onSelect: (plan: Plan) => void;
  isLoading?: boolean;
  style?: object;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrent = false,
  isPopular = false,
  onSelect,
  isLoading = false,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useT();
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

  const planColor = plan.color || (plan.slug === "PRO" ? "#D4A017" : "#1E3A8A");
  const isFree = plan.price === 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          borderColor: isPopular ? planColor : isDark ? "#334155" : "#E2E8F0",
          borderWidth: isPopular ? 2 : 1,
          shadowColor: isPopular ? planColor : "transparent",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: isPopular ? 8 : 2,
        },
        animatedStyle,
        style,
      ]}
    >
      {/* Popular Badge */}
      {isPopular && (
        <View
          style={[
            styles.popularBadge,
            {
              backgroundColor: planColor,
            },
          ]}
        >
          <Text style={styles.popularText}>
            {plan.badge || t("billing_plans.popular", "LE PLUS POPULAIRE")}
          </Text>
        </View>
      )}

      {/* Plan Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.planName, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>
            {plan.name}
          </Text>
          <Text style={[styles.planDescription, { color: isDark ? "#94A3B8" : "#64748B" }]}>
            {plan.description}
          </Text>
        </View>
        {isCurrent && (
          <View style={[styles.currentBadge, { backgroundColor: "#10B981" }]}>
            <Text style={styles.currentText}>{t("agency.plan_current", "Actuel")}</Text>
          </View>
        )}
      </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: planColor }]}>
          {formatPrice(plan.price)} FCFA
        </Text>
        <Text style={[styles.interval, { color: isDark ? "#94A3B8" : "#64748B" }]}>
          / {plan.interval === "monthly" ? t("property.months", "mois") : t("billing_plans.yearly", "an")}
        </Text>
      </View>

      {!isFree && (
        <Text style={[styles.yearlyPrice, { color: isDark ? "#94A3B8" : "#64748B" }]}>
          Soit {formatPrice(plan.priceYearly)} FCFA/{t("billing_plans.yearly", "an")}
        </Text>
      )}

      {/* Features */}
      <View style={styles.featuresContainer}>
        {plan.features.map((feature) => (
          <View key={feature.key} style={styles.featureRow}>
            <Ionicons
              name={feature.included ? "checkmark-circle" : "close-circle"}
              size={18}
              color={feature.included ? "#10B981" : isDark ? "#64748B" : "#94A3B8"}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: feature.included
                    ? isDark ? "#F8FAFC" : "#0F172A"
                    : isDark ? "#64748B" : "#94A3B8",
                },
              ]}
            >
              {feature.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={() => onSelect(plan)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isCurrent || isLoading}
        style={[
          styles.selectButton,
          {
            backgroundColor: isCurrent ? theme.colors.muted : planColor,
            opacity: isCurrent ? 0.6 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.selectButtonText,
            {
              color: isCurrent
                ? isDark ? "#94A3B8" : "#64748B"
                : "#FFFFFF",
            },
          ]}
        >
          {isCurrent ? t("agency.plan_current", "Plan actuel") : t("agency.plan_choose", { name: plan.name })}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 4,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: "800",
  },
  planDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 12,
    marginBottom: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: "900",
  },
  interval: {
    fontSize: 14,
    marginLeft: 4,
  },
  yearlyPrice: {
    fontSize: 13,
    marginBottom: 16,
  },
  featuresContainer: {
    marginTop: 16,
    gap: 6,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  selectButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default PlanCard;