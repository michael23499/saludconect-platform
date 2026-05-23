"use client";

import { useApp } from "@/components/providers/Providers";
import type { Dict } from "@/lib/i18n";

type AuthKey = keyof Dict["auth"];

/**
 * Título + subtítulo traducibles para las páginas de auth.
 * Las páginas son Server Components (con guards async) y no pueden usar
 * useApp() directamente, así que extraemos el encabezado a este client component.
 *
 * - `subtitleKey`: subtítulo estático (login, reset, complete-profile).
 * - `email`: si se pasa, construye el subtítulo de set-password con el email
 *   interpolado (prefix + email + suffix).
 */
export function AuthHeading({
  titleKey,
  subtitleKey,
  email,
}: {
  titleKey: AuthKey;
  subtitleKey?: AuthKey;
  email?: string;
}) {
  const { t } = useApp();
  const a = t.auth;
  return (
    <>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">
        {a[titleKey]}
      </h1>
      {email ? (
        <p className="mt-2 text-sm text-mist-500">
          {a.setSubtitlePrefix}{" "}
          <span className="font-medium text-ink-800">{email}</span>. {a.setSubtitleSuffix}
        </p>
      ) : subtitleKey ? (
        <p className="mt-2 text-sm text-mist-500">{a[subtitleKey]}</p>
      ) : null}
    </>
  );
}
