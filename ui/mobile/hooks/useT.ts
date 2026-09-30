import { useTranslation } from "react-i18next";
import { type SupportedLanguage } from "@/configs/i18n";

export function useT(ns = "translation") {
  const { t, i18n } = useTranslation(ns);
  return {
    t,
    lang: i18n.language as SupportedLanguage,
    dir: i18n.dir(),
  };
}
