"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";
import { DICT } from "@/lib/i18n";
import { UserMenu } from "@/components/auth/UserMenu";

type HeaderUser = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: "professional" | "clinic" | "admin" | null;
};

export function Header({ user }: { user: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { t, lang, setLang, theme, toggleTheme } = useApp();

  // Mientras el menú móvil está abierto: bloquea el scroll del fondo
  // (si no, el gesto de scroll se va a la página de detrás) y permite cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Both-language labels so each item reserves the max width
  // between ES and EN, preventing the header from shifting on toggle.
  const NAV = [
    { href: "/how-it-works", es: DICT.es.nav.how, en: DICT.en.nav.how },
    { href: "/clinics", es: DICT.es.nav.clinics, en: DICT.en.nav.clinics },
    { href: "/professionals", es: DICT.es.nav.pros, en: DICT.en.nav.pros },
    { href: "/search", es: DICT.es.nav.search, en: DICT.en.nav.search },
    { href: "/contact", es: DICT.es.nav.contact, en: DICT.en.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-[60] border-b border-mist-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <div className="flex items-center gap-6 lg:gap-9">
          <Logo className="shrink-0" />
          <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = path === n.href;
            const longer = n.es.length >= n.en.length ? n.es : n.en;
            const current = lang === "es" ? n.es : n.en;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "relative px-2.5 py-2 text-[14px] font-medium text-ink-800 transition hover:text-brand-700",
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
                  <span className="absolute -bottom-[1px] left-2.5 right-2.5 h-[2px] rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
                )}
              </Link>
            );
          })}
        </nav>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <LangSwitch lang={lang} onChange={setLang} />
          <ThemeSwitch theme={theme} onToggle={toggleTheme} />

          <span className="mx-1 h-6 w-px bg-mist-200" />

          {user ? (
            <UserMenu
              fullName={user.fullName}
              email={user.email}
              avatarUrl={user.avatarUrl}
              role={user.role}
            />
          ) : (
            <>
              {/* Reserve width for the longer label between ES and EN */}
              <DualLabelButton href="/login" variant="ghost" es={DICT.es.nav.login} en={DICT.en.nav.login} current={lang} />
              <DualLabelButton
                href="/register"
                variant="primary"
                es={DICT.es.nav.register}
                en={DICT.en.nav.register}
                current={lang}
                trailingIcon
              />
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-mist-200 text-ink-800 transition hover:bg-mist-50 lg:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {open ? <path d="M6 6l12 12M18 6l-12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu — full overlay above everything, taps outside to close */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 top-16 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Cerrar menú"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 h-full w-full cursor-default bg-ink-950/30 backdrop-blur-sm transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Panel */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-mist-200 bg-white shadow-[0_20px_44px_-20px_rgba(10,22,51,0.28)] transition-all duration-200 ease-[cubic-bezier(.22,.61,.36,1)]",
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          )}
        >
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
            <div className="mt-3 flex items-center justify-end gap-2">
              <LangSwitch lang={lang} onChange={setLang} />
              <ThemeSwitch theme={theme} onToggle={toggleTheme} />
            </div>
            {user ? (
              <div className="mt-2">
                <UserMenu
                  fullName={user.fullName}
                  email={user.email}
                  avatarUrl={user.avatarUrl}
                  role={user.role}
                />
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button href="/login" variant="secondary" size="sm" className="flex-1" onClick={() => setOpen(false)}>{t.nav.login}</Button>
                <Button href="/register" size="sm" className="flex-1" onClick={() => setOpen(false)}>{t.nav.register}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
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
        "relative inline-flex h-9 w-[68px] items-center rounded-full border p-0.5 transition-colors duration-300",
        isDark ? "border-white/10 bg-ink-900" : "border-mist-200 bg-mist-100"
      )}
    >
      {/* thumb */}
      <span
        className={cn(
          "relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)]",
          isDark
            ? "translate-x-9 bg-ink-700 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)]"
            : "translate-x-0 bg-white shadow-[0_2px_8px_-2px_rgba(10,22,51,0.18)] ring-1 ring-mist-200/70"
        )}
        aria-hidden
      >
        {isDark ? (
          <svg className="h-3.5 w-3.5 text-mist-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="3.6" />
            <path d="M12 3.5v1.5M12 19v1.5M3.5 12h1.5M19 12h1.5M6 6l1.06 1.06M16.94 16.94L18 18M6 18l1.06-1.06M16.94 7.06L18 6" />
          </svg>
        )}
      </span>

      {/* The off-state icon hint on the opposite side */}
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 transition-opacity duration-200",
          isDark ? "left-2 opacity-30" : "right-2 opacity-30"
        )}
        aria-hidden
      >
        {isDark ? (
          <svg className="h-3 w-3 text-mist-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 4v1.5M12 18.5V20M4 12h1.5M18.5 12H20M6 6l1 1M17 17l1 1M6 18l1-1M17 7l1-1" />
          </svg>
        ) : (
          <svg className="h-3 w-3 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </span>
    </button>
  );
}
