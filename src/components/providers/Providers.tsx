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

export function Providers({
  children,
  initialLang = "es",
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const router = useRouter();
  // El idioma inicial viene del servidor (cookie) → server y client coinciden,
  // sin flash ni hydration mismatch.
  const [lang, setLangState] = useState<Lang>(initialLang);
  // El script inline del layout ya aplicó la clase `dark` desde localStorage
  // antes de hidratar (evita flash). Inicializamos el estado leyendo esa clase
  // del DOM: así no necesitamos un effect que haga setState al montar.
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("scn:theme", theme); } catch {}
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
