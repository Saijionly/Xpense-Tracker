"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Language, TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("xpense-language") as Language | null;
      if (stored === "en" || stored === "fil") setLanguageState(stored);
    } catch {
      // ignore
    }
  }, []);

  function setLanguage(l: Language) {
    setLanguageState(l);
    try {
      localStorage.setItem("xpense-language", l);
    } catch {
      // ignore
    }
  }

  function t(key: TranslationKey): string {
    return translations[language][key] ?? translations.en[key];
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}