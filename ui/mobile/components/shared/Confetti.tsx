// components/shared/Confetti.tsx (NOUVEAU)

import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ConfettiRef {
  /** Lance une explosion de confettis */
  fire: (options?: ConfettiOptions) => void;
  /** Arrête les confettis en cours */
  stop: () => void;
  /** Lance une explosion avec un preset */
  firePreset: (preset: ConfettiPresetType) => void;
}

export type ConfettiPresetType = "success" | "celebration" | "fireworks" | "rain" | "subtle" | "gold";

export interface ConfettiOptions {
  /** Nombre de confettis */
  count?: number;
  /** Couleurs des confettis */
  colors?: string[];
  /** Durée de l'animation */
  duration?: number;
  /** Taille des confettis */
  size?: number;
  /** Origine de l'explosion (x: 0-1, y: 0-1) */
  origin?: { x: number; y: number };
  /** Type de confettis */
  type?: "explosion" | "fall" | "fireworks";
}

const PRESETS: Record<ConfettiPresetType, ConfettiOptions> = {
  success: {
    count: 120,
    colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#059669"],
    duration: 2500,
    size: 8,
    origin: { x: 0.5, y: 0.6 },
    type: "explosion",
  },
  celebration: {
    count: 200,
    colors: ["#f59e0b", "#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981"],
    duration: 3500,
    size: 10,
    origin: { x: 0.5, y: 0.5 },
    type: "fireworks",
  },
  fireworks: {
    count: 250,
    colors: ["#fbbf24", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6"],
    duration: 4000,
    size: 12,
    origin: { x: 0.5, y: 0.4 },
    type: "fireworks",
  },
  rain: {
    count: 150,
    colors: ["#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe", "#1d4ed8"],
    duration: 3000,
    size: 6,
    origin: { x: 0.5, y: 0 },
    type: "fall",
  },
  subtle: {
    count: 60,
    colors: ["#10b981", "#34d399", "#6ee7b7"],
    duration: 2000,
    size: 6,
    origin: { x: 0.5, y: 0.7 },
    type: "explosion",
  },
  gold: {
    count: 180,
    colors: ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#fcd34d", "#fde68a"],
    duration: 3000,
    size: 10,
    origin: { x: 0.5, y: 0.6 },
    type: "explosion",
  },
};

const Confetti = forwardRef<ConfettiRef>((_, ref) => {
  const confettiRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    fire: (options: ConfettiOptions = {}) => {
      const config = {
        count: options.count || 100,
        colors: options.colors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
        duration: options.duration || 3000,
        size: options.size || 8,
        startDelay: 0,
        fadeOutDuration: 500,
        ...options,
      };

      // Nettoyer le timeout précédent
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Arrêter les confettis précédents
      if (confettiRef.current) {
        try {
          confettiRef.current.stop();
        } catch (e) {
          // Ignorer
        }
      }

      // Lancer les nouveaux confettis
      if (confettiRef.current) {
        try {
          confettiRef.current.start(config);
        } catch (e) {
          console.warn("Erreur lors du lancement des confettis:", e);
        }
      }

      // Arrêter automatiquement après la durée
      timeoutRef.current = setTimeout(() => {
        if (confettiRef.current) {
          try {
            confettiRef.current.stop();
          } catch (e) {
            // Ignorer
          }
        }
        timeoutRef.current = null;
      }, config.duration + 500);
    },

    stop: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (confettiRef.current) {
        try {
          confettiRef.current.stop();
        } catch (e) {
          // Ignorer
        }
      }
    },

    firePreset: (preset: ConfettiPresetType) => {
      const options = PRESETS[preset] || PRESETS.success;
      ref && typeof ref === "object" && "fire" in ref && (ref as any).fire(options);
    },
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        confettiCount={100}
        colors={["#FF6B6B", "#4ECDC4", "#45B7D1"]}
      />
    </View>
  );
});

Confetti.displayName = "Confetti";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 9999,
  },
});

export default Confetti;