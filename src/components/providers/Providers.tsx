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
  const [theme, setThemeState] = useState<Theme>("light");

  // El theme sigue en localStorage (no necesita ser server-side; se aplica
  // con el script inline del layout para evitar flash).
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("scn:theme") as Theme | null;
      setThemeState(storedTheme === "dark" ? "dark" : "light");
    } catch {}
  }, []);

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
