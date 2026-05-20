"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { DICT, type Lang, type Dict } from "@/lib/i18n";

type Theme = "light" | "dark";
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  const [theme, setThemeState] = useState<Theme>("light");

  // Hydrate from localStorage / prefers-color-scheme
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("scn:lang") as Lang | null;
      if (storedLang === "es" || storedLang === "en") setLangState(storedLang);
      const storedTheme = localStorage.getItem("scn:theme") as Theme | null;
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      const effective = storedTheme || (prefersDark ? "dark" : "light");
      setThemeState(effective);
    } catch {}
  }, []);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("scn:theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("scn:lang", lang); } catch {}
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <AppContext.Provider value={{ lang, setLang, t: DICT[lang], theme, setTheme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) {
    // SSR-safe fallback (used only if a consumer is rendered outside provider during static prerender)
    return {
      lang: "es",
      setLang: () => {},
      t: DICT.es,
      theme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
