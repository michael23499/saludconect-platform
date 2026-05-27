"use client";

import { useApp } from "@/components/providers/Providers";
import { openCookiePreferences } from "@/lib/cookie-consent";

/**
 * Botón que reabre el panel de preferencias de cookies. Pensado para enrolarse
 * en contenido server-rendered (p.ej. la página de política de cookies o el
 * footer), de modo que el usuario pueda revisar su decisión cuando quiera.
 */
export function CookiePrefsButton({ className }: { className?: string }) {
  const { t } = useApp();
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={
        className ??
        "inline-flex h-10 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
      }
    >
      {t.cookieConsent.manage}
    </button>
  );
}
