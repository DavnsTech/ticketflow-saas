import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

import en from "../i18n/en.json";
import fr from "../i18n/fr.json";
import de from "../i18n/de.json";
import es from "../i18n/es.json";
import it from "../i18n/it.json";
import pt from "../i18n/pt.json";

export type Locale = "en" | "fr" | "de" | "es" | "it" | "pt";

const translations: Record<Locale, Record<string, unknown>> = { en, fr, de, es, it, pt };

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  pt: "Português",
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && saved in translations) return saved;
    const browserLang = navigator.language.split("-")[0] as Locale;
    return browserLang in translations ? browserLang : "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = getNestedValue(translations[locale] as Record<string, unknown>, key);
    if (value === key) {
      value = getNestedValue(translations.en as Record<string, unknown>, key);
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  }, [locale]);

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
