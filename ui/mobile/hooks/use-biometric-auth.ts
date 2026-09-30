// @/hooks/use-biometric-auth.ts
import { useState, useEffect, useCallback } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { useAppStore } from "@/stores/app-store";

export function useBiometricAuth() {
  const {
    biometricEnabled,
    setBiometricEnabled,
    isAppLockEnabled,
    setAppLockEnabled,
  } = useAppStore();

  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<
    LocalAuthentication.AuthenticationType[]
  >([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = hasHardware
          ? await LocalAuthentication.isEnrolledAsync()
          : false;
        const types = hasHardware
          ? await LocalAuthentication.supportedAuthenticationTypesAsync()
          : [];

        if (mounted) {
          setIsBiometricAvailable(hasHardware);
          setIsEnrolled(enrolled);
          setBiometricTypes(types);
        }
      } catch {
        if (mounted) {
          setIsBiometricAvailable(false);
          setIsEnrolled(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const authenticate = useCallback(
    async (promptMessage = "Déverrouiller Immo360"): Promise<boolean> => {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          fallbackLabel: "Utiliser le code de l'appareil",
          cancelLabel: "Annuler",
          disableDeviceFallback: false,
        });
        return result.success;
      } catch (err) {
        console.warn("Biometric authentication error:", err);
        return false;
      }
    },
    [],
  );

  const toggleBiometric = () => {
    setBiometricEnabled(!biometricEnabled);
  };

  return {
    isBiometricAvailable,
    isEnrolled,
    biometricTypes,
    isBiometricEnabled: biometricEnabled,
    authenticate,
    toggleBiometric,
  };
}

