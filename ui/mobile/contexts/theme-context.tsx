import React, {
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { useAppStore } from "@/stores/app-store";
import { lightTheme, darkTheme, Theme, ThemeMode } from "@/constants/theme";

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  colorScheme: NonNullable<ColorSchemeName>;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  liquidGlassEnabled: boolean;
  setLiquidGlassEnabled: (enabled: boolean) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  initialMode = "system",
}: ThemeProviderProps) {
  const storeMode = useAppStore((s) => s.themeMode);
  const storeSetMode = useAppStore((s) => s.setThemeMode);
  const storeLiquidGlass = useAppStore((s) => s.liquidGlassEnabled);
  const storeSetLiquidGlass = useAppStore((s) => s.setLiquidGlassEnabled);
  const [colorScheme, setColorScheme] =
    useState<NonNullable<ColorSchemeName>>(
      Appearance.getColorScheme() ?? "light"
    );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: scheme }) => {
      if (scheme) {
        setColorScheme(scheme);
      }
    });

    return () => subscription.remove();
  }, []);

  const mode: ThemeMode = storeMode ?? initialMode;
  const liquidGlassEnabled = storeLiquidGlass ?? true;

  const isDark = useMemo(() => {
    if (mode === "system") {
      return colorScheme === "dark";
    }
    return mode === "dark";
  }, [mode, colorScheme]);

  const theme: Theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const setMode = (newMode: ThemeMode) => {
    storeSetMode(newMode);
  };

  const toggleTheme = () => {
    if (mode === "dark") {
      setMode("light");
    } else if (mode === "light") {
      setMode("dark");
    } else {
      setMode(isDark ? "light" : "dark");
    }
  };

  const setLiquidGlassEnabled = (enabled: boolean) => {
    storeSetLiquidGlass(enabled);
  };

  const value = useMemo(
    () => ({
      theme,
      mode,
      colorScheme,
      setMode,
      toggleTheme,
      isDark,
      liquidGlassEnabled,
      setLiquidGlassEnabled,
    }),
    [theme, mode, colorScheme, isDark, liquidGlassEnabled]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
