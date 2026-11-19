import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language, Translations } from "@/locales/translations";

// ── Deep dot-notation path resolver ──────────────────────────────────────
// Builds all valid dot paths from the nested translation object
// e.g. "nav.home" | "auth.login" | "hero.cta.hire" | ...

type Leaves<T, P extends string = ""> = {
  [K in keyof T]: T[K] extends string
    ? P extends "" ? `${string & K}` : `${P}.${string & K}`
    : P extends ""
    ? Leaves<T[K], `${string & K}`>
    : Leaves<T[K], `${P}.${string & K}`>;
}[keyof T];

export type TranslationPath = Leaves<Translations>;

// Resolves a dot-path like "hero.cta.hire" against the translation object
const resolvePath = (obj: Record<string, unknown>, path: string): string => {
  const result = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof result === "string" ? result : path; // fallback: return the key itself
};

// ── Context ───────────────────────────────────────────────────────────────

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Translate by dot-path: t("nav.home"), t("hero.cta.hire"), t("auth.login") */
  t: (path: TranslationPath) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("app_language") as Language) || "kin"
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app_language" && e.newValue) {
        setLanguage(e.newValue as Language);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_language", lang);
  };

  const t = (path: TranslationPath): string =>
    resolvePath(translations[language] as unknown as Record<string, unknown>, path);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
};