"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";
import { DICT } from "@/lib/i18n";

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { t, lang, setLang, theme, toggleTheme } = useApp();

  // Both-language labels so each item reserves the max width
  // between ES and EN, preventing the header from shifting on toggle.
  const NAV = [
    { href: "/como-funciona", es: DICT.es.nav.how, en: DICT.en.nav.how },
    { href: "/clinicas", es: DICT.es.nav.clinics, en: DICT.en.nav.clinics },
    { href: "/profesionales", es: DICT.es.nav.pros, en: DICT.en.nav.pros },
    { href: "/buscar", es: DICT.es.nav.search, en: DICT.en.nav.search },
    { href: "/contacto", es: DICT.es.nav.contact, en: DICT.en.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-mist-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.href;
            const longer = n.es.length >= n.en.length ? n.es : n.en;
            const current = lang === "es" ? n.es : n.en;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "relative px-3.5 py-2 text-[14px] font-medium text-ink-800 transition hover:text-brand-700",
                  active && "text-brand-700"
                )}
              >
                {/* Ghost reserves space of the longer label so the menu does not shift */}
                <span className="invisible block whitespace-nowrap" aria-hidden>
                  {longer}
                </span>
                <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
                  {current}
                </span>
                {active && (
                  <span className="absolute -bottom-[1px] left-3.5 right-3.5 h-[2px] rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LangSwitch lang={lang} onChange={setLang} />
          <ThemeSwitch theme={theme} onToggle={toggleTheme} />

          <span className="mx-1 h-6 w-px bg-mist-200" />

          {/* Reserve width for the longer label between ES and EN */}
          <DualLabelButton href="/login" variant="ghost" es={DICT.es.nav.login} en={DICT.en.nav.login} current={lang} />
          <DualLabelButton
            href="/registro"
            variant="primary"
            es={DICT.es.nav.register}
            en={DICT.en.nav.register}
            current={lang}
            trailingIcon
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          aria-label="Abrir menú"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-mist-200 text-ink-800 md:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {open ? <path d="M6 6l12 12M18 6l-12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-mist-200 bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-5 py-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-800 hover:bg-mist-50"
              >
                {lang === "es" ? n.es : n.en}
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-2">
              <LangSwitch lang={lang} onChange={setLang} />
              <ThemeSwitch theme={theme} onToggle={toggleTheme} />
            </div>
            <div className="mt-2 flex gap-2">
              <Button href="/login" variant="secondary" size="sm" className="flex-1">{t.nav.login}</Button>
              <Button href="/registro" size="sm" className="flex-1">{t.nav.register}</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function DualLabelButton({
  href,
  es,
  en,
  current,
  variant,
  trailingIcon = false,
}: {
  href: string;
  es: string;
  en: string;
  current: "es" | "en";
  variant: "ghost" | "primary";
  trailingIcon?: boolean;
}) {
  const longer = es.length >= en.length ? es : en;
  const label = current === "es" ? es : en;
  const base =
    "relative inline-flex h-9 items-center justify-center rounded-full text-[14px] font-medium px-4 transition";
  const cls =
    variant === "primary"
      ? `${base} bg-brand-600 text-white hover:bg-brand-700 shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]`
      : `${base} bg-transparent text-ink-800 hover:bg-mist-100`;
  return (
    <Link href={href} className={cls}>
      <span className="invisible inline-flex items-center whitespace-nowrap" aria-hidden>
        {longer}
        {trailingIcon && <span className="ml-2 inline-block h-3.5 w-3.5" />}
      </span>
      <span className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap px-4">
        {label}
        {trailingIcon && (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </span>
    </Link>
  );
}

function LangSwitch({ lang, onChange }: { lang: "es" | "en"; onChange: (l: "es" | "en") => void }) {
  return (
    <div className="relative inline-flex h-9 items-center rounded-full border border-mist-200 bg-white p-0.5 text-[11px] font-semibold uppercase tracking-wider">
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 left-0.5 h-8 w-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-500 shadow-[0_6px_14px_-6px_rgba(37,99,235,0.7)] transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)]",
          lang === "en" && "translate-x-9"
        )}
      />
      <button
        onClick={() => onChange("es")}
        className={cn(
          "relative z-10 inline-flex h-8 w-9 items-center justify-center rounded-full transition-colors duration-200",
          lang === "es" ? "text-white" : "text-mist-500 hover:text-ink-800"
        )}
        aria-label="Español"
      >
        ES
      </button>
      <button
        onClick={() => onChange("en")}
        className={cn(
          "relative z-10 inline-flex h-8 w-9 items-center justify-center rounded-full transition-colors duration-200",
          lang === "en" ? "text-white" : "text-mist-500 hover:text-ink-800"
        )}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}

function ThemeSwitch({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-9 w-[68px] items-center rounded-full border border-mist-200 p-0.5 transition-colors duration-300",
        isDark ? "bg-ink-900" : "bg-white"
      )}
    >
      {/* sun (left) */}
      <span
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 transition-opacity duration-200",
          isDark ? "opacity-30" : "opacity-100"
        )}
        aria-hidden
      >
        <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
        </svg>
      </span>
      {/* moon (right) */}
      <span
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-200",
          isDark ? "opacity-100" : "opacity-30"
        )}
        aria-hidden
      >
        <svg className="h-3.5 w-3.5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" />
        </svg>
      </span>
      {/* thumb */}
      <span
        className={cn(
          "relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_6px_14px_-6px_rgba(10,22,51,0.5)] transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)]",
          isDark
            ? "translate-x-9 from-cyan-400 to-brand-500"
            : "translate-x-0 from-white to-mist-100 border border-mist-200"
        )}
        aria-hidden
      >
        {isDark ? (
          <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="12" cy="12" r="4" />
          </svg>
        )}
      </span>
    </button>
  );
}
