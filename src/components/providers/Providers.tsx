"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DICT, type Lang, type Dict } from "@/lib/i18n";
import { RevealObserver } from "@/components/providers/RevealObserver";

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

const LANG_COOKIE = "scn_lang";
const THEME_COOKIE = "scn_theme"; // debe coincidir con la cookie que lee el layout

export function Providers({
  children,
  initialLang = "es",
  initialTheme = "light",
}: {
  children: ReactNode;
  initialLang?: Lang;
  initialTheme?: Theme;
}) {
  const router = useRouter();
  // El idioma y el tema iniciales vienen del servidor (cookies scn_lang /
  // scn_theme) → server y client renderizan lo mismo, sin flash ni hydration
  // mismatch.
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.setAttribute("data-theme", theme);
    // Cookie para que el servidor renderice el tema correcto en la próxima
    // carga (evita el mismatch); localStorage queda como respaldo.
    try {
      localStorage.setItem("scn:theme", theme);
      document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, [theme]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      try {
        // Cookie para que los Server Components también traduzcan.
        document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = l;
      } catch {}
      // Re-renderiza los Server Components con el nuevo idioma.
      router.refresh();
    },
    [router],
  );

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <AppContext.Provider value={{ lang, setLang, t: DICT[lang], theme, setTheme, toggleTheme }}>
      <RevealObserver />
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) {
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
